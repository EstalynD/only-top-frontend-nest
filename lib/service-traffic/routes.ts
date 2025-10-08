/**
 * Rutas del API de Traffic/Trafficker
 * IMPORTANTE: Todas las rutas deben incluir el prefijo /api/ según el estándar del proyecto
 */

export const TRAFFIC_ROUTES = {
  // CRUD de campañas
  campaigns: '/api/traffic/campaigns',
  campaignById: (id: string) => `/api/traffic/campaigns/campaign/${id}`,
  
  // Estadísticas y consultas especiales
  statistics: '/api/traffic/campaigns/statistics',
  campaignsByModelo: (modeloId: string) => `/api/traffic/campaigns/modelo/${modeloId}`,
  
  // Traffickers
  traffickers: '/api/traffic/campaigns/traffickers',
} as const;
