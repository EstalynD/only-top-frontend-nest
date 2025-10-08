/**
 * Rutas del API de Finanzas
 * IMPORTANTE: Todas las rutas deben incluir el prefijo /api/ según el estándar del proyecto
 */

export const FINANZAS_ROUTES = {
  // Lista de modelos con ganancias
  modelos: '/api/finanzas/modelos',
  
  // Cálculo de finanzas
  calcular: '/api/finanzas/calcular',
  recalcular: '/api/finanzas/recalcular',
  
  // Consultas específicas
  modeloPorPeriodo: (modeloId: string, mes: number, anio: number) => 
    `/api/finanzas/modelo/${modeloId}/${mes}/${anio}`,
  
  // Estadísticas
  estadisticas: '/api/finanzas/estadisticas',
  mesActual: '/api/finanzas/mes-actual',
  
  // Actualización de estado
  actualizarEstado: (finanzasId: string) => `/api/finanzas/${finanzasId}/estado`,
  
  // Actualización de comisión bancaria
  comisionBanco: '/api/finanzas/comision-banco',
  
  // Aprobación masiva
  aprobarTodas: (mes: number, anio: number) => `/api/finanzas/aprobar-todas/${mes}/${anio}`,
  
  // Bank OnlyTop y Consolidación
  bank: '/api/finanzas/bank',
  consolidarPeriodo: (mes: number, anio: number) => `/api/finanzas/consolidar/${mes}/${anio}`,
  periodosConsolidados: '/api/finanzas/periodos-consolidados',
  
  // ========== COSTOS FIJOS MENSUALES ==========
  costosFijos: {
    // Consulta
    get: (mes: number, anio: number) => `/api/finanzas/costos-fijos/${mes}/${anio}`,
    
    // Gestión de gastos
    registrarGasto: '/api/finanzas/costos-fijos/gasto',
    actualizarGasto: '/api/finanzas/costos-fijos/gasto',
    eliminarGasto: '/api/finanzas/costos-fijos/gasto',
    
    // Gestión de categorías
    crearCategoria: '/api/finanzas/costos-fijos/categoria',
    eliminarCategoria: '/api/finanzas/costos-fijos/categoria',
    
    // Consolidación
    consolidar: (mes: number, anio: number) => `/api/finanzas/costos-fijos/consolidar/${mes}/${anio}`,
  },
} as const;
