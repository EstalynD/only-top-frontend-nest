export type UserProfile = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type GetProfileResponse = { user: UserProfile };
export type UpdateProfileRequest = Partial<Pick<UserProfile, 'displayName' | 'email' | 'avatarUrl'>>;
export type UpdateProfileResponse = { user: UserProfile };

export type AdminUserListItem = Pick<UserProfile, 'id' | 'username' | 'roles' | 'permissions' | 'displayName' | 'email' | 'avatarUrl'> & {
  _id?: string; // por si el backend devuelve _id
};

export type AdminUserListResponse = {
  items: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};
