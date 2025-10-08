// Rutas del módulo de ventas de chatters
export const CHATTER_ROUTES = {
  // Gestión de ventas
  sales: '/api/chatter/sales',
  saleById: (id: string) => `/api/chatter/sales/sale/${id}`,
  
  // Estadísticas
  generalStats: '/api/chatter/sales/stats/general',
  groupSales: (modeloId: string) => `/api/chatter/sales/grupo/${modeloId}`,
  chatterStats: (chatterId: string) => `/api/chatter/sales/chatter/${chatterId}/stats`,
  modeloStats: (modeloId: string) => `/api/chatter/sales/modelo/${modeloId}/stats`,
  compareGroups: '/api/chatter/sales/comparar-grupos',
  
  // Chatters
  activeChatters: '/api/chatter/sales/chatters/active',
  modeloChatters: (modeloId: string) => `/api/chatter/sales/modelo/${modeloId}/chatters`,
  
  // Exportación PDF
  groupSalesPdf: (modeloId: string) => `/api/chatter/sales/grupo/${modeloId}/pdf`,
  chatterStatsPdf: (chatterId: string) => `/api/chatter/sales/chatter/${chatterId}/stats/pdf`,
  compareGroupsPdf: '/api/chatter/sales/comparar-grupos/pdf',
  generalStatsPdf: '/api/chatter/sales/stats/general/pdf',
} as const;

