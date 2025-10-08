/**
 * API del módulo de Horas Extras
 */

import { requestJSON } from '../utils/fetcher';
import { HORAS_EXTRAS_ROUTES } from './routes';
import type {
  HorasExtrasRegistro,
  CreateHorasExtrasDto,
  UpdateHorasExtrasDto,
  AprobarHorasExtrasDto,
  FiltrosHorasExtrasDto,
  ResumenEmpleado,
  EstadisticasGenerales,
  AprobarHorasExtrasLoteDto,
} from './types';

// ========== CRUD BÁSICO ==========

/**
 * Crear registro de horas extras
 */
export async function createHorasExtras(
  data: CreateHorasExtrasDto,
  token: string
): Promise<HorasExtrasRegistro> {
  return requestJSON<HorasExtrasRegistro>(HORAS_EXTRAS_ROUTES.base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Obtener listado de registros con filtros
 */
export async function getHorasExtras(
  filtros: FiltrosHorasExtrasDto,
  token: string
): Promise<HorasExtrasRegistro[]> {
  const params = new URLSearchParams();
  
  if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId);
  if (filtros.anio) params.append('anio', String(filtros.anio));
  if (filtros.mes) params.append('mes', String(filtros.mes));
  if (filtros.quincena) params.append('quincena', String(filtros.quincena));
  if (filtros.periodo) params.append('periodo', filtros.periodo);
  if (filtros.estado) params.append('estado', filtros.estado);

  const url = params.toString() 
    ? `${HORAS_EXTRAS_ROUTES.base}?${params.toString()}`
    : HORAS_EXTRAS_ROUTES.base;

  return requestJSON<HorasExtrasRegistro[]>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Obtener registro por ID
 */
export async function getHorasExtrasById(
  id: string,
  token: string
): Promise<HorasExtrasRegistro> {
  return requestJSON<HorasExtrasRegistro>(HORAS_EXTRAS_ROUTES.byId(id), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Actualizar registro
 */
export async function updateHorasExtras(
  id: string,
  data: UpdateHorasExtrasDto,
  token: string
): Promise<HorasExtrasRegistro> {
  return requestJSON<HorasExtrasRegistro>(HORAS_EXTRAS_ROUTES.byId(id), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Eliminar registro
 */
export async function deleteHorasExtras(
  id: string,
  token: string
): Promise<void> {
  await fetch(requestJSON.base(HORAS_EXTRAS_ROUTES.byId(id)), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ========== CONSULTAS ESPECÍFICAS ==========

/**
 * Obtener registros de un empleado en un periodo
 */
export async function getHorasExtrasByEmpleadoAndPeriodo(
  empleadoId: string,
  anio: number,
  mes: number,
  token: string
): Promise<HorasExtrasRegistro[]> {
  return requestJSON<HorasExtrasRegistro[]>(
    HORAS_EXTRAS_ROUTES.byEmpleadoAndPeriodo(empleadoId, anio, mes),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// ========== APROBACIÓN Y PAGO ==========

/**
 * Aprobar o rechazar registro
 */
export async function aprobarHorasExtras(
  id: string,
  data: AprobarHorasExtrasDto,
  token: string
): Promise<HorasExtrasRegistro> {
  return requestJSON<HorasExtrasRegistro>(HORAS_EXTRAS_ROUTES.aprobar(id), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

// ========== NUEVOS ENDPOINTS: PENDIENTES Y APROBACIÓN EN LOTE ==========

/** Obtener pendientes por periodo */
export async function getPendientesPorPeriodo(
  anio: number,
  mes: number,
  token: string,
  quincena?: 1 | 2,
): Promise<HorasExtrasRegistro[]> {
  const url = HORAS_EXTRAS_ROUTES.pendientesPorPeriodo(anio, mes, quincena);
  return requestJSON<HorasExtrasRegistro[]>(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Aprobar o rechazar múltiples registros */
export async function aprobarHorasExtrasLote(
  data: AprobarHorasExtrasLoteDto,
  token: string,
): Promise<{ updated: number } & { registros?: HorasExtrasRegistro[] }> {
  try {
    const res = await requestJSON<any>(
      HORAS_EXTRAS_ROUTES.aprobarLote(),
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }
    );
    // Normalizar posibles formas de respuesta del backend
    if (res && typeof res === 'object') {
      // Caso nuevo servicio: { processed, success, failed, results }
      if (typeof res.success === 'number') {
        return { updated: res.success, registros: res.results };
      }
      // Caso legacy/previsto: { updated, registros? }
      if (typeof res.updated === 'number') {
        return { updated: res.updated, registros: res.registros };
      }
    }
    // Si la respuesta no coincide con ningún formato conocido, intentar inferir
    return { updated: Array.isArray(res?.results) ? res.results.filter((r: any) => r?.ok).length : 0 };
  } catch (e: any) {
    // Fallback: si el endpoint de lote falla (p.ej. 400 por validación/whitelist),
    // aprobar uno por uno usando el endpoint individual para no bloquear el flujo.
    const isValidation400 = e?.status === 400 || /should not exist/i.test(String(e?.message || ''));
    if (!isValidation400) throw e;
    const ids = Array.isArray(data.ids) ? data.ids : [];
    let success = 0;
    for (const id of ids) {
      try {
        await aprobarHorasExtras(id, { estado: data.estado, comentarios: data.comentarios }, token);
        success += 1;
      } catch {
        // Continuar con los demás
      }
    }
    return { updated: success };
  }
}

// ========== ESTADÍSTICAS Y REPORTES ==========

/**
 * Obtener resumen mensual de un empleado
 */
export async function getResumenEmpleado(
  empleadoId: string,
  anio: number,
  mes: number,
  token: string
): Promise<ResumenEmpleado> {
  return requestJSON<ResumenEmpleado>(
    HORAS_EXTRAS_ROUTES.resumenEmpleado(empleadoId, anio, mes),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Obtener estadísticas generales del mes
 */
export async function getEstadisticasGenerales(
  anio: number,
  mes: number,
  token: string
): Promise<EstadisticasGenerales> {
  return requestJSON<EstadisticasGenerales>(
    HORAS_EXTRAS_ROUTES.estadisticas(anio, mes),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
