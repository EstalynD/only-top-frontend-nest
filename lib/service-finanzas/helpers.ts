/**
 * Finanzas Helpers - Frontend
 * 
 * Utilidades específicas del módulo de finanzas.
 */

import { MESES, ESTADO_COLORS, ESTADO_LABELS } from './constants';

/**
 * Obtiene el nombre del mes en español
 */
export function getNombreMes(mes: number): string {
  if (mes < 1 || mes > 12) return 'Mes inválido';
  return MESES[mes - 1];
}

/**
 * Obtiene el color para un estado
 */
export function getColorEstado(estado: string): string {
  return ESTADO_COLORS[estado] || '#6b7280';
}

/**
 * Obtiene el label para un estado
 */
export function getLabelEstado(estado: string): string {
  return ESTADO_LABELS[estado] || estado;
}

/**
 * Valida si un mes es válido
 */
export function isValidMes(mes: number): boolean {
  return mes >= 1 && mes <= 12;
}

/**
 * Valida si un año es válido
 */
export function isValidAnio(anio: number): boolean {
  return anio >= 2020 && anio <= 2030;
}

/**
 * Obtiene el periodo actual (mes y año)
 */
export function getPeriodoActual(): { mes: number; anio: number } {
  const now = new Date();
  return {
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
  };
}

/**
 * Formatea un periodo como string
 */
export function formatPeriodo(mes: number, anio: number): string {
  return `${getNombreMes(mes)} ${anio}`;
}

/**
 * Formatea un número como moneda USD
 * Útil para cuando el backend no devuelve valores formateados
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}
