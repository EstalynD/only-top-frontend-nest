export type AuthUser = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  token: string;
  expiresAt: number;
  user: Pick<AuthUser, 'username'>;
};

export type MeResponse = { user: Pick<AuthUser, 'username'> };
