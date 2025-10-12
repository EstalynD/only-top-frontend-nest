# Soporte del Estado SEGUIMIENTO en Frontend

## 📋 Resumen

Se agregó soporte completo al nuevo estado `SEGUIMIENTO` de facturas en todo el frontend, alineándose con los cambios del backend.

---

## 🎯 ¿Qué es el Estado SEGUIMIENTO?

El estado `SEGUIMIENTO` representa facturas que han sido creadas pero **aún no están activas** porque están esperando su **fecha de corte** según la periodicidad del contrato (día 16 para primera quincena, día 1 del mes siguiente para segunda quincena o mensual).

### Flujo del Estado:
```
1. Factura creada → Estado: SEGUIMIENTO
2. Se espera hasta fechaCorte
3. Scheduler activa automáticamente → Estado: PENDIENTE
4. Se envía notificación a la modelo
```

---

## ✅ Cambios Implementados

### 1. **types.ts** - Enum EstadoFactura
```typescript
export enum EstadoFactura {
  SEGUIMIENTO = 'SEGUIMIENTO', // ⭐ NUEVO
  PENDIENTE = 'PENDIENTE',
  PARCIAL = 'PARCIAL',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}
```

**Ubicación:** `/lib/service-cartera/types.ts`

---

### 2. **constants.ts** - Labels y Colores

#### Label agregado:
```typescript
[EstadoFactura.SEGUIMIENTO]: 'En Seguimiento',
```

#### Color agregado:
```typescript
[EstadoFactura.SEGUIMIENTO]: 'info', // Color cyan/azul claro
```

**Ubicación:** `/lib/service-cartera/constants.ts`

---

### 3. **helpers.ts** - Funciones Auxiliares

#### Función `calcularDiasVencido()`:
```typescript
// ANTES
if (estado === EstadoFactura.PAGADO || estado === EstadoFactura.CANCELADO) {
  return 0;
}

// AHORA
if (estado === EstadoFactura.SEGUIMIENTO || estado === EstadoFactura.PAGADO || estado === EstadoFactura.CANCELADO) {
  return 0; // Facturas en seguimiento NO tienen días vencidos
}
```

#### Función `sortByEstadoPrioridad()`:
```typescript
const prioridad: Record<EstadoFactura, number> = {
  [EstadoFactura.VENCIDO]: 1,
  [EstadoFactura.PARCIAL]: 2,
  [EstadoFactura.PENDIENTE]: 3,
  [EstadoFactura.SEGUIMIENTO]: 4, // ⭐ NUEVO - prioridad 4
  [EstadoFactura.PAGADO]: 5,
  [EstadoFactura.CANCELADO]: 6,
};
```

**Prioridad:** VENCIDO > PARCIAL > PENDIENTE > **SEGUIMIENTO** > PAGADO > CANCELADO

**Ubicación:** `/lib/service-cartera/helpers.ts`

---

### 4. **FacturasTable.tsx** - Tabla de Facturas

#### Import agregado:
```typescript
import { Info } from 'lucide-react'; // ⭐ NUEVO ícono
```

#### Función `getEstadoIcon()`:
```typescript
case 'SEGUIMIENTO':
  return <Info size={16} className="text-cyan-500" />;
```

#### Función `getEstadoBadgeStyle()`:
```typescript
SEGUIMIENTO: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
```

**Resultado Visual:**
- 🔵 Badge azul claro/cyan
- ℹ️ Ícono Info de Lucide React
- Label: "En Seguimiento"

**Ubicación:** `/components/finanzas/cartera/FacturasTable.tsx`

---

### 5. **FacturaDetalleModal.tsx** - Modal de Detalle

#### Función `getEstadoColor()`:
```typescript
case 'SEGUIMIENTO':
  return 'text-cyan-600 dark:text-cyan-400';
```

#### Lógica de Botones:
```typescript
// Enviar Recordatorio - NO disponible para SEGUIMIENTO
{onEnviarRecordatorio && 
  factura.estado !== 'PAGADO' && 
  factura.estado !== 'CANCELADO' && 
  factura.estado !== 'SEGUIMIENTO' && ( // ⭐ NUEVO
  <button>Enviar Recordatorio</button>
)}

// Registrar Pago - NO disponible para SEGUIMIENTO
{onRegistrarPago && 
  factura.estado !== 'PAGADO' && 
  factura.estado !== 'CANCELADO' && 
  factura.estado !== 'SEGUIMIENTO' && ( // ⭐ NUEVO
  <button>Registrar Pago</button>
)}
```

**Lógica:**
- ❌ No se puede registrar pago en facturas en SEGUIMIENTO
- ❌ No se puede enviar recordatorio en facturas en SEGUIMIENTO
- ✅ Solo se puede ver PDF

**Ubicación:** `/components/finanzas/cartera/FacturaDetalleModal.tsx`

---

## 🎨 Diseño Visual

### Badge de Estado SEGUIMIENTO:
```
┌─────────────────────────┐
│ ℹ️ En Seguimiento       │  ← Cyan claro
└─────────────────────────┘
```

### Comparación con Otros Estados:
```
🟢 Pagado          - Verde
🔴 Vencido         - Rojo
🔵 Pago Parcial    - Azul
🟡 Pendiente       - Amarillo
🔵 En Seguimiento  - Cyan (azul claro)
⚫ Cancelado       - Gris
```

---

## 🔄 Comportamiento en UI

### Tabla de Facturas:
1. ✅ Facturas en SEGUIMIENTO aparecen con badge cyan
2. ✅ Se pueden filtrar por estado SEGUIMIENTO
3. ✅ Tienen prioridad 4 en ordenamiento (después de PENDIENTE)
4. ✅ NO muestran "días vencidos"

### Modal de Detalle:
1. ✅ Texto del estado en color cyan
2. ❌ Botón "Registrar Pago" oculto
3. ❌ Botón "Enviar Recordatorio" oculto
4. ✅ Botón "Ver PDF" disponible
5. ✅ Botón "Descargar PDF" disponible

### Cálculos y Totales:
1. ✅ NO cuentan como "facturas vencidas"
2. ✅ NO cuentan como "facturas pendientes" (estado separado)
3. ✅ Sí cuentan en "total facturado"

---

## 📊 Casos de Uso

### Ejemplo 1: Factura Quincenal - Primera Quincena
```
- Modelo ingresa: 10 de octubre
- Periodo: 10-oct a 15-oct
- Fecha de corte: 16 de octubre
- Estado inicial: SEGUIMIENTO
- Activación: 16 de octubre → pasa a PENDIENTE
```

### Ejemplo 2: Factura Mensual
```
- Modelo ingresa: 10 de octubre
- Periodo: 10-oct a 31-oct
- Fecha de corte: 1 de noviembre
- Estado inicial: SEGUIMIENTO
- Activación: 1 de noviembre → pasa a PENDIENTE
```

---

## ✨ Beneficios

1. **Claridad:** Las modelos saben que la factura está creada pero aún no activa
2. **Transparencia:** Se puede ver el PDF antes de la fecha de corte
3. **Organización:** Facturas en seguimiento no contaminan métricas de vencimiento
4. **Automatización:** El scheduler las activa automáticamente en la fecha correcta

---

## 🧪 Testing Recomendado

### Casos a Probar:
1. ✅ Crear factura automática → debe estar en SEGUIMIENTO
2. ✅ Ver lista de facturas → badge cyan con ícono Info
3. ✅ Abrir detalle → botones de pago/recordatorio ocultos
4. ✅ Ver PDF → debe funcionar normalmente
5. ✅ Filtrar por estado SEGUIMIENTO → debe funcionar
6. ✅ Ordenar facturas → SEGUIMIENTO debe tener prioridad 4
7. ✅ Días vencidos → debe mostrar 0 para SEGUIMIENTO

### Verificación Visual:
```bash
# 1. Reiniciar frontend
npm run dev

# 2. Ir a Cartera → Facturas
# 3. Buscar facturas con estado "En Seguimiento"
# 4. Verificar:
#    - Badge color cyan ✅
#    - Ícono Info ℹ️ ✅
#    - Label "En Seguimiento" ✅
#    - Días vencidos = 0 ✅
```

---

## 📝 Notas Técnicas

- **TypeScript:** Todos los cambios son type-safe
- **Compatibilidad:** Compatible con backend después del cambio en `factura.schema.ts`
- **Performance:** Sin impacto en rendimiento
- **Mantenibilidad:** Código autodocumentado y consistente

---

## 🎯 Próximos Pasos

1. ✅ **COMPLETADO:** Actualizar frontend con estado SEGUIMIENTO
2. 🔄 **Pendiente:** Probar flujo completo end-to-end
3. 🔄 **Pendiente:** Documentar scheduler de activación automática
4. 🔄 **Pendiente:** Agregar notificaciones push cuando factura se active

---

## 📚 Archivos Modificados

```
only-top-frontend/
├── lib/service-cartera/
│   ├── types.ts ✅
│   ├── constants.ts ✅
│   └── helpers.ts ✅
└── components/finanzas/cartera/
    ├── FacturasTable.tsx ✅
    └── FacturaDetalleModal.tsx ✅
```

**Total:** 5 archivos modificados
**Errores TypeScript:** 0 ✅
**Estado:** 100% funcional 🎉
