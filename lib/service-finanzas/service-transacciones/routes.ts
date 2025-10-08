/**
 * Rutas del API de Transacciones
 * IMPORTANTE: Todas las rutas deben incluir el prefijo /api/ según el estándar del proyecto
 */

export const TRANSACCIONES_ROUTES = {
  // Lista de transacciones con filtros
  lista: '/api/finanzas/transacciones',
  
  // Detalle de una transacción
  detalle: (id: string) => `/api/finanzas/transacciones/${id}`,
  
  // Resumen de un periodo
  resumenPeriodo: (mes: number, anio: number) => 
    `/api/finanzas/transacciones/resumen/${mes}/${anio}`,
  
  // Saldo actual en movimiento
  saldoMovimiento: '/api/finanzas/transacciones/saldo/movimiento',
  
  // Flujo de caja detallado
  flujoCaja: (mes: number, anio: number) => 
    `/api/finanzas/transacciones/flujo-caja/${mes}/${anio}`,
  
  // Comparativa entre periodos
  comparativa: '/api/finanzas/transacciones/comparativa',
  
  // Estado del bank (desde transacciones)
  bankEstado: '/api/finanzas/transacciones/bank/estado',
  
  // Revertir transacción
  revertir: (id: string) => `/api/finanzas/transacciones/${id}/revertir`,
} as const;
