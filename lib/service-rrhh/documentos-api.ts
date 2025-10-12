import { requestJSON } from '../utils/fetcher';
import { RRHH_ROUTES } from './routes';
import type { 
  Documento, 
  CreateDocumentoDto, 
  UpdateDocumentoDto, 
  ValidarDocumentoDto, 
  RenovarDocumentoDto,
  DocumentosStats,
  DocumentosFiltros
} from './contratos-types';

// Obtener documentos por empleado
export function getDocumentosByEmpleado(empleadoId: string, token: string, filtros?: Partial<DocumentosFiltros>) {
  const params = new URLSearchParams();
  if (filtros?.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.esConfidencial !== undefined) params.append('esConfidencial', filtros.esConfidencial.toString());

  const queryString = params.toString();
  const url = queryString ? `${RRHH_ROUTES.documentosByEmpleado(empleadoId)}?${queryString}` : RRHH_ROUTES.documentosByEmpleado(empleadoId);

  return requestJSON<Documento[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener documento por ID
export function getDocumentoById(id: string, token: string) {
  return requestJSON<{ success: boolean; data: Documento }>(RRHH_ROUTES.documentoById(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Crear documento (con upload de archivo)
export function createDocumento(data: CreateDocumentoDto, archivo: File, token: string) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('empleadoId', data.empleadoId);
  if (data.contratoId) formData.append('contratoId', data.contratoId);
  formData.append('nombre', data.nombre);
  formData.append('nombreOriginal', data.nombreOriginal);
  formData.append('tipoDocumento', data.tipoDocumento);
  formData.append('descripcion', data.descripcion);
  formData.append('fechaEmision', data.fechaEmision);
  if (data.fechaVencimiento) formData.append('fechaVencimiento', data.fechaVencimiento);
  if (data.esConfidencial !== undefined) formData.append('esConfidencial', data.esConfidencial.toString());
  if (data.tags && data.tags.length) {
    // Enviar como campos repetidos para que el backend lo interprete como array
    for (const tag of data.tags) formData.append('tags', tag);
  }
  if (data.requiereRenovacion !== undefined) formData.append('requiereRenovacion', data.requiereRenovacion.toString());
  if (data.diasAntesVencimiento) formData.append('diasAntesVencimiento', data.diasAntesVencimiento.toString());

  return requestJSON<Documento>(RRHH_ROUTES.documentos, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// Actualizar documento
export function updateDocumento(id: string, data: UpdateDocumentoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Documento }>(RRHH_ROUTES.documentoById(id), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Validar documento
export function validarDocumento(id: string, data: ValidarDocumentoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Documento }>(RRHH_ROUTES.validarDocumento(id), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Renovar documento
export function renovarDocumento(id: string, data: RenovarDocumentoDto, archivo: File, token: string) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('nombre', data.nombre);
  formData.append('nombreOriginal', data.nombreOriginal);
  formData.append('descripcion', data.descripcion);
  formData.append('fechaEmision', data.fechaEmision);
  if (data.fechaVencimiento) formData.append('fechaVencimiento', data.fechaVencimiento);

  return requestJSON<{ success: boolean; message: string; data: Documento }>(RRHH_ROUTES.renovarDocumento(id), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// Eliminar documento
export function deleteDocumento(id: string, token: string) {
  return requestJSON<{ success: boolean; message: string }>(RRHH_ROUTES.documentoById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener documentos próximos a vencer
export function getDocumentosProximosAVencer(token: string, dias: number = 30) {
  return requestJSON<{ success: boolean; data: Documento[] }>(`${RRHH_ROUTES.documentosProximosAVencer}?dias=${dias}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener documentos vencidos
export function getDocumentosVencidos(token: string) {
  return requestJSON<{ success: boolean; data: Documento[] }>(RRHH_ROUTES.documentosVencidos, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Marcar documentos vencidos
export function marcarDocumentosVencidos(token: string) {
  return requestJSON<{ success: boolean; message: string; data: { cantidadMarcados: number } }>(RRHH_ROUTES.marcarDocumentosVencidos, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener estadísticas de documentos por empleado
export function getEstadisticasDocumentos(empleadoId: string, token: string) {
  return requestJSON<DocumentosStats>(RRHH_ROUTES.estadisticasDocumentos(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Buscar documentos por criterios
export function buscarDocumentos(filtros: DocumentosFiltros, token: string) {
  const params = new URLSearchParams();
  if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId);
  if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.esConfidencial !== undefined) params.append('esConfidencial', filtros.esConfidencial.toString());
  if (filtros.tags) params.append('tags', filtros.tags.join(','));

  const queryString = params.toString();
  const url = queryString ? `${RRHH_ROUTES.buscarDocumentos}?${queryString}` : RRHH_ROUTES.buscarDocumentos;

  return requestJSON<{ success: boolean; data: Documento[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Descargar documento
export function descargarDocumento(id: string, token: string) {
  return requestJSON<{ url: string; nombre: string; formato: string; tamaño: number }>(RRHH_ROUTES.descargarDocumento(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}
