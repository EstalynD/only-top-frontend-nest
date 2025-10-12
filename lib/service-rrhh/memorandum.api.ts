import { requestJSON } from '../utils/fetcher';
import type {
  Memorandum,
  MemorandumStats,
  MemorandumFilters,
  SubsaneMemorandumDto,
  ReviewMemorandumDto
} from './memorandum-types';

const MEMORANDUM_ROUTES = {
  // Legacy
  generate: '/api/rrhh/memorandum/generate',
  
  // Empleado endpoints
  empleadoMemorandos: '/api/rrhh/attendance/empleado/mis-memorandos',
  empleadoMemorandum: (id: string) => `/api/rrhh/attendance/empleado/mis-memorandos/${id}`,
  empleadoSubsanar: (id: string) => `/api/rrhh/attendance/empleado/subsanar-memorando/${id}`,
  empleadoStats: '/api/rrhh/attendance/empleado/mis-memorandos-stats',
  
  // Admin endpoints
  adminTodos: '/api/rrhh/attendance/admin/memorandos/todos', // NUEVO: Todos los memorandos
  adminPendientes: '/api/rrhh/attendance/admin/memorandos/pendientes',
  adminMemorandum: (id: string) => `/api/rrhh/attendance/admin/memorandos/${id}`,
  adminRevisar: (id: string) => `/api/rrhh/attendance/admin/memorandos/${id}/revisar`,
  adminUsuario: (userId: string) => `/api/rrhh/attendance/admin/memorandos/usuario/${userId}`,
  adminEmpleado: (empleadoId: string) => `/api/rrhh/attendance/admin/memorandos/empleado/${empleadoId}`,
  adminStats: '/api/rrhh/attendance/admin/memorandos-stats',
  adminExpirar: '/api/rrhh/attendance/admin/memorandos/expirar-vencidos'
} as const;

export type MemorandumType = 'AUSENCIA' | 'LLEGADA_TARDE' | 'SALIDA_ANTICIPADA' | 'SALIDA_OMITIDA';

export interface GenerateMemorandumRequest {
  type: MemorandumType;
  userId: string;
  date: string; // Format: YYYY-MM-DD
}

/**
 * Genera un memorando en formato PDF y lo descarga automáticamente
 */
export async function generateMemorandum(
  token: string,
  request: GenerateMemorandumRequest
): Promise<void> {
  const params = new URLSearchParams({
    type: request.type,
    userId: request.userId,
    date: request.date
  });

  const url = `${MEMORANDUM_ROUTES.generate}?${params.toString()}`;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al generar memorando: ${errorText || response.statusText}`);
    }

    // Get filename from Content-Disposition header or create default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `memorando-${request.type.toLowerCase()}-${request.date}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Download the PDF
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error generating memorandum:', error);
    throw error;
  }
}

/**
 * Obtiene el label en español para el tipo de memorando
 */
export function getMemorandumTypeLabel(type: MemorandumType): string {
  const labels: Record<MemorandumType, string> = {
    'AUSENCIA': 'Ausencia Injustificada',
    'LLEGADA_TARDE': 'Llegada Tarde',
    'SALIDA_ANTICIPADA': 'Salida Anticipada',
    'SALIDA_OMITIDA': 'Salida Omitida'
  };
  return labels[type];
}

/**
 * Obtiene el color para el tipo de memorando
 */
export function getMemorandumTypeColor(type: MemorandumType): string {
  const colors: Record<MemorandumType, string> = {
    'AUSENCIA': 'var(--ot-red-500)',
    'LLEGADA_TARDE': 'var(--ot-yellow-500)',
    'SALIDA_ANTICIPADA': 'var(--ot-orange-500)',
    'SALIDA_OMITIDA': 'var(--ot-purple-500)'
  };
  return colors[type];
}

// ========== ENDPOINTS EMPLEADO ==========

/**
 * Obtiene todos los memorandos del empleado autenticado
 */
export function empleadoGetMemorandos(
  token: string,
  filters?: MemorandumFilters
): Promise<Memorandum[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.empleadoMemorandos}?${params.toString()}`
    : MEMORANDUM_ROUTES.empleadoMemorandos;

  return requestJSON<Memorandum[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Obtiene un memorando específico del empleado
 */
export function empleadoGetMemorandum(
  token: string,
  memorandumId: string
): Promise<Memorandum> {
  return requestJSON<Memorandum>(
    MEMORANDUM_ROUTES.empleadoMemorandum(memorandumId),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    }
  );
}

/**
 * Subsana un memorando pendiente
 */
export function empleadoSubsanarMemorandum(
  token: string,
  memorandumId: string,
  data: SubsaneMemorandumDto
): Promise<Memorandum> {
  return requestJSON<Memorandum>(
    MEMORANDUM_ROUTES.empleadoSubsanar(memorandumId),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }
  );
}

/**
 * Obtiene estadísticas de memorandos del empleado
 */
export function empleadoGetMemorandumStats(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<MemorandumStats> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.empleadoStats}?${params.toString()}`
    : MEMORANDUM_ROUTES.empleadoStats;

  return requestJSON<MemorandumStats>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

// ========== ENDPOINTS ADMIN ==========

/**
 * Obtiene TODOS los memorandos del sistema con filtros (RRHH)
 * A diferencia de adminGetMemorandosPendientes, este endpoint retorna memorandos en cualquier estado
 */
export function adminGetTodosMemorandos(
  token: string,
  filters?: MemorandumFilters
): Promise<Memorandum[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.areaId) params.append('areaId', filters.areaId);
  if (filters?.cargoId) params.append('cargoId', filters.cargoId);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.adminTodos}?${params.toString()}`
    : MEMORANDUM_ROUTES.adminTodos;

  return requestJSON<Memorandum[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Obtiene memorandos pendientes de revisión (RRHH)
 */
export function adminGetMemorandosPendientes(
  token: string,
  filters?: MemorandumFilters
): Promise<Memorandum[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.areaId) params.append('areaId', filters.areaId);
  if (filters?.cargoId) params.append('cargoId', filters.cargoId);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.adminPendientes}?${params.toString()}`
    : MEMORANDUM_ROUTES.adminPendientes;

  return requestJSON<Memorandum[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Obtiene un memorando específico (admin)
 */
export function adminGetMemorandum(
  token: string,
  memorandumId: string
): Promise<Memorandum> {
  return requestJSON<Memorandum>(
    MEMORANDUM_ROUTES.adminMemorandum(memorandumId),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    }
  );
}

/**
 * Revisa y aprueba/rechaza un memorando (RRHH)
 */
export function adminRevisarMemorandum(
  token: string,
  memorandumId: string,
  data: ReviewMemorandumDto
): Promise<Memorandum> {
  return requestJSON<Memorandum>(
    MEMORANDUM_ROUTES.adminRevisar(memorandumId),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }
  );
}

/**
 * Obtiene todos los memorandos de un usuario (admin)
 */
export function adminGetMemorandosUsuario(
  token: string,
  userId: string,
  filters?: MemorandumFilters
): Promise<Memorandum[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.adminUsuario(userId)}?${params.toString()}`
    : MEMORANDUM_ROUTES.adminUsuario(userId);

  return requestJSON<Memorandum[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Obtiene todos los memorandos de un empleado por empleadoId (admin)
 */
export function adminGetMemorandosEmpleado(
  token: string,
  empleadoId: string,
  filters?: MemorandumFilters
): Promise<Memorandum[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.adminEmpleado(empleadoId)}?${params.toString()}`
    : MEMORANDUM_ROUTES.adminEmpleado(empleadoId);

  return requestJSON<Memorandum[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Obtiene estadísticas globales de memorandos (admin)
 */
export function adminGetMemorandumStats(
  token: string,
  filters?: MemorandumFilters
): Promise<MemorandumStats> {
  const params = new URLSearchParams();
  if (filters?.areaId) params.append('areaId', filters.areaId);
  if (filters?.cargoId) params.append('cargoId', filters.cargoId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const url = params.toString()
    ? `${MEMORANDUM_ROUTES.adminStats}?${params.toString()}`
    : MEMORANDUM_ROUTES.adminStats;

  return requestJSON<MemorandumStats>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
}

/**
 * Ejecuta manualmente el job de expiración de memorandos
 */
export function adminExpirarMemorandosVencidos(
  token: string
): Promise<{ success: boolean; message: string; count: number }> {
  return requestJSON<{ success: boolean; message: string; count: number }>(
    MEMORANDUM_ROUTES.adminExpirar,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}
