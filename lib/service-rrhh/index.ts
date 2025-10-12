import { requestJSON } from '@/lib/utils/fetcher';
import { RRHH_ROUTES } from './routes';
import type {
  EndowmentCategory,
  EndowmentItem,
  EndowmentTracking,
  EndowmentStats,
  CreateEndowmentCategoryDto,
  UpdateEndowmentCategoryDto,
  CreateEndowmentItemDto,
  UpdateEndowmentItemDto,
  CreateEndowmentTrackingDto,
  UpdateEndowmentTrackingDto,
} from './types';

// ========== Categorías ==========
export function getEndowmentCategories(token: string, includeInactive = false) {
  const url = includeInactive
    ? `${RRHH_ROUTES.endowment.categories}?includeInactive=true`
    : RRHH_ROUTES.endowment.categories;
  return requestJSON<EndowmentCategory[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createEndowmentCategory(data: CreateEndowmentCategoryDto, token: string) {
  return requestJSON<EndowmentCategory>(RRHH_ROUTES.endowment.categories, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateEndowmentCategory(id: string, data: UpdateEndowmentCategoryDto, token: string) {
  return requestJSON<EndowmentCategory>(RRHH_ROUTES.endowment.categoryById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteEndowmentCategory(id: string, token: string) {
  return requestJSON<void>(RRHH_ROUTES.endowment.categoryById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Items ==========
export function getEndowmentItems(token: string, includeInactive = false, categoryId?: string) {
  const params = new URLSearchParams();
  if (includeInactive) params.append('includeInactive', 'true');
  if (categoryId) params.append('categoryId', categoryId);
  const url = params.toString()
    ? `${RRHH_ROUTES.endowment.items}?${params.toString()}`
    : RRHH_ROUTES.endowment.items;
  return requestJSON<EndowmentItem[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createEndowmentItem(data: CreateEndowmentItemDto, token: string) {
  return requestJSON<EndowmentItem>(RRHH_ROUTES.endowment.items, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateEndowmentItem(id: string, data: UpdateEndowmentItemDto, token: string) {
  return requestJSON<EndowmentItem>(RRHH_ROUTES.endowment.itemById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteEndowmentItem(id: string, token: string) {
  return requestJSON<void>(RRHH_ROUTES.endowment.itemById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Tracking ==========
export function getEndowmentTracking(token: string, query?: Partial<{ empleadoId: string; itemId: string; categoryId: string; action: string; startDate: string; endDate: string }>) {
  const params = new URLSearchParams();
  if (query?.empleadoId) params.append('empleadoId', query.empleadoId);
  if (query?.itemId) params.append('itemId', query.itemId);
  if (query?.categoryId) params.append('categoryId', query.categoryId);
  if (query?.action) params.append('action', query.action);
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);
  const url = params.toString()
    ? `${RRHH_ROUTES.endowment.tracking}?${params.toString()}`
    : RRHH_ROUTES.endowment.tracking;
  return requestJSON<EndowmentTracking[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createEndowmentTracking(data: CreateEndowmentTrackingDto, token: string) {
  return requestJSON<EndowmentTracking>(RRHH_ROUTES.endowment.tracking, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateEndowmentTracking(id: string, data: UpdateEndowmentTrackingDto, token: string) {
  return requestJSON<EndowmentTracking>(RRHH_ROUTES.endowment.trackingById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteEndowmentTracking(id: string, token: string) {
  return requestJSON<void>(RRHH_ROUTES.endowment.trackingById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Estadísticas ==========
export function getEndowmentStats(token: string, query?: Partial<{ areaId: string; categoryId: string; startDate: string; endDate: string }>) {
  const params = new URLSearchParams();
  if (query?.areaId) params.append('areaId', query.areaId);
  if (query?.categoryId) params.append('categoryId', query.categoryId);
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);
  const url = params.toString() ? `${RRHH_ROUTES.endowment.stats}?${params.toString()}` : RRHH_ROUTES.endowment.stats;
  return requestJSON<EndowmentStats>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getEmpleadoEndowmentResumen(empleadoId: string, token: string) {
  return requestJSON<{ totalEntregas: number; totalDevoluciones: number; itemsActivos: number; categorias: string[]; valorTotalEstimado: number }>(
    RRHH_ROUTES.endowment.empleado.resumen(empleadoId),
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
}

export function getEmpleadoEndowmentHistorial(empleadoId: string, token: string) {
  return requestJSON<EndowmentTracking[]>(RRHH_ROUTES.endowment.empleado.historial(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getEmpleadoEndowmentItemsActivos(empleadoId: string, token: string) {
  return requestJSON<EndowmentTracking[]>(RRHH_ROUTES.endowment.empleado.itemsActivos(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

