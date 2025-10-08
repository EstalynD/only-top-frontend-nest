/**
 * Rutas del API de Gastos Fijos Quincenales
 * IMPORTANTE: Todas las rutas deben incluir el prefijo /api/ según el estándar del proyecto
 */

export const GASTOS_FIJOS_ROUTES = {
  // Registro de gastos
  registrar: '/api/finanzas/gastos-fijos/registrar',
  
  // CRUD de gastos individuales
  actualizar: (id: string) => `/api/finanzas/gastos-fijos/${id}`,
  aprobar: (id: string) => `/api/finanzas/gastos-fijos/${id}/aprobar`,
  eliminar: (id: string) => `/api/finanzas/gastos-fijos/${id}`,
  
  // Resúmenes y consultas
  resumenQuincenal: '/api/finanzas/gastos-fijos/resumen-quincenal',
  resumenMensual: '/api/finanzas/gastos-fijos/resumen-mensual',
  comparativa: '/api/finanzas/gastos-fijos/comparativa',
  
  // Consolidación
  consolidar: '/api/finanzas/gastos-fijos/consolidar',
  
  // Generación automática
  generarNomina: '/api/finanzas/gastos-fijos/generar-nomina',
} as const;
