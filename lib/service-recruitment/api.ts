import { requestJSON } from '../utils/fetcher';
import { RECRUITMENT_ROUTES } from './routes';
import type {
  RecruitmentActivity,
  CreateRecruitmentActivityDto,
  UpdateRecruitmentActivityDto,
  VincularModeloDto,
  RecruitmentStats,
  GeneralStats,
  SalesCloser,
  EstadoModeloCerrada,
} from './types';

// ========== CRUD DE ACTIVIDADES ==========

export async function getActivities(
  token: string,
  filters?: {
    salesCloserId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: EstadoModeloCerrada;
  }
): Promise<RecruitmentActivity[]> {
  const query = new URLSearchParams();
  if (filters?.salesCloserId) query.append('salesCloserId', filters.salesCloserId);
  if (filters?.fechaDesde) query.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) query.append('fechaHasta', filters.fechaHasta);
  if (filters?.estado) query.append('estado', filters.estado);

  const url = query.toString()
    ? `${RECRUITMENT_ROUTES.activities.list}?${query.toString()}`
    : RECRUITMENT_ROUTES.activities.list;

  return requestJSON<RecruitmentActivity[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getActivity(token: string, id: string): Promise<RecruitmentActivity> {
  return requestJSON<RecruitmentActivity>(
    RECRUITMENT_ROUTES.activities.detail(id),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
}

export async function createActivity(
  token: string,
  data: CreateRecruitmentActivityDto
): Promise<RecruitmentActivity> {
  // Sanitizar payload: el backend calcula promedioFacturacion y no espera ese campo en el DTO
  const sanitized: CreateRecruitmentActivityDto = {
    ...data,
    modelosCerradas: data.modelosCerradas?.map(m => {
      const { promedioFacturacion, ...rest } = m as any;
      return rest as typeof m;
    }),
  } as any;

  return requestJSON<RecruitmentActivity>(
    RECRUITMENT_ROUTES.activities.create,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(sanitized),
    }
  );
}

export async function updateActivity(
  token: string,
  id: string,
  data: UpdateRecruitmentActivityDto
): Promise<RecruitmentActivity> {
  // Sanitizar payload: no enviar salesCloserId en PATCH y quitar promedioFacturacion de modelosCerradas
  const { salesCloserId, ...rest } = data as any;
  const sanitized: UpdateRecruitmentActivityDto = {
    ...rest,
    modelosCerradas: rest.modelosCerradas?.map((m: any) => {
      const { promedioFacturacion, ...r } = m || {};
      return r;
    }),
  } as any;

  return requestJSON<RecruitmentActivity>(
    RECRUITMENT_ROUTES.activities.update(id),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(sanitized),
    }
  );
}

export async function deleteActivity(token: string, id: string): Promise<void> {
  await fetch(requestJSON.base(RECRUITMENT_ROUTES.activities.delete(id)), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ========== VINCULAR MODELO ==========

export async function vincularModelo(
  token: string,
  data: VincularModeloDto
): Promise<RecruitmentActivity> {
  return requestJSON<RecruitmentActivity>(
    RECRUITMENT_ROUTES.activities.vincularModelo,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }
  );
}

// ========== ESTADÍSTICAS ==========

export async function getStatsBySalesCloser(
  token: string,
  salesCloserId: string,
  fechaDesde?: string,
  fechaHasta?: string
): Promise<RecruitmentStats> {
  const query = new URLSearchParams();
  if (fechaDesde) query.append('fechaDesde', fechaDesde);
  if (fechaHasta) query.append('fechaHasta', fechaHasta);

  const url = query.toString()
    ? `${RECRUITMENT_ROUTES.activities.statsBySalesCloser(salesCloserId)}?${query.toString()}`
    : RECRUITMENT_ROUTES.activities.statsBySalesCloser(salesCloserId);

  return requestJSON<RecruitmentStats>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getGeneralStats(
  token: string,
  fechaDesde?: string,
  fechaHasta?: string
): Promise<GeneralStats> {
  const query = new URLSearchParams();
  if (fechaDesde) query.append('fechaDesde', fechaDesde);
  if (fechaHasta) query.append('fechaHasta', fechaHasta);

  const url = query.toString()
    ? `${RECRUITMENT_ROUTES.activities.stats}?${query.toString()}`
    : RECRUITMENT_ROUTES.activities.stats;

  return requestJSON<GeneralStats>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ========== SALES CLOSERS ==========

export async function getSalesClosers(token: string): Promise<SalesCloser[]> {
  return requestJSON<SalesCloser[]>(
    RECRUITMENT_ROUTES.activities.salesClosers,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
}

// ========== EXPORTACIÓN ==========

export async function exportToExcel(
  token: string,
  filters?: {
    salesCloserId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }
): Promise<void> {
  const query = new URLSearchParams();
  if (filters?.salesCloserId) query.append('salesCloserId', filters.salesCloserId);
  if (filters?.fechaDesde) query.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) query.append('fechaHasta', filters.fechaHasta);

  const url = query.toString()
    ? `${RECRUITMENT_ROUTES.export.excel}?${query.toString()}`
    : RECRUITMENT_ROUTES.export.excel;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar a Excel');
    }

    // Obtener filename del header o usar default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `recruitment-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Descargar el archivo
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
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

export async function exportToPdf(
  token: string,
  filters?: {
    salesCloserId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }
): Promise<void> {
  const query = new URLSearchParams();
  if (filters?.salesCloserId) query.append('salesCloserId', filters.salesCloserId);
  if (filters?.fechaDesde) query.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) query.append('fechaHasta', filters.fechaHasta);

  const url = query.toString()
    ? `${RECRUITMENT_ROUTES.export.pdf}?${query.toString()}`
    : RECRUITMENT_ROUTES.export.pdf;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar a PDF');
    }

    // Obtener filename del header o usar default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `recruitment-${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Descargar el archivo
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
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

