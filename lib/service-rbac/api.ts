import { RBAC_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { PermissionDef, Role, AssignRolesResponse, UpdatePermsResponse } from './types';

export function listPermissions(token: string) {
  return requestJSON<PermissionDef[]>(RBAC_ROUTES.permissions, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function listRoles(token: string) {
  return requestJSON<Role[]>(RBAC_ROUTES.roles, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createRole(token: string, role: Pick<Role, 'key' | 'name' | 'permissions' | 'meta'>) {
  return requestJSON<Role>(RBAC_ROUTES.roles, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(role),
  });
}

export function updateRole(token: string, key: string, patch: Partial<Pick<Role, 'name' | 'permissions' | 'meta'>>) {
  return requestJSON<Role>(RBAC_ROUTES.role(key), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
}

export function deleteRole(token: string, key: string) {
  return requestJSON<{ deletedCount: number }>(RBAC_ROUTES.role(key), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function assignRoles(token: string, userId: string, roles: string[]) {
  return requestJSON<AssignRolesResponse>(RBAC_ROUTES.userAssignRoles(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roles }),
  });
}

export function revokeRoles(token: string, userId: string, roles: string[]) {
  return requestJSON<AssignRolesResponse>(RBAC_ROUTES.userRevokeRoles(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roles }),
  });
}

export function grantPermissions(token: string, userId: string, permissions: string[]) {
  return requestJSON<UpdatePermsResponse>(RBAC_ROUTES.userGrantPerms(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ permissions }),
  });
}

export function revokePermissions(token: string, userId: string, permissions: string[]) {
  return requestJSON<UpdatePermsResponse>(RBAC_ROUTES.userRevokePerms(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ permissions }),
  });
}
