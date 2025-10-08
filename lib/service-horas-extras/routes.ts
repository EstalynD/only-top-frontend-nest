/**
 * Rutas del módulo de Horas Extras
 * Todas las rutas comienzan con /api/rrhh/horas-extras
 */

const BASE_PATH = '/api/rrhh/horas-extras';

export const HORAS_EXTRAS_ROUTES = {
  // CRUD básico
  base: BASE_PATH,
  byId: (id: string) => `${BASE_PATH}/${id}`,
  
  // Consultas específicas
  byEmpleadoAndPeriodo: (empleadoId: string, anio: number, mes: number) => 
    `${BASE_PATH}/empleado/${empleadoId}/periodo/${anio}/${mes}`,
  
  // Aprobación y pago
  aprobar: (id: string) => `${BASE_PATH}/${id}/aprobar`,
  aprobarLote: () => `${BASE_PATH}/aprobar-lote`,
  pendientesPorPeriodo: (anio: number, mes: number, quincena?: 1 | 2) => {
    const q = typeof quincena === 'number' ? `&quincena=${quincena}` : '';
    return `${BASE_PATH}/pendientes/periodo?anio=${anio}&mes=${mes}${q}`;
  },
  
  // Estadísticas y reportes
  resumenEmpleado: (empleadoId: string, anio: number, mes: number) => 
    `${BASE_PATH}/resumen/empleado/${empleadoId}/${anio}/${mes}`,
  estadisticas: (anio: number, mes: number) => 
    `${BASE_PATH}/estadisticas/${anio}/${mes}`,
} as const;
