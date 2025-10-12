/**
 * Helpers del módulo de Cartera
 * Utilidades para formateo y validación
 */

import { EstadoFactura, Factura, PeriodoFacturacion } from './types';
import { MESES_OPTIONS } from './constants';

// ========== FORMATEO ==========

/**
 * Convierte un BigInt serializado (string) a número decimal
 * El backend usa escala de 5 decimales (100000)
 */
export function bigIntToNumber(value: string | number): number {
  if (typeof value === 'number') return value / 100000;
  return parseFloat(value) / 100000;
}

/**
 * Formatea un valor monetario según la moneda
 * USD: 2 decimales, separador de miles con coma
 * COP: 0 decimales, separador de miles con punto
 */
export function formatCurrency(value: string | number, moneda: 'USD' | 'COP' = 'USD'): string {
  const numValue = typeof value === 'string' ? bigIntToNumber(value) : value;
  
  if (moneda === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  } else {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }
}

/**
 * Formatea un periodo de facturación a texto legible
 */
export function formatPeriodo(periodo: PeriodoFacturacion): string {
  const mesLabel = MESES_OPTIONS.find((m) => m.value === periodo.mes)?.label || periodo.mes;
  
  if (periodo.quincena) {
    const quincenaLabel = periodo.quincena === 1 ? '1ra quincena' : '2da quincena';
    return `${quincenaLabel} ${mesLabel} ${periodo.anio}`;
  }
  
  return `${mesLabel} ${periodo.anio}`;
}

/**
 * Calcula días vencidos de una factura
 */
export function calcularDiasVencido(fechaVencimiento: string, estado: EstadoFactura): number {
  if (estado === EstadoFactura.SEGUIMIENTO || estado === EstadoFactura.PAGADO || estado === EstadoFactura.CANCELADO) {
    return 0; // Facturas en seguimiento, pagadas o canceladas no tienen días vencidos
  }

  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
  
  return diferencia > 0 ? diferencia : 0;
}

/**
 * Determina si una factura está próxima a vencer
 */
export function isProximaVencer(fechaVencimiento: string, diasAntes: number = 5): boolean {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = Math.floor((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  
  return diferencia > 0 && diferencia <= diasAntes;
}

/**
 * Calcula porcentaje de pago de una factura
 */
export function calcularPorcentajePago(factura: Factura): number {
  // Convertir total y saldo de BigInt string a número
  const total = bigIntToNumber(factura.total);
  const saldo = bigIntToNumber(factura.saldoPendiente);
  const pagado = total - saldo;
  
  if (total === 0) return 0;
  return Math.round((pagado / total) * 100);
}

/**
 * Formatea número de factura con color según estado
 */
export function getFacturaDisplayNumber(numeroFactura: string): string {
  return numeroFactura.replace('FACT-', '#');
}

/**
 * Formatea número de recibo
 */
export function getReciboDisplayNumber(numeroRecibo: string): string {
  return numeroRecibo.replace('REC-', '#');
}

// ========== VALIDACIÓN ==========

/**
 * Valida formato de archivo de comprobante
 */
export function isFormatoComprobanteValido(file: File, formatosPermitidos: string[]): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? formatosPermitidos.includes(extension) : false;
}

/**
 * Valida tamaño de archivo de comprobante
 */
export function isTamanoComprobanteValido(file: File, tamanoMaximo: number): boolean {
  return file.size <= tamanoMaximo;
}

/**
 * Valida que el monto no exceda el saldo pendiente
 */
export function isMontoValido(monto: number, saldoPendiente: string): boolean {
  const saldo = bigIntToNumber(saldoPendiente);
  return monto > 0 && monto <= saldo;
}

/**
 * Valida estructura de periodo
 */
export function isPeriodoValido(periodo: Partial<PeriodoFacturacion>): boolean {
  if (!periodo.anio || !periodo.mes) return false;
  if (periodo.anio < 2020 || periodo.anio > 2100) return false;
  if (periodo.mes < 1 || periodo.mes > 12) return false;
  if (periodo.quincena && (periodo.quincena < 1 || periodo.quincena > 2)) return false;
  return true;
}

// ========== ORDENAMIENTO ==========

/**
 * Compara facturas por fecha de vencimiento (ascendente)
 */
export function sortByFechaVencimiento(a: Factura, b: Factura): number {
  return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
}

/**
 * Compara facturas por estado (prioridad: VENCIDO > PARCIAL > PENDIENTE > SEGUIMIENTO > PAGADO > CANCELADO)
 */
export function sortByEstadoPrioridad(a: Factura, b: Factura): number {
  const prioridad: Record<EstadoFactura, number> = {
    [EstadoFactura.VENCIDO]: 1,
    [EstadoFactura.PARCIAL]: 2,
    [EstadoFactura.PENDIENTE]: 3,
    [EstadoFactura.SEGUIMIENTO]: 4,
    [EstadoFactura.PAGADO]: 5,
    [EstadoFactura.CANCELADO]: 6,
  };
  
  return prioridad[a.estado] - prioridad[b.estado];
}

// ========== FILTRADO ==========

/**
 * Filtra facturas por modelo
 */
export function filterByModelo(facturas: Factura[], modeloId: string): Factura[] {
  return facturas.filter((f) => f.modeloId === modeloId);
}

/**
 * Filtra facturas por estado
 */
export function filterByEstado(facturas: Factura[], estado: EstadoFactura): Factura[] {
  return facturas.filter((f) => f.estado === estado);
}

/**
 * Filtra facturas por rango de fechas
 */
export function filterByFechaRango(
  facturas: Factura[],
  desde: string,
  hasta: string,
): Factura[] {
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);
  
  return facturas.filter((f) => {
    const fecha = new Date(f.fechaEmision);
    return fecha >= fechaDesde && fecha <= fechaHasta;
  });
}

// ========== AGREGACIONES ==========

/**
 * Calcula totales de un conjunto de facturas
 */
export function calcularTotalesFacturas(facturas: Factura[]): {
  totalFacturado: number;
  totalPagado: number;
  saldoPendiente: number;
  cantidadFacturas: number;
} {
  const totales = facturas.reduce(
    (acc, factura) => {
      // Convertir valores BigInt a números
      const total = bigIntToNumber(factura.total);
      const saldo = bigIntToNumber(factura.saldoPendiente);
      const pagado = total - saldo;
      
      return {
        totalFacturado: acc.totalFacturado + total,
        totalPagado: acc.totalPagado + pagado,
        saldoPendiente: acc.saldoPendiente + saldo,
      };
    },
    { totalFacturado: 0, totalPagado: 0, saldoPendiente: 0 },
  );

  return {
    ...totales,
    cantidadFacturas: facturas.length,
  };
}

/**
 * Agrupa facturas por estado
 */
export function groupByEstado(facturas: Factura[]): Record<EstadoFactura, Factura[]> {
  return facturas.reduce(
    (acc, factura) => {
      if (!acc[factura.estado]) {
        acc[factura.estado] = [];
      }
      acc[factura.estado].push(factura);
      return acc;
    },
    {} as Record<EstadoFactura, Factura[]>,
  );
}
