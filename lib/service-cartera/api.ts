/**
 * API del módulo de Cartera
 * Funciones para comunicación con el backend
 */

import { requestJSON } from '../utils/fetcher';
import { CARTERA_ROUTES } from './routes';
import type {
  Factura,
  Pago,
  Recordatorio,
  ConfiguracionCartera,
  EstadoCuenta,
  TotalesCartera,
  DashboardCartera,
  PaginatedResponse,
  CreateFacturaDto,
  UpdateFacturaDto,
  GenerarFacturaModeloDto,
  GenerarFacturasPorPeriodoDto,
  CreatePagoDto,
  FiltrosFacturasDto,
  FiltrosPagosDto,
  ObtenerEstadoCuentaDto,
  EnviarRecordatorioDto,
  UpdateConfiguracionDto,
} from './types';

// ========== FACTURAS ==========

/**
 * Obtiene lista de facturas con filtros y paginación
 */
export async function getFacturas(token: string, filtros?: FiltrosFacturasDto): Promise<PaginatedResponse<Factura>> {
  const params = new URLSearchParams();
  
  if (filtros?.modeloId) params.append('modeloId', filtros.modeloId);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.mes) params.append('mes', filtros.mes.toString());
  if (filtros?.anio) params.append('anio', filtros.anio.toString());
  if (filtros?.page) params.append('page', filtros.page.toString());
  if (filtros?.limit) params.append('limit', filtros.limit.toString());
  if (filtros?.sortBy) params.append('sortBy', filtros.sortBy);
  if (filtros?.sortOrder) params.append('sortOrder', filtros.sortOrder);

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.facturas.list}?${query}` : CARTERA_ROUTES.facturas.list;

  // requestJSON ya desenvuelve { success, data }, por lo que aquí recibimos
  // directamente un objeto con forma { facturas, total, page, limit }
  const resp = await requestJSON<{ facturas?: Factura[]; total?: number; page?: number; limit?: number }>(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const facturas = Array.isArray(resp?.facturas) ? resp.facturas : [];
  const total = typeof resp?.total === 'number' ? resp.total! : facturas.length;
  const page = typeof resp?.page === 'number' ? resp.page! : 1;
  const limit = typeof resp?.limit === 'number' ? resp.limit! : facturas.length || 20;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  return {
    data: facturas,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Obtiene una factura por ID
 */
export function getFacturaById(token: string, id: string): Promise<Factura> {
  return requestJSON<Factura>(CARTERA_ROUTES.facturas.byId(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Crea una factura manual
 */
export function createFactura(token: string, dto: CreateFacturaDto): Promise<Factura> {
  return requestJSON<Factura>(CARTERA_ROUTES.facturas.create, {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Actualiza una factura
 */
export function updateFactura(token: string, id: string, dto: UpdateFacturaDto): Promise<Factura> {
  return requestJSON<Factura>(CARTERA_ROUTES.facturas.update(id), {
    method: 'PUT',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Elimina una factura
 */
export function deleteFactura(token: string, id: string): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(CARTERA_ROUTES.facturas.delete(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Genera una factura automática para una modelo
 */
export function generarFacturaModelo(
  token: string,
  modeloId: string,
  dto: GenerarFacturaModeloDto,
): Promise<Factura> {
  return requestJSON<Factura>(CARTERA_ROUTES.facturas.generarPorModelo(modeloId), {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Genera facturas para múltiples modelos en un periodo
 */
export function generarFacturasPorPeriodo(
  token: string,
  dto: GenerarFacturasPorPeriodoDto,
): Promise<{
  generadas: number;
  errores: number;
  facturas: Factura[];
  erroresDetalle: Array<{ modeloId: string; error: string }>;
}> {
  return requestJSON(CARTERA_ROUTES.facturas.generarPorPeriodo, {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtiene facturas próximas a vencer
 */
export function getFacturasProximasVencer(
  token: string,
  dias?: number,
): Promise<{ facturas: Factura[]; total: number }> {
  const params = dias ? `?dias=${dias}` : '';
  return requestJSON(`${CARTERA_ROUTES.facturas.proximasVencer}${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtiene facturas vencidas
 */
export function getFacturasVencidas(token: string): Promise<{ facturas: Factura[]; total: number }> {
  return requestJSON(CARTERA_ROUTES.facturas.vencidas, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Abre el PDF de una factura en una nueva pestaña
 * 
 * NUEVO: Usa endpoint público /api/cartera-pdf/facturas/:id/A4/:filename
 * Ya NO requiere token JWT (similar a contratos-modelo)
 * 
 * @param facturaId ID de la factura
 * @param filename Nombre del archivo (opcional)
 */
export function openFacturaPdf(facturaId: string, filename: string = 'factura.pdf'): void {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
    // Usar el nuevo endpoint público similar a contratos-modelo
    const url = `${apiUrl}/api/cartera-pdf/facturas/${facturaId}/A4/${filename}`;
    
    // Abrir directamente en nueva pestaña (no requiere headers ni token)
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      throw new Error('No se pudo abrir la ventana. Verifica que los pop-ups estén habilitados.');
    }
  } catch (error) {
    console.error('Error abriendo PDF de factura:', error);
    throw error;
  }
}

/**
 * DEPRECADO: Usar openFacturaPdf() en su lugar
 * Esta función retorna solo la URL, pero window.open() no puede enviar headers
 * 
 * @deprecated Usar openFacturaPdf(token, facturaId) en su lugar
 */
export function getFacturaPdfUrl(facturaId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}${CARTERA_ROUTES.facturas.pdf(facturaId)}`;
}

/**
 * Obtiene la URL pública de una factura usando token temporal
 * Esta URL NO requiere autenticación JWT
 * 
 * @param token Token temporal generado por el backend (HMAC-SHA256)
 * @returns URL pública para acceder al PDF sin autenticación
 */
export function getFacturaPdfUrlPublic(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}/api/cartera/factura/token/${token}/pdf`;
}

/**
 * Genera un enlace público temporal para una factura
 * Requiere autenticación JWT para generar el token
 * El token resultante se puede usar con getFacturaPdfUrlPublic()
 * 
 * @param token JWT token del usuario autenticado
 * @param facturaId ID de la factura
 * @returns Objeto con token temporal, URLs y fecha de expiración
 */
export async function generateFacturaPdfLink(
  token: string,
  facturaId: string,
): Promise<{
  token: string;
  viewUrl: string;
  downloadUrl: string;
  expiresAt: string;
}> {
  const result = await requestJSON<{
    success: boolean;
    data: {
      token: string;
      viewUrl: string;
      downloadUrl: string;
      expiresAt: string;
    };
  }>(`/api/cartera/facturas/${facturaId}/pdf/link`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return result.data;
}

/**
 * Descarga el PDF de una factura
 * Retorna un Blob para forzar descarga en el navegador
 * 
 * NOTA: Usa el servicio centralizado CarteraPdfCoreService del backend
 */
export async function downloadFacturaPdf(
  token: string,
  facturaId: string,
  numeroFactura: string,
): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
    const url = `${apiUrl}${CARTERA_ROUTES.facturas.pdfDownload(facturaId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Factura_${numeroFactura}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error descargando PDF de factura:', error);
    throw error;
  }
}

// ========== PAGOS ==========

/**
 * Obtiene lista de pagos con filtros
 */
export function getPagos(token: string, filtros?: FiltrosPagosDto): Promise<PaginatedResponse<Pago>> {
  const params = new URLSearchParams();
  
  if (filtros?.facturaId) params.append('facturaId', filtros.facturaId);
  if (filtros?.modeloId) params.append('modeloId', filtros.modeloId);
  if (filtros?.metodoPago) params.append('metodoPago', filtros.metodoPago);
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.page) params.append('page', filtros.page.toString());
  if (filtros?.limit) params.append('limit', filtros.limit.toString());

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.pagos.list}?${query}` : CARTERA_ROUTES.pagos.list;
  
  return requestJSON<PaginatedResponse<Pago>>(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtiene un pago por ID
 */
export function getPagoById(token: string, id: string): Promise<Pago> {
  return requestJSON<Pago>(CARTERA_ROUTES.pagos.byId(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Registra un pago con comprobante (FormData)
 */
export function createPago(token: string, dto: CreatePagoDto, file: File | null): Promise<Pago> {
  const formData = new FormData();
  
  formData.append('facturaId', dto.facturaId);
  formData.append('fechaPago', dto.fechaPago);
  formData.append('montoUSD', dto.montoUSD.toString());
  formData.append('metodoPago', dto.metodoPago);
  
  if (dto.referencia) formData.append('referencia', dto.referencia);
  if (dto.observaciones) formData.append('observaciones', dto.observaciones);
  if (file) formData.append('file', file);

  return requestJSON<Pago>(CARTERA_ROUTES.pagos.create, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Obtiene pagos de una factura específica
 */
export function getPagosByFactura(token: string, facturaId: string): Promise<{ pagos: Pago[]; total: number }> {
  return requestJSON(CARTERA_ROUTES.pagos.byFactura(facturaId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== ESTADO DE CUENTA ==========

/**
 * Obtiene el estado de cuenta de una modelo
 */
export function getEstadoCuenta(
  token: string,
  modeloId: string,
  dto: ObtenerEstadoCuentaDto,
): Promise<EstadoCuenta> {
  const params = new URLSearchParams();
  if (dto?.fechaInicio) params.set('fechaInicio', dto.fechaInicio);
  if (dto?.fechaFin) params.set('fechaFin', dto.fechaFin);

  return requestJSON(`${CARTERA_ROUTES.estadoCuenta.get(modeloId)}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Descarga el PDF del estado de cuenta
 * 
 * NOTA: Usa el servicio centralizado CarteraPdfCoreService del backend
 */
export async function downloadEstadoCuentaPDF(
  token: string,
  modeloId: string,
  dto: ObtenerEstadoCuentaDto,
): Promise<Blob> {
  const params = new URLSearchParams();
  if (dto?.fechaInicio) params.set('fechaInicio', dto.fechaInicio);
  if (dto?.fechaFin) params.set('fechaFin', dto.fechaFin);

  const response = await fetch(
    requestJSON.base(`${CARTERA_ROUTES.estadoCuenta.pdf(modeloId)}?${params.toString()}`),
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Error al descargar PDF: ${response.statusText}`);
  }

  return await response.blob();
}

/**
 * Obtiene la URL pública del estado de cuenta usando token temporal
 * Esta URL NO requiere autenticación JWT
 * 
 * @param token Token temporal generado por el backend (HMAC-SHA256)
 * @returns URL pública para acceder al estado de cuenta sin autenticación
 */
export function getEstadoCuentaPdfUrlPublic(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}/api/cartera/estado-cuenta/token/${token}/pdf`;
}

// ========== RECORDATORIOS ==========

/**
 * Obtiene lista de recordatorios
 */
export function getRecordatorios(
  token: string,
  filtros?: { facturaId?: string; tipo?: string; desde?: string; hasta?: string },
): Promise<{ recordatorios: Recordatorio[]; total: number }> {
  const params = new URLSearchParams();
  
  if (filtros?.facturaId) params.append('facturaId', filtros.facturaId);
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.recordatorios.list}?${query}` : CARTERA_ROUTES.recordatorios.list;
  
  return requestJSON(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Envía un recordatorio de pago
 */
export function enviarRecordatorio(
  token: string,
  facturaId: string,
  dto: EnviarRecordatorioDto,
): Promise<{ recordatorio: Recordatorio; emailEnviado: boolean }> {
  return requestJSON(CARTERA_ROUTES.recordatorios.enviar(facturaId), {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== TOTALES Y ESTADÍSTICAS ==========

/**
 * Obtiene totales generales de cartera
 */
export function getTotalesCartera(
  token: string,
  filtros?: { desde?: string; hasta?: string },
): Promise<TotalesCartera> {
  const params = new URLSearchParams();
  
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.totales}?${query}` : CARTERA_ROUTES.totales;
  
  return requestJSON<TotalesCartera>(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtiene dashboard completo de cartera
 */
export function getDashboardCartera(
  token: string,
  filtros?: { desde?: string; hasta?: string },
): Promise<DashboardCartera> {
  const params = new URLSearchParams();
  
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.dashboard}?${query}` : CARTERA_ROUTES.dashboard;

  return requestJSON<DashboardCartera>(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtiene estadísticas de cartera
 */
export function getEstadisticasCartera(
  token: string,
  filtros?: { desde?: string; hasta?: string },
): Promise<{
  tasaCobranza: number;
  diasPromedioCobranza: number;
  facturasAlDia: number;
  facturasAtrasadas: number;
}> {
  const params = new URLSearchParams();
  
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);

  const query = params.toString();
  const path = query ? `${CARTERA_ROUTES.estadisticas}?${query}` : CARTERA_ROUTES.estadisticas;
  
  return requestJSON(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== CONFIGURACIÓN ==========

/**
 * Obtiene la configuración de cartera
 */
export function getConfiguracion(token: string): Promise<ConfiguracionCartera> {
  return requestJSON<ConfiguracionCartera>(CARTERA_ROUTES.configuracion.get, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Actualiza la configuración de cartera
 */
export function updateConfiguracion(
  token: string,
  dto: UpdateConfiguracionDto,
): Promise<ConfiguracionCartera> {
  return requestJSON<ConfiguracionCartera>(CARTERA_ROUTES.configuracion.update, {
    method: 'PUT',
    body: JSON.stringify(dto),
    headers: { Authorization: `Bearer ${token}` },
  });
}
