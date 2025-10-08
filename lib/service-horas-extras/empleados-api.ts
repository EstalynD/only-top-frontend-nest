/**
 * Helper para obtener empleados desde el módulo de RRHH
 * Usado para selectors en el módulo de Horas Extras
 */

import { requestJSON } from '../utils/fetcher';

export interface EmpleadoOption {
  _id: string;
  nombre: string;
  apellido: string;
  numeroIdentificacion?: string;
  correoElectronico?: string;
  salario?: {
    monto: number;
    moneda: string;
  };
  estado?: string;
}

/**
 * Obtener lista de empleados activos para selects
 */
export async function getEmpleadosActivos(token: string): Promise<EmpleadoOption[]> {
  try {
    const response = await requestJSON<EmpleadoOption[]>('/api/rrhh/empleados', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Filtrar solo activos
    return response.filter(emp => emp.estado === 'ACTIVO' || !emp.estado);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return [];
  }
}

/**
 * Obtener información de un empleado por ID
 */
export async function getEmpleadoById(id: string, token: string): Promise<EmpleadoOption | null> {
  try {
    return await requestJSON<EmpleadoOption>(`/api/rrhh/empleados/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    return null;
  }
}

/**
 * Formatea el nombre completo del empleado
 */
export function formatEmpleadoNombre(empleado: EmpleadoOption): string {
  return `${empleado.nombre} ${empleado.apellido}`;
}

/**
 * Formatea el label para el select (nombre + identificación)
 */
export function formatEmpleadoLabel(empleado: EmpleadoOption): string {
  const nombre = formatEmpleadoNombre(empleado);
  const identificacion = empleado.numeroIdentificacion ? ` (${empleado.numeroIdentificacion})` : '';
  return `${nombre}${identificacion}`;
}
