import { requestJSON } from '../utils/fetcher';
import { CHATTER_ROUTES } from './routes';
import type {
  ChatterSale,
  CreateSaleDto,
  UpdateSaleDto,
  FilterSalesDto,
  GroupSalesData,
  ChatterStats,
  ModeloStats,
  GeneralStats,
  GroupComparison,
  ActiveChatter,
  ModeloChatters,
} from './types';

// ========== GESTIÓN DE VENTAS ==========

export function createSale(token: string, data: CreateSaleDto): Promise<ChatterSale> {
  return requestJSON<ChatterSale>(CHATTER_ROUTES.sales, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export function getSales(token: string, filters?: FilterSalesDto): Promise<ChatterSale[]> {
  const params = new URLSearchParams();
  if (filters?.modeloId) params.append('modeloId', filters.modeloId);
  if (filters?.chatterId) params.append('chatterId', filters.chatterId);
  if (filters?.tipoVenta) params.append('tipoVenta', filters.tipoVenta);
  if (filters?.turno) params.append('turno', filters.turno);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.plataforma) params.append('plataforma', filters.plataforma);

  const query = params.toString();
  const path = query ? `${CHATTER_ROUTES.sales}?${query}` : CHATTER_ROUTES.sales;

  return requestJSON<ChatterSale[]>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getSaleById(token: string, id: string): Promise<ChatterSale> {
  return requestJSON<ChatterSale>(CHATTER_ROUTES.saleById(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateSale(token: string, id: string, data: UpdateSaleDto): Promise<ChatterSale> {
  return requestJSON<ChatterSale>(CHATTER_ROUTES.saleById(id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export function deleteSale(token: string, id: string): Promise<void> {
  return requestJSON<void>(CHATTER_ROUTES.saleById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== ESTADÍSTICAS ==========

export function getGeneralStats(
  token: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<GeneralStats> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query ? `${CHATTER_ROUTES.generalStats}?${query}` : CHATTER_ROUTES.generalStats;

  return requestJSON<GeneralStats>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getGroupSales(
  token: string,
  modeloId: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<GroupSalesData> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query
    ? `${CHATTER_ROUTES.groupSales(modeloId)}?${query}`
    : CHATTER_ROUTES.groupSales(modeloId);

  return requestJSON<GroupSalesData>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getChatterStats(
  token: string,
  chatterId: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<ChatterStats> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query
    ? `${CHATTER_ROUTES.chatterStats(chatterId)}?${query}`
    : CHATTER_ROUTES.chatterStats(chatterId);

  return requestJSON<ChatterStats>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getModeloStats(
  token: string,
  modeloId: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<ModeloStats> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query
    ? `${CHATTER_ROUTES.modeloStats(modeloId)}?${query}`
    : CHATTER_ROUTES.modeloStats(modeloId);

  return requestJSON<ModeloStats>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function compareGroups(
  token: string,
  modeloIds: string[],
  fechaInicio?: string,
  fechaFin?: string,
): Promise<GroupComparison> {
  return requestJSON<GroupComparison>(CHATTER_ROUTES.compareGroups, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ modeloIds, fechaInicio, fechaFin }),
  });
}

// ========== CHATTERS ==========

export function getActiveChatters(token: string): Promise<ActiveChatter[]> {
  return requestJSON<ActiveChatter[]>(CHATTER_ROUTES.activeChatters, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getModeloChatters(token: string, modeloId: string): Promise<ModeloChatters> {
  return requestJSON<ModeloChatters>(CHATTER_ROUTES.modeloChatters(modeloId), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== EXPORTACIÓN PDF ==========

export function downloadGroupSalesPdf(
  token: string,
  modeloId: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<Blob> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query
    ? `${CHATTER_ROUTES.groupSalesPdf(modeloId)}?${query}`
    : CHATTER_ROUTES.groupSalesPdf(modeloId);

  return fetch(requestJSON.base(path), {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}

export function downloadChatterStatsPdf(
  token: string,
  chatterId: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<Blob> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query
    ? `${CHATTER_ROUTES.chatterStatsPdf(chatterId)}?${query}`
    : CHATTER_ROUTES.chatterStatsPdf(chatterId);

  return fetch(requestJSON.base(path), {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}

export function downloadGroupComparisonPdf(
  token: string,
  modeloIds: string[],
  fechaInicio?: string,
  fechaFin?: string,
): Promise<Blob> {
  return fetch(requestJSON.base(CHATTER_ROUTES.compareGroupsPdf), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modeloIds, fechaInicio, fechaFin }),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}

export function downloadGeneralStatsPdf(
  token: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<Blob> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const query = params.toString();
  const path = query ? `${CHATTER_ROUTES.generalStatsPdf}?${query}` : CHATTER_ROUTES.generalStatsPdf;

  return fetch(requestJSON.base(path), {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}

// ========== FUNCIONES DE EXCEL ==========

/**
 * Descarga la plantilla Excel para importación masiva de ventas
 */
export function downloadExcelTemplate(token: string): Promise<Blob> {
  return fetch(requestJSON.base('/api/chatter/sales/excel/template'), {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}

/**
 * Importa ventas desde un archivo Excel
 */
export async function importSalesFromExcel(
  token: string,
  file: File
): Promise<{
  exitosas: number;
  fallidas: number;
  errores: Array<{ fila: number; mensaje: string }>;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(requestJSON.base('/api/chatter/sales/excel/import'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return await response.json();
}

