// Rutas del módulo de recruitment (ventas)
export const RECRUITMENT_ROUTES = {
  activities: {
    list: '/api/recruitment/activities',
    create: '/api/recruitment/activities',
    detail: (id: string) => `/api/recruitment/activities/${id}`,
    update: (id: string) => `/api/recruitment/activities/${id}`,
    delete: (id: string) => `/api/recruitment/activities/${id}`,
    stats: '/api/recruitment/activities/stats',
    statsBySalesCloser: (salesCloserId: string) => `/api/recruitment/activities/stats/${salesCloserId}`,
    salesClosers: '/api/recruitment/activities/sales-closers',
    vincularModelo: '/api/recruitment/activities/vincular-modelo',
  },
  export: {
    excel: '/api/recruitment/activities/export/excel',
    pdf: '/api/recruitment/activities/export/pdf',
  },
} as const;

