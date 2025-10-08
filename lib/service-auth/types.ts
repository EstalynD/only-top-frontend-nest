export type AuthUser = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  token: string;
  expiresAt: number;
  user: Pick<AuthUser, 'id' | 'username' | 'roles' | 'permissions'>;
};

export type MeResponse = { user: Pick<AuthUser, 'id' | 'username' | 'roles' | 'permissions'> };
