import { requestJSON } from '../utils/fetcher';

export interface RecruitmentGoal {
  _id: string;
  salesCloserId: string | {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
    correoCorporativo?: string;
  };
  titulo: string;
  descripcion?: string;
  tipo: 'MODELOS_CERRADAS' | 'FACTURACION';
  valorObjetivo: number;
  moneda: string;
  periodo: 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' | 'PERSONALIZADO';
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA' | 'VENCIDA';
  valorActual: number;
  porcentajeCompletado: number;
  notificacionesActivas: boolean;
  umbralNotificaciones: number[];
  notificacionesEnviadas: Array<{
    porcentaje: number;
    fechaEnvio: string;
    mensaje: string;
  }>;
  emailSalesCloser?: string;
  nombreSalesCloser?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalDto {
  salesCloserId: string;
  titulo: string;
  descripcion?: string;
  tipo: 'MODELOS_CERRADAS' | 'FACTURACION';
  valorObjetivo: number;
  moneda?: string;
  periodo: 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' | 'PERSONALIZADO';
  fechaInicio: string;
  fechaFin: string;
  notificacionesActivas?: boolean;
  umbralNotificaciones?: number[];
}

export interface UpdateGoalDto {
  titulo?: string;
  descripcion?: string;
  valorObjetivo?: number;
  moneda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA' | 'VENCIDA';
  notificacionesActivas?: boolean;
  umbralNotificaciones?: number[];
}

export interface GoalStats {
  total: number;
  activas: number;
  completadas: number;
  vencidas: number;
  promedioCompletado: number;
  tasaExito: number;
}

/**
 * Obtiene todas las metas de recruitment con filtros opcionales
 */
export async function getGoals(token: string, filters?: {
  salesCloserId?: string;
  estado?: string;
  tipo?: string;
  activas?: boolean;
}): Promise<RecruitmentGoal[]> {
  const params = new URLSearchParams();
  if (filters?.salesCloserId) params.append('salesCloserId', filters.salesCloserId);
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.activas) params.append('activas', 'true');

  const query = params.toString() ? `?${params.toString()}` : '';
  return requestJSON(`/api/recruitment/goals${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtiene una meta por ID
 */
export async function getGoalById(token: string, id: string): Promise<RecruitmentGoal> {
  return requestJSON(`/api/recruitment/goals/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Crea una nueva meta de recruitment
 */
export async function createGoal(token: string, data: CreateGoalDto): Promise<RecruitmentGoal> {
  return requestJSON('/api/recruitment/goals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza una meta existente
 */
export async function updateGoal(token: string, id: string, data: UpdateGoalDto): Promise<RecruitmentGoal> {
  return requestJSON(`/api/recruitment/goals/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Elimina una meta
 */
export async function deleteGoal(token: string, id: string): Promise<void> {
  return requestJSON(`/api/recruitment/goals/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Actualiza el progreso de una meta manualmente
 */
export async function updateGoalProgress(token: string, id: string): Promise<RecruitmentGoal> {
  return requestJSON(`/api/recruitment/goals/${id}/update-progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtiene estadísticas de metas
 */
export async function getGoalStats(token: string, salesCloserId?: string): Promise<GoalStats> {
  const query = salesCloserId ? `?salesCloserId=${salesCloserId}` : '';
  return requestJSON(`/api/recruitment/goals/stats${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Fuerza la actualización de todas las metas activas
 */
export async function updateAllActiveGoals(token: string): Promise<{ message: string }> {
  return requestJSON('/api/recruitment/goals/update-all', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

