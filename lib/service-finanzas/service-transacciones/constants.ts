/**
 * Constantes para el módulo de Transacciones
 */

import { TipoTransaccion, OrigenTransaccion, EstadoTransaccion } from './types';

// ========== LABELS ==========

export const TIPO_TRANSACCION_LABELS: Record<TipoTransaccion, string> = {
  [TipoTransaccion.INGRESO]: 'Ingreso',
  [TipoTransaccion.EGRESO]: 'Egreso',
};

export const ORIGEN_TRANSACCION_LABELS: Record<OrigenTransaccion, string> = {
  [OrigenTransaccion.GANANCIA_MODELO]: 'Ganancia Modelo',
  [OrigenTransaccion.COSTO_FIJO]: 'Costo Fijo',
  [OrigenTransaccion.AJUSTE_MANUAL]: 'Ajuste Manual',
  [OrigenTransaccion.COMISION_TRAFFICKER]: 'Comisión Trafficker',
  [OrigenTransaccion.OTROS]: 'Otros',
};

export const ESTADO_TRANSACCION_LABELS: Record<EstadoTransaccion, string> = {
  [EstadoTransaccion.EN_MOVIMIENTO]: 'En Movimiento',
  [EstadoTransaccion.CONSOLIDADO]: 'Consolidado',
  [EstadoTransaccion.REVERTIDO]: 'Revertido',
};

// ========== COLORES ==========

export const TIPO_TRANSACCION_COLORS: Record<TipoTransaccion, string> = {
  [TipoTransaccion.INGRESO]: '#10b981', // Verde
  [TipoTransaccion.EGRESO]: '#ef4444', // Rojo
};

export const ORIGEN_TRANSACCION_COLORS: Record<OrigenTransaccion, string> = {
  [OrigenTransaccion.GANANCIA_MODELO]: '#3b82f6', // Azul
  [OrigenTransaccion.COSTO_FIJO]: '#f59e0b', // Naranja
  [OrigenTransaccion.AJUSTE_MANUAL]: '#8b5cf6', // Púrpura
  [OrigenTransaccion.COMISION_TRAFFICKER]: '#06b6d4', // Cian
  [OrigenTransaccion.OTROS]: '#6b7280', // Gris
};

export const ESTADO_TRANSACCION_COLORS: Record<EstadoTransaccion, string> = {
  [EstadoTransaccion.EN_MOVIMIENTO]: '#f59e0b', // Naranja
  [EstadoTransaccion.CONSOLIDADO]: '#10b981', // Verde
  [EstadoTransaccion.REVERTIDO]: '#6b7280', // Gris
};

// ========== ÍCONOS ==========

export const TIPO_TRANSACCION_ICONS: Record<TipoTransaccion, string> = {
  [TipoTransaccion.INGRESO]: '💰',
  [TipoTransaccion.EGRESO]: '💸',
};

export const ORIGEN_TRANSACCION_ICONS: Record<OrigenTransaccion, string> = {
  [OrigenTransaccion.GANANCIA_MODELO]: '👤',
  [OrigenTransaccion.COSTO_FIJO]: '📋',
  [OrigenTransaccion.AJUSTE_MANUAL]: '✏️',
  [OrigenTransaccion.COMISION_TRAFFICKER]: '🌐',
  [OrigenTransaccion.OTROS]: '📦',
};

export const ESTADO_TRANSACCION_ICONS: Record<EstadoTransaccion, string> = {
  [EstadoTransaccion.EN_MOVIMIENTO]: '🔄',
  [EstadoTransaccion.CONSOLIDADO]: '✅',
  [EstadoTransaccion.REVERTIDO]: '❌',
};

// ========== MENSAJES ==========

export const TRANSACCIONES_MESSAGES = {
  // Éxito
  transaccionRevertida: 'Transacción revertida exitosamente',
  datosActualizados: 'Datos actualizados exitosamente',
  
  // Errores
  errorCargarTransacciones: 'Error al cargar las transacciones',
  errorCargarDetalle: 'Error al cargar el detalle de la transacción',
  errorRevertir: 'Error al revertir la transacción',
  errorCargarResumen: 'Error al cargar el resumen del periodo',
  errorCargarSaldo: 'Error al cargar el saldo en movimiento',
  errorCargarFlujoCaja: 'Error al cargar el flujo de caja',
  errorCargarComparativa: 'Error al cargar la comparativa',
  
  // Confirmaciones
  confirmarRevertir: '¿Estás seguro de revertir esta transacción? Esta acción creará una transacción inversa.',
  
  // Validaciones
  razonRequerida: 'Debes proporcionar una razón para revertir la transacción',
  noSePuedeRevertir: 'No se puede revertir una transacción ya revertida',
  transaccionConsolidada: 'Esta transacción ya está consolidada',
} as const;

// ========== VALIDACIONES ==========

export const TRANSACCIONES_VALIDATIONS = {
  razonMinLength: 10,
  razonMaxLength: 500,
  busquedaMinLength: 2,
  busquedaMaxLength: 100,
  limitePorPagina: 20,
  limitePorPaginaMax: 100,
} as const;

// ========== OPCIONES DE FILTROS ==========

export const FILTRO_TIPOS = [
  { value: TipoTransaccion.INGRESO, label: TIPO_TRANSACCION_LABELS[TipoTransaccion.INGRESO] },
  { value: TipoTransaccion.EGRESO, label: TIPO_TRANSACCION_LABELS[TipoTransaccion.EGRESO] },
];

export const FILTRO_ORIGENES = [
  { value: OrigenTransaccion.GANANCIA_MODELO, label: ORIGEN_TRANSACCION_LABELS[OrigenTransaccion.GANANCIA_MODELO] },
  { value: OrigenTransaccion.COSTO_FIJO, label: ORIGEN_TRANSACCION_LABELS[OrigenTransaccion.COSTO_FIJO] },
  { value: OrigenTransaccion.AJUSTE_MANUAL, label: ORIGEN_TRANSACCION_LABELS[OrigenTransaccion.AJUSTE_MANUAL] },
  { value: OrigenTransaccion.COMISION_TRAFFICKER, label: ORIGEN_TRANSACCION_LABELS[OrigenTransaccion.COMISION_TRAFFICKER] },
  { value: OrigenTransaccion.OTROS, label: ORIGEN_TRANSACCION_LABELS[OrigenTransaccion.OTROS] },
];

export const FILTRO_ESTADOS = [
  { value: EstadoTransaccion.EN_MOVIMIENTO, label: ESTADO_TRANSACCION_LABELS[EstadoTransaccion.EN_MOVIMIENTO] },
  { value: EstadoTransaccion.CONSOLIDADO, label: ESTADO_TRANSACCION_LABELS[EstadoTransaccion.CONSOLIDADO] },
  { value: EstadoTransaccion.REVERTIDO, label: ESTADO_TRANSACCION_LABELS[EstadoTransaccion.REVERTIDO] },
];
