/**
 * Tipos para el módulo de ventas de modelos
 */

// Enums
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
export type EstadoModelo = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA' | 'TERMINADA';
export type GroupByOption = 'salesCloser' | 'trafficker' | 'estado' | 'mes';

// Entidades básicas
export interface Chatter {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
}

export interface Modelo {
  id: string;
  nombreCompleto: string;
  correoElectronico: string;
  fotoPerfil?: string | null;
  estado: EstadoModelo;
  salesCloser?: {
    nombre: string;
    apellido: string;
    correoElectronico: string;
  };
  trafficker?: {
    nombre: string;
    apellido: string;
    correoElectronico: string;
  };
  equipoChatters?: {
    turnoAM: Chatter;
    turnoPM: Chatter;
    turnoMadrugada: Chatter;
    supernumerario: Chatter;
  };
}

export interface Venta {
  _id: string;
  modeloId: string;
  chatterId: Chatter;
  monto: number;
  moneda: string;
  tipoVenta: TipoVenta;
  turno: TurnoChatter;
  fechaVenta: string;
  descripcion?: string | null;
  plataforma?: string | null;
  registradoPor?: {
    username: string;
    displayName: string;
  };
}

// Filtros
export interface SalesFilters {
  fechaInicio?: string;
  fechaFin?: string;
  chatterId?: string;
  turno?: TurnoChatter;
  tipoVenta?: TipoVenta;
  plataforma?: string;
}

// Respuestas de la API
export interface VentasPorChatter {
  chatter: Chatter;
  ventas: Venta[];
  total: number;
  count: number;
}

export interface ResumenVentas {
  totalVentas: number;
  totalMonto: number;
  promedioVenta: number;
  ventasPorChatter: VentasPorChatter[];
  ventasPorTurno: Record<TurnoChatter, { total: number; count: number }>;
  ventasPorTipo: Record<TipoVenta, { total: number; count: number }>;
}

export interface ModeloSalesResponse {
  modelo: Modelo;
  ventas: Venta[];
  resumen: ResumenVentas;
  filtros?: SalesFilters;
}

export interface VentasPorMes {
  _id: { mes: number; anio: number };
  total: number;
  count: number;
}

export interface VentasPorDiaSemana {
  _id: number; // 1=Domingo, 7=Sábado
  total: number;
  count: number;
}

export interface ChatterStats {
  chatterId: string;
  nombre: string;
  total: number;
  count: number;
  promedio: number;
}

export interface TurnoStats {
  _id: TurnoChatter;
  total: number;
  count: number;
  promedio: number;
}

export interface TipoVentaStats {
  _id: TipoVenta;
  total: number;
  count: number;
  promedio: number;
}

export interface PlataformaStats {
  _id: string;
  total: number;
  count: number;
}

export interface EstadisticasGenerales {
  totalVentas: number;
  totalMonto: number;
  promedioVenta: number;
  ventaMaxima: number;
  ventaMinima: number;
}

export interface ModeloSalesStatisticsResponse {
  modelo: {
    id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string | null;
  };
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
  estadisticas: {
    general: EstadisticasGenerales;
    ventasPorMes: VentasPorMes[];
    ventasPorDiaSemana: VentasPorDiaSemana[];
    ventasPorChatter: ChatterStats[];
    ventasPorTurno: TurnoStats[];
    ventasPorTipo: TipoVentaStats[];
    ventasPorPlataforma: PlataformaStats[];
  };
}

export interface ComparacionModelo {
  modelo: {
    id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string | null;
    estado: EstadoModelo;
  };
  stats: {
    totalVentas: number;
    totalMonto: number;
    promedioVenta: number;
  };
}

export interface RankingItem {
  posicion: number;
  modeloId: string;
  nombreCompleto: string;
  totalMonto: number;
  totalVentas: number;
}

export interface CompareModelosResponse {
  comparaciones: ComparacionModelo[];
  totalModelos: number;
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
  ranking: RankingItem[];
}

export interface GrupoVentas {
  salesCloser?: {
    id: string;
    nombre: string;
    correoElectronico: string;
  };
  trafficker?: {
    id: string;
    nombre: string;
    correoElectronico: string;
  };
  estado?: EstadoModelo;
  mes?: number;
  anio?: number;
  totalMonto: number;
  totalVentas: number;
  totalModelos: number;
}

export interface SalesGroupedResponse {
  groupBy: GroupByOption;
  grupos: GrupoVentas[];
}

export interface TopModelo {
  modeloId: string;
  nombreCompleto: string;
  fotoPerfil?: string | null;
  total: number;
  count: number;
}

export interface DashboardResponse {
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
  estadisticas: {
    general: {
      totalVentas: number;
      totalMonto: number;
      promedioVenta: number;
    };
    totalModelosActivas: number;
  };
  topModelos: TopModelo[];
  ventasPorMes: VentasPorMes[];
}

// Indicadores avanzados
export interface ModelosPorEstado {
  activas: number;
  inactivas: number;
  suspendidas: number;
  terminadas: number;
}

export interface ModeloNueva {
  id: string;
  nombre: string;
}

export interface ModelosNuevasPorPeriodo {
  ultimos3Meses: Array<{
    _id: { mes: number; anio: number };
    count: number;
    modelos: ModeloNueva[];
  }>;
  totalUltimos3Meses: number;
}

export interface TasaRetencion {
  modelosRegistradasHace3Meses: number;
  modelosActivasDepues3Meses: number;
  tasaRetencion: number;
  porcentajeFormateado: string;
}

export interface CrecimientoMensual {
  mes: number;
  anio: number;
  totalVentas: number;
  totalMonto: number;
  crecimientoVentas: number;
  crecimientoMonto: number;
}

export interface RankingRentabilidad {
  ranking: number;
  modeloId: string;
  nombreCompleto: string;
  correoElectronico: string;
  fotoPerfil?: string | null;
  estado: string;
  totalVentas: number;
  totalMonto: number;
  promedioVenta: number;
}

export interface IndicadoresResponse {
  periodo: {
    fechaInicio?: string;
    fechaFin?: string;
  };
  modelosPorEstado: ModelosPorEstado;
  modelosNuevasPorPeriodo: ModelosNuevasPorPeriodo;
  tasaRetencion: TasaRetencion;
  crecimientoMensual: CrecimientoMensual[];
  rankingRentabilidad: RankingRentabilidad[];
}

