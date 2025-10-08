/**
 * API calls para el módulo de Finanzas
 */

import { requestJSON } from '../utils/fetcher';
import { FINANZAS_ROUTES } from './routes';
import type {
  ModeloConGanancias,
  EstadisticasFinanzas,
  FinanzasFormateada,
  CalcularFinanzasDto,
  RecalcularFinanzasDto,
  RecalcularFinanzasRespuesta,
  ActualizarEstadoFinanzasDto,
  FiltrosFinanzas,
  BankOnlyTop,
  PeriodoConsolidado,
  ConsolidarPeriodoRespuesta,
  CostosFijosMensuales,
  RegistrarGastoRequest,
  ActualizarGastoRequest,
  EliminarGastoRequest,
  CrearCategoriaRequest,
  EliminarCategoriaRequest,
  ConsolidarCostosRequest,
  ConsolidarCostosResponse,
} from './types';

/**
 * Obtiene lista de modelos con sus ganancias del mes actual
 */
export async function obtenerModelosConGanancias(
  token: string,
  filtros?: FiltrosFinanzas
): Promise<ModeloConGanancias[]> {
  const params = new URLSearchParams();
  
  if (filtros?.mes) params.append('mes', filtros.mes.toString());
  if (filtros?.anio) params.append('anio', filtros.anio.toString());
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
  
  const queryString = params.toString();
  const url = queryString 
    ? `${FINANZAS_ROUTES.modelos}?${queryString}` 
    : FINANZAS_ROUTES.modelos;
  
  const response = await requestJSON<{ success: boolean; data: ModeloConGanancias[]; count: number }>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  
  return response.data;
}

/**
 * Calcula finanzas para un modelo específico
 */
export async function calcularFinanzas(
  token: string,
  dto: CalcularFinanzasDto
): Promise<FinanzasFormateada> {
  const response = await requestJSON<{ success: boolean; message: string; data: FinanzasFormateada }>(FINANZAS_ROUTES.calcular, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
  return response.data;
}

/**
 * Recalcula finanzas para múltiples modelos
 */
export async function recalcularFinanzas(
  token: string,
  dto: RecalcularFinanzasDto
): Promise<RecalcularFinanzasRespuesta> {
  const response = await requestJSON<{ success: boolean; data: RecalcularFinanzasRespuesta }>(FINANZAS_ROUTES.recalcular, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
  return response.data;
}

/**
 * Obtiene finanzas de un modelo para un periodo específico
 */
export async function obtenerFinanzasPorModelo(
  token: string,
  modeloId: string,
  mes: number,
  anio: number
): Promise<FinanzasFormateada> {
  const response = await requestJSON<{ success: boolean; data: FinanzasFormateada }>(
    FINANZAS_ROUTES.modeloPorPeriodo(modeloId, mes, anio),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  return response.data;
}

/**
 * Obtiene estadísticas generales de finanzas
 */
export async function obtenerEstadisticas(
  token: string,
  mes?: number,
  anio?: number
): Promise<EstadisticasFinanzas> {
  const params = new URLSearchParams();
  if (mes) params.append('mes', mes.toString());
  if (anio) params.append('anio', anio.toString());
  
  const queryString = params.toString();
  const url = queryString 
    ? `${FINANZAS_ROUTES.estadisticas}?${queryString}` 
    : FINANZAS_ROUTES.estadisticas;
  
  const response = await requestJSON<{ success: boolean; data: EstadisticasFinanzas }>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  
  return response.data;
}

/**
 * Actualiza el estado de finanzas
 */
export async function actualizarEstadoFinanzas(
  token: string,
  finanzasId: string,
  dto: ActualizarEstadoFinanzasDto
): Promise<FinanzasFormateada> {
  const response = await requestJSON<{ success: boolean; message: string; data: FinanzasFormateada }>(
    FINANZAS_ROUTES.actualizarEstado(finanzasId),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(dto),
    }
  );
  return response.data;
}

/**
 * Obtiene resumen del mes actual
 */
export async function obtenerFinanzasMesActual(token: string) {
  const response = await requestJSON<{
    success: boolean;
    data: {
      periodo: { mes: number; anio: number };
      modelos: ModeloConGanancias[];
      estadisticas: EstadisticasFinanzas;
    };
  }>(FINANZAS_ROUTES.mesActual, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return response.data;
}

/**
 * Actualiza el porcentaje de comisión bancaria para un periodo
 */
export async function actualizarComisionBancoPeriodo(
  token: string,
  mes: number,
  anio: number,
  porcentajeComisionBanco: number
): Promise<{ actualizadas: number; errores: number }> {
  const response = await requestJSON<{
    success: boolean;
    message: string;
    data: { actualizadas: number; errores: number };
  }>(FINANZAS_ROUTES.comisionBanco, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mes, anio, porcentajeComisionBanco }),
  });
  return response.data;
}

/**
 * Obtiene el estado del Bank OnlyTop
 */
export async function obtenerBankOnlyTop(token: string): Promise<BankOnlyTop> {
  const response = await requestJSON<{ success: boolean; data: BankOnlyTop }>(
    FINANZAS_ROUTES.bank,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  return response.data;
}

/**
 * Consolida un periodo específico (cierre de mes)
 */
export async function consolidarPeriodo(
  token: string,
  mes: number,
  anio: number,
  notasCierre?: string
): Promise<ConsolidarPeriodoRespuesta> {
  const response = await requestJSON<{ success: boolean; data: ConsolidarPeriodoRespuesta }>(
    FINANZAS_ROUTES.consolidarPeriodo(mes, anio),
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notasCierre }),
    }
  );
  return response.data;
}

/**
 * Obtiene lista de todos los periodos consolidados
 */
export async function obtenerPeriodosConsolidados(token: string): Promise<PeriodoConsolidado[]> {
  const response = await requestJSON<{ success: boolean; data: PeriodoConsolidado[] }>(
    FINANZAS_ROUTES.periodosConsolidados,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  return response.data;
}

// ========== COSTOS FIJOS MENSUALES ==========

/**
 * Obtiene los costos fijos de un mes específico
 * Si no existe, el backend lo crea automáticamente con categorías base
 */
export async function obtenerCostosFijos(
  token: string,
  mes: number,
  anio: number
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.get(mes, anio), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Registra un nuevo gasto en una categoría
 */
export async function registrarGasto(
  token: string,
  data: RegistrarGastoRequest
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.registrarGasto, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza un gasto existente
 */
export async function actualizarGasto(
  token: string,
  data: ActualizarGastoRequest
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.actualizarGasto, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Elimina un gasto
 */
export async function eliminarGasto(
  token: string,
  data: EliminarGastoRequest
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.eliminarGasto, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Crea una nueva categoría personalizada
 */
export async function crearCategoria(
  token: string,
  data: CrearCategoriaRequest
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.crearCategoria, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Elimina una categoría (solo si no tiene gastos)
 */
export async function eliminarCategoria(
  token: string,
  data: EliminarCategoriaRequest
): Promise<CostosFijosMensuales> {
  return requestJSON<CostosFijosMensuales>(FINANZAS_ROUTES.costosFijos.eliminarCategoria, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

/**
 * Consolida los costos fijos del mes
 */
export async function consolidarCostos(
  token: string,
  mes: number,
  anio: number,
  data: ConsolidarCostosRequest
): Promise<ConsolidarCostosResponse> {
  return requestJSON<ConsolidarCostosResponse>(
    FINANZAS_ROUTES.costosFijos.consolidar(mes, anio),
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }
  );
}
