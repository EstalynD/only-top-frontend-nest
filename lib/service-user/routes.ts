export const USER_ROUTES = {
  profile: '/profile',
  adminList: (q?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (q && q.trim()) params.set('q', q.trim());
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ''}`;
  },
} as const;
