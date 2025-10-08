import type { Area, Cargo } from './types';

// Re-export types for convenience
export type { Area, Cargo };

export interface Salario {
  monto: number;
  moneda: string;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion?: string;
}

export interface InformacionBancaria {
  nombreBanco: string;
  numeroCuenta: string;
  tipoCuenta: 'AHORROS' | 'CORRIENTE';
}

export interface Empleado {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  correoPersonal?: string | null;
  correoCorporativo?: string | null;
  telefono: string;
  cargoId: string | Cargo;
  areaId: string | Area;
  jefeInmediatoId?: string | Empleado | null;
  fechaInicio: string;
  salario: Salario;
  tipoContrato: string;
  numeroIdentificacion: string;
  direccion: string;
  ciudad: string;
  pais: string;
  contactoEmergencia: ContactoEmergencia;
  fechaNacimiento: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'TERMINADO';
  informacionBancaria: InformacionBancaria;
  fotoPerfil?: string | null;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
  // Información de cuenta (opcional, proporcionada por backend)
  hasUserAccount?: boolean;
  userAccount?: { id: string; username: string; email: string | null } | null;
}

export interface Contrato {
  _id: string;
  empleadoId: string | Empleado;
  numeroContrato: string;
  tipoContrato: string;
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

export interface PlantillaContrato {
  _id: string;
  nombre: string;
  descripcion?: string | null;
  areaId: string | Area;
  cargoId: string | Cargo;
  tipoContrato: string;
  contenidoPlantilla: string;
  variables: string[];
  activa: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// DTOs para crear/actualizar
export interface CreateEmpleadoDto {
  nombre: string;
  apellido: string;
  correoElectronico: string;
  correoPersonal?: string | null;
  correoCorporativo?: string | null;
  telefono: string;
  cargoId: string;
  areaId: string;
  jefeInmediatoId?: string | null;
  fechaInicio: string;
  salario: Salario;
  tipoContrato: string;
  numeroIdentificacion: string;
  direccion: string;
  ciudad: string;
  pais?: string;
  contactoEmergencia: ContactoEmergencia;
  fechaNacimiento: string;
  estado?: string;
  informacionBancaria: InformacionBancaria;
  fotoPerfil?: string | null;
}

export interface UpdateEmpleadoDto extends Partial<CreateEmpleadoDto> {
  // Explicit properties for better type inference
}

export interface EmpleadosStats {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  contratosEnRevision: number;
  empleadosPorArea: Array<{
    area: string;
    count: number;
  }>;
}
