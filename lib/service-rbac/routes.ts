export const rbacRoutes = {
  listRoles: '/admin/rbac/roles',
  assignRoles: (userId: string) => `/admin/rbac/users/${userId}/roles/assign`,
  revokeRoles: (userId: string) => `/admin/rbac/users/${userId}/roles/revoke`,
};
export const RBAC_ROUTES = {
  permissions: '/admin/rbac/permissions',
  roles: '/admin/rbac/roles',
  role: (key: string) => `/admin/rbac/roles/${encodeURIComponent(key)}`,
  userAssignRoles: (userId: string) => `/admin/rbac/users/${encodeURIComponent(userId)}/assign-roles`,
  userRevokeRoles: (userId: string) => `/admin/rbac/users/${encodeURIComponent(userId)}/revoke-roles`,
  userGrantPerms: (userId: string) => `/admin/rbac/users/${encodeURIComponent(userId)}/grant-permissions`,
  userRevokePerms: (userId: string) => `/admin/rbac/users/${encodeURIComponent(userId)}/revoke-permissions`,
} as const;
