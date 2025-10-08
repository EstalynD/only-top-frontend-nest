// Enums para contratos
export enum PeriodicidadPago {
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
}

export enum TipoComision {
  FIJO = 'FIJO',
  ESCALONADO = 'ESCALONADO',
}

export enum EstadoContrato {
  BORRADOR = 'BORRADOR',
  PENDIENTE_FIRMA = 'PENDIENTE_FIRMA',
  FIRMADO = 'FIRMADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
}

// Interfaces
export interface ComisionFija {
  porcentaje: number;
}

export interface ComisionEscalonada {
  escalaId: string;
  escalaNombre: string;
}

export interface FirmaDigital {
  fechaFirma: string;
  nombreCompleto: string;
  numeroIdentificacion: string;
  ipAddress: string;
  userAgent: string;
  dispositivo?: string | null;
  otpVerificado: boolean;
}

export interface PaymentProcessor {
  _id: string;
  name: string;
  code: string;
  type: string;
  isActive: boolean;
}

export interface CommissionScale {
  _id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  rules: Array<{
    minUsd: number;
    maxUsd?: number;
    percentage: number;
  }>;
}

export interface ContratoModelo {
  _id: string;
  modeloId: string | {
    _id: string;
    nombreCompleto: string;
    correoElectronico: string;
    numeroIdentificacion: string;
    fotoPerfil?: string | null;
  };
  numeroContrato: string;
  fechaInicio: string;
  periodicidadPago: PeriodicidadPago;
  fechaInicioCobro: string;
  tipoComision: TipoComision;
  comisionFija?: ComisionFija | null;
  comisionEscalonada?: ComisionEscalonada | null;
  procesadorPagoId: string | PaymentProcessor;
  procesadorPagoNombre: string;
  estado: EstadoContrato;
  firma?: FirmaDigital | null;
  tokenFirmaUnico?: string | null;
  tokenFirmaExpiracion?: string | null;
  creadoPor?: string | null;
  fechaEnvioPendienteFirma?: string | null;
  fechaFirma?: string | null;
  notasInternas?: string | null;
  salesCloserAsignado?: string | {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
    telefono?: string;
  } | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContratoModeloDto {
  modeloId: string;
  fechaInicio: string;
  periodicidadPago: PeriodicidadPago;
  fechaInicioCobro: string;
  tipoComision: TipoComision;
  comisionFijaPorcentaje?: number;
  comisionEscalonadaId?: string;
  procesadorPagoId: string;
  notasInternas?: string;
  salesCloserAsignado?: string;
}

export interface UpdateContratoModeloDto {
  fechaInicio?: string;
  periodicidadPago?: PeriodicidadPago;
  fechaInicioCobro?: string;
  tipoComision?: TipoComision;
  comisionFijaPorcentaje?: number;
  comisionEscalonadaId?: string;
  procesadorPagoId?: string;
  notasInternas?: string;
}

export interface FirmarContratoDto {
  contratoId: string;
  nombreCompleto: string;
  numeroIdentificacion: string;
  codigoOtp: string;
  ipAddress: string;
  userAgent: string;
  dispositivo?: string;
}

export interface ContratosStats {
  total: number;
  firmados: number;
  pendientes: number;
  borradores: number;
  rechazados: number;
}

