import { requestJSON } from '@/lib/utils/fetcher';
import type {
  ChatterCommission,
  GenerateCommissionsDto,
  ApproveCommissionDto,
  RejectCommissionDto,
  PayCommissionDto,
  FilterCommissionsDto,
  BulkApproveCommissionsDto,
  BulkPayCommissionsDto,
  CommissionStatistics,
  GenerateCommissionsResult,
} from './commissions-types';

const BASE_PATH = '/api/chatter/sales/commissions';

// ========== Generar Comisiones ==========

export async function generateCommissions(
  token: string,
  data: GenerateCommissionsDto,
): Promise<GenerateCommissionsResult> {
  return requestJSON(`${BASE_PATH}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ========== CRUD de Comisiones ==========

export async function getCommissions(
  token: string,
  filters?: FilterCommissionsDto,
): Promise<ChatterCommission[]> {
  const params = new URLSearchParams();
  // Solo agregar params si tienen valor
  if (filters?.chatterId && filters.chatterId.trim()) params.append('chatterId', filters.chatterId);
  if (filters?.modeloId && filters.modeloId.trim()) params.append('modeloId', filters.modeloId);
  if (filters?.goalId && filters.goalId.trim()) params.append('goalId', filters.goalId);
  if (filters?.estado && filters.estado.trim()) params.append('estado', filters.estado);
  if (filters?.fechaInicio && filters.fechaInicio.trim()) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin && filters.fechaFin.trim()) params.append('fechaFin', filters.fechaFin);

  const query = params.toString();
  return requestJSON(`${BASE_PATH}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCommissionById(token: string, id: string): Promise<ChatterCommission> {
  return requestJSON(`${BASE_PATH}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCommissionsForChatter(
  token: string,
  chatterId: string,
  estado?: string,
): Promise<ChatterCommission[]> {
  const params = new URLSearchParams();
  // Solo agregar params si tienen valor
  if (estado && estado.trim()) params.append('estado', estado);

  const query = params.toString();
  return requestJSON(`${BASE_PATH}/chatter/${chatterId}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Aprobación ==========

export async function approveCommission(
  token: string,
  id: string,
  data: ApproveCommissionDto,
): Promise<ChatterCommission> {
  return requestJSON(`${BASE_PATH}/${id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function rejectCommission(
  token: string,
  id: string,
  data: RejectCommissionDto,
): Promise<ChatterCommission> {
  return requestJSON(`${BASE_PATH}/${id}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function bulkApproveCommissions(
  token: string,
  data: BulkApproveCommissionsDto,
): Promise<{ approved: number; failed: number; errors: Array<{ id: string; error: string }> }> {
  return requestJSON(`${BASE_PATH}/bulk-approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ========== Pago ==========

export async function payCommission(
  token: string,
  id: string,
  data: PayCommissionDto,
): Promise<ChatterCommission> {
  return requestJSON(`${BASE_PATH}/${id}/pay`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function bulkPayCommissions(
  token: string,
  data: BulkPayCommissionsDto,
): Promise<{ paid: number; failed: number; errors: Array<{ id: string; error: string }> }> {
  return requestJSON(`${BASE_PATH}/bulk-pay`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ========== Eliminar ==========

export async function deleteCommission(token: string, id: string): Promise<void> {
  return requestJSON(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Estadísticas ==========

export async function getCommissionStatistics(
  token: string,
  chatterId?: string,
  modeloId?: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<CommissionStatistics> {
  const params = new URLSearchParams();
  // Solo agregar params si tienen valor
  if (chatterId && chatterId.trim()) params.append('chatterId', chatterId);
  if (modeloId && modeloId.trim()) params.append('modeloId', modeloId);
  if (fechaInicio && fechaInicio.trim()) params.append('fechaInicio', fechaInicio);
  if (fechaFin && fechaFin.trim()) params.append('fechaFin', fechaFin);

  const query = params.toString();
  return requestJSON(`${BASE_PATH}/statistics${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

