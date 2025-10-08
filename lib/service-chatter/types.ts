// Tipos del módulo de ventas de chatters

export type TipoVenta = 
  | 'TIP'
  | 'CONTENIDO_PERSONALIZADO'
  | 'SUSCRIPCION'
  | 'PPV'
  | 'SEXTING'
  | 'VIDEO_CALL'
  | 'AUDIO_CALL'
  | 'MENSAJE_MASIVO'
  | 'OTRO';

export type TurnoChatter = 'AM' | 'PM' | 'MADRUGADA' | 'SUPERNUMERARIO';

export interface ChatterSale {
  _id: string;
  modeloId: string | ModeloInfo;
  chatterId: string | ChatterInfo;
  monto: number;
  moneda: string;
  tipoVenta: TipoVenta;
  turno: TurnoChatter;
  fechaVenta: string;
  descripcion?: string | null;
  notasInternas?: string | null;
  plataforma?: string | null;
  registradoPor?: string | UserInfo | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ModeloInfo {
  _id: string;
  nombreCompleto: string;
  correoElectronico: string;
  fotoPerfil?: string | null;
  estado: string;
}

export interface ChatterInfo {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  cargoId?: any;
}

export interface UserInfo {
  _id: string;
  username: string;
  displayName?: string;
}

export interface CreateSaleDto {
  modeloId: string;
  chatterId: string;
  monto: number;
  moneda?: string;
  tipoVenta: TipoVenta;
  turno: TurnoChatter;
  fechaVenta: string;
  descripcion?: string;
  notasInternas?: string;
  plataforma?: string;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

export interface FilterSalesDto {
  modeloId?: string;
  chatterId?: string;
  tipoVenta?: TipoVenta;
  turno?: TurnoChatter;
  fechaInicio?: string;
  fechaFin?: string;
  plataforma?: string;
}

export interface GroupSalesData {
  modelo: {
    id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string | null;
  };
  grupo: {
    AM: TurnoData;
    PM: TurnoData;
    MADRUGADA: TurnoData;
    SUPERNUMERARIO: TurnoData;
  };
  totalGrupo: number;
  totalVentas: number;
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export interface TurnoData {
  chatter: ChatterInfo;
  ventas: ChatterSale[];
  total: number;
}

export interface ChatterStats {
  chatter: {
    id: string;
    nombre: string;
    correoElectronico: string;
  };
  estadisticas: {
    totalVentas: number;
    totalMonto: number;
    promedioVenta: number;
    ventasPorTipo: Record<TipoVenta, number>;
    ventasPorModelo: Array<{
      modeloId: string;
      nombreCompleto: string;
      total: number;
      count: number;
    }>;
  };
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export interface ModeloStats {
  modelo: {
    id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string | null;
  };
  estadisticas: {
    totalVentas: number;
    totalMonto: number;
    promedioVenta: number;
    ventasPorTipo: Record<TipoVenta, number>;
    ventasPorTurno: Record<TurnoChatter, number>;
  };
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export interface GeneralStats {
  totalVentas: number;
  totalMonto: number;
  promedioVenta: number;
  topChatters: Array<{
    chatterId: string;
    nombre: string;
    total: number;
    count: number;
  }>;
  topModelos: Array<{
    modeloId: string;
    nombreCompleto: string;
    total: number;
    count: number;
  }>;
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export interface GroupComparison {
  comparaciones: GroupSalesData[];
  totalModelos: number;
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export interface ActiveChatter extends ChatterInfo {
  cargo: string;
  sesionActiva: boolean;
}

export interface ModeloChatters {
  modeloId: string;
  nombreCompleto: string;
  equipoChatters: {
    AM: ChatterInfo;
    PM: ChatterInfo;
    MADRUGADA: ChatterInfo;
    SUPERNUMERARIO: ChatterInfo;
  };
}

