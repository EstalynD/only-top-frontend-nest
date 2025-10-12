/**
 * Helpers para Gastos Fijos Quincenales
 */

import {
  QuincenaEnum,
  CategoriaGasto,
  EstadoGasto,
  EstadoResumen,
} from './types';
import {
  QUINCENA_LABELS,
  QUINCENA_SHORT_LABELS,
  CATEGORIA_LABELS,
  CATEGORIA_COLORS,
  CATEGORIA_ICONS,
  ESTADO_GASTO_LABELS,
  ESTADO_GASTO_COLORS,
  ESTADO_RESUMEN_LABELS,
  ESTADO_RESUMEN_COLORS,
  INDICADOR_COLORS,
  OPCIONES_MESES,
} from './constants';

// ========== FORMATEO ==========

/**
 * Obtiene el label de una quincena
 */
export function getQuincenaLabel(quincena: QuincenaEnum, short: boolean = false): string {
  return short ? QUINCENA_SHORT_LABELS[quincena] : QUINCENA_LABELS[quincena];
}

/**
 * Obtiene el label de una categoría
 */
export function getCategoriaLabel(categoria: CategoriaGasto): string {
  return CATEGORIA_LABELS[categoria];
}

/**
 * Obtiene el color de una categoría
 */
export function getCategoriaColor(categoria: CategoriaGasto): string {
  return CATEGORIA_COLORS[categoria];
}

/**
 * Obtiene el icono de una categoría
 */
export function getCategoriaIcon(categoria: CategoriaGasto): string {
  return CATEGORIA_ICONS[categoria];
}

/**
 * Obtiene el label de un estado de gasto
 */
export function getEstadoGastoLabel(estado: EstadoGasto): string {
  return ESTADO_GASTO_LABELS[estado];
}

/**
 * Obtiene el color de un estado de gasto
 */
export function getEstadoGastoColor(estado: EstadoGasto): string {
  return ESTADO_GASTO_COLORS[estado];
}

/**
 * Obtiene el label de un estado de resumen
 */
export function getEstadoResumenLabel(estado: EstadoResumen): string {
  return ESTADO_RESUMEN_LABELS[estado];
}

/**
 * Obtiene el color de un estado de resumen
 */
export function getEstadoResumenColor(estado: EstadoResumen): string {
  return ESTADO_RESUMEN_COLORS[estado];
}

/**
 * Obtiene los colores para un indicador (verde/rojo/gris)
 */
export function getIndicadorColors(indicador: 'verde' | 'rojo' | 'gris') {
  return INDICADOR_COLORS[indicador];
}

// ========== VALIDACIONES ==========

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
 * Valida si un monto es válido
 */
export function isValidMonto(monto: number): boolean {
  return monto > 0 && monto <= 1_000_000;
}

/**
 * Valida si una categoría requiere empleadoId
 */
export function categoriaRequiereEmpleado(categoria: CategoriaGasto): boolean {
  return categoria === CategoriaGasto.NOMINA;
}

// ========== UTILIDADES ==========

/**
 * Obtiene el nombre del mes en español
 */
export function getNombreMes(mes: number): string {
  const option = OPCIONES_MESES.find(m => m.value === mes);
  return option?.label || 'Mes inválido';
}

/**
 * Formatea un periodo como string
 */
export function formatPeriodo(mes: number, anio: number): string {
  return `${getNombreMes(mes)} ${anio}`;
}

/**
 * Formatea un periodo con quincena
 */
export function formatPeriodoQuincenal(mes: number, anio: number, quincena: QuincenaEnum): string {
  return `${getNombreMes(mes)} ${anio} - ${getQuincenaLabel(quincena, true)}`;
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
 * Obtiene la quincena actual
 */
export function getQuincenaActual(): QuincenaEnum {
  const dia = new Date().getDate();
  return dia <= 15 ? QuincenaEnum.PRIMERA_QUINCENA : QuincenaEnum.SEGUNDA_QUINCENA;
}

/**
 * Calcula la fecha de pago para una quincena
 */
export function getFechaPagoQuincena(mes: number, anio: number, quincena: QuincenaEnum): string {
  if (quincena === QuincenaEnum.PRIMERA_QUINCENA) {
    // Q1: día 15
    return `${anio}-${String(mes).padStart(2, '0')}-15`;
  } else {
    // Q2: último día del mes
    const ultimoDia = new Date(anio, mes, 0).getDate();
    return `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  }
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}

/**
 * Obtiene el icono para la dirección de crecimiento
 */
export function getIconoCrecimiento(direccion: 'crecimiento' | 'decrecimiento' | 'neutro'): string {
  switch (direccion) {
    case 'crecimiento':
      return '▲';
    case 'decrecimiento':
      return '▼';
    case 'neutro':
    default:
      return '●';
  }
}

/**
 * Obtiene el nombre del mes en español
 */
export function nombreMes(mes: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || 'Mes inválido';
}

/**
 * Formatea un porcentaje con signo y color
 */
export function formatPorcentaje(porcentaje: number): {
  texto: string;
  color: string;
  icono: string;
} {
  const abs = Math.abs(porcentaje);
  const signo = porcentaje > 0 ? '+' : porcentaje < 0 ? '-' : '';
  
  let color: string;
  let icono: string;
  
  if (porcentaje > 0) {
    color = '#10b981'; // Verde
    icono = '▲';
  } else if (porcentaje < 0) {
    color = '#ef4444'; // Rojo
    icono = '▼';
  } else {
    color = '#6b7280'; // Gris
    icono = '●';
  }
  
  return {
    texto: `${signo}${abs.toFixed(2)}%`,
    color,
    icono,
  };
}

/**
 * Genera un ID de periodo
 */
export function generarPeriodoId(mes: number, anio: number, quincena?: QuincenaEnum): string {
  const mesStr = String(mes).padStart(2, '0');
  if (quincena) {
    const q = quincena === QuincenaEnum.PRIMERA_QUINCENA ? 'Q1' : 'Q2';
    return `${anio}-${mesStr}-${q}`;
  }
  return `${anio}-${mesStr}`;
}

/**
 * Verifica si un periodo está consolidado
 */
export function isPeriodoConsolidado(estado: EstadoResumen): boolean {
  return estado === EstadoResumen.CONSOLIDADO;
}

/**
 * Calcula el porcentaje de una categoría sobre el total
 */
export function calcularPorcentajeCategoria(montoCategoria: number, montoTotal: number): number {
  if (montoTotal === 0) return 0;
  return (montoCategoria / montoTotal) * 100;
}

/**
 * Ordena categorías por monto (mayor a menor)
 */
export function ordenarCategoriasPorMonto<T extends { totalCategoria?: number; porcentajeDelTotal?: number }>(
  categorias: T[]
): T[] {
  return [...categorias].sort((a, b) => {
    const montoA = a.totalCategoria || a.porcentajeDelTotal || 0;
    const montoB = b.totalCategoria || b.porcentajeDelTotal || 0;
    return montoB - montoA;
  });
}
