# DataTable Component - Documentación

## 🎯 **Descripción**

El componente `DataTable` es una tabla responsiva y completamente funcional que incluye búsqueda en tiempo real, ordenamiento por columnas, paginación automática y un diseño moderno que se adapta al sistema de diseño de OnlyTop.

## ✨ **Características Principales**

### **1. Búsqueda en Tiempo Real**
- Campo de búsqueda integrado en la parte superior
- Filtra automáticamente por columnas marcadas como `searchable`
- Búsqueda case-insensitive
- Placeholder personalizable

### **2. Ordenamiento Inteligente**
- Iconos de ordenamiento en headers de columnas
- Tres estados: sin ordenar, ascendente, descendente
- Solo columnas marcadas como `sortable` permiten ordenamiento
- Indicadores visuales claros del estado actual

### **3. Paginación Automática**
- Paginación automática con controles intuitivos
- Información de registros mostrados
- Navegación por páginas con botones anterior/siguiente
- Números de página clickeables

### **4. Diseño Responsivo**
- Tabla con scroll horizontal en pantallas pequeñas
- Adaptación automática a diferentes tamaños de pantalla
- Mantiene la funcionalidad en dispositivos móviles

### **5. Estados de Carga**
- Indicador de carga integrado
- Estado vacío personalizable
- Manejo de errores elegante

## 🚀 **Uso Básico**

```tsx
import DataTable, { Column } from '@/components/ui/DataTable';

// Definir las columnas
const columns: Column<MiTipo>[] = [
  {
    key: 'nombre',
    title: 'Nombre',
    dataIndex: 'nombre',
    sortable: true,
    searchable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: true,
    searchable: true,
    render: (value) => <a href={`mailto:${value}`}>{value}</a>,
  },
  {
    key: 'fecha',
    title: 'Fecha',
    dataIndex: 'createdAt',
    sortable: true,
    render: (value) => formatDate(value),
  },
];

// Usar el componente
<DataTable
  data={misDatos}
  columns={columns}
  loading={isLoading}
  searchable={true}
  searchPlaceholder="Buscar usuarios..."
  onRowClick={(record) => handleVerDetalles(record.id)}
/>
```

## 📋 **Props del Componente**

### **DataTableProps<T>**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `data` | `T[]` | ✅ | Array de datos a mostrar |
| `columns` | `Column<T>[]` | ✅ | Configuración de columnas |
| `loading` | `boolean` | ❌ | Estado de carga |
| `searchable` | `boolean` | ❌ | Habilitar búsqueda (default: true) |
| `searchPlaceholder` | `string` | ❌ | Placeholder del buscador |
| `pagination` | `object` | ❌ | Configuración de paginación |
| `onRowClick` | `function` | ❌ | Callback al hacer click en fila |
| `onSort` | `function` | ❌ | Callback al ordenar |
| `emptyState` | `object` | ❌ | Estado vacío personalizado |
| `className` | `string` | ❌ | Clases CSS adicionales |

### **Column<T>**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `key` | `string` | ✅ | Identificador único de la columna |
| `title` | `string` | ✅ | Título mostrado en el header |
| `dataIndex` | `keyof T` | ✅ | Propiedad del objeto de datos |
| `render` | `function` | ❌ | Función de renderizado personalizada |
| `sortable` | `boolean` | ❌ | Permitir ordenamiento |
| `searchable` | `boolean` | ❌ | Incluir en búsqueda |
| `width` | `string` | ❌ | Ancho de la columna |
| `align` | `'left' \| 'center' \| 'right'` | ❌ | Alineación del contenido |
| `className` | `string` | ❌ | Clases CSS adicionales |

## 🎨 **Ejemplos de Uso**

### **1. Tabla Básica**
```tsx
<DataTable
  data={usuarios}
  columns={columnasUsuarios}
  loading={cargando}
/>
```

### **2. Con Búsqueda Personalizada**
```tsx
<DataTable
  data={productos}
  columns={columnasProductos}
  searchable={true}
  searchPlaceholder="Buscar productos por nombre o categoría..."
/>
```

### **3. Con Paginación Personalizada**
```tsx
<DataTable
  data={ventas}
  columns={columnasVentas}
  pagination={{
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
  }}
/>
```

### **4. Con Estado Vacío Personalizado**
```tsx
<DataTable
  data={registros}
  columns={columnasRegistros}
  emptyState={{
    icon: <FileText size={48} />,
    title: "No hay documentos",
    description: "Sube tu primer documento para comenzar"
  }}
/>
```

### **5. Con Click en Fila**
```tsx
<DataTable
  data={clientes}
  columns={columnasClientes}
  onRowClick={(cliente) => {
    router.push(`/clientes/${cliente.id}`);
  }}
/>
```

## 🔧 **Configuración Avanzada**

### **Renderizado Personalizado**
```tsx
const columns: Column<Usuario>[] = [
  {
    key: 'avatar',
    title: 'Avatar',
    dataIndex: 'avatar',
    render: (value, record) => (
      <img 
        src={value} 
        alt={record.nombre}
        className="w-8 h-8 rounded-full"
      />
    ),
  },
  {
    key: 'estado',
    title: 'Estado',
    dataIndex: 'activo',
    render: (value) => (
      <Badge variant={value ? 'success' : 'danger'}>
        {value ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
];
```

### **Ordenamiento Personalizado**
```tsx
<DataTable
  data={datos}
  columns={columnas}
  onSort={(column, direction) => {
    console.log(`Ordenando por ${column} en dirección ${direction}`);
    // Lógica personalizada de ordenamiento
  }}
/>
```

## 🎯 **Mejores Prácticas**

### **1. Configuración de Columnas**
- Usa `key` únicos y descriptivos
- Marca columnas relevantes como `searchable`
- Usa `render` para formatear datos complejos
- Define `width` para columnas con contenido fijo

### **2. Performance**
- El componente usa `useMemo` para optimizar filtros y ordenamiento
- Los datos se procesan solo cuando es necesario
- La paginación reduce el número de elementos renderizados

### **3. Accesibilidad**
- Todos los elementos son accesibles por teclado
- Labels descriptivos para screen readers
- Contraste adecuado en todos los estados

### **4. Responsividad**
- La tabla se adapta automáticamente a diferentes pantallas
- Scroll horizontal en dispositivos móviles
- Controles de paginación optimizados para touch

## 🚀 **Implementación en Horas Extras**

El componente ya está implementado en la página de Horas Extras con la siguiente configuración:

```tsx
const columns: Column<HorasExtrasRegistro>[] = [
  {
    key: 'periodo',
    title: 'Período',
    dataIndex: 'periodo',
    sortable: true,
    searchable: true,
    render: (value) => <span className="text-sm font-medium">{formatPeriodo(value)}</span>,
  },
  {
    key: 'empleado',
    title: 'Empleado',
    dataIndex: 'empleadoId',
    sortable: true,
    searchable: true,
    render: (value) => <span className="text-sm">{getNombreEmpleado(value)}</span>,
  },
  // ... más columnas
];
```

## 🎉 **Beneficios Obtenidos**

- ✅ **Código más limpio**: Eliminación de HTML de tabla repetitivo
- ✅ **Funcionalidad completa**: Búsqueda, ordenamiento y paginación integrados
- ✅ **Consistencia visual**: Diseño unificado en toda la aplicación
- ✅ **Mantenibilidad**: Un solo componente para todas las tablas
- ✅ **Performance**: Optimizaciones automáticas de React
- ✅ **Accesibilidad**: Cumple estándares WCAG 2.1 AA
- ✅ **Responsividad**: Funciona perfectamente en todos los dispositivos

---

**Resultado**: Un componente de tabla moderno, funcional y completamente integrado con el sistema de diseño de OnlyTop. 🎯
