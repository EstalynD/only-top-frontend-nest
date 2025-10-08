/**
 * Transacciones Helpers - Frontend
 * 
 * Utilidades específicas del módulo de transacciones.
 */

import {
  TipoTransaccion,
  OrigenTransaccion,
  EstadoTransaccion,
  type TransaccionMovimiento,
} from './types';
import {
  TIPO_TRANSACCION_LABELS,
  TIPO_TRANSACCION_COLORS,
  TIPO_TRANSACCION_ICONS,
  ORIGEN_TRANSACCION_LABELS,
  ORIGEN_TRANSACCION_COLORS,
  ORIGEN_TRANSACCION_ICONS,
  ESTADO_TRANSACCION_LABELS,
  ESTADO_TRANSACCION_COLORS,
  ESTADO_TRANSACCION_ICONS,
} from './constants';

/**
 * Obtiene el label de un tipo de transacción
 */
export function getLabelTipo(tipo: TipoTransaccion): string {
  return TIPO_TRANSACCION_LABELS[tipo] || tipo;
}

/**
 * Obtiene el color de un tipo de transacción
 */
export function getColorTipo(tipo: TipoTransaccion): string {
  return TIPO_TRANSACCION_COLORS[tipo] || '#6b7280';
}

/**
 * Obtiene el ícono de un tipo de transacción
 */
export function getIconoTipo(tipo: TipoTransaccion): string {
  return TIPO_TRANSACCION_ICONS[tipo] || '💵';
}

/**
 * Obtiene el label de un origen de transacción
 */
export function getLabelOrigen(origen: OrigenTransaccion): string {
  return ORIGEN_TRANSACCION_LABELS[origen] || origen;
}

/**
 * Obtiene el color de un origen de transacción
 */
export function getColorOrigen(origen: OrigenTransaccion): string {
  return ORIGEN_TRANSACCION_COLORS[origen] || '#6b7280';
}

/**
 * Obtiene el ícono de un origen de transacción
 */
export function getIconoOrigen(origen: OrigenTransaccion): string {
  return ORIGEN_TRANSACCION_ICONS[origen] || '📦';
}

/**
 * Obtiene el label de un estado de transacción
 */
export function getLabelEstado(estado: EstadoTransaccion): string {
  return ESTADO_TRANSACCION_LABELS[estado] || estado;
}

/**
 * Obtiene el color de un estado de transacción
 */
export function getColorEstado(estado: EstadoTransaccion): string {
  return ESTADO_TRANSACCION_COLORS[estado] || '#6b7280';
}

/**
 * Obtiene el ícono de un estado de transacción
 */
export function getIconoEstado(estado: EstadoTransaccion): string {
  return ESTADO_TRANSACCION_ICONS[estado] || '🔄';
}

/**
 * Formatea una transacción con toda su información visual
 */
export function formatearTransaccion(transaccion: TransaccionMovimiento) {
  return {
    ...transaccion,
    tipoLabel: getLabelTipo(transaccion.tipo),
    tipoColor: getColorTipo(transaccion.tipo),
    tipoIcono: getIconoTipo(transaccion.tipo),
    origenLabel: getLabelOrigen(transaccion.origen),
    origenColor: getColorOrigen(transaccion.origen),
    origenIcono: getIconoOrigen(transaccion.origen),
    estadoLabel: getLabelEstado(transaccion.estado),
    estadoColor: getColorEstado(transaccion.estado),
    estadoIcono: getIconoEstado(transaccion.estado),
  };
}

/**
 * Valida si una transacción puede ser revertida
 */
export function puedeRevertirse(transaccion: TransaccionMovimiento): boolean {
  return transaccion.estado !== EstadoTransaccion.REVERTIDO;
}

/**
 * Formatea el monto con signo según el tipo
 */
export function formatearMontoConSigno(monto: string, tipo: TipoTransaccion): string {
  const signo = tipo === TipoTransaccion.INGRESO ? '+' : '-';
  return `${signo}${monto}`;
}

/**
 * Obtiene la fecha formateada para mostrar
 */
export function formatearFechaTransaccion(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calcula el periodo de una transacción
 */
export function getPeriodoTransaccion(transaccion: TransaccionMovimiento): string {
  return transaccion.periodo || `${transaccion.mes}/${transaccion.anio}`;
}
