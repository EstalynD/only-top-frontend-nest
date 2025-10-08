/**
 * Tipos e interfaces del módulo de Horas Extras
 */

// ========== ENUMS ==========

export enum TipoHoraExtra {
  DIURNA = 'DIURNA',
  NOCTURNA = 'NOCTURNA',
  RECARGO_NOCTURNO = 'RECARGO_NOCTURNO',
  DOMINGO = 'DOMINGO',
  FESTIVO = 'FESTIVO',
  DOMINGO_NOCTURNO = 'DOMINGO_NOCTURNO',
  FESTIVO_NOCTURNO = 'FESTIVO_NOCTURNO',
}

export enum EstadoHoraExtra {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

// ========== INTERFACES BASE ==========

export interface DetalleHoraExtra {
  tipo: TipoHoraExtra;
  cantidadHoras: number;
  observaciones?: string | null;
  fechaRegistro: string; // ISO 8601
  valorHoraOrdinaria?: string; // Formateado: "$ 2,500.00"
  recargoPorcentaje?: number;
  valorConRecargo?: string; // Formateado: "$ 3,000.00"
  total?: string; // Formateado: "$ 15,000.00"
}

export interface SalarioBase {
  monto: number;
  moneda: string;
}

export interface Aprobacion {
  aprobadoPor?: string | { _id: string; username: string };
  fechaAprobacion?: string;
  comentarios?: string | null;
}

export interface HorasExtrasRegistro {
  _id: string;
  empleadoId: string | EmpleadoRef;
  anio: number;
  mes: number;
  quincena: 1 | 2;
  periodo: string;
  detalles: DetalleHoraExtra[];
  salarioBase: SalarioBase;
  horasLaboralesMes: number;
  valorHoraOrdinaria: string; // Formateado: "$ 2,500.00"
  totalHoras: number;
  totalRecargo: string; // Formateado: "$ 15,000.00"
  estado: EstadoHoraExtra;
  aprobacion?: Aprobacion | null;
  registradoPor: string | { _id: string; username: string };
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Valores raw para cálculos (opcionales)
  _raw?: {
    valorHoraOrdinaria: number;
    totalRecargo: number;
  };
}

export interface EmpleadoRef {
  _id: string;
  nombre: string;
  apellido: string;
  numeroIdentificacion?: string;
  correoElectronico?: string;
  salario?: SalarioBase;
}

// ========== DTOs PARA API ==========

export interface CreateDetalleHoraExtraDto {
  tipo: TipoHoraExtra;
  cantidadHoras: number;
  fechaRegistro: string; // ISO 8601
  observaciones?: string;
}

export interface CreateHorasExtrasDto {
  empleadoId: string;
  anio: number;
  mes: number;
  quincena: 1 | 2;
  detalles: CreateDetalleHoraExtraDto[];
  horasLaboralesMes?: number;
}

export interface UpdateHorasExtrasDto {
  detalles?: CreateDetalleHoraExtraDto[];
  horasLaboralesMes?: number;
}

export interface AprobarHorasExtrasDto {
  estado: 'APROBADO' | 'RECHAZADO';
  comentarios?: string;
}

// Aprobación en lote
export interface AprobarHorasExtrasLoteDto {
  ids: string[];
  estado: 'APROBADO' | 'RECHAZADO';
  comentarios?: string;
}

export interface FiltrosHorasExtrasDto {
  empleadoId?: string;
  anio?: number;
  mes?: number;
  quincena?: 1 | 2;
  periodo?: string;
  estado?: EstadoHoraExtra;
}

// ========== RESPUESTAS DE ESTADÍSTICAS ==========

export interface DesglosePorTipo {
  tipo: TipoHoraExtra;
  horas: number;
  totalCOP: number;
  totalCOPRaw: string;
}

export interface RegistroResumen {
  id: string;
  quincena: 1 | 2;
  periodo: string;
  totalHoras: number;
  totalRecargoCOP: number;
  estado: EstadoHoraExtra;
}

export interface ResumenEmpleado {
  empleadoId: string;
  anio: number;
  mes: number;
  cantidadRegistros: number;
  totalHorasMes: number;
  totalRecargoCOP: number;
  totalRecargoCOPRaw: string;
  desglosePorTipo: DesglosePorTipo[];
  registros: RegistroResumen[];
}

export interface EstadoPorEstado {
  estado: EstadoHoraExtra;
  cantidad: number;
  totalCOP: number;
  totalCOPRaw: string;
}

export interface EstadisticasGenerales {
  periodo: string;
  totalRegistros: number;
  totalHoras: number;
  totalRecargoCOP: number;
  totalRecargoCOPRaw: string;
  porEstado: EstadoPorEstado[];
}

// ========== TIPOS DE UI ==========

export interface HorasExtrasFormData {
  empleadoId: string;
  anio: number;
  mes: number;
  quincena: 1 | 2;
  detalles: CreateDetalleHoraExtraDto[];
}

export interface DetalleFormData {
  tipo: TipoHoraExtra;
  cantidadHoras: string; // String para input
  fechaRegistro: string;
  observaciones: string;
}
