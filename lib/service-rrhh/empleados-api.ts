import { requestJSON } from '../utils/fetcher';
import type { 
  Empleado, 
  Contrato, 
  CreateEmpleadoDto, 
  UpdateEmpleadoDto,
  EmpleadosStats
} from './empleados-types';

const EMPLEADOS_ROUTES = {
  empleados: '/api/rrhh/empleados',
  empleadoById: (id: string) => `/api/rrhh/empleados/${id}`,
  empleadosStats: '/api/rrhh/empleados/stats',
  contratosByEmpleado: (id: string) => `/api/rrhh/empleados/${id}/contratos`,
  aprobarContrato: (contratoId: string) => `/api/rrhh/empleados/contratos/${contratoId}/aprobar`,
} as const;

// ========== EMPLEADOS ==========

export function createEmpleado(data: CreateEmpleadoDto, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleados, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAllEmpleados(token: string, includeInactive = false, areaId?: string, cargoId?: string): Promise<Empleado[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append('includeInactive', 'true');
  if (areaId) params.append('areaId', areaId);
  if (cargoId) params.append('cargoId', cargoId);
  
  const url = params.toString() 
    ? `${EMPLEADOS_ROUTES.empleados}?${params.toString()}`
    : EMPLEADOS_ROUTES.empleados;
    
  return requestJSON<Empleado[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getEmpleadoById(id: string, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleadoById(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateEmpleado(id: string, data: UpdateEmpleadoDto, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleadoById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteEmpleado(id: string, token: string): Promise<void> {
  return requestJSON<void>(EMPLEADOS_ROUTES.empleadoById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getEmpleadosStats(token: string): Promise<EmpleadosStats> {
  return requestJSON<EmpleadosStats>(EMPLEADOS_ROUTES.empleadosStats, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== CONTRATOS ==========

export function getContratosByEmpleado(empleadoId: string, token: string): Promise<Contrato[]> {
  return requestJSON<Contrato[]>(EMPLEADOS_ROUTES.contratosByEmpleado(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function aprobarContrato(contratoId: string, estado: 'APROBADO' | 'RECHAZADO', comentarios: string | null, token: string): Promise<Contrato> {
  return requestJSON<Contrato>(EMPLEADOS_ROUTES.aprobarContrato(contratoId), {
    method: 'PATCH',
    body: JSON.stringify({ estado, comentarios }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== FOTOS ==========

export function uploadEmpleadoPhoto(formData: FormData, token: string): Promise<{ success: boolean; data?: { url: string; publicId: string }; message?: string }> {
  return fetch(`${requestJSON.base('/api/rrhh/empleados/upload-photo')}`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir la foto');
    }
    return response.json();
  });
}