# Sistema de Transacciones - Frontend

## 📋 Descripción

Módulo frontend completo para el sistema de transacciones de dinero en movimiento. Proporciona una interfaz visual para consultar, filtrar y gestionar todas las transacciones financieras del sistema OnlyTop.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
only-top-frontend/
├── lib/
│   └── service-finanzas/
│       └── service-transacciones/      # Módulo de transacciones
│           ├── types.ts                # Tipos TypeScript
│           ├── api.ts                  # Llamadas a API
│           ├── routes.ts               # Rutas del backend
│           ├── constants.ts            # Constantes (labels, colores, iconos)
│           ├── helpers.ts              # Utilidades de formato
│           └── index.ts                # Exports del módulo
│
└── components/
    └── finanzas/
        ├── TransaccionesTable.tsx      # Tabla principal de transacciones
        └── ResumenTransacciones.tsx    # Resumen visual del periodo
```

## 🎨 Componentes

### TransaccionesTable

Tabla completa con todas las transacciones del periodo.

**Props:**
- `mes?: number` - Mes a filtrar (1-12)
- `anio?: number` - Año a filtrar
- `tipo?: TipoTransaccion` - Filtrar por INGRESO o EGRESO
- `origen?: OrigenTransaccion` - Filtrar por origen
- `estado?: EstadoTransaccion` - Filtrar por estado
- `onTransaccionRevertida?: () => void` - Callback al revertir

**Características:**
- ✅ Paginación automática (20 por página)
- ✅ Filtros múltiples por props
- ✅ Revertir transacciones
- ✅ Colores por tipo (verde=ingreso, rojo=egreso)
- ✅ Íconos visuales
- ✅ Responsive design
- ✅ Botón de actualizar manual

**Ejemplo de uso:**
```tsx
import TransaccionesTable from '@/components/finanzas/TransaccionesTable';
import { TipoTransaccion, EstadoTransaccion } from '@/lib/service-finanzas/service-transacciones';

function MiPagina() {
  return (
    <TransaccionesTable
      mes={10}
      anio={2025}
      tipo={TipoTransaccion.INGRESO}
      estado={EstadoTransaccion.EN_MOVIMIENTO}
      onTransaccionRevertida={() => console.log('Transacción revertida')}
    />
  );
}
```

### ResumenTransacciones

Widget visual con estadísticas del periodo.

**Props:**
- `mes: number` - Mes a mostrar (1-12)
- `anio: number` - Año a mostrar

**Características:**
- ✅ Cards con totales (ingresos, egresos, neto, cantidad)
- ✅ Desglose por origen
- ✅ Colores diferenciados
- ✅ Iconos lucide-react
- ✅ Actualización automática

**Ejemplo de uso:**
```tsx
import ResumenTransacciones from '@/components/finanzas/ResumenTransacciones';

function Dashboard() {
  return (
    <ResumenTransacciones mes={10} anio={2025} />
  );
}
```

## 🔧 API Service

### Funciones Disponibles

Todas las funciones están disponibles en el namespace `Transacciones`:

```tsx
import { Transacciones } from '@/lib/service-finanzas';
```

#### obtenerTransacciones
Obtiene lista de transacciones con filtros y paginación.

```tsx
const response = await Transacciones.obtenerTransacciones(token, {
  mes: 10,
  anio: 2025,
  tipo: Transacciones.TipoTransaccion.INGRESO,
  estado: Transacciones.EstadoTransaccion.EN_MOVIMIENTO,
  pagina: 1,
  limite: 20,
});

console.log(response.transacciones); // Array de transacciones
console.log(response.paginacion);    // Info de paginación
```

#### obtenerResumenPeriodo
Obtiene resumen completo del periodo con totales y desglose.

```tsx
const resumen = await Transacciones.obtenerResumenPeriodo(token, 10, 2025);

console.log(resumen.totales.ingresos);     // "$10,500.00"
console.log(resumen.totales.egresos);      // "$3,200.00"
console.log(resumen.totales.neto);         // "$7,300.00"
console.log(resumen.desglosePorOrigen);    // Array por origen
```

#### obtenerSaldoMovimiento
Obtiene el saldo actual en movimiento (no consolidado).

```tsx
const saldo = await Transacciones.obtenerSaldoMovimiento(token);

console.log(saldo.saldoMovimiento);        // "$7,300.00"
console.log(saldo.cantidadTransacciones);  // 15
```

#### obtenerFlujoCaja
Obtiene flujo de caja detallado con saldo inicial y final.

```tsx
const flujo = await Transacciones.obtenerFlujoCaja(token, 10, 2025);

console.log(flujo.saldoInicial);           // "$5,000.00"
console.log(flujo.transacciones);          // Array con saldo acumulado
console.log(flujo.saldoFinal);             // "$12,300.00"
```

#### revertirTransaccion
Revierte una transacción creando una inversa.

```tsx
const resultado = await Transacciones.revertirTransaccion(token, transaccionId, {
  razon: 'Error en el cálculo, recalcular'
});

console.log(resultado.transaccionOriginal);  // Estado: REVERTIDO
console.log(resultado.transaccionReversa);   // Transacción inversa
```

## 🎯 Tipos y Enums

### TipoTransaccion
```tsx
enum TipoTransaccion {
  INGRESO = 'INGRESO',  // Verde 💰
  EGRESO = 'EGRESO',    // Rojo 💸
}
```

### OrigenTransaccion
```tsx
enum OrigenTransaccion {
  GANANCIA_MODELO = 'GANANCIA_MODELO',           // Azul 👤
  COSTO_FIJO = 'COSTO_FIJO',                     // Naranja 📋
  AJUSTE_MANUAL = 'AJUSTE_MANUAL',               // Púrpura ✏️
  COMISION_TRAFFICKER = 'COMISION_TRAFFICKER',   // Cian 🌐
  OTROS = 'OTROS',                               // Gris 📦
}
```

### EstadoTransaccion
```tsx
enum EstadoTransaccion {
  EN_MOVIMIENTO = 'EN_MOVIMIENTO',  // Naranja 🔄 (editable)
  CONSOLIDADO = 'CONSOLIDADO',      // Verde ✅ (inmutable)
  REVERTIDO = 'REVERTIDO',          // Gris ❌ (cancelado)
}
```

## 🛠️ Utilidades (Helpers)

```tsx
import { Transacciones } from '@/lib/service-finanzas';

// Formatear transacción con colores, iconos y labels
const formatted = Transacciones.formatearTransaccion(transaccion);
console.log(formatted.tipoLabel);    // "Ingreso"
console.log(formatted.tipoColor);    // "#10b981"
console.log(formatted.tipoIcono);    // "💰"

// Formatear monto con signo
const monto = Transacciones.formatearMontoConSigno("5000.00", TipoTransaccion.INGRESO);
console.log(monto);  // "+$5,000.00"

// Validar si puede revertirse
if (Transacciones.puedeRevertirse(transaccion)) {
  // Mostrar botón de revertir
}

// Formatear fecha
const fecha = Transacciones.formatearFechaTransaccion("2025-10-04T10:30:00Z");
console.log(fecha);  // "4 oct 2025, 10:30"

// Obtener labels, colores e iconos
console.log(Transacciones.getLabelTipo(TipoTransaccion.INGRESO));    // "Ingreso"
console.log(Transacciones.getColorOrigen(OrigenTransaccion.COSTO_FIJO));  // "#f59e0b"
console.log(Transacciones.getIconoEstado(EstadoTransaccion.CONSOLIDADO)); // "✅"
```

## 🎨 Constantes de UI

### Colores por Tipo
- `INGRESO`: `#10b981` (Verde)
- `EGRESO`: `#ef4444` (Rojo)

### Colores por Origen
- `GANANCIA_MODELO`: `#3b82f6` (Azul)
- `COSTO_FIJO`: `#f59e0b` (Naranja)
- `AJUSTE_MANUAL`: `#8b5cf6` (Púrpura)
- `COMISION_TRAFFICKER`: `#06b6d4` (Cian)
- `OTROS`: `#6b7280` (Gris)

### Colores por Estado
- `EN_MOVIMIENTO`: `#f59e0b` (Naranja)
- `CONSOLIDADO`: `#10b981` (Verde)
- `REVERTIDO`: `#6b7280` (Gris)

## 📝 Mensajes

```tsx
import { Transacciones } from '@/lib/service-finanzas';

// Éxito
Transacciones.TRANSACCIONES_MESSAGES.transaccionRevertida;
// "Transacción revertida exitosamente"

// Errores
Transacciones.TRANSACCIONES_MESSAGES.errorCargarTransacciones;
// "Error al cargar las transacciones"

// Confirmaciones
Transacciones.TRANSACCIONES_MESSAGES.confirmarRevertir;
// "¿Estás seguro de revertir esta transacción? Esta acción creará una transacción inversa."
```

## 🔄 Flujo de Trabajo

### 1. Visualizar Transacciones
```tsx
// En la página del Bank OnlyTop
<TransaccionesTable
  mes={mesActual}
  anio={anioActual}
  onTransaccionRevertida={handleRefresh}
/>
```

### 2. Filtrar Transacciones
```tsx
// Solo ingresos consolidados
<TransaccionesTable
  mes={10}
  anio={2025}
  tipo={TipoTransaccion.INGRESO}
  estado={EstadoTransaccion.CONSOLIDADO}
/>
```

### 3. Buscar por Descripción
El usuario puede buscar en tiempo real escribiendo en el campo de búsqueda.

### 4. Revertir Transacción
El usuario hace clic en el botón de revertir (🔄), confirma con una razón, y se crea una transacción inversa automáticamente.

### 5. Ver Resumen
```tsx
<ResumenTransacciones mes={10} anio={2025} />
```

## 🚀 Integración en Bank Page

```tsx
import TransaccionesTable from '@/components/finanzas/TransaccionesTable';
import ResumenTransacciones from '@/components/finanzas/ResumenTransacciones';

export default function BankPage() {
  const { token } = useAuth();
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Bank Card */}
      <BankOnlyTopCard />

      {/* Resumen de Transacciones */}
      <ResumenTransacciones mes={mesActual} anio={anioActual} />

      {/* Tabla de Transacciones */}
      <TransaccionesTable
        mes={mesActual}
        anio={anioActual}
        onTransaccionRevertida={() => window.location.reload()}
      />
    </div>
  );
}
```

## ✅ Validaciones

- ✅ Token requerido para todas las llamadas
- ✅ Mes entre 1-12
- ✅ Razón de reversión mínimo 10 caracteres
- ✅ No se pueden revertir transacciones ya revertidas
- ✅ Búsqueda mínimo 2 caracteres
- ✅ Paginación automática con límite de 100 por página

## 🎯 Casos de Uso

### Ver todas las transacciones del mes
```tsx
<TransaccionesTable mes={10} anio={2025} />
```

### Ver solo ingresos pendientes de consolidar
```tsx
<TransaccionesTable
  tipo={TipoTransaccion.INGRESO}
  estado={EstadoTransaccion.EN_MOVIMIENTO}
/>
```

### Ver costos fijos del mes
```tsx
<TransaccionesTable
  mes={10}
  anio={2025}
  origen={OrigenTransaccion.COSTO_FIJO}
/>
```

### Buscar por descripción
El usuario escribe "Marketing" en el campo de búsqueda y presiona Enter.

## 📊 Exportaciones del Módulo

```tsx
// Desde el namespace principal
import { Transacciones } from '@/lib/service-finanzas';

// Tipos
Transacciones.TipoTransaccion
Transacciones.OrigenTransaccion
Transacciones.EstadoTransaccion
Transacciones.TransaccionMovimiento
Transacciones.FiltrarTransaccionesDto
Transacciones.ResumenTransaccionesPeriodoDto
// ... todos los tipos

// API
Transacciones.obtenerTransacciones()
Transacciones.obtenerResumenPeriodo()
Transacciones.obtenerSaldoMovimiento()
Transacciones.obtenerFlujoCaja()
Transacciones.revertirTransaccion()
// ... todas las funciones

// Helpers
Transacciones.formatearTransaccion()
Transacciones.getLabelTipo()
Transacciones.getColorOrigen()
// ... todas las utilidades

// Constantes
Transacciones.TIPO_TRANSACCION_LABELS
Transacciones.ORIGEN_TRANSACCION_COLORS
Transacciones.TRANSACCIONES_MESSAGES
// ... todas las constantes
```

## 🎓 Ejemplos Completos

### Dashboard Personalizado
```tsx
function DashboardFinanciero() {
  const { token } = useAuth();
  const [resumen, setResumen] = React.useState(null);

  React.useEffect(() => {
    const cargar = async () => {
      const data = await Transacciones.obtenerResumenPeriodo(token, 10, 2025);
      setResumen(data);
    };
    cargar();
  }, [token]);

  return (
    <div>
      <h1>Dashboard Financiero</h1>
      <p>Ingresos: ${resumen?.totales.ingresos}</p>
      <p>Egresos: ${resumen?.totales.egresos}</p>
      <p>Neto: ${resumen?.totales.neto}</p>
    </div>
  );
}
```

## 🔗 Rutas del Backend

Todas las rutas están definidas en `TRANSACCIONES_ROUTES`:

- `GET /api/finanzas/transacciones` - Lista con filtros
- `GET /api/finanzas/transacciones/:id` - Detalle
- `GET /api/finanzas/transacciones/resumen/:mes/:anio` - Resumen
- `GET /api/finanzas/transacciones/saldo/movimiento` - Saldo actual
- `GET /api/finanzas/transacciones/flujo-caja/:mes/:anio` - Flujo de caja
- `POST /api/finanzas/transacciones/comparativa` - Comparativa
- `GET /api/finanzas/transacciones/bank/estado` - Estado del bank
- `DELETE /api/finanzas/transacciones/:id/revertir` - Revertir

## 📚 Documentación Adicional

- Backend: Ver `only-top-backend/src/finanzas/SISTEMA_TRANSACCIONES.md`
- Rules: Ver `only-top-backend/src/rules.md` sección "Transacciones y Flujo de Caja"
- API Tests: Ver `FINANZAS_API_TESTS.http`

---

**Desarrollado para OnlyTop** | Sistema de Transacciones v1.0
