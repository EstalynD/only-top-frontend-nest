# Módulo de Recruitment - Frontend

## Descripción

Interfaz completa para la gestión de actividades de prospección y cierre de modelos por parte del equipo de Sales Closers. Este módulo forma parte del sistema CRM ligero de OnlyTop.

## Estructura

```
lib/service-recruitment/
├── types.ts              # Tipos TypeScript
├── routes.ts             # Definición de rutas API
├── api.ts                # Funciones de API
├── constants.ts          # Constantes y configuración
└── README.md            # Este archivo

components/recruitment/
├── ActivityForm.tsx      # Formulario de actividad (crear/editar)
├── ActivityList.tsx      # Lista de actividades con filtros
└── StatsCards.tsx        # Cards de estadísticas y KPIs

app/(protected)/ventas/recruitment/
├── page.tsx              # Página principal (lista)
├── nueva/page.tsx        # Registrar nueva actividad
└── stats/page.tsx        # Dashboard de estadísticas
```

## Componentes

### ActivityForm

**Formulario completo para registrar/editar actividades diarias**

**Props:**
- `initialData?`: Datos iniciales para edición
- `onSubmit`: Función para enviar datos
- `submitLabel?`: Texto del botón de submit
- `loading?`: Estado de carga

**Secciones del Formulario:**

1. **Información Básica**
   - Fecha de actividad
   - Sales Closer (auto-detectado o manual)

2. **Métricas de Instagram** (Rosa/Pink)
   - Cuentas texteadas (DMs enviados)
   - Likes realizados
   - Comentarios realizados
   - Con tooltips explicativos

3. **Contactos Obtenidos** (Verde/Green)
   - Lista dinámica de contactos
   - Campos: Número, Perfil IG, Nombre
   - Agregar/eliminar contactos

4. **Reuniones** (Púrpura/Purple)
   - Reuniones agendadas
   - Reuniones realizadas
   - Cálculo automático de tasa de efectividad

5. **Modelos Cerradas** (Naranja/Orange)
   - Lista dinámica de modelos
   - Facturación últimos 3 meses
   - Cálculo automático de promedio
   - Fecha de cierre
   - Estado (EN_ESPERA, REGISTRADA, FIRMADA)

6. **Notas del Día**
   - Campo de texto libre para observaciones

**Características:**
- ✅ Validación en tiempo real
- ✅ Cálculos automáticos
- ✅ UI profesional con gradientes OnlyTop
- ✅ Responsive design
- ✅ Tooltips informativos

### ActivityList

**Lista filtrable de actividades con vista de cards**

**Props:**
- `activities`: Array de actividades
- `salesClosers`: Array de Sales Closers para filtros
- `onDelete?`: Función para eliminar actividad
- `loading?`: Estado de carga

**Características:**
- ✅ Filtros avanzados:
  - Por Sales Closer
  - Por rango de fechas
  - Por estado de modelo
- ✅ Contador de filtros activos
- ✅ Limpiar filtros
- ✅ Resumen de resultados
- ✅ Cards informativos:
  - Métricas visuales
  - Modelos cerradas expandidas
  - Notas del día
  - Acciones (ver, editar, eliminar)

### StatsCards

**Dashboard de estadísticas y KPIs**

**Props:**
- `stats`: Objeto RecruitmentStats
- `loading?`: Estado de carga

**Sections:**

1. **Métricas Principales**
   - Cuentas texteadas con gradiente rosa
   - Contactos obtenidos con gradiente verde
   - Reuniones realizadas con gradiente púrpura
   - Modelos cerradas con gradiente naranja
   - Indicadores de tendencia (↑/↓)

2. **Tasas de Conversión**
   - Contacto → Reunión
   - Agendada → Realizada
   - Reunión → Cierre
   - Barras de progreso visuales

3. **Estado de Modelos**
   - Distribución por estado (EN_ESPERA, REGISTRADA, FIRMADA)
   - Porcentajes visuales
   - Barras de progreso por color

4. **Facturación Promedio**
   - Card destacado con gradiente verde
   - Promedio mensual por modelo
   - Comisión estimada (30%)
   - Facturación total proyectada

## Páginas

### `/ventas/recruitment`

**Página principal con lista de actividades**

**Características:**
- Header con branding OnlyTop
- Stats rápidas (4 cards principales)
- Botones de acción (Nueva actividad, Estadísticas)
- Lista completa con filtros
- Confirmación para eliminar

### `/ventas/recruitment/nueva`

**Registrar nueva actividad**

**Características:**
- Breadcrumb para volver
- Tips rápidos para el usuario
- Formulario completo
- Validaciones en tiempo real
- Feedback de éxito/error con Toast

### `/ventas/recruitment/stats`

**Dashboard de estadísticas**

**Características:**
- Toggle entre vista general y por Sales Closer
- Filtros de fecha
- Vista General:
  - Totales del equipo
  - Sales Closers activos
  - Top 10 Sales Closers
  - Opción de ver detalles individuales
- Vista Individual:
  - Stats completas por Sales Closer
  - Métricas, tasas, distribución
- Botón de exportación (preparado)

## API Functions

```typescript
// CRUD
getActivities(token, filters?)
getActivity(token, id)
createActivity(token, data)
updateActivity(token, id, data)
deleteActivity(token, id)

// Vinculación
vincularModelo(token, data)

// Estadísticas
getStatsBySalesCloser(token, salesCloserId, fechaDesde?, fechaHasta?)
getGeneralStats(token, fechaDesde?, fechaHasta?)

// Utilidades
getSalesClosers(token)

// Exportación
getExcelExportUrl(filters?)
getPdfExportUrl(filters?)
```

## Tipos Principales

```typescript
// Estados
enum EstadoModeloCerrada {
  EN_ESPERA = 'EN_ESPERA',
  REGISTRADA = 'REGISTRADA',
  FIRMADA = 'FIRMADA',
}

// Contacto obtenido
interface ContactoObtenido {
  numero: string;
  perfilInstagram?: string | null;
  nombreProspecto?: string | null;
  fechaObtencion: string;
}

// Modelo cerrada
interface ModeloCerrada {
  nombreModelo: string;
  perfilInstagram: string;
  facturacionUltimosTresMeses: [number, number, number];
  promedioFacturacion: number;
  fechaCierre: string;
  estado: EstadoModeloCerrada;
  modeloId?: string | null;
  notas?: string | null;
}

// Actividad completa
interface RecruitmentActivity {
  _id: string;
  fechaActividad: string;
  salesCloserId: string | SalesCloser;
  cuentasTexteadas: number;
  likesRealizados: number;
  comentariosRealizados: number;
  contactosObtenidos: ContactoObtenido[];
  reunionesAgendadas: number;
  reunionesRealizadas: number;
  modelosCerradas: ModeloCerrada[];
  notasDia?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Estadísticas
interface RecruitmentStats {
  totales: { ... };
  tasasConversion: { ... };
  promedioFacturacionModelosCerradas: string;
  modelosPorEstado: { ... };
  cantidadActividades: number;
  rangoFechas: { ... };
}
```

## Constantes

```typescript
// Estados con colores
ESTADOS_MODELO_CERRADA = [
  { value: 'EN_ESPERA', label: 'En Espera', color: '#f59e0b' },
  { value: 'REGISTRADA', label: 'Registrada', color: '#3b82f6' },
  { value: 'FIRMADA', label: 'Firmada', color: '#10b981' },
]

// Límites de validación
VALIDATION_LIMITS = {
  MAX_CONTACTOS: 50,
  MAX_MODELOS_CERRADAS: 20,
  MIN_FACTURACION: 0,
  MAX_FACTURACION: 1000000,
}

// Mensajes
MESSAGES = {
  ACTIVITY_CREATED: 'Actividad registrada exitosamente',
  ACTIVITY_UPDATED: 'Actividad actualizada exitosamente',
  ...
}

// Labels, Placeholders, Tooltips
LABELS = { ... }
PLACEHOLDERS = { ... }
TOOLTIPS = { ... }
```

## Paleta de Colores

El módulo respeta la paleta OnlyTop:

- **Pink/Rosa**: Métricas de Instagram (`--ot-pink-500`, `--ot-pink-600`)
- **Green/Verde**: Contactos obtenidos (`--ot-green-500`, `--ot-green-600`)
- **Purple/Púrpura**: Reuniones (`--ot-purple-500`, `--ot-purple-600`)
- **Orange/Naranja**: Modelos cerradas (`--ot-orange-500`, `--ot-orange-600`)
- **Blue/Azul**: General, primario (`--ot-blue-500`, `--ot-blue-600`)

## Gradientes

```css
/* Header principal */
linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))

/* Modelos cerradas */
linear-gradient(to right, from-orange-50, to-pink-50)

/* Estados */
background-color: ${color}20;
color: ${color};
border: 1px solid ${color}40;
```

## Navegación

El módulo se agrega al Sidebar en la sección **"Ventas"**:

```tsx
VENTAS_GROUP = {
  id: 'ventas',
  label: 'Ventas',
  icon: <TrendingUp size={18} />,
  requiresPermission: 'ventas:recruitment:read',
  children: [
    { href: '/ventas/recruitment', label: 'Recruitment' },
    { href: '/ventas/recruitment/stats', label: 'Estadísticas' },
  ]
}
```

## Permisos Requeridos

- `ventas:recruitment:read` - Ver actividades y estadísticas
- `ventas:recruitment:create` - Crear actividades
- `ventas:recruitment:update` - Editar actividades
- `ventas:recruitment:delete` - Eliminar actividades
- `ventas:recruitment:export` - Exportar reportes
- `ventas:recruitment:stats` - Ver estadísticas avanzadas

## Flujo de Usuario

1. **Sales Closer accede al módulo** (`/ventas/recruitment`)
2. **Ve su lista de actividades** con filtros
3. **Registra nueva actividad** (click en "Nueva Actividad")
4. **Completa el formulario** por secciones:
   - Métricas de IG
   - Contactos obtenidos
   - Reuniones
   - Modelos cerradas (si aplica)
5. **Sistema valida y guarda**
6. **Recibe confirmación** con Toast
7. **Puede ver estadísticas** en `/ventas/recruitment/stats`
8. **Filtrar por Sales Closer o ver general**
9. **Exportar reportes** (preparado para futuro)

## Estados de Modelo Cerrada

### EN_ESPERA
- 🟡 Amarillo/Naranja
- Modelo recién cerrada
- Esperando registro completo
- Aún no vinculada al sistema

### REGISTRADA
- 🔵 Azul
- Modelo ya existe en `ModeloEntity`
- Vinculada con `modeloId`
- Esperando firma de contrato

### FIRMADA
- 🟢 Verde
- Modelo ha firmado contrato
- Proceso completado
- Éxito total

## Métricas y KPIs Tracked

### Embudo de Conversión

```
Cuentas Texteadas (DM)
    ↓
Contactos Obtenidos
    ↓ (Tasa: Contacto → Reunión)
Reuniones Agendadas
    ↓ (Tasa: Agendada → Realizada)
Reuniones Realizadas
    ↓ (Tasa: Reunión → Cierre)
Modelos Cerradas
```

### Fórmulas

```
Tasa Contacto → Reunión = (Reuniones Agendadas / Contactos) × 100
Tasa Agendada → Realizada = (Realizadas / Agendadas) × 100
Tasa Reunión → Cierre = (Cierres / Realizadas) × 100
Promedio Facturación = Σ(Facturación Modelo) / Total Modelos
```

## Mejores Prácticas

### Para Sales Closers:
1. Registrar actividades al final de cada día
2. Incluir perfiles de Instagram de contactos para seguimiento
3. Agregar notas sobre conversaciones prometedoras
4. Registrar modelos cerradas inmediatamente
5. Ingresar facturación real de últimos 3 meses

### Para Supervisores:
1. Revisar estadísticas semanalmente
2. Identificar top performers
3. Detectar cuellos de botella en el embudo
4. Comparar tasas de conversión entre Sales Closers
5. Tomar decisiones basadas en datos

## Responsive Design

✅ Todos los componentes son completamente responsive:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3-4 columnas
- XL: 4+ columnas

## Accesibilidad

- ✅ Labels semánticos
- ✅ ARIA labels en botones
- ✅ Contraste de colores WCAG AA
- ✅ Tooltips informativos
- ✅ Estados visuales claros

## Testing

### Checklist de Pruebas:
- [ ] Crear actividad con todos los campos
- [ ] Crear actividad solo con campos obligatorios
- [ ] Agregar/eliminar contactos dinámicamente
- [ ] Agregar/eliminar modelos dinámicamente
- [ ] Cálculo automático de promedio de facturación
- [ ] Validación de reuniones realizadas ≤ agendadas
- [ ] Filtros de lista
- [ ] Limpiar filtros
- [ ] Ver estadísticas generales
- [ ] Ver estadísticas por Sales Closer
- [ ] Cambio de rango de fechas
- [ ] Auto-detección de Sales Closer actual
- [ ] Navegación entre páginas
- [ ] Toast de éxito/error

## Roadmap

### Próximas Mejoras:
- [ ] Exportación real a Excel con formato
- [ ] Exportación real a PDF profesional
- [ ] Gráficos de tendencias (Chart.js/Recharts)
- [ ] Alertas de bajo rendimiento
- [ ] Sugerencias automáticas de mejora
- [ ] Integración con Instagram API
- [ ] Seguimiento de conversaciones
- [ ] Recordatorios de follow-up
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Desarrollado por**: OnlyTop Development Team

