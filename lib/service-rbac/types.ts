export type Permission = {
  key: string;
  description?: string;
  group?: string;
};
export type PermissionDef = {
  key: string;
  name: string;
  module: string;
};

export type Role = {
  key: string;
  name: string;
  permissions: string[];
  meta?: Record<string, any>;
};

export type AssignRolesResponse = { roles: string[]; permissions: string[] };
export type UpdatePermsResponse = { permissions: string[] };
