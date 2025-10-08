import { requestJSON } from '../utils/fetcher';

const EMPLEADOS_ROUTES = {
  crearCuenta: (empleadoId: string) => `/api/rrhh/empleados/${empleadoId}/crear-cuenta`
} as const;

export interface CrearCuentaResponse {
  username: string;
  password: string;
  email: string;
}

/**
 * Crea una cuenta de usuario vinculada a un empleado
 */
export async function crearCuentaParaEmpleado(
  token: string,
  empleadoId: string
): Promise<CrearCuentaResponse> {
  return requestJSON<CrearCuentaResponse>(EMPLEADOS_ROUTES.crearCuenta(empleadoId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
