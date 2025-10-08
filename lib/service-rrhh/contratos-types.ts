import type { Empleado } from './empleados-types';

export interface Contrato {
  _id: string;
  empleadoId: string | Empleado;
  numeroContrato: string;
  tipoContrato: 'PRESTACION_SERVICIOS' | 'TERMINO_FIJO' | 'TERMINO_INDEFINIDO' | 'OBRA_LABOR' | 'APRENDIZAJE';
  fechaInicio: string;
  fechaFin?: string | null;
  estado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'TERMINADO';
  contenidoContrato: string;
  plantillaId: string;
  aprobacion?: {
    aprobadoPor?: string | null;
    fechaAprobacion?: string | null;
    comentarios?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Documento {
  _id: string;
  empleadoId: string | Empleado;
  contratoId?: string | Contrato | null;
  nombre: string;
  nombreOriginal: string;
  tipoDocumento: 'CEDULA_IDENTIDAD' | 'RUT' | 'DIPLOMA' | 'CERTIFICADO_ACADEMICO' | 'CERTIFICADO_LABORAL' | 'CERTIFICADO_MEDICO' | 'CERTIFICADO_PENALES' | 'CERTIFICADO_POLICIA' | 'CONTRATO_LABORAL' | 'HOJA_VIDA' | 'FOTO_PERFIL' | 'OTRO';
  descripcion: string;
  urlArchivo: string;
  publicId: string;
  formato: string;
  tamañoBytes: number;
  mimeType: string;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  fechaSubida: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | 'RENOVADO';
  validacion?: {
    validadoPor?: string | null;
    fechaValidacion?: string | null;
    observaciones?: string | null;
    esValido?: boolean;
  };
  renovacion?: {
    requiereRenovacion?: boolean;
    diasAntesVencimiento?: number;
    notificado?: boolean;
    documentoAnterior?: string | null;
  };
  esConfidencial: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlantillaContrato {
  _id: string;
  nombre: string;
  descripcion?: string | null;
  contenido: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs para crear/actualizar
export interface CreateContratoDto {
  empleadoId: string;
  numeroContrato?: string;
  tipoContrato: string;
  fechaInicio: string;
  fechaFin?: string | null;
  contenidoContrato: string;
  plantillaId: string;
}

export interface UpdateContratoDto {
  numeroContrato?: string;
  tipoContrato?: string;
  fechaInicio?: string;
  fechaFin?: string | null;
  contenidoContrato?: string;
  plantillaId?: string;
}

export interface AprobarContratoDto {
  estado: 'APROBADO' | 'RECHAZADO';
  comentarios?: string | null;
}

export interface RenovarContratoDto {
  fechaInicio: string;
  fechaFin?: string | null;
  contenidoContrato: string;
  plantillaId: string;
  comentarios?: string | null;
}

export interface CreateDocumentoDto {
  empleadoId: string;
  contratoId?: string | null;
  nombre: string;
  nombreOriginal: string;
  tipoDocumento: string;
  descripcion: string;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  esConfidencial?: boolean;
  tags?: string[];
  requiereRenovacion?: boolean;
  diasAntesVencimiento?: number;
}

export interface UpdateDocumentoDto {
  nombre?: string;
  descripcion?: string;
  fechaEmision?: string;
  fechaVencimiento?: string | null;
  esConfidencial?: boolean;
  tags?: string[];
  requiereRenovacion?: boolean;
  diasAntesVencimiento?: number;
}

export interface ValidarDocumentoDto {
  estado: 'APROBADO' | 'RECHAZADO';
  observaciones?: string | null;
  esValido?: boolean;
}

export interface RenovarDocumentoDto {
  nombre: string;
  nombreOriginal: string;
  descripcion: string;
  fechaEmision: string;
  fechaVencimiento?: string | null;
}

// Estadísticas
export interface ContratosStats {
  total: number;
  porEstado: Record<string, number>;
  porTipo: Record<string, number>;
  proximosAVencer: number;
  vencidos: number;
}

export interface DocumentosStats {
  total: number;
  porEstado: Record<string, number>;
  porTipo: Record<string, number>;
  proximosAVencer: number;
  vencidos: number;
}

// Filtros de búsqueda
export interface ContratosFiltros {
  empleadoId?: string;
  estado?: string;
  tipoContrato?: string;
  fechaInicio?: string;
  fechaFin?: string;
  numeroContrato?: string;
}

export interface DocumentosFiltros {
  empleadoId?: string;
  tipoDocumento?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  esConfidencial?: boolean;
  tags?: string[];
}
