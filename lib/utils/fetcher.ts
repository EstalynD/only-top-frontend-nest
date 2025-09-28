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
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

requestJSON.base = base;
