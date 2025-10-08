# Módulo Frontend - Ventas de Chatters

## 📦 Estructura del Módulo

```
lib/service-chatter/
├── routes.ts       # Definición de endpoints
├── types.ts        # Tipos TypeScript completos
├── constants.ts    # Constantes (labels, colores, permisos)
├── api.ts          # Funciones para llamar a la API
└── README.md       # Este archivo

components/chatter/
├── CreateSaleModal.tsx   # Modal para registrar ventas
├── SalesTable.tsx        # Tabla de ventas con acciones
├── StatsCard.tsx         # Card de estadísticas reutilizable
└── [otros componentes]

app/(protected)/ventas/chatting/
├── page.tsx              # Dashboard principal
├── grupos/page.tsx       # Análisis por grupos
└── [otras vistas]
```

## 🎯 Características Implementadas

### 1. **Gestión de Ventas**
- ✅ Registro de ventas con modal profesional
- ✅ Listado con tabla responsive
- ✅ Filtros avanzados (fecha, tipo, turno, plataforma)
- ✅ Edición y eliminación de ventas
- ✅ Validación completa de formularios

### 2. **Dashboard Principal**
- ✅ Cards de estadísticas generales
- ✅ Total de ventas, monto total, promedio
- ✅ Top 10 chatters y modelos
- ✅ Tabla de ventas recientes
- ✅ Filtros dinámicos

### 3. **Análisis por Grupos**
- ✅ Vista por modelo y sus 4 chatters
- ✅ Desglose por turno (AM, PM, Madrugada, Supernumerario)
- ✅ Estadísticas individuales por chatter
- ✅ Totales y promedios del grupo

### 4. **Exportación PDF**
- ✅ Reporte general del sistema
- ✅ Reporte por grupo de chatters
- ✅ Estadísticas de chatter individual
- ✅ Comparación de múltiples grupos

### 5. **UI/UX Profesional**
- ✅ Diseño con variables CSS del tema
- ✅ Modo oscuro y claro soportado
- ✅ Componentes reutilizables
- ✅ Animaciones y transiciones suaves
- ✅ Responsive design completo

## 🚀 Uso del Servicio

### Importar Funciones de API

```typescript
import { 
  createSale, 
  getSales, 
  getGeneralStats,
  downloadGeneralStatsPdf 
} from '@/lib/service-chatter/api';
```

### Ejemplo: Registrar una Venta

```typescript
import { useAuth } from '@/lib/auth';
import { createSale } from '@/lib/service-chatter/api';

const { token } = useAuth();

const sale = await createSale(token, {
  modeloId: '673abc123...',
  chatterId: '673def456...',
  monto: 150.50,
  tipoVenta: 'CONTENIDO_PERSONALIZADO',
  turno: 'PM',
  fechaVenta: new Date().toISOString(),
  plataforma: 'OnlyFans',
});
```

### Ejemplo: Obtener Ventas con Filtros

```typescript
import { getSales } from '@/lib/service-chatter/api';

const sales = await getSales(token, {
  modeloId: '673abc123...',
  fechaInicio: '2025-10-01',
  fechaFin: '2025-10-31',
  tipoVenta: 'SUSCRIPCION',
});
```

### Ejemplo: Descargar PDF

```typescript
import { downloadGeneralStatsPdf } from '@/lib/service-chatter/api';

const blob = await downloadGeneralStatsPdf(
  token,
  '2025-10-01',
  '2025-10-31'
);

// Descargar automáticamente
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'reporte-chatters.pdf';
a.click();
```

## 🎨 Uso de Componentes

### CreateSaleModal

```tsx
import CreateSaleModal from '@/components/chatter/CreateSaleModal';

<CreateSaleModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => loadData()}
  modeloId="optional-preset-id"
  chatterId="optional-preset-id"
  turno="AM"
/>
```

### SalesTable

```tsx
import SalesTable from '@/components/chatter/SalesTable';

<SalesTable
  sales={salesData}
  loading={isLoading}
  onView={(sale) => console.log(sale)}
  onEdit={(sale) => editSale(sale)}
  onDelete={(sale) => deleteSale(sale)}
/>
```

### StatsCard

```tsx
import StatsCard from '@/components/chatter/StatsCard';
import { DollarSign } from 'lucide-react';

<StatsCard
  title="Total Ventas"
  value="$12,450.00"
  subtitle="Este mes"
  icon={DollarSign}
  iconColor="var(--ot-blue-500)"
  trend={{ value: 12, isPositive: true }}
/>
```

## 📊 Tipos Principales

### ChatterSale

```typescript
interface ChatterSale {
  _id: string;
  modeloId: string | ModeloInfo;
  chatterId: string | ChatterInfo;
  monto: number;
  moneda: string;
  tipoVenta: TipoVenta;
  turno: TurnoChatter;
  fechaVenta: string;
  descripcion?: string;
  plataforma?: string;
  createdAt: string;
  updatedAt: string;
}
```

### GroupSalesData

```typescript
interface GroupSalesData {
  modelo: ModeloInfo;
  grupo: {
    AM: TurnoData;
    PM: TurnoData;
    MADRUGADA: TurnoData;
    SUPERNUMERARIO: TurnoData;
  };
  totalGrupo: number;
  totalVentas: number;
  periodo: { fechaInicio?: string; fechaFin?: string };
}
```

## 🎨 Estilos y Tema

El módulo utiliza **variables CSS** del tema OnlyTop:

```css
--surface        /* Fondo de contenedores */
--surface-muted  /* Fondo alternativo */
--input-bg       /* Fondo de inputs */
--border         /* Color de bordes */
--text-primary   /* Texto principal */
--text-muted     /* Texto secundario */
--ot-blue-500    /* Color primario OnlyTop */
```

### Colores por Turno

```typescript
TURNO_COLORS = {
  AM: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  PM: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  MADRUGADA: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' },
  SUPERNUMERARIO: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
}
```

## 🔐 Permisos

Todos los endpoints requieren autenticación JWT y permisos RBAC:

```typescript
CHATTER_PERMISSIONS = {
  create: 'ventas:chatting:create',
  read: 'ventas:chatting:read',
  update: 'ventas:chatting:update',
  delete: 'ventas:chatting:delete',
}
```

## 📱 Responsive Design

El módulo es **completamente responsive**:

- **Mobile**: Vista en columna única
- **Tablet**: Grid de 2 columnas
- **Desktop**: Grid de 4 columnas
- **Tablas**: Scroll horizontal en móviles

## 🧪 Manejo de Errores

Todos los errores se manejan con toasts profesionales:

```typescript
try {
  await createSale(token, data);
  addToast({
    type: 'success',
    title: 'Éxito',
    description: 'Venta registrada correctamente',
  });
} catch (error: any) {
  addToast({
    type: 'error',
    title: 'Error',
    description: error.message,
  });
}
```

## 🔄 Estados de Carga

Uso consistente de `Loader` component:

```typescript
{loading ? (
  <Loader size="lg" />
) : (
  <Content />
)}
```

## 📋 Checklist de Implementación

- [x] Estructura de servicios (`service-chatter/`)
- [x] Tipos TypeScript completos
- [x] Constantes y helpers
- [x] Funciones API con manejo de errores
- [x] Componentes UI reutilizables
- [x] Dashboard principal
- [x] Vista de análisis por grupos
- [x] Exportación PDF
- [x] Tema oscuro/claro
- [x] Responsive design
- [x] Toasts de notificación
- [x] Validación de formularios
- [x] Documentación completa

## 🚀 Próximas Mejoras

- [ ] Gráficos con Chart.js
- [ ] Importación masiva desde Excel
- [ ] Comparación visual de grupos
- [ ] Filtros guardados
- [ ] Exportación a Excel
- [ ] Vista de estadísticas por chatter individual
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda avanzada con autocompletado

## 📚 Referencias

- **Backend API**: `only-top-backend/src/chatter/README.md`
- **Convenciones**: `only-top-frontend/lib/rule-estructura.md`
- **Tema**: `only-top-frontend/lib/theme.tsx`
- **Componentes UI**: `only-top-frontend/components/ui/`

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Desarrollado por**: OnlyTop Frontend Team

