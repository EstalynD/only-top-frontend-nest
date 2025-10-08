import { requestJSON } from '@/lib/utils/fetcher';
import type {
  ChatterGoal,
  CreateChatterGoalDto,
  UpdateChatterGoalDto,
  CloseChatterGoalDto,
  FilterChatterGoalsDto,
  GoalProgress,
  GoalStatistics,
} from './goals-types';

const BASE_PATH = '/api/chatter/sales/goals';

// ========== CRUD de Metas ==========

export async function createGoal(token: string, data: CreateChatterGoalDto): Promise<ChatterGoal> {
  return requestJSON(`${BASE_PATH}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function getGoals(token: string, filters?: FilterChatterGoalsDto): Promise<ChatterGoal[]> {
  const params = new URLSearchParams();
  // Solo agregar params si tienen valor
  if (filters?.modeloId && filters.modeloId.trim()) params.append('modeloId', filters.modeloId);
  if (filters?.estado && filters.estado.trim()) params.append('estado', filters.estado);
  if (filters?.fechaInicio && filters.fechaInicio.trim()) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin && filters.fechaFin.trim()) params.append('fechaFin', filters.fechaFin);

  const query = params.toString();
  return requestJSON(`${BASE_PATH}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getGoalById(token: string, id: string): Promise<ChatterGoal> {
  return requestJSON(`${BASE_PATH}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getActiveGoalForModel(token: string, modeloId: string): Promise<ChatterGoal | null> {
  return requestJSON(`${BASE_PATH}/modelo/${modeloId}/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateGoal(
  token: string,
  id: string,
  data: UpdateChatterGoalDto,
): Promise<ChatterGoal> {
  return requestJSON(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function closeGoal(
  token: string,
  id: string,
  data: CloseChatterGoalDto,
): Promise<ChatterGoal> {
  return requestJSON(`${BASE_PATH}/${id}/close`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function cancelGoal(token: string, id: string, reason?: string): Promise<ChatterGoal> {
  return requestJSON(`${BASE_PATH}/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });
}

export async function deleteGoal(token: string, id: string): Promise<void> {
  return requestJSON(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== Progreso y Estadísticas ==========

export async function updateGoalProgress(token: string, id: string): Promise<GoalProgress> {
  return requestJSON(`${BASE_PATH}/${id}/update-progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getGoalStatistics(
  token: string,
  modeloId?: string,
  fechaInicio?: string,
  fechaFin?: string,
): Promise<GoalStatistics> {
  const params = new URLSearchParams();
  // Solo agregar params si tienen valor
  if (modeloId && modeloId.trim()) params.append('modeloId', modeloId);
  if (fechaInicio && fechaInicio.trim()) params.append('fechaInicio', fechaInicio);
  if (fechaFin && fechaFin.trim()) params.append('fechaFin', fechaFin);

  const query = params.toString();
  return requestJSON(`${BASE_PATH}/statistics${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

