/**
 * API calls para el módulo de Transacciones
 */

import { jsonFetch } from '@/lib/http';
import { TRANSACCIONES_ROUTES } from './routes';
import type {
  TransaccionesPaginadasDto,
  TransaccionMovimiento,
  ResumenTransaccionesPeriodoDto,
  SaldoMovimientoDto,
  FlujoCajaDetalladoDto,
  ComparativaTransaccionesDto,
  ComparativaTransaccionesResponseDto,
  FiltrarTransaccionesDto,
  RevertirTransaccionDto,
} from './types';
import type { BankOnlyTop } from '../types';

/**
 * Obtiene lista de transacciones con filtros y paginación
 */
export async function obtenerTransacciones(
  token: string,
  filtros?: FiltrarTransaccionesDto
): Promise<TransaccionesPaginadasDto> {
  const params = new URLSearchParams();
  
  if (filtros?.mes) params.append('mes', filtros.mes.toString());
  if (filtros?.anio) params.append('anio', filtros.anio.toString());
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.origen) params.append('origen', filtros.origen);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.saltar !== undefined) params.append('saltar', filtros.saltar.toString());
  if (filtros?.limite) params.append('limite', filtros.limite.toString());
  
  const queryString = params.toString();
  const url = queryString 
    ? `${TRANSACCIONES_ROUTES.lista}?${queryString}` 
    : TRANSACCIONES_ROUTES.lista;
  
  // El backend devuelve directamente el objeto, no envuelto en { success, data }
  const response = await jsonFetch<{
    transacciones: any[]; // Recibimos con 'id', necesitamos mapear a '_id'
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  
  // Mapear la respuesta del backend al formato frontend
  // Backend usa 'id', frontend usa '_id'
  const transaccionesMapeadas: TransaccionMovimiento[] = response.transacciones.map((t: any) => ({
    _id: t.id,
    periodo: t.periodo,
    mes: t.mes,
    anio: t.anio,
    tipo: t.tipo,
    origen: t.origen,
    montoUSD: t.montoUSD,
    montoFormateado: t.montoFormateado,
    descripcion: t.descripcion,
    estado: t.estado,
    referenciaId: t.referenciaId,
    referenciaModelo: t.referenciaModelo,
    modeloId: t.modeloId,
    creadoPor: t.creadoPor,
    fechaCreacion: t.fechaCreacion,
    fechaConsolidacion: t.fechaConsolidacion,
    consolidadoPor: t.consolidadoPor,
    notas: t.notas,
    meta: t.meta,
  }));
  
  return {
    transacciones: transaccionesMapeadas,
    paginacion: {
      paginaActual: response.pagina,
      totalPaginas: response.totalPaginas,
      totalResultados: response.total,
      resultadosPorPagina: response.limite,
    },
  };
}

/**
 * Obtiene el detalle de una transacción específica
 */
export async function obtenerTransaccionDetalle(
  token: string,
  id: string
): Promise<TransaccionMovimiento> {
  const response = await jsonFetch<any>(
    TRANSACCIONES_ROUTES.detalle(id),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  
  // Mapear id -> _id
  return {
    _id: response.id,
    periodo: response.periodo,
    mes: response.mes,
    anio: response.anio,
    tipo: response.tipo,
    origen: response.origen,
    montoUSD: response.montoUSD,
    montoFormateado: response.montoFormateado,
    descripcion: response.descripcion,
    estado: response.estado,
    referenciaId: response.referenciaId,
    referenciaModelo: response.referenciaModelo,
    modeloId: response.modeloId,
    creadoPor: response.creadoPor,
    fechaCreacion: response.fechaCreacion,
    fechaConsolidacion: response.fechaConsolidacion,
    consolidadoPor: response.consolidadoPor,
    notas: response.notas,
    meta: response.meta,
  };
}

/**
 * Obtiene el resumen de transacciones de un periodo
 */
export async function obtenerResumenPeriodo(
  token: string,
  mes: number,
  anio: number
): Promise<ResumenTransaccionesPeriodoDto> {
  const response = await jsonFetch<ResumenTransaccionesPeriodoDto>(
    TRANSACCIONES_ROUTES.resumenPeriodo(mes, anio),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  
  return response;
}

/**
 * Obtiene el saldo actual en movimiento
 */
export async function obtenerSaldoMovimiento(
  token: string
): Promise<SaldoMovimientoDto> {
  const response = await jsonFetch<SaldoMovimientoDto>(
    TRANSACCIONES_ROUTES.saldoMovimiento,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  
  return response;
}

/**
 * Obtiene el flujo de caja detallado de un periodo
 */
export async function obtenerFlujoCaja(
  token: string,
  mes: number,
  anio: number
): Promise<FlujoCajaDetalladoDto> {
  const response = await jsonFetch<FlujoCajaDetalladoDto>(
    TRANSACCIONES_ROUTES.flujoCaja(mes, anio),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  
  return response;
}

/**
 * Obtiene la comparativa entre múltiples periodos
 */
export async function obtenerComparativa(
  token: string,
  dto: ComparativaTransaccionesDto
): Promise<ComparativaTransaccionesResponseDto> {
  const response = await jsonFetch<ComparativaTransaccionesResponseDto>(
    TRANSACCIONES_ROUTES.comparativa,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(dto),
    }
  );
  
  return response;
}

/**
 * Obtiene el estado del Bank OnlyTop (desde transacciones)
 */
export async function obtenerBankEstado(
  token: string
): Promise<BankOnlyTop> {
  const response = await jsonFetch<BankOnlyTop>(
    TRANSACCIONES_ROUTES.bankEstado,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  
  return response;
}

/**
 * Revierte una transacción
 */
export async function revertirTransaccion(
  token: string,
  id: string,
  dto: RevertirTransaccionDto
): Promise<{ transaccionOriginal: TransaccionMovimiento; transaccionReversa: TransaccionMovimiento }> {
  const response = await jsonFetch<{ 
    transaccionOriginal: TransaccionMovimiento; 
    transaccionReversa: TransaccionMovimiento;
  }>(
    TRANSACCIONES_ROUTES.revertir(id),
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(dto),
    }
  );
  
  return response;
}
