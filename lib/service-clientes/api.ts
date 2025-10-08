import { requestJSON, base } from '../utils/fetcher';
import { CLIENTES_ROUTES } from './routes';
import type {
  Modelo,
  CreateModeloDto,
  UpdateModeloDto,
  ModelosStats,
  UploadPhotoResponse,
  EmpleadoBasico,
  EmpleadosDisponibles,
} from './types';

// ========== CRUD de Modelos ==========

export async function getModelos(
  token: string,
  params?: {
    includeInactive?: boolean;
    salesCloserId?: string;
    traffickerId?: string;
  },
): Promise<Modelo[]> {
  const searchParams = new URLSearchParams();
  if (params?.includeInactive) searchParams.set('includeInactive', 'true');
  if (params?.salesCloserId) searchParams.set('salesCloserId', params.salesCloserId);
  if (params?.traffickerId) searchParams.set('traffickerId', params.traffickerId);

  const url = searchParams.toString()
    ? `${CLIENTES_ROUTES.modelos.list}?${searchParams}`
    : CLIENTES_ROUTES.modelos.list;

  return requestJSON<Modelo[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getModelo(token: string, id: string): Promise<Modelo> {
  return requestJSON<Modelo>(CLIENTES_ROUTES.modelos.detail(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function createModelo(token: string, data: CreateModeloDto): Promise<Modelo> {
  return requestJSON<Modelo>(CLIENTES_ROUTES.modelos.create, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function updateModelo(
  token: string,
  id: string,
  data: UpdateModeloDto,
): Promise<Modelo> {
  return requestJSON<Modelo>(CLIENTES_ROUTES.modelos.update(id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function deleteModelo(token: string, id: string): Promise<void> {
  const res = await fetch(base(CLIENTES_ROUTES.modelos.delete(id)), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// ========== Estadísticas ==========

export async function getModelosStats(token: string): Promise<ModelosStats> {
  return requestJSON<ModelosStats>(CLIENTES_ROUTES.modelos.stats, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== Upload de foto ==========

export async function uploadModeloPhoto(token: string, file: File): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(base(CLIENTES_ROUTES.modelos.uploadPhoto), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

// ========== Empleados disponibles ==========

export async function getSalesClosersDisponibles(token: string): Promise<EmpleadoBasico[]> {
  return requestJSON<EmpleadoBasico[]>(CLIENTES_ROUTES.disponibles.salesClosers, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getChattersDisponibles(token: string): Promise<EmpleadosDisponibles> {
  return requestJSON<EmpleadosDisponibles>(CLIENTES_ROUTES.disponibles.chatters, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getTraffickersDisponibles(token: string): Promise<EmpleadoBasico[]> {
  return requestJSON<EmpleadoBasico[]>(CLIENTES_ROUTES.disponibles.traffickers, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

