/**
 * API del módulo de ventas de modelos
 */

import { requestJSON, base } from '../utils/fetcher';
import { MODELOS_VENTAS_ROUTES } from './routes';
import type {
  ModeloSalesResponse,
  ModeloSalesStatisticsResponse,
  CompareModelosResponse,
  SalesGroupedResponse,
  DashboardResponse,
  SalesFilters,
  GroupByOption,
} from './types';

/**
 * Obtener ventas de una modelo con filtros
 */
export async function getModeloSales(
  token: string,
  modeloId: string,
  filters?: SalesFilters
): Promise<ModeloSalesResponse> {
  const params = new URLSearchParams();
  
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.chatterId) params.append('chatterId', filters.chatterId);
  if (filters?.turno) params.append('turno', filters.turno);
  if (filters?.tipoVenta) params.append('tipoVenta', filters.tipoVenta);
  if (filters?.plataforma) params.append('plataforma', filters.plataforma);

  const url = `${MODELOS_VENTAS_ROUTES.modeloSales(modeloId)}?${params}`;

  return requestJSON<ModeloSalesResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener estadísticas de ventas de una modelo
 */
export async function getModeloSalesStatistics(
  token: string,
  modeloId: string,
  fechaInicio?: string,
  fechaFin?: string
): Promise<ModeloSalesStatisticsResponse> {
  const params = new URLSearchParams();
  
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const url = `${MODELOS_VENTAS_ROUTES.modeloSalesStats(modeloId)}?${params}`;

  return requestJSON<ModeloSalesStatisticsResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Comparar ventas entre múltiples modelos
 */
export async function compareModelos(
  token: string,
  modeloIds: string[],
  fechaInicio?: string,
  fechaFin?: string
): Promise<CompareModelosResponse> {
  return requestJSON<CompareModelosResponse>(MODELOS_VENTAS_ROUTES.comparar, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ modeloIds, fechaInicio, fechaFin }),
    cache: 'no-store',
  });
}

/**
 * Obtener ventas agrupadas por criterio
 */
export async function getSalesGrouped(
  token: string,
  groupBy: GroupByOption,
  fechaInicio?: string,
  fechaFin?: string
): Promise<SalesGroupedResponse> {
  const params = new URLSearchParams({ groupBy });
  
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const url = `${MODELOS_VENTAS_ROUTES.agrupadas}?${params}`;

  return requestJSON<SalesGroupedResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener dashboard general de ventas
 */
export async function getVentasDashboard(
  token: string,
  fechaInicio?: string,
  fechaFin?: string
): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const url = `${MODELOS_VENTAS_ROUTES.dashboard}?${params}`;

  return requestJSON<DashboardResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener indicadores y métricas avanzadas
 */
export async function getIndicadores(
  token: string,
  fechaInicio?: string,
  fechaFin?: string
): Promise<any> {
  const params = new URLSearchParams();
  
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const url = `${MODELOS_VENTAS_ROUTES.indicadores}?${params}`;

  return requestJSON(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Exportar ventas a Excel
 */
export async function exportVentasExcel(
  token: string,
  filters?: SalesFilters & { modeloId?: string }
): Promise<Blob> {
  const params = new URLSearchParams();
  
  if (filters?.modeloId) params.append('modeloId', filters.modeloId);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.chatterId) params.append('chatterId', filters.chatterId);
  if (filters?.turno) params.append('turno', filters.turno);
  if (filters?.tipoVenta) params.append('tipoVenta', filters.tipoVenta);

  const path = `${MODELOS_VENTAS_ROUTES.exportExcel}?${params}`;
  const url = base(path);
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error al exportar a Excel');
  }

  return response.blob();
}

/**
 * Exportar ventas a PDF
 */
export async function exportVentasPdf(
  token: string,
  filters?: SalesFilters & { modeloId?: string }
): Promise<Blob> {
  const params = new URLSearchParams();
  
  if (filters?.modeloId) params.append('modeloId', filters.modeloId);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.chatterId) params.append('chatterId', filters.chatterId);
  if (filters?.turno) params.append('turno', filters.turno);
  if (filters?.tipoVenta) params.append('tipoVenta', filters.tipoVenta);

  const path = `${MODELOS_VENTAS_ROUTES.exportPdf}?${params}`;
  const url = base(path);
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error al exportar a PDF');
  }

  return response.blob();
}

