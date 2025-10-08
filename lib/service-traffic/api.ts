/**
 * API calls para el módulo de Traffic/Trafficker
 */

import { requestJSON } from '../utils/fetcher';
import { TRAFFIC_ROUTES } from './routes';
import type {
  TrafficCampaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  FilterCampaignsDto,
  CampaignStatistics,
  Trafficker,
} from './types';

/**
 * Crear nueva campaña
 */
export function createCampaign(token: string, data: CreateCampaignDto) {
  return requestJSON<TrafficCampaign>(TRAFFIC_ROUTES.campaigns, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Obtener lista de campañas con filtros opcionales
 */
export function getCampaigns(token: string, filters?: FilterCampaignsDto) {
  const params = new URLSearchParams();
  
  if (filters?.modeloId) params.append('modeloId', filters.modeloId);
  if (filters?.traffickerId) params.append('traffickerId', filters.traffickerId);
  if (filters?.plataforma) params.append('plataforma', filters.plataforma);
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.pais) params.append('pais', filters.pais);

  const queryString = params.toString();
  const url = queryString 
    ? `${TRAFFIC_ROUTES.campaigns}?${queryString}` 
    : TRAFFIC_ROUTES.campaigns;

  return requestJSON<TrafficCampaign[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener campaña por ID
 */
export function getCampaignById(token: string, id: string) {
  return requestJSON<TrafficCampaign>(TRAFFIC_ROUTES.campaignById(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Actualizar campaña
 */
export function updateCampaign(token: string, id: string, data: UpdateCampaignDto) {
  return requestJSON<TrafficCampaign>(TRAFFIC_ROUTES.campaignById(id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Eliminar campaña
 */
export function deleteCampaign(token: string, id: string) {
  return requestJSON<{ message: string }>(TRAFFIC_ROUTES.campaignById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtener estadísticas generales de campañas
 */
export function getCampaignStatistics(token: string, filters?: FilterCampaignsDto) {
  const params = new URLSearchParams();
  
  if (filters?.modeloId) params.append('modeloId', filters.modeloId);
  if (filters?.plataforma) params.append('plataforma', filters.plataforma);
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);

  const queryString = params.toString();
  const url = queryString 
    ? `${TRAFFIC_ROUTES.statistics}?${queryString}` 
    : TRAFFIC_ROUTES.statistics;

  return requestJSON<CampaignStatistics>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener histórico de campañas por modelo
 */
export function getCampaignsByModelo(token: string, modeloId: string) {
  return requestJSON<TrafficCampaign[]>(TRAFFIC_ROUTES.campaignsByModelo(modeloId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener lista de Traffickers (empleados con cargo TRF_TRF) activos
 */
export function getTraffickers(token: string) {
  return requestJSON<Trafficker[]>(TRAFFIC_ROUTES.traffickers, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
