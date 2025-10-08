/**
 * API calls para Gastos Fijos Quincenales
 */

import { requestJSON } from '@/lib/utils/fetcher';
import { GASTOS_FIJOS_ROUTES } from './routes';
import type {
  RegistrarGastoFijoDto,
  ActualizarGastoFijoDto,
  AprobarGastoDto,
  ConsolidarResumenMensualDto,
  GenerarNominaQuincenalDto,
  QuincenaEnum,
  RegistrarGastoResponse,
  ActualizarGastoResponse,
  AprobarGastoResponse,
  ResumenQuincenalResponse,
  ResumenMensualResponse,
  ComparativaResponse,
  ConsolidarResponse,
  GenerarNominaResponse,
} from './types';

// ========== CRUD DE GASTOS ==========

/**
 * Registra un nuevo gasto fijo quincenal
 */
export async function registrarGasto(
  token: string,
  dto: RegistrarGastoFijoDto
): Promise<RegistrarGastoResponse> {
  return requestJSON<RegistrarGastoResponse>(GASTOS_FIJOS_ROUTES.registrar, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

/**
 * Actualiza un gasto existente
 */
export async function actualizarGasto(
  token: string,
  gastoId: string,
  dto: ActualizarGastoFijoDto
): Promise<ActualizarGastoResponse> {
  return requestJSON<ActualizarGastoResponse>(GASTOS_FIJOS_ROUTES.actualizar(gastoId), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

/**
 * Aprueba o rechaza un gasto
 */
export async function aprobarGasto(
  token: string,
  gastoId: string,
  dto: AprobarGastoDto
): Promise<AprobarGastoResponse> {
  return requestJSON<AprobarGastoResponse>(GASTOS_FIJOS_ROUTES.aprobar(gastoId), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

/**
 * Elimina un gasto (soft delete)
 */
export async function eliminarGasto(
  token: string,
  gastoId: string
): Promise<void> {
  await requestJSON(GASTOS_FIJOS_ROUTES.eliminar(gastoId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== RESÚMENES Y CONSULTAS ==========

/**
 * Obtiene resumen de una quincena específica
 */
export async function obtenerResumenQuincenal(
  token: string,
  mes: number,
  anio: number,
  quincena: QuincenaEnum
): Promise<ResumenQuincenalResponse> {
  const params = new URLSearchParams({
    mes: mes.toString(),
    anio: anio.toString(),
    quincena,
  });
  
  return requestJSON<ResumenQuincenalResponse>(
    `${GASTOS_FIJOS_ROUTES.resumenQuincenal}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
}

/**
 * Obtiene resumen mensual consolidado con utilidad neta y comparativa
 */
export async function obtenerResumenMensual(
  token: string,
  mes: number,
  anio: number
): Promise<ResumenMensualResponse> {
  const params = new URLSearchParams({
    mes: mes.toString(),
    anio: anio.toString(),
  });
  
  return requestJSON<ResumenMensualResponse>(
    `${GASTOS_FIJOS_ROUTES.resumenMensual}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
}

/**
 * Obtiene comparativa de múltiples meses
 */
export async function obtenerComparativaMensual(
  token: string,
  anio: number,
  cantidadMeses: number = 12
): Promise<ComparativaResponse> {
  const params = new URLSearchParams({
    anio: anio.toString(),
    cantidadMeses: cantidadMeses.toString(),
  });
  
  return requestJSON<ComparativaResponse>(
    `${GASTOS_FIJOS_ROUTES.comparativa}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
}

// ========== CONSOLIDACIÓN ==========

/**
 * Consolida el resumen mensual (cierra el periodo)
 */
export async function consolidarResumenMensual(
  token: string,
  dto: ConsolidarResumenMensualDto
): Promise<ConsolidarResponse> {
  return requestJSON<ConsolidarResponse>(GASTOS_FIJOS_ROUTES.consolidar, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

// ========== GENERACIÓN AUTOMÁTICA ==========

/**
 * Genera automáticamente los gastos de nómina desde empleados RRHH
 */
export async function generarNominaQuincenal(
  token: string,
  dto: GenerarNominaQuincenalDto
): Promise<GenerarNominaResponse> {
  return requestJSON<GenerarNominaResponse>(GASTOS_FIJOS_ROUTES.generarNomina, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}
