import { API_BASE } from '../config';

export function base(path: string) {
  return `${API_BASE}${path}`;
}

export async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  // Asegurar que 'Content-Type: application/json' no se pierda cuando se pasan headers en init
  const res = await fetch(base(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    // Try to parse JSON error if provided by backend
    const rawErr = await res.text();
    type HttpError = Error & { status?: number; body?: unknown };
    try {
      const json = rawErr ? JSON.parse(rawErr) : undefined;
      const msg = typeof json?.message === 'string' ? json.message : Array.isArray(json?.message) ? json.message.join(', ') : undefined;
      const err: HttpError = new Error(msg || json?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = json ?? rawErr;
      throw err as HttpError;
    } catch {
      const err: HttpError = new Error(rawErr || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = rawErr;
      throw err as HttpError;
    }
  }
  // Manejar respuestas sin cuerpo (204/205/304 o 200 con body vacío)
  const status = res.status;
  if (status === 204 || status === 205 || status === 304) {
    return null as unknown as T;
  }
  const raw = await res.text();
  if (!raw || raw.trim() === '') {
    return null as unknown as T;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Si el servidor respondió con texto no JSON pero exitoso, exponerlo por si es útil
    // Mantener compatibilidad devolviendo cualquier string como unknown
    return raw as unknown as T;
  }
}

requestJSON.base = base;
