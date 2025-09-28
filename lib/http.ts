import { API_BASE } from './config';

export async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export type LoginResponse = { token: string; expiresAt: number; user: { username: string } };

export function loginApi(username: string, password: string) {
  return jsonFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logoutApi(token: string) {
  return fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type MeResponse = { user: { username: string } };
export async function meApi(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as MeResponse;
}
