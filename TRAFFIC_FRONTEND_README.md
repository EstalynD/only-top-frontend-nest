# Frontend - Módulo Traffic/Trafficker

## Implementación Completada ✅

### Arquitectura

```
only-top-frontend/
├── lib/service-traffic/           # Capa de servicios
│   ├── types.ts                   # Tipos y enums completos
│   ├── routes.ts                  # Rutas del API
│   ├── constants.ts               # Constantes y configuración
│   └── api.ts                     # Funciones de llamadas al API
│
├── components/traffic/            # Componentes UI
│   ├── CampaignCard.tsx          # Tarjeta de campaña individual
│   ├── CampaignFilters.tsx       # Filtros avanzados
│   ├── CampaignStats.tsx         # Estadísticas y métricas
│   └── CampaignFormModal.tsx     # Formulario de creación/edición
│
└── app/(protected)/ventas/traffic/
    ├── page.tsx                   # Lista principal de campañas
    └── modelo/[modeloId]/
        └── page.tsx               # Histórico por modelo
```

## Características Implementadas

### ✅ Capa de Servicios (`lib/service-traffic/`)

**types.ts** - Sistema de tipos completo:
- Enums: `PlataformaCampana`, `EstadoCampana`, `AcortadorURL`
- Tipos: `TrafficCampaign`, `CreateCampaignDto`, `UpdateCampaignDto`, `FilterCampaignsDto`
- Helpers UI: Labels, colores por estado, mapeo de nombres

**routes.ts** - Rutas centralizadas:
```typescript
TRAFFIC_ROUTES = {
  campaigns: '/traffic/campaigns',
  campaignById: (id) => `/traffic/campaigns/campaign/${id}`,
  statistics: '/traffic/campaigns/statistics',
  campaignsByModelo: (modeloId) => `/traffic/campaigns/modelo/${modeloId}`,
}
```

**constants.ts** - Configuración:
- 8 monedas disponibles (USD, EUR, GBP, PEN, MXN, COP, ARS, CLP)
- 16 países comunes predefinidos
- 6 rangos de edad predefinidos
- 14 intereses comunes
- Mensajes de error/éxito
- Límites de validación

**api.ts** - 7 funciones de API:
- `createCampaign()` - POST nueva campaña
- `getCampaigns()` - GET con filtros
- `getCampaignById()` - GET por ID
- `updateCampaign()` - PATCH actualizar
- `deleteCampaign()` - DELETE eliminar
- `getCampaignStatistics()` - GET estadísticas
- `getCampaignsByModelo()` - GET histórico por modelo

### ✅ Componentes UI (`components/traffic/`)

**CampaignCard.tsx** - Tarjeta visual de campaña:
- Header con modelo, plataforma y estado (badge colorizado)
- Información del trafficker responsable
- Fechas de activación y finalización
- Barra de progreso de presupuesto (gastado/asignado)
- Segmentación (países, edad)
- Links externos (pauta, track link)
- Sección de rendimiento expandible
- Acciones: Editar / Eliminar

**CampaignFilters.tsx** - Filtros avanzados:
- Select de modelo (si hay múltiples modelos)
- Select de plataforma (6 opciones)
- Select de estado (Activa, Pausada, Finalizada)
- Input de fecha inicio
- Input de fecha fin
- Input de país (búsqueda por texto)
- Botón "Limpiar filtros" (aparece solo si hay filtros activos)

**CampaignStats.tsx** - Dashboard de métricas:
- 4 cards principales:
  - Total de campañas (con activas/pausadas)
  - Presupuesto total asignado (con gastado)
  - Promedio por campaña
  - Campañas finalizadas (con porcentaje)
- Gráfico de barras: Distribución por plataforma
- Ranking: Top 5 países objetivo

**CampaignFormModal.tsx** - Formulario completo (670+ líneas):
- **Información Básica**: Modelo, Plataforma, Estado
- **Fechas**: Activación (req), Publicación, Finalización
- **Presupuesto**: Asignado, Gastado, Moneda
- **Segmentación**:
  - Descripción textual
  - Países (select múltiple de 16 países comunes + agregar custom)
  - Regiones (agregar custom con tags)
  - Rango de edad (min/max)
  - Intereses (7 botones rápidos + agregar custom, max 20)
- **Links y Contenido**:
  - Link de pauta (URL)
  - Track link OF (URL)
  - Acortador utilizado (select de 8 opciones)
  - Copy utilizado (textarea 500 chars)
- **Seguimiento**:
  - Rendimiento (textarea)
  - Notas (textarea 1000 chars)
- Validaciones en tiempo real
- Modo crear/editar automático
- Loading states

### ✅ Páginas

**`/ventas/traffic/page.tsx`** - Vista principal:
- Header sticky con título y botones (Actualizar, Nueva Campaña)
- Estadísticas generales (CampaignStats)
- Filtros avanzados (CampaignFilters)
- Grid responsivo de campañas (1/2/3 columnas según viewport)
- Estados: Loading, Error, Empty, Success
- Integración con modal de formulario
- Funciones CRUD completas:
  - Crear campaña
  - Editar campaña
  - Eliminar campaña (con confirmación)
  - Ver histórico por modelo (navegación)
- Carga automática de modelos desde `/clientes/modelos`
- Refresh manual y automático con filtros

**`/ventas/traffic/modelo/[modeloId]/page.tsx`** - Histórico por modelo:
- Breadcrumb de navegación (Volver a Campañas)
- Header con nombre completo de la modelo
- 3 cards de resumen:
  - Total de campañas (con activas)
  - Presupuesto total asignado
  - Total gastado (con porcentaje)
- Grid de todas las campañas de la modelo
- Vista de solo lectura (sin editar/eliminar)
- Estados: Loading, Error, Empty, Success

### ✅ Navegación (Sidebar)

Agregado en `components/layout/Sidebar.tsx`:
- Nueva sección "Traffic / Trafficker" dentro del grupo "Ventas"
- Ítem de navegación: "Campañas" → `/ventas/traffic`
- Permisos RBAC: Requiere `ventas:traffic:campaigns:read`
- 4 permisos adicionales en tipos:
  - `ventas:traffic:campaigns:read`
  - `ventas:traffic:campaigns:create`
  - `ventas:traffic:campaigns:update`
  - `ventas:traffic:campaigns:delete`

## Patrones Aplicados

✅ **Estructura de lib/** según `rule-estrucutra.md`:
- Separación por dominio (`service-traffic/`)
- Exportaciones nombradas
- Sin dependencias circulares
- Tipado estricto (no `any`)
- Funciones de API usan `requestJSON` de `utils/fetcher.ts`

✅ **Estilos UI** según `consideration-implementation.md`:
- Variables de tema (`--surface`, `--border`, `--text-primary`, `--ot-blue-500`)
- Soporte modo oscuro/claro
- Sin colores hardcodeados
- Hover states con transiciones suaves
- Focus states con ring en inputs

✅ **Componentes reutilizables**:
- `Modal` del sistema
- `Select` / `SelectField` del sistema
- `Loader` con variantes de tamaño
- `CampaignCard` reutilizable en múltiples vistas

✅ **Validaciones**:
- Campos requeridos marcados con asterisco rojo
- Límites de caracteres con contador
- Validación de URLs
- Validación de presupuestos (gastado <= asignado)
- Validación de fechas

## Flujo de Trabajo

### Crear Campaña
1. Usuario hace click en "Nueva Campaña"
2. Modal se abre con formulario vacío
3. Usuario selecciona modelo (requerido)
4. Usuario completa campos (plataforma, fechas, presupuesto, etc.)
5. Usuario agrega segmentación (países, edad, intereses)
6. Usuario ingresa links y copy
7. Click en "Crear Campaña"
8. API call POST `/traffic/campaigns`
9. Si éxito: Modal se cierra, lista se recarga
10. Si error: Mensaje de error en modal

### Editar Campaña
1. Usuario hace click en "Editar" en CampaignCard
2. Modal se abre con datos pre-cargados
3. Usuario modifica campos necesarios
4. Click en "Actualizar"
5. API call PATCH `/traffic/campaigns/campaign/:id`
6. Si éxito: Modal se cierra, lista se recarga

### Filtrar Campañas
1. Usuario selecciona filtros (modelo, plataforma, estado, fechas, país)
2. `useEffect` detecta cambio en `filters`
3. API call GET `/traffic/campaigns?modeloId=...&plataforma=...`
4. Lista se actualiza automáticamente
5. Estadísticas se recalculan con filtros aplicados

### Ver Histórico
1. Usuario hace click en nombre de modelo en CampaignCard
2. Navegación a `/ventas/traffic/modelo/:modeloId`
3. API calls:
   - GET `/clientes/modelos/:modeloId` (datos de modelo)
   - GET `/traffic/campaigns/modelo/:modeloId` (campañas)
4. Se muestran resumen y grid de campañas

## Estados y Loading

- **Loading inicial**: Spinner centrado mientras carga
- **Stats loading**: Skeleton cards con animación pulse
- **Empty state**: Mensaje amigable "No hay campañas"
- **Error state**: Card rojo con ícono y mensaje de error
- **Deleting**: Botón con spinner durante eliminación

## Responsive Design

- **Mobile (< 768px)**: 1 columna de campañas, filtros verticales
- **Tablet (768px - 1024px)**: 2 columnas de campañas
- **Desktop (> 1024px)**: 3 columnas de campañas, filtros en grid 3x3

## Próximas Mejoras

- [ ] Exportar a Excel/PDF (botón preparado, API pendiente)
- [ ] Drag & drop para reordenar campañas
- [ ] Vista de calendario de campañas
- [ ] Comparación entre campañas
- [ ] Gráficos de rendimiento por plataforma
- [ ] Notificaciones cuando presupuesto > 90%
- [ ] Duplicar campaña
- [ ] Historial de cambios de campaña

## Testing Manual

### Checklist de pruebas:
- [x] Backend compila sin errores
- [x] Frontend compila sin errores nuevos
- [ ] Crear campaña con todos los campos
- [ ] Crear campaña con campos mínimos
- [ ] Editar campaña existente
- [ ] Eliminar campaña (con confirmación)
- [ ] Filtrar por modelo
- [ ] Filtrar por plataforma
- [ ] Filtrar por estado
- [ ] Filtrar por fechas
- [ ] Limpiar filtros
- [ ] Ver histórico de modelo
- [ ] Navegación breadcrumb funciona
- [ ] Estadísticas se actualizan con filtros
- [ ] Modal se cierra al hacer click fuera
- [ ] Modal se cierra con ESC
- [ ] Modo oscuro/claro funcionan

## Convenciones de Código

- Componentes en PascalCase
- Archivos en kebab-case
- Hooks de React al inicio de componentes
- `React.useCallback` para funciones estables
- `React.useMemo` para cálculos pesados
- Estilos inline con variables CSS
- Tipos importados con `type` keyword
- Comentarios solo cuando necesario
- Destructuring de props
- Handlers con prefijo `handle`

## Notas de Implementación

- El campo `traffickerId` se obtiene automáticamente del usuario autenticado (backend)
- El modelo es requerido y no editable después de creación
- Las estadísticas se recalculan con cada filtro aplicado
- Los países e intereses tienen límites (50 países, 20 intereses)
- Las fechas se envían en formato ISO al backend
- Los presupuestos admiten decimales (paso 0.01)
