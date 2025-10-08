import { requestJSON } from '../utils/fetcher';

const MEMORANDUM_ROUTES = {
  generate: '/api/rrhh/memorandum/generate'
} as const;

export type MemorandumType = 'AUSENCIA' | 'LLEGADA_TARDE' | 'SALIDA_ANTICIPADA';

export interface GenerateMemorandumRequest {
  type: MemorandumType;
  userId: string;
  date: string; // Format: YYYY-MM-DD
}

/**
 * Genera un memorando en formato PDF y lo descarga automáticamente
 */
export async function generateMemorandum(
  token: string,
  request: GenerateMemorandumRequest
): Promise<void> {
  const params = new URLSearchParams({
    type: request.type,
    userId: request.userId,
    date: request.date
  });

  const url = `${MEMORANDUM_ROUTES.generate}?${params.toString()}`;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al generar memorando: ${errorText || response.statusText}`);
    }

    // Get filename from Content-Disposition header or create default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `memorando-${request.type.toLowerCase()}-${request.date}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Download the PDF
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error generating memorandum:', error);
    throw error;
  }
}

/**
 * Obtiene el label en español para el tipo de memorando
 */
export function getMemorandumTypeLabel(type: MemorandumType): string {
  const labels: Record<MemorandumType, string> = {
    'AUSENCIA': 'Ausencia Injustificada',
    'LLEGADA_TARDE': 'Llegada Tarde',
    'SALIDA_ANTICIPADA': 'Salida Anticipada'
  };
  return labels[type];
}

/**
 * Obtiene el color para el tipo de memorando
 */
export function getMemorandumTypeColor(type: MemorandumType): string {
  const colors: Record<MemorandumType, string> = {
    'AUSENCIA': 'var(--ot-red-500)',
    'LLEGADA_TARDE': 'var(--ot-yellow-500)',
    'SALIDA_ANTICIPADA': 'var(--ot-orange-500)'
  };
  return colors[type];
}
