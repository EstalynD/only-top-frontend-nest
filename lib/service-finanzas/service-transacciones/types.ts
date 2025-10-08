/**
 * Transacciones Types - Frontend
 * 
 * Tipos TypeScript para el sistema de transacciones de dinero en movimiento.
 */

// ========== ENUMS ==========

export enum TipoTransaccion {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
}

export enum OrigenTransaccion {
  GANANCIA_MODELO = 'GANANCIA_MODELO',
  COSTO_FIJO = 'COSTO_FIJO',
  AJUSTE_MANUAL = 'AJUSTE_MANUAL',
  COMISION_TRAFFICKER = 'COMISION_TRAFFICKER',
  OTROS = 'OTROS',
}

export enum EstadoTransaccion {
  EN_MOVIMIENTO = 'EN_MOVIMIENTO',
  CONSOLIDADO = 'CONSOLIDADO',
  REVERTIDO = 'REVERTIDO',
}

// ========== INTERFACES BASE ==========

/** Transacción de movimiento de dinero */
export interface TransaccionMovimiento {
  _id: string;
  periodo: string; // 'MM/YYYY'
  mes: number; // 1-12
  anio: number;
  
  tipo: TipoTransaccion;
  origen: OrigenTransaccion;
  montoUSD: number; // Valor numérico
  montoFormateado: string; // Valor formateado (ej: "$ 1,234.56")
  descripcion: string;
  estado: EstadoTransaccion;
  
  // Referencias opcionales
  referenciaId?: string;
  referenciaModelo?: string;
  modeloId?: string;
  
  // Auditoría
  creadoPor?: string;
  fechaCreacion: string;
  fechaConsolidacion?: string | null;
  consolidadoPor?: string | null;
  
  // Notas
  notas?: string | null;
  
  // Metadata adicional
  meta?: Record<string, any>;
  
  createdAt?: string;
  updatedAt?: string;
}

// ========== DTOs DE REQUEST ==========

/** Filtros para listar transacciones */
export interface FiltrarTransaccionesDto {
  mes?: number;
  anio?: number;
  tipo?: TipoTransaccion;
  origen?: OrigenTransaccion;
  estado?: EstadoTransaccion;
  saltar?: number;  // Número de registros a saltar (skip)
  limite?: number;  // Cantidad de registros por página
}

/** Request para revertir una transacción */
export interface RevertirTransaccionDto {
  razon: string;
}

/** Request para comparativa de transacciones */
export interface ComparativaTransaccionesDto {
  periodos: {
    mes: number;
    anio: number;
  }[];
}

// ========== DTOs DE RESPONSE ==========

/** Respuesta del backend para transacciones paginadas */
interface TransaccionesBackendResponse {
  transacciones: TransaccionMovimiento[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/** Transacciones paginadas (formato frontend) */
export interface TransaccionesPaginadasDto {
  transacciones: TransaccionMovimiento[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    totalResultados: number;
    resultadosPorPagina: number;
  };
}

/** Resumen de transacciones por periodo */
export interface ResumenTransaccionesPeriodoDto {
  periodo: string;
  mes: number;
  anio: number;

  // Totales
  totalIngresos: number;
  totalIngresosFormateado: string;
  totalEgresos: number;
  totalEgresosFormateado: string;
  saldoNeto: number;
  saldoNetoFormateado: string;

  // Cantidad de transacciones
  cantidadIngresos: number;
  cantidadEgresos: number;
  cantidadTotal: number;

  // Por origen
  desglosePorOrigen: {
    origen: OrigenTransaccion;
    tipo: TipoTransaccion;
    cantidad: number;
    total: number;
    totalFormateado: string;
  }[];

  // Estado
  transaccionesEnMovimiento: number;
  transaccionesConsolidadas: number;
  estado: 'ABIERTO' | 'CONSOLIDADO';

  // Fechas
  fechaUltimaTransaccion?: string;
  fechaConsolidacion?: string | null;
}

/** Saldo actual en movimiento */
export interface SaldoMovimientoDto {
  saldoMovimiento: string;
  totalIngresos: string;
  totalEgresos: string;
  cantidadTransacciones: number;
  ultimaActualizacion: string;
}

/** Flujo de caja detallado */
export interface FlujoCajaDetalladoDto {
  periodo: {
    mes: number;
    anio: number;
  };
  saldoInicial: string;
  transacciones: {
    fecha: string;
    tipo: TipoTransaccion;
    origen: OrigenTransaccion;
    descripcion: string;
    monto: string;
    saldoAcumulado: string;
  }[];
  totales: {
    ingresos: string;
    egresos: string;
    neto: string;
  };
  saldoFinal: string;
}

/** Comparativa de transacciones entre periodos - Response */
export interface ComparativaTransaccionesResponseDto {
  periodos: {
    mes: number;
    anio: number;
    periodo: string;
    ingresos: string;
    egresos: string;
    neto: string;
    cantidadTransacciones: number;
  }[];
  promedios: {
    ingresoPromedio: string;
    egresoPromedio: string;
    netoPromedio: string;
  };
  tendencia: {
    ingresos: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE';
    egresos: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE';
    neto: 'CRECIENTE' | 'ESTABLE' | 'DECRECIENTE';
  };
}
