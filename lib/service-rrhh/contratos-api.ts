import { requestJSON } from '../utils/fetcher';
import { RRHH_ROUTES } from './routes';
import type { 
  Contrato, 
  CreateContratoDto, 
  UpdateContratoDto, 
  AprobarContratoDto, 
  RenovarContratoDto,
  ContratosStats,
  ContratosFiltros
} from './contratos-types';

// Obtener todos los contratos
export function getContratos(token: string, filtros?: ContratosFiltros) {
  const params = new URLSearchParams();
  if (filtros?.empleadoId) params.append('empleadoId', filtros.empleadoId);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.tipoContrato) params.append('tipoContrato', filtros.tipoContrato);
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros?.numeroContrato) params.append('numeroContrato', filtros.numeroContrato);

  const queryString = params.toString();
  const url = queryString ? `${RRHH_ROUTES.contratos}?${queryString}` : RRHH_ROUTES.contratos;

  return requestJSON<{ success: boolean; data: Contrato[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener contrato por ID
export function getContratoById(id: string, token: string) {
  return requestJSON<{ success: boolean; data: Contrato }>(RRHH_ROUTES.contratoById(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener contratos por empleado
export function getContratosByEmpleado(empleadoId: string, token: string) {
  return requestJSON<Contrato[]>(RRHH_ROUTES.contratosByEmpleado(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// Crear contrato
export function createContrato(data: CreateContratoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Contrato }>(RRHH_ROUTES.contratos, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Actualizar contrato
export function updateContrato(id: string, data: UpdateContratoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Contrato }>(RRHH_ROUTES.contratoById(id), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Aprobar/rechazar contrato
export function aprobarContrato(id: string, data: AprobarContratoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Contrato }>(RRHH_ROUTES.aprobarContrato(id), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Renovar contrato
export function renovarContrato(id: string, data: RenovarContratoDto, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Contrato }>(RRHH_ROUTES.renovarContrato(id), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Eliminar contrato
export function deleteContrato(id: string, token: string) {
  return requestJSON<{ success: boolean; message: string }>(RRHH_ROUTES.contratoById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener contratos próximos a vencer
export function getContratosProximosAVencer(token: string, dias: number = 30) {
  return requestJSON<{ success: boolean; data: Contrato[] }>(`${RRHH_ROUTES.contratosProximosAVencer}?dias=${dias}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener contratos vencidos
export function getContratosVencidos(token: string) {
  return requestJSON<{ success: boolean; data: Contrato[] }>(RRHH_ROUTES.contratosVencidos, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Marcar contratos vencidos
export function marcarContratosVencidos(token: string) {
  return requestJSON<{ success: boolean; message: string; data: { cantidadMarcados: number } }>(RRHH_ROUTES.marcarContratosVencidos, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener estadísticas de contratos
export function getEstadisticasContratos(token: string) {
  return requestJSON<ContratosStats>(RRHH_ROUTES.estadisticasContratos, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Buscar contratos por criterios
export function buscarContratos(filtros: ContratosFiltros, token: string) {
  const params = new URLSearchParams();
  if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.tipoContrato) params.append('tipoContrato', filtros.tipoContrato);
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.numeroContrato) params.append('numeroContrato', filtros.numeroContrato);

  const queryString = params.toString();
  const url = queryString ? `${RRHH_ROUTES.buscarContratos}?${queryString}` : RRHH_ROUTES.buscarContratos;

  return requestJSON<{ success: boolean; data: Contrato[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Generar PDF del contrato (dinámico con plantilla)
export interface PdfContratoResponse {
  filename: string;
  mimeType: string;
  pdfBuffer: string; // base64
}

export function generarPdfContrato(id: string, token: string) {
  return requestJSON<PdfContratoResponse>(RRHH_ROUTES.generarPdfContrato(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== PLANTILLAS DE CONTRATOS ==========

// Generar contrato laboral usando plantilla
export function generarContratoLaboral(empleadoId: string, token: string) {
  return requestJSON<{ success: boolean; message: string; data: Buffer }>(RRHH_ROUTES.generarContratoLaboral(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener información del contrato laboral (sin PDF)
export function getInfoContratoLaboral(empleadoId: string, token: string) {
  return requestJSON<{ success: boolean; data: any }>(RRHH_ROUTES.getInfoContratoLaboral(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Validar si existe plantilla para el empleado
export function validarPlantillaContrato(empleadoId: string, token: string) {
  return requestJSON<{ success: boolean; data: { tienePlantilla: boolean; templateId?: string; templateName?: string } }>(RRHH_ROUTES.validarPlantillaContrato(empleadoId), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener plantillas disponibles
export function getPlantillasContratos(token: string) {
  return requestJSON<{ success: boolean; data: any[] }>(RRHH_ROUTES.plantillasContratos, {
    headers: { Authorization: `Bearer ${token}` },
  });
}