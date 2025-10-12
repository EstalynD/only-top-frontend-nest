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

// ========== UTILIDADES ==========

/**
 * Normaliza una URL de Cloudinary para asegurar que sea accesible
 * Convierte URLs con transformaciones automáticas a URLs simples
 */
export function normalizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    // Si la URL ya es simple (sin transformaciones automáticas), devolverla tal como está
    if (!url.includes('/auto/upload/') && !url.includes('/upload/s--')) {
      return url;
    }

    // Extraer el public_id de la URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
      return url;
    }

    // Buscar el public_id después de las transformaciones
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

    // Generar una URL simple sin transformaciones automáticas
    const cloudName = urlParts[2]; // res.cloudinary.com/[cloudName]/...
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  } catch (error) {
    console.warn('Error normalizando URL de Cloudinary:', error);
    return url;
  }
}

/**
 * Normaliza las URLs de las imágenes en un modelo
 */
export function normalizeModeloImageUrls(modelo: Modelo): Modelo {
  if (modelo.fotoPerfil) {
    modelo.fotoPerfil = normalizeCloudinaryUrl(modelo.fotoPerfil);
  }
  return modelo;
}

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

  const modelos = await requestJSON<Modelo[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  
  // Normalizar URLs de imágenes
  return modelos.map(modelo => normalizeModeloImageUrls(modelo));
}

export async function getModelo(token: string, id: string): Promise<Modelo> {
  const modelo = await requestJSON<Modelo>(CLIENTES_ROUTES.modelos.detail(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  
  // Normalizar URLs de imágenes
  return normalizeModeloImageUrls(modelo);
}

export async function createModelo(token: string, data: CreateModeloDto): Promise<Modelo> {
  const modelo = await requestJSON<Modelo>(CLIENTES_ROUTES.modelos.create, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  
  // Normalizar URLs de imágenes
  return normalizeModeloImageUrls(modelo);
}

export async function updateModelo(
  token: string,
  id: string,
  data: UpdateModeloDto,
): Promise<Modelo> {
  const modelo = await requestJSON<Modelo>(CLIENTES_ROUTES.modelos.update(id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  
  // Normalizar URLs de imágenes
  return normalizeModeloImageUrls(modelo);
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

