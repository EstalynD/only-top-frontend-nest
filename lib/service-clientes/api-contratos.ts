import { requestJSON } from '../utils/fetcher';
import { API_BASE } from '../config';
import { CLIENTES_ROUTES } from './routes';
import type {
  ContratoModelo,
  CreateContratoModeloDto,
  UpdateContratoModeloDto,
  FirmarContratoDto,
  ContratosStats,
  PaymentProcessor,
  CommissionScale,
} from './types-contratos';

// ========== CRUD DE CONTRATOS ==========

export async function getContratos(
  token: string,
  filters?: {
    modeloId?: string;
    estado?: string;
    search?: string;
  }
): Promise<ContratoModelo[]> {
  const query = new URLSearchParams();
  if (filters?.modeloId) query.append('modeloId', filters.modeloId);
  if (filters?.estado) query.append('estado', filters.estado);
  if (filters?.search) query.append('search', filters.search);

  const url = query.toString()
    ? `${CLIENTES_ROUTES.contratos.list}?${query.toString()}`
    : CLIENTES_ROUTES.contratos.list;

  return requestJSON<ContratoModelo[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getContrato(token: string, id: string): Promise<ContratoModelo> {
  return requestJSON<ContratoModelo>(CLIENTES_ROUTES.contratos.detail(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function createContrato(
  token: string,
  dto: CreateContratoModeloDto
): Promise<ContratoModelo> {
  return requestJSON<ContratoModelo>(CLIENTES_ROUTES.contratos.create, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

export async function updateContrato(
  token: string,
  id: string,
  dto: UpdateContratoModeloDto
): Promise<ContratoModelo> {
  return requestJSON<ContratoModelo>(CLIENTES_ROUTES.contratos.update(id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  });
}

export async function deleteContrato(token: string, id: string): Promise<void> {
  return requestJSON<void>(CLIENTES_ROUTES.contratos.delete(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getContratosStats(token: string): Promise<ContratosStats> {
  return requestJSON<ContratosStats>(CLIENTES_ROUTES.contratos.stats, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== PROCESO DE FIRMA ==========

export async function enviarParaFirma(
  token: string,
  contratoId: string
): Promise<{ success: boolean; message: string }> {
  return requestJSON<{ success: boolean; message: string }>(
    CLIENTES_ROUTES.contratos.enviarParaFirma,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contratoId }),
    }
  );
}

export async function enviarEnlaceFirma(
  token: string,
  contratoId: string
): Promise<{ success: boolean; message: string; enlace: string }> {
  return requestJSON<{ success: boolean; message: string; enlace: string }>(
    CLIENTES_ROUTES.contratos.enviarEnlaceFirma,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contratoId }),
    }
  );
}

export async function solicitarOtp(
  token: string,
  contratoId: string,
  correoModelo: string
): Promise<{ success: boolean; message: string }> {
  return requestJSON<{ success: boolean; message: string }>(
    CLIENTES_ROUTES.contratos.solicitarOtp,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contratoId, correoModelo }),
    }
  );
}

export async function firmarContrato(
  token: string,
  dto: FirmarContratoDto
): Promise<{ success: boolean; contrato: ContratoModelo }> {
  return requestJSON<{ success: boolean; contrato: ContratoModelo }>(
    CLIENTES_ROUTES.contratos.firmar,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(dto),
    }
  );
}

// ========== OTROS ENDPOINTS ==========

export async function getPaymentProcessors(token: string): Promise<PaymentProcessor[]> {
  return requestJSON<PaymentProcessor[]>('/sistema/finance/payment-processors', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getCommissionScales(token: string): Promise<CommissionScale[]> {
  return requestJSON<CommissionScale[]>('/sistema/finance/commission-scales', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== FIRMA PÚBLICA (Sin autenticación) ==========

export async function obtenerContratoPorToken(token: string): Promise<ContratoModelo> {
  // requestJSON ya desenvuelve la respuesta { success, data } automáticamente
  return requestJSON<ContratoModelo>(
    CLIENTES_ROUTES.firmaPublica.obtenerContrato(token),
    {
      cache: 'no-store',
    }
  );
}

export async function solicitarOtpPorToken(token: string): Promise<{ success: boolean; message: string }> {
  return requestJSON<{ success: boolean; message: string }>(
    CLIENTES_ROUTES.firmaPublica.solicitarOtp(token),
    {
      method: 'POST',
    }
  );
}

export async function firmarContratoPorToken(
  token: string,
  dto: Omit<FirmarContratoDto, 'contratoId'>
): Promise<{ success: boolean; contrato: ContratoModelo }> {
  return requestJSON<{ success: boolean; contrato: ContratoModelo }>(
    CLIENTES_ROUTES.firmaPublica.firmar(token),
    {
      method: 'POST',
      body: JSON.stringify(dto),
    }
  );
}

// ========== UTILIDADES PARA PDFs ==========

/**
 * Genera la URL completa para visualizar el PDF de un contrato
 * Esta URL apunta al backend a través del proxy del frontend
 */
export function getPdfViewUrl(contratoId: string, numeroContrato: string): string {
  const route = CLIENTES_ROUTES.contratos.pdfView(contratoId, numeroContrato);
  return `${API_BASE}${route}`;
}

/**
 * Genera la URL completa para descargar el PDF de un contrato
 * Esta URL apunta al backend a través del proxy del frontend
 */
export function getPdfDownloadUrl(contratoId: string): string {
  const route = CLIENTES_ROUTES.contratos.pdfDownload(contratoId);
  return `${API_BASE}${route}`;
}

/**
 * Obtiene información del PDF de un contrato
 */
export async function getPdfInfo(
  token: string,
  contratoId: string
): Promise<{
  contratoId: string;
  numeroContrato: string;
  estado: string;
  pdfUrl: string;
  firmado: boolean;
}> {
  return requestJSON<any>(
    CLIENTES_ROUTES.contratos.pdfInfo(contratoId),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  ).then(res => res.data);
}

