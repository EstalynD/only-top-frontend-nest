import { requestJSON } from '../utils/fetcher';
import type { 
  Empleado, 
  Contrato, 
  CreateEmpleadoDto, 
  UpdateEmpleadoDto,
  EmpleadosStats
} from './empleados-types';

// Función para normalizar URLs de Cloudinary
export function normalizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    // If the URL is already simple (no automatic transformations), return it as is
    if (!url.includes('/auto/upload/') && !url.includes('/upload/s--')) {
      return url;
    }

    // Extract the public_id from the URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
      return url;
    }

    // Find the public_id after transformations
    let publicId = '';
    for (let i = uploadIndex + 1; i < urlParts.length; i++) {
      const part = urlParts[i];
      if (part.includes('.') && !part.includes('--')) {
        publicId = part;
        break;
      }
    }

    if (!publicId) {
      return url;
    }

    // Generate a simple URL without automatic transformations
    const cloudName = urlParts[2]; // res.cloudinary.com/[cloudName]/...
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  } catch (error) {
    console.warn('Error normalizando URL de Cloudinary:', error);
    return url;
  }
}

// Función para normalizar URLs de imágenes en un empleado
export function normalizeEmpleadoImageUrls(empleado: Empleado): Empleado {
  if (empleado.fotoPerfil) {
    empleado.fotoPerfil = normalizeCloudinaryUrl(empleado.fotoPerfil);
  }
  return empleado;
}

const EMPLEADOS_ROUTES = {
  empleados: '/api/rrhh/empleados',
  empleadoById: (id: string) => `/api/rrhh/empleados/${id}`,
  empleadosStats: '/api/rrhh/empleados/stats',
  contratosByEmpleado: (id: string) => `/api/rrhh/empleados/${id}/contratos`,
  aprobarContrato: (contratoId: string) => `/api/rrhh/empleados/contratos/${contratoId}/aprobar`,
  crearCuenta: (id: string) => `/api/rrhh/empleados/${id}/crear-cuenta`,
  resetPassword: (id: string) => `/api/rrhh/empleados/${id}/reset-password`,
  editarCuenta: (id: string) => `/api/rrhh/empleados/${id}/editar-cuenta`,
} as const;

// ========== EMPLEADOS ==========

export function createEmpleado(data: CreateEmpleadoDto, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleados, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  }).then(empleado => normalizeEmpleadoImageUrls(empleado));
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
  }).then(empleados => empleados.map(empleado => normalizeEmpleadoImageUrls(empleado)));
}

export function getEmpleadoById(id: string, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleadoById(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).then(empleado => normalizeEmpleadoImageUrls(empleado));
}

export function updateEmpleado(id: string, data: UpdateEmpleadoDto, token: string): Promise<Empleado> {
  return requestJSON<Empleado>(EMPLEADOS_ROUTES.empleadoById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  }).then(empleado => normalizeEmpleadoImageUrls(empleado));
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

// ========== GESTIÓN DE CUENTAS ==========

export function crearCuentaParaEmpleado(empleadoId: string, token: string): Promise<{ username: string; password: string; email: string }> {
  return requestJSON<{ username: string; password: string; email: string }>(EMPLEADOS_ROUTES.crearCuenta(empleadoId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function resetPasswordEmpleado(empleadoId: string, token: string): Promise<{ username: string; password: string; email: string }> {
  return requestJSON<{ username: string; password: string; email: string }>(EMPLEADOS_ROUTES.resetPassword(empleadoId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function editarCuentaEmpleado(empleadoId: string, updateData: { username?: string; email?: string; displayName?: string }, token: string): Promise<{ username: string; email: string; displayName: string }> {
  return requestJSON<{ username: string; email: string; displayName: string }>(EMPLEADOS_ROUTES.editarCuenta(empleadoId), {
    method: 'PATCH',
    body: JSON.stringify(updateData),
    headers: { Authorization: `Bearer ${token}` },
  });
}