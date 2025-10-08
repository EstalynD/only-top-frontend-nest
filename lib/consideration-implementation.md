Evitar pérdida de Content-Type al fusionar headers: construir fetch con `...init` primero y luego `headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }`.
Así Authorization u otros headers no sobreescriben Content-Type y el backend parsea JSON bien.
Aplicado en `lib/utils/fetcher.ts::requestJSON`.

Usar `config.ts` para URLs centralizadas: todas las URLs de API deben definirse en `lib/config.ts` usando `API_BASE` como base.
Importar desde `@/lib/config` en lugar de hardcodear URLs. Esto facilita cambios de entorno y mantenimiento.

**IMPORTANTE: Rutas en servicios de API**
- En los servicios (`lib/service-*/`), NUNCA construir URLs con `API_BASE` directamente (ej: `${API_BASE}/finanzas`).
- SIEMPRE usar paths relativos comenzando con `/` (ej: `/api/finanzas`).
- La función `requestJSON` del fetcher se encarga de agregar `API_BASE` automáticamente.
- ❌ INCORRECTO: `const BASE_URL = ${API_BASE}/finanzas;` (duplica la URL)
- ✅ CORRECTO: Definir rutas en `routes.ts` como `/api/finanzas`
- Esto evita duplicación de URLs como `http://localhost:3041/http://localhost:3041/finanzas`.

**Estructura de servicios de API** (seguir patrón de `service-traffic`):
- Cada servicio debe tener: `routes.ts`, `types.ts`, `api.ts`, `constants.ts`, `helpers.ts`, `index.ts`
- `routes.ts`: Definir TODAS las rutas del módulo con prefijo `/api/` (ej: `/api/finanzas/modelos`)
- `types.ts`: Interfaces y enums del dominio
- `api.ts`: Funciones que llaman a `requestJSON` usando rutas de `routes.ts`
- `constants.ts`: Constantes, labels, colores, mensajes de error/éxito
- `helpers.ts`: Utilidades específicas del dominio (formateo, validación)
- `index.ts`: Exportar TODO (`export * from './...'`)
- Usar importaciones nombradas, NO default exports
- Ver `lib/rule-estrucutra.md` para detalles completos

NestJS (módulos/guards/rutas) — reglas generales para evitar 404 y errores de DI:
- Si un controlador usa `@UseGuards(AuthGuard)` (o cualquier guard/provider externo), el módulo que declara ese controlador DEBE importar el módulo que exporta esos providers (p. ej., `AuthModule` que exporta `AuthService`/`AuthGuard`). Usa `forwardRef` si hay dependencia circular.
- Todo módulo de funcionalidad (FeatureModule) que expone controladores debe estar importado por el módulo raíz correspondiente (normalmente `AppModule`) para que sus rutas queden mapeadas; de lo contrario, recibirás 404 aunque compile.
- Prefijos de rutas: define un estándar (ej., sin `api/` o con `api/`) y úsalo de forma consistente. Si necesitas compatibilidad temporal, puedes mapear múltiples prefijos en el mismo controlador: `@Controller(['feature/path', 'api/feature/path'])`. Planifica su remoción y en el frontend usa SIEMPRE rutas relativas a través del fetcher central.
- Alternativa opcional: si vas a proteger todo con el mismo guard, registra `AuthGuard` como `APP_GUARD` global en un módulo central. Aun así, recuerda importar el módulo que exporta sus dependencias.

Checklist al crear/activar un nuevo FeatureModule:
1) Declara `@Module({ imports: [Deps necesarias (AuthModule, Database, etc.)], controllers: [..], providers: [..], exports: [..] })`.
2) Importa el FeatureModule en `AppModule` (u otro módulo raíz que arranque la app).
3) Revisa prefijos de `@Controller()` y alinea con el estándar del proyecto (evita mezclar `/api/` y rutas sin prefijo si no es intencional).
4) En el frontend, consume endpoints con path relativo (comenzando con `/`) y deja que `requestJSON` + `API_BASE` compongan la URL final.

Configuración de asistencia — horario fijo (almuerzo):
- Se agregaron `lunchBreakEnabled` (boolean) y `lunchBreak: { startTime, endTime }` al horario fijo.
- Validaciones backend: si está habilitado, el intervalo debe ser válido (HH:mm), durar entre 15 y 180 minutos y estar contenido dentro del rango laboral de cada día activo (si el día no cruza medianoche).
- Frontend: el modal de “Horario Fijo” permite activar/desactivar y setear el intervalo. Al guardar, se envía como parte de `fixedSchedule` en `PUT /sistema/attendance/config`.
- Nota: por ahora aplica solo para horario fijo; turnos rotativos no consideran `lunchBreak` aún.

Estilos UI — formularios de recruitment (modo oscuro/claro):
- Usar variables de tema existentes (`--surface`, `--surface-muted`, `--input-bg`, `--border`, `--text-primary`, `--text-muted`) para fondos y texto; evita colores `bg-white`/`dark:bg-gray-*` hardcodeados.
- Agrupar formularios en contenedores con borde y sombra suave (`var(--border)`, `var(--shadow)`) para replicar la estética de contratos sin perder identidad de recruitment.
- Inputs/selects: aplicar `style={inputStyle}` o clases equivalentes que usen las variables anteriores y mantener `focus:ring` corporativo (`var(--ot-blue-500)` o acentos por bloque).
- Secciones auxiliares (tips, totales) deben reutilizar `var(--surface-muted)` para resaltar sin crear blancos intensos en modo oscuro.
- Al crear nuevos componentes para recruitment, documenta los estilos compartidos en el mismo archivo o extrae hooks utilitarios si serán reutilizados.