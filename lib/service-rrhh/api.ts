import { RRHH_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { 
  Area, 
  Cargo, 
  AreaWithCargos, 
  CreateAreaDto, 
  UpdateAreaDto, 
  CreateCargoDto, 
  UpdateCargoDto 
} from './types';

// ========== ÁREAS ==========

export function createArea(data: CreateAreaDto, token: string): Promise<Area> {
  return requestJSON<Area>(RRHH_ROUTES.areas, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAllAreas(token: string, includeInactive = false): Promise<Area[]> {
  const url = includeInactive 
    ? `${RRHH_ROUTES.areas}?includeInactive=true`
    : RRHH_ROUTES.areas;
    
  return requestJSON<Area[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAreasWithCargos(token: string, includeInactive = false): Promise<AreaWithCargos[]> {
  const url = includeInactive 
    ? `${RRHH_ROUTES.areasWithCargos}?includeInactive=true`
    : RRHH_ROUTES.areasWithCargos;
    
  return requestJSON<AreaWithCargos[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAreaById(id: string, token: string): Promise<Area> {
  return requestJSON<Area>(RRHH_ROUTES.areaById(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAreaByCode(code: string, token: string): Promise<Area> {
  return requestJSON<Area>(RRHH_ROUTES.areaByCode(code), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateArea(id: string, data: UpdateAreaDto, token: string): Promise<Area> {
  return requestJSON<Area>(RRHH_ROUTES.areaById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteArea(id: string, token: string): Promise<void> {
  return requestJSON<void>(RRHH_ROUTES.areaById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== CARGOS ==========

export function createCargo(data: CreateCargoDto, token: string): Promise<Cargo> {
  return requestJSON<Cargo>(RRHH_ROUTES.cargos, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAllCargos(token: string, includeInactive = false, areaId?: string): Promise<Cargo[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append('includeInactive', 'true');
  if (areaId) params.append('areaId', areaId);
  
  const url = params.toString() 
    ? `${RRHH_ROUTES.cargos}?${params.toString()}`
    : RRHH_ROUTES.cargos;
    
  return requestJSON<Cargo[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getCargoById(id: string, token: string): Promise<Cargo> {
  return requestJSON<Cargo>(RRHH_ROUTES.cargoById(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getCargoByCode(code: string, token: string): Promise<Cargo> {
  return requestJSON<Cargo>(RRHH_ROUTES.cargoByCode(code), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateCargo(id: string, data: UpdateCargoDto, token: string): Promise<Cargo> {
  return requestJSON<Cargo>(RRHH_ROUTES.cargoById(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteCargo(id: string, token: string): Promise<void> {
  return requestJSON<void>(RRHH_ROUTES.cargoById(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== PLANTILLAS DE CONTRATOS ==========

export function getAvailableContractTemplates(token: string): Promise<any[]> {
  return requestJSON<any[]>(RRHH_ROUTES.contractTemplates, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getContractTemplatesByArea(areaCode: string, token: string): Promise<any[]> {
  return requestJSON<any[]>(RRHH_ROUTES.contractTemplatesByArea(areaCode), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getContractTemplatesByCargo(cargoCode: string, token: string): Promise<any[]> {
  return requestJSON<any[]>(RRHH_ROUTES.contractTemplatesByCargo(cargoCode), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function assignContractTemplates(token: string): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(RRHH_ROUTES.assignContractTemplates, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function verifyTemplateAssignments(token: string): Promise<any> {
  return requestJSON<any>(RRHH_ROUTES.verifyTemplateAssignments, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function clearTemplateAssignments(token: string): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(RRHH_ROUTES.clearTemplateAssignments, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== SEEDER ==========
export function seedDefaults(token: string): Promise<{ ok: true }> {
  return requestJSON<{ ok: true }>(RRHH_ROUTES.seedDefaults, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
