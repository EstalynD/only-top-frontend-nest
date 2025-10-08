/**
 * Helpers y utilidades del módulo de Horas Extras
 */

import { TipoHoraExtra, EstadoHoraExtra, DetalleHoraExtra } from './types';
import { RECARGOS_COLOMBIA, TIPO_HORA_LABELS, ESTADO_LABELS, MESES_LABELS } from './constants';

// ========== CONVERSIÓN DE BIGINT ==========

/**
 * Convierte un BigInt serializado (string) a número decimal
 * Los valores vienen como BigInt × 100 desde el backend
 */
export function bigIntToNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return Number(value) / 100;
}

/**
 * Formatea un valor BigInt como moneda COP
 */
export function formatBigIntCOP(value: string | number): string {
  const num = bigIntToNumber(value);
  return formatCOP(num);
}

/**
 * Formatea un número como moneda COP
 */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un valor BigInt según la moneda especificada
 */
export function formatBigIntMoneda(value: string | number, moneda: string = 'USD'): string {
  const num = bigIntToNumber(value);
  if (moneda === 'COP') {
    return formatCOP(num);
  }
  // Para USD u otras monedas, formato con decimales
  return `$ ${num.toFixed(2)}`;
}

// ========== REDONDEO MONETARIO ==========

/**
 * Redondea un valor según la moneda (política centralizada - consistente con backend)
 * - USD: 2 decimales
 * - COP: 0 decimales
 * Usa "banker's rounding" (half to even) para evitar sesgos
 * 
 * @param value Valor a redondear
 * @param currency Código de moneda ('USD', 'COP')
 * @returns Valor redondeado según la moneda
 */
export function roundForCurrency(value: number, currency: string = 'USD'): number {
  const decimals = currency === 'COP' ? 0 : 2;
  const factor = Math.pow(10, decimals);
  
  // Banker's rounding (round half to even)
  const scaled = value * factor;
  const rounded = Math.round(scaled);
  
  // Si está exactamente en el medio (.5), redondear al número par más cercano
  if (Math.abs(scaled - rounded) === 0.5) {
    return (Math.floor(scaled / 2) * 2) / factor;
  }
  
  return rounded / factor;
}

// ========== CÁLCULOS ==========

/**
 * Calcula el valor de la hora ordinaria
 * Redondea según la moneda (política centralizada)
 */
export function calcularValorHoraOrdinaria(
  salarioMensual: number, 
  horasLaboralesMes: number = 220,
  moneda: string = 'USD'
): number {
  if (salarioMensual <= 0 || horasLaboralesMes <= 0) return 0;
  const valor = salarioMensual / horasLaboralesMes;
  return roundForCurrency(valor, moneda);
}

/**
 * Calcula el valor de una hora extra con recargo aplicado
 * Redondea según la moneda (política centralizada)
 */
export function calcularValorHoraConRecargo(
  valorHoraOrdinaria: number, 
  tipo: TipoHoraExtra,
  moneda: string = 'USD'
): number {
  const recargo = RECARGOS_COLOMBIA[tipo];
  const valor = valorHoraOrdinaria * (1 + recargo);
  return roundForCurrency(valor, moneda);
}

/**
 * Calcula el total de un detalle de hora extra
 * Redondea según la moneda (política centralizada)
 */
export function calcularTotalDetalle(
  cantidadHoras: number,
  valorHoraOrdinaria: number,
  tipo: TipoHoraExtra,
  moneda: string = 'USD'
): number {
  const valorConRecargo = calcularValorHoraConRecargo(valorHoraOrdinaria, tipo, moneda);
  const total = cantidadHoras * valorConRecargo;
  return roundForCurrency(total, moneda);
}

/**
 * Calcula el multiplicador de recargo para un tipo de hora
 */
export function getMultiplicadorRecargo(tipo: TipoHoraExtra): number {
  return 1 + RECARGOS_COLOMBIA[tipo];
}

/**
 * Formatea el porcentaje de recargo
 */
export function formatRecargoPorcentaje(tipo: TipoHoraExtra): string {
  const porcentaje = RECARGOS_COLOMBIA[tipo] * 100;
  return `${porcentaje}%`;
}

// ========== FORMATO DE FECHAS ==========

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una fecha ISO a formato corto (dd/mm/yyyy)
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Convierte fecha a input date format (YYYY-MM-DD)
 */
export function toInputDate(isoDate: string): string {
  return isoDate.split('T')[0];
}

/**
 * Convierte input date a ISO string
 */
export function fromInputDate(inputDate: string): string {
  return new Date(inputDate).toISOString();
}

// ========== FORMATO DE PERIODO ==========

/**
 * Genera un periodo a partir de año, mes y quincena
 */
export function generarPeriodo(anio: number, mes: number, quincena: 1 | 2): string {
  const mesStr = String(mes).padStart(2, '0');
  return `${anio}-${mesStr}-Q${quincena}`;
}

/**
 * Parsea un periodo a sus componentes
 */
export function parsePeriodo(periodo: string): { anio: number; mes: number; quincena: 1 | 2 } | null {
  const match = periodo.match(/^(\d{4})-(\d{2})-Q([12])$/);
  if (!match) return null;
  return {
    anio: parseInt(match[1], 10),
    mes: parseInt(match[2], 10),
    quincena: parseInt(match[3], 10) as 1 | 2,
  };
}

/**
 * Formatea un periodo para mostrar
 */
export function formatPeriodo(periodo: string): string {
  const parsed = parsePeriodo(periodo);
  if (!parsed) return periodo;
  const mesLabel = MESES_LABELS[parsed.mes - 1];
  return `${mesLabel} ${parsed.anio} - Q${parsed.quincena}`;
}

/**
 * Formatea un periodo como "Mes Año"
 */
export function formatPeriodoMes(anio: number, mes: number): string {
  const mesLabel = MESES_LABELS[mes - 1];
  return `${mesLabel} ${anio}`;
}

// ========== LABELS Y HELPERS ==========

/**
 * Obtiene el label de un tipo de hora extra
 */
export function getTipoHoraLabel(tipo: TipoHoraExtra): string {
  return TIPO_HORA_LABELS[tipo] || tipo;
}

/**
 * Obtiene el label de un estado
 */
export function getEstadoLabel(estado: EstadoHoraExtra): string {
  return ESTADO_LABELS[estado] || estado;
}

/**
 * Obtiene el nombre completo de un empleado
 */
export function getNombreEmpleado(empleado: { nombre: string; apellido: string }): string {
  return `${empleado.nombre} ${empleado.apellido}`;
}

// ========== VALIDACIONES ==========

/**
 * Valida si un estado permite edición
 */
export function puedeEditar(estado: EstadoHoraExtra): boolean {
  return estado === EstadoHoraExtra.PENDIENTE;
}

/**
 * Valida si un estado permite eliminación
 */
export function puedeEliminar(estado: EstadoHoraExtra): boolean {
  return estado === EstadoHoraExtra.PENDIENTE || estado === EstadoHoraExtra.RECHAZADO;
}

/**
 * Valida si un estado permite aprobación
 */
export function puedeAprobar(estado: EstadoHoraExtra): boolean {
  return estado === EstadoHoraExtra.PENDIENTE;
}

/**
 * Valida cantidad de horas
 */
export function validarCantidadHoras(horas: number): boolean {
  return horas > 0 && horas <= 24;
}

// ========== AGRUPACIÓN Y ORDENAMIENTO ==========

/**
 * Agrupa detalles por tipo
 */
export function agruparPorTipo(detalles: DetalleHoraExtra[]): Map<TipoHoraExtra, DetalleHoraExtra[]> {
  const map = new Map<TipoHoraExtra, DetalleHoraExtra[]>();
  detalles.forEach(detalle => {
    const grupo = map.get(detalle.tipo) || [];
    grupo.push(detalle);
    map.set(detalle.tipo, grupo);
  });
  return map;
}

/**
 * Ordena detalles por fecha
 */
export function ordenarPorFecha(detalles: DetalleHoraExtra[], desc = false): DetalleHoraExtra[] {
  return [...detalles].sort((a, b) => {
    const dateA = new Date(a.fechaRegistro).getTime();
    const dateB = new Date(b.fechaRegistro).getTime();
    return desc ? dateB - dateA : dateA - dateB;
  });
}

// ========== EXPORTACIÓN ==========

/**
 * Convierte un registro a formato CSV
 */
export function toCSVRow(registro: any): string[] {
  return [
    registro.periodo,
    getNombreEmpleado(registro.empleadoId),
    String(registro.totalHoras),
    formatBigIntCOP(registro.totalRecargoCOP),
    getEstadoLabel(registro.estado),
    formatDate(registro.createdAt),
  ];
}

/**
 * Genera encabezados CSV
 */
export function getCSVHeaders(): string[] {
  return ['Periodo', 'Empleado', 'Total Horas', 'Total COP', 'Estado', 'Fecha Registro'];
}
