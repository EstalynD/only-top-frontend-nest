# Módulo de Dotación - Frontend

Este documento describe la implementación del módulo de dotación en el frontend, que permite visualizar el historial de elementos entregados a empleados.

## 🎯 Funcionalidades Implementadas

### ✅ Características Principales

- **Tab de Dotación** en la página de detalle del empleado
- **Historial completo** de entregas, devoluciones, mantenimientos, etc.
- **Resumen estadístico** con métricas por empleado
- **Vista dual**: Historial detallado y resumen estadístico
- **Información detallada** de cada elemento (marca, modelo, serie, valor)
- **Estados visuales** para diferentes tipos de acciones y condiciones

## 📁 Estructura de Archivos

### Servicios API
- `lib/service-rrhh/dotacion-api.ts` - Servicio para comunicación con el backend

### Componentes
- `components/rrhh/DotacionTab.tsx` - Componente principal del tab de dotación
- `components/rrhh/EmpleadoDetallePage.tsx` - Página principal actualizada con el nuevo tab

## 🔧 Implementación Técnica

### Servicio API (`dotacion-api.ts`)

```typescript
// Tipos principales
export interface EndowmentTracking {
  _id: string;
  empleadoId: { /* info del empleado */ };
  itemId: { /* info del elemento */ };
  categoryId: { /* info de la categoría */ };
  action: 'ENTREGA' | 'DEVOLUCION' | 'MANTENIMIENTO' | 'REPARACION' | 'REEMPLAZO';
  actionDate: string;
  observations?: string;
  condition?: string;
  location?: string;
  // ... más campos
}

// Servicios principales
export const dotacionApi = {
  getEmpleadoHistorial(empleadoId: string, token: string): Promise<EndowmentTracking[]>
  getEmpleadoResumen(empleadoId: string, token: string): Promise<EndowmentSummary>
  getEmpleadoItemsActivos(empleadoId: string, token: string): Promise<EndowmentTracking[]>
  // ... más métodos
}
```

### Componente DotacionTab

**Características principales:**
- **Carga de datos**: Historial y resumen en paralelo
- **Vista dual**: Botones para alternar entre historial y resumen
- **Estados visuales**: Colores e iconos para diferentes acciones
- **Información detallada**: Marca, modelo, serie, valor estimado
- **Responsive**: Adaptado para móviles y desktop

**Estructura del componente:**
```typescript
export default function DotacionTab({ empleadoId, token }: Props) {
  const [historial, setHistorial] = useState<EndowmentTracking[]>([]);
  const [resumen, setResumen] = useState<EndowmentSummary | null>(null);
  const [activeView, setActiveView] = useState<'historial' | 'resumen'>('historial');
  
  // Carga de datos, renderizado, etc.
}
```

## 🎨 Interfaz de Usuario

### Vista de Historial
- **Cards individuales** para cada registro de dotación
- **Iconos de acción** (📦 entrega, ↩️ devolución, 🔧 mantenimiento, etc.)
- **Información del elemento**: Nombre, descripción, marca, modelo, serie
- **Valor estimado** formateado en moneda colombiana
- **Condición del elemento** con colores y iconos
- **Fecha y ubicación** de la acción
- **Número de referencia** para trazabilidad

### Vista de Resumen
- **Métricas principales**: Entregas, devoluciones, items activos, valor total
- **Estadísticas por acción**: Desglose de todos los tipos de acciones
- **Categorías**: Lista de categorías de elementos entregados

### Estados Visuales

**Acciones:**
- 🟢 **ENTREGA**: Verde
- 🔵 **DEVOLUCION**: Azul  
- 🟡 **MANTENIMIENTO**: Amarillo
- 🟠 **REPARACION**: Naranja
- 🟣 **REEMPLAZO**: Morado

**Condiciones:**
- ✅ **NUEVO**: Verde
- ✅ **BUENO**: Azul
- ⚠️ **REGULAR**: Amarillo
- ❌ **DAÑADO**: Rojo

## 🔗 Integración con Backend

### Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/rrhh/endowment/tracking/empleado/:empleadoId` | Historial completo del empleado |
| `GET` | `/api/rrhh/endowment/empleados/:empleadoId/resumen` | Resumen estadístico |
| `GET` | `/api/rrhh/endowment/empleados/:empleadoId/items-activos` | Items activos del empleado |

### Flujo de Datos

1. **Carga inicial**: Se obtienen historial y resumen en paralelo
2. **Renderizado**: Se muestran los datos según la vista activa
3. **Interacción**: El usuario puede alternar entre historial y resumen
4. **Actualización**: Botón de reintentar en caso de error

## 📱 Responsive Design

### Mobile (< 640px)
- **Tabs compactos**: Solo iconos en móvil
- **Cards apiladas**: Información en columnas
- **Botones pequeños**: Tamaño optimizado para touch

### Desktop (≥ 640px)
- **Tabs completos**: Iconos + texto
- **Grid layout**: Información en múltiples columnas
- **Hover effects**: Interacciones mejoradas

## 🎯 Casos de Uso

### 1. Ver Historial de Dotación
- Usuario navega a detalle de empleado
- Hace clic en tab "Dotación"
- Ve historial completo de elementos entregados

### 2. Revisar Resumen Estadístico
- En el tab de dotación, hace clic en "Resumen"
- Ve métricas agregadas del empleado
- Identifica patrones de uso

### 3. Información Detallada
- Ve detalles de cada elemento (marca, modelo, serie)
- Revisa valor estimado y condición
- Consulta observaciones y ubicación

## 🔐 Seguridad

- **Autenticación**: Todos los requests incluyen token JWT
- **Autorización**: El backend valida permisos `rrhh:endowment:read`
- **Validación**: Datos validados tanto en frontend como backend

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
- **Filtros**: Por fecha, categoría, acción
- **Búsqueda**: En historial de elementos
- **Exportación**: PDF del historial
- **Notificaciones**: Alertas de vencimientos
- **Gestión**: Crear/editar/eliminar registros desde el frontend

### Optimizaciones
- **Paginación**: Para empleados con mucho historial
- **Caché**: Reducir llamadas al backend
- **Lazy loading**: Cargar datos bajo demanda

## 📊 Métricas Disponibles

- **Total de entregas** por empleado
- **Total de devoluciones** por empleado
- **Items activos** (entregados sin devolver)
- **Valor total estimado** de dotación
- **Categorías** de elementos entregados
- **Estadísticas por acción** (mantenimientos, reparaciones, etc.)

## 🎨 Temas

El componente soporta tanto tema claro como oscuro:
- **Tema claro**: Fondos blancos, texto oscuro
- **Tema oscuro**: Fondos grises, texto claro
- **Colores adaptativos**: Los colores de estado se adaptan al tema

## 📝 Notas de Implementación

1. **Error Handling**: Manejo robusto de errores con mensajes informativos
2. **Loading States**: Indicadores de carga durante las peticiones
3. **Empty States**: Mensajes informativos cuando no hay datos
4. **Accessibility**: Uso de iconos y colores con significado semántico
5. **Performance**: Carga paralela de datos para mejor UX
