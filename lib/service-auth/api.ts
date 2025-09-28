import { AUTH_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { LoginResponse, MeResponse } from './types';

export function login(username: string, password: string) {
  return requestJSON<LoginResponse>(AUTH_ROUTES.login, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout(token: string) {
  return fetch(requestJSON.base(AUTH_ROUTES.logout), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function me(token: string) {
  return requestJSON<MeResponse>(AUTH_ROUTES.me, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
