/**
 * Rutas del módulo de ventas de modelos
 */
export const MODELOS_VENTAS_ROUTES = {
  // Ventas individuales
  modeloSales: (modeloId: string) => `/api/rrhh/modelos/${modeloId}/ventas`,
  modeloSalesStats: (modeloId: string) => `/api/rrhh/modelos/${modeloId}/ventas/estadisticas`,
  
  // Comparación y agrupación
  comparar: '/api/rrhh/modelos/ventas/comparar',
  agrupadas: '/api/rrhh/modelos/ventas/agrupadas',
  dashboard: '/api/rrhh/modelos/ventas/dashboard',
  
  // Indicadores y métricas
  indicadores: '/api/rrhh/modelos/ventas/indicadores',
  
  // Exportación
  exportExcel: '/api/rrhh/modelos/ventas/exportar/excel',
  exportPdf: '/api/rrhh/modelos/ventas/exportar/pdf',
} as const;

