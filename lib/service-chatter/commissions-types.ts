// Types for Chatter Commissions

export enum CommissionStatus {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  PAGADA = 'PAGADA',
  CANCELADA = 'CANCELADA',
}

export enum CommissionType {
  SUPERNUMERARIO = 'SUPERNUMERARIO',
  ESCALABLE = 'ESCALABLE',
}

export interface CommissionSalesDetail {
  totalVentas: number;
  montoTotal: number;
  turno: string;
}

export interface ChatterCommission {
  _id: string;
  chatterId: {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
  };
  modeloId: {
    _id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string;
  };
  goalId?: {
    _id: string;
    montoObjetivo: number;
    porcentajeCumplimiento: number;
  };
  fechaInicio: string;
  fechaFin: string;
  tipoComision: CommissionType;
  turno: string;
  totalVentas: number;
  montoVentas: number;
  metaGrupo?: number;
  ventasGrupo?: number;
  porcentajeCumplimientoGrupo?: number;
  porcentajeComision: number;
  montoComision: number;
  moneda: string;
  commissionScaleId?: string;
  detalleVentas?: CommissionSalesDetail;
  estado: CommissionStatus;
  fechaAprobacion?: string;
  aprobadoPor?: {
    _id: string;
    username: string;
    displayName: string;
  };
  fechaPago?: string;
  referenciaPago?: string;
  pagadoPor?: {
    _id: string;
    username: string;
    displayName: string;
  };
  notas?: string;
  observaciones?: string;
  generadoPor?: {
    _id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCommissionsDto {
  modeloId?: string;
  fechaInicio: string;
  fechaFin: string;
  goalId?: string;
}

export interface ApproveCommissionDto {
  notas?: string;
}

export interface RejectCommissionDto {
  observaciones: string;
}

export interface PayCommissionDto {
  referenciaPago?: string;
  notas?: string;
}

export interface FilterCommissionsDto {
  chatterId?: string;
  modeloId?: string;
  goalId?: string;
  estado?: CommissionStatus;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface BulkApproveCommissionsDto {
  commissionIds: string[];
  notas?: string;
}

export interface BulkPayCommissionsDto {
  commissionIds: string[];
  referenciaPago?: string;
  notas?: string;
}

export interface CommissionStatistics {
  totalCommissions: number;
  pendingCommissions: number;
  approvedCommissions: number;
  paidCommissions: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  avgCommission: number;
}

export interface GenerateCommissionsResult {
  generated: ChatterCommission[];
  summary: {
    totalModelos: number;
    totalChatters: number;
    totalComisiones: number;
    montoTotalComisiones: number;
    comisionesPorTipo: {
      SUPERNUMERARIO: number;
      ESCALABLE: number;
    };
  };
}

