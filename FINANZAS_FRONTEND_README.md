# Módulo Finanzas - Frontend

## Descripción

Módulo frontend para gestión financiera de modelos. Integra con el backend de Finanzas y el MoneyService para cálculos precisos con BigInt.

## Estructura

```
lib/service-finanzas/
├── finanzas.types.ts        # Tipos e interfaces TypeScript
├── finanzas.service.ts      # Funciones de API
└── index.ts                 # Exportaciones

components/finanzas/
├── FinanzasDashboard.tsx    # Dashboard de estadísticas
├── ModelosGananciasTable.tsx # Tabla de modelos con ganancias
├── CalcularFinanzasModal.tsx # Modal para calcular finanzas
├── FinanzasDetalleModal.tsx  # Modal con desglose detallado
└── index.ts                 # Exportaciones

components/ui/
├── MoneyDisplay.tsx         # Componente para mostrar montos
└── FinanzasStatusBadge.tsx  # Badge de estados

app/(protected)/finanzas/
└── page.tsx                 # Página principal de Finanzas
```

## Características

### 1. Dashboard de Estadísticas

Muestra totales y promedios del periodo:
- Total Ventas Netas
- Total Comisiones (Agencia + Banco)
- Total Ganancias Modelos
- Total Ganancias OnlyTop
- Promedios por modelo
- Top 10 modelos por ganancias

### 2. Gestión de Modelos

Tabla con:
- Lista de modelos con finanzas del mes
- Filtros por estado y búsqueda
- Botones para calcular/recalcular
- Ver detalle de finanzas

### 3. Cálculo de Finanzas

Modal para:
- Seleccionar modelo, mes y año
- Opción de recalcular si existe
- Agregar notas
- Ver resultado inmediato

### 4. Detalle de Finanzas

Modal con desglose completo:
- Ventas netas
- Comisión agencia (% configurable)
- Comisión banco (2%)
- Ganancia modelo
- Ganancia OnlyTop
- Información adicional (días trabajados, promedio diario)
- Auditoría (fechas de cálculo, aprobación, pago)

## Estados de Finanzas

| Estado | Color | Descripción |
|--------|-------|-------------|
| CALCULADO | Azul (#3b82f6) | Finanzas calculadas, pendiente revisión |
| PENDIENTE_REVISION | Amarillo (#f59e0b) | En revisión administrativa |
| APROBADO | Verde (#10b981) | Aprobadas, listas para pago |
| PAGADO | Gris (#6b7280) | Pago completado |

## Integración con MoneyService

Todos los montos se formatean usando el MoneyService:

```typescript
import { formatMoney, CurrencyCode } from '@/lib/utils/money';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';

// Formateo manual
const formatted = formatMoney(3000000.25, CurrencyCode.USD);
// => "$3,000,000.25"

// Componente
<MoneyDisplay 
  amount={3000000.25} 
  currency={CurrencyCode.USD}
  size="lg"
/>
```

## API del Servicio

### obtenerModelosConGanancias

Obtiene lista de modelos con sus ganancias del periodo.

```typescript
const modelos = await obtenerModelosConGanancias(token, {
  mes: 10,
  anio: 2025,
  estado: EstadoFinanzas.CALCULADO,
  busqueda: 'Maria'
});
```

### calcularFinanzas

Calcula finanzas para un modelo específico.

```typescript
const finanzas = await calcularFinanzas(token, {
  modeloId: '12345',
  mes: 10,
  anio: 2025,
  recalcular: false,
  notas: 'Cálculo mensual'
});
```

### obtenerEstadisticas

Obtiene estadísticas generales del periodo.

```typescript
const stats = await obtenerEstadisticas(token, 10, 2025);
```

### actualizarEstadoFinanzas

Actualiza el estado de finanzas (workflow).

```typescript
const updated = await actualizarEstadoFinanzas(token, finanzasId, {
  estado: EstadoFinanzas.APROBADO,
  notas: 'Aprobado por finanzas'
});
```

## Flujo de Trabajo

1. **Cálculo Inicial**
   - Usuario selecciona modelo y periodo
   - Sistema obtiene ventas del ChatterSales
   - Sistema obtiene % comisión del ContratoModelo
   - Sistema calcula con MoneyService (BigInt precision)
   - Estado: CALCULADO

2. **Revisión**
   - Administrador revisa el cálculo
   - Puede recalcular si hay errores
   - Estado: PENDIENTE_REVISION

3. **Aprobación**
   - Finanzas aprueba los montos
   - Estado: APROBADO

4. **Pago**
   - Se realiza el pago al modelo
   - Se registra fecha y usuario
   - Estado: PAGADO

## Componentes UI

### MoneyDisplay

Muestra montos formateados con MoneyService.

```typescript
<MoneyDisplay 
  amount={1500000.50}
  currency={CurrencyCode.USD}
  size="lg"
  color="#10b981"
/>
```

Props:
- `amount`: number | string
- `currency`: CurrencyCode (USD | COP)
- `format`: DisplayFormat (SYMBOL_ONLY | CODE_SYMBOL | CODE_ONLY)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: string (CSS color)
- `showZero`: boolean

### FinanzasStatusBadge

Muestra estado de finanzas con color.

```typescript
<FinanzasStatusBadge 
  estado={EstadoFinanzas.APROBADO}
  size="md"
/>
```

## Estilos

El módulo usa el sistema de temas de OnlyTop:

```css
--surface: Fondo de componentes
--surface-muted: Fondo secundario
--background: Fondo de página
--border: Bordes
--text-primary: Texto principal
--text-muted: Texto secundario
--ot-blue-500: Azul corporativo
```

## Permisos (Futuro)

```typescript
finanzas:read         // Ver finanzas
finanzas:calculate    // Calcular finanzas
finanzas:approve      // Aprobar finanzas
finanzas:pay          // Marcar como pagado
finanzas:admin        // Administración total
```

## Ejemplos de Uso

### Calcular finanzas para un modelo

```typescript
import { calcularFinanzas } from '@/lib/service-finanzas';

const result = await calcularFinanzas(token, {
  modeloId: 'modelo_123',
  mes: 10,
  anio: 2025,
  recalcular: false
});

console.log(result.gananciaModelo); // "$3,150.75"
```

### Mostrar estadísticas del mes

```typescript
import { obtenerEstadisticas } from '@/lib/service-finanzas';

const stats = await obtenerEstadisticas(token);

console.log(stats.totales.ventasNetas); // "$125,000.00"
console.log(stats.contadores.totalModelos); // 25
```

## Próximas Mejoras

- [ ] Exportar a Excel/PDF
- [ ] Gráficos de tendencias (Chart.js)
- [ ] Comparación entre periodos
- [ ] Filtros avanzados (rango de fechas, múltiples estados)
- [ ] Notificaciones push cuando finanzas están listas
- [ ] Historial de cambios de estado
- [ ] Comentarios y aprobaciones múltiples
- [ ] Integración con sistema de pagos

## Testing

```bash
# Probar con datos reales
npm run dev

# Navegar a /finanzas
# Verificar:
# - Dashboard carga estadísticas
# - Tabla muestra modelos correctamente
# - Modal de calcular funciona
# - MoneyDisplay formatea correctamente
# - Estados tienen colores correctos
```

## Troubleshooting

### Montos no se formatean correctamente

Verificar que MoneyService está funcionando:

```typescript
import { formatMoney, CurrencyCode } from '@/lib/utils/money';

console.log(formatMoney(1500.50, CurrencyCode.USD));
// Debe mostrar: "$1,500.50"
```

### API devuelve 404

Verificar que el backend está corriendo y la ruta es correcta:

```typescript
// En config.ts
export const API_BASE = 'http://localhost:3001/api';
```

### Estadísticas no cargan

Verificar permisos del usuario y que existen datos:

```typescript
// Verificar que hay ChatterSales registradas
// Verificar que hay ContratoModelo configurado
// Verificar token de autenticación
```

## Soporte

Para dudas o reportar bugs:
- Documentación del backend: `FINANZAS_MODULE_README.md`
- API Tests: `FINANZAS_API_TESTS.http`
- Money Module: `MONEY_MODULE_README.md`
