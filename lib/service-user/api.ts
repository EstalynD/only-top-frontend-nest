import { USER_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse, AdminUserListResponse, CreateUserRequest, AdminUser } from './types';

export function getProfile(token: string) {
  return requestJSON<GetProfileResponse>(USER_ROUTES.profile, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateProfile(token: string, body: UpdateProfileRequest) {
  return requestJSON<UpdateProfileResponse>(USER_ROUTES.profile, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export function listUsers(token: string, q?: string, page: number = 1, limit: number = 20) {
  return requestJSON<AdminUserListResponse>(USER_ROUTES.adminList(q, page, limit), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createUser(token: string, body: CreateUserRequest) {
  return requestJSON<AdminUser>(USER_ROUTES.adminCreate, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}
