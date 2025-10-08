import { jsonFetch } from '../http';

export interface Empleado {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefono?: string;
}

export interface Modelo {
  _id: string;
  nombreCompleto: string;
  correoElectronico: string;
  fotoPerfil?: string;
  estado: string;
  equipoChatters: {
    turnoAM: Empleado;
    turnoPM: Empleado;
    turnoMadrugada: Empleado;
    supernumerario: Empleado;
  };
}

const BASE_URL = '/api/rrhh/modelos';

/**
 * Obtiene todas las modelos activas con sus chatters asignados
 */
export async function getModelosActivas(token: string): Promise<Modelo[]> {
  return await jsonFetch<Modelo[]>(`${BASE_URL}?includeInactive=false`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtiene una modelo por ID con sus chatters asignados
 */
export async function getModeloById(token: string, modeloId: string): Promise<Modelo> {
  return await jsonFetch<Modelo>(`${BASE_URL}/${modeloId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtiene los chatters asignados a una modelo específica
 */
export async function getChattersDeModelo(token: string, modeloId: string) {
  return await jsonFetch(`/api/chatter/sales/modelo/${modeloId}/chatters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
