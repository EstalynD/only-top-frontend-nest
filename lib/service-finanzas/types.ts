/**
 * Finanzas Types - Frontend
 * 
 * Tipos TypeScript para el módulo de finanzas.
 * Espejo de los DTOs del backend.
 */

export enum EstadoFinanzas {
  CALCULADO = 'CALCULADO',
  PENDIENTE_REVISION = 'PENDIENTE_REVISION',
  APROBADO = 'APROBADO',
  PAGADO = 'PAGADO',
}

export enum TipoVenta {
  CHATTING = 'CHATTING',
  RECRUITMENT = 'RECRUITMENT',
  TRAFFIC = 'TRAFFIC',
  OTROS = 'OTROS',
}

export interface FinanzasModelo {
  _id: string;
  modeloId: string;
  mes: number;
  anio: number;
  ventasNetasUSD: number;
  comisionAgenciaUSD: number;
  comisionBancoUSD: number;
  gananciaModeloUSD: number;
  gananciaOnlyTopUSD: number;
  porcentajeComisionAgencia: number;
  porcentajeComisionBanco: number;
  estado: EstadoFinanzas;
  fechaCalculo: string;
  calculadoPor: string;
  fechaAprobacion?: string;
  aprobadoPor?: string;
  fechaPago?: string;
  pagadoPor?: string;
  notas?: string;
  meta?: {
    totalVentas: number;
    desgloseVentas: {
      tipo: TipoVenta;
      cantidad: number;
      montoTotal: number;
    }[];
    promedioVentaDiaria: number;
    diasTrabajados: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FinanzasFormateada {
  _id: string;
  modeloId: string;
  mes: number;
  anio: number;
  ventasNetas: string;
  comisionAgencia: string;
  comisionBanco: string;
  gananciaModelo: string;
  gananciaOnlyTop: string;
  porcentajeComisionAgencia: number;
  porcentajeComisionBanco: number;
  estado: EstadoFinanzas;
  fechaCalculo: string;
  calculadoPor: string;
  fechaAprobacion?: string;
  aprobadoPor?: string;
  fechaPago?: string;
  pagadoPor?: string;
  notas?: string;
  meta?: {
    totalVentas: number;
    desgloseVentas: {
      tipo: TipoVenta;
      cantidad: number;
      montoTotal: string;
    }[];
    promedioVentaDiaria: string;
    diasTrabajados: number;
  };
}

export interface ModeloConGanancias {
  modeloId: string;
  nombreCompleto: string;
  email: string;
  finanzas?: FinanzasFormateada;
  tieneFinanzas: boolean;
  mesActual: number;
  anioActual: number;
}

export interface EstadisticasFinanzas {
  periodo: {
    mes: number;
    anio: number;
  };
  
  totales: {
    ventasNetasUSD: number;
    gananciaOnlyTopUSD: number;
    comisionesBancoUSD: number;
    gananciaModelosUSD: number;

    // Formateados (compatibilidad con UI)
    ventasNetasFormateado: string;
    gananciaOnlyTopFormateado: string;
    comisionesBancoFormateado: string;
    gananciaModelosFormateado: string;
    // alias usados por componentes
    ventasNetas?: string;
    gananciaOnlyTop?: string;
  };
  
  promedios: {
    ventasPorModelo: number;
    gananciaOnlyTopPorModelo: number;
    ventasPorModeloFormateado?: string;
    gananciaOnlyTopPorModeloFormateado?: string;
  };
  
  modelosActivas: number;
  totalVentas: number;
  // Contadores agregados para dashboard
  contadores?: {
    modelosConFinanzas: number;
    totalModelos: number;
  };
  
  topModelos: Array<{
    modeloId: string;
    nombreModelo: string;
    ventasNetasUSD: number;
    gananciaOnlyTopUSD: number;
    porcentajeComisionAgencia?: number;
    ventasNetasFormateado: string;
    gananciaOnlyTopFormateado: string;
  }>;
  
  porEstado: Record<string, number>;
}

// DTOs de Request
export interface CalcularFinanzasDto {
  modeloId: string;
  mes: number;
  anio: number;
  porcentajeComisionBanco?: number;
}

export interface RecalcularFinanzasDto {
  mes: number;
  anio: number;
  modeloIds?: string[];
  porcentajeComisionBanco?: number;
}

export interface RecalcularFinanzasRespuesta {
  procesadas: number;
  exitosas: number;
  errores: string[];
}

export interface ActualizarEstadoFinanzasDto {
  estado: EstadoFinanzas;
  notas?: string;
}

export interface FiltrosFinanzas {
  mes?: number;
  anio?: number;
  estado?: EstadoFinanzas;
  busqueda?: string;
}

// ============================================
// Consolidación y Bank OnlyTop
// ============================================

export interface BankOnlyTop {
  _id: string;
  // Valores numéricos
  dineroConsolidadoUSD: number;
  dineroMovimientoUSD: number;
  totalUSD: number;
  // Valores formateados
  dineroConsolidadoFormateado: string;
  dineroMovimientoFormateado: string;
  totalFormateado: string;
  // Metadata
  periodoActual: string;
  totalPeriodosConsolidados: number;
  totalModelosHistorico: number;
  totalVentasHistorico: number;
  ultimaConsolidacion?: string;
  createdAt?: string;
  updatedAt?: string;
  meta?: any;
}

export interface PeriodoConsolidado {
  _id: string;
  periodo: string;
  mes: number;
  anio: number;
  totalVentasNetasUSD: string;
  totalComisionAgenciaUSD: string;
  totalComisionBancoUSD: string;
  totalGananciaModelosUSD: string;
  totalGananciaOnlyTopUSD: string;
  cantidadModelos: number;
  porcentajeComisionBancoPromedio: number;
  estado: EstadoPeriodoConsolidado;
  topModelos: TopModeloPeriodo[];
  desglosePorEstado: {
    estado: EstadoFinanzas;
    cantidad: number;
  }[];
  finanzasIds: string[];
  fechaConsolidacion?: string;
  consolidadoPor?: string;
  notasCierre?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EstadoPeriodoConsolidado {
  ABIERTO = 'ABIERTO',
  EN_REVISION = 'EN_REVISION',
  CONSOLIDADO = 'CONSOLIDADO',
  CERRADO = 'CERRADO',
}

export interface TopModeloPeriodo {
  modeloId: string;
  nombreCompleto: string;
  gananciaOnlyTopUSD: string;
  ventasNetasUSD: string;
}

export interface ConsolidarPeriodoDto {
  mes: number;
  anio: number;
  notasCierre?: string;
}

export interface ConsolidarPeriodoRespuesta {
  periodoConsolidado: PeriodoConsolidado;
  bankActualizado: BankOnlyTop;
  cantidadFinanzasConsolidadas: number;
  mensaje: string;
}

// ========== COSTOS FIJOS MENSUALES ==========

export type EstadoCostos = 'ABIERTO' | 'CONSOLIDADO';

/** Gasto individual dentro de una categoría */
export interface GastoFijo {
  concepto: string;
  montoUSD: number;
  montoFormateado: string;
  fechaRegistro: string;
  registradoPor?: string;
  notas?: string;
  porcentajeCategoria: number; // % dentro de la categoría
}

/** Categoría de gastos con totales calculados */
export interface CategoriaGasto {
  nombre: string;
  descripcion?: string;
  color?: string; // Hex color para UI
  gastos: GastoFijo[];
  totalCategoriaUSD: number;
  totalCategoriaFormateado: string;
  porcentajeDelTotal: number; // % del total de gastos
  cantidadGastos: number;
}

/** Documento completo de costos fijos de un mes */
export interface CostosFijosMensuales {
  mes: number; // 1-12
  anio: number;
  periodo: string; // "YYYY-MM"
  estado: EstadoCostos;
  consolidado: boolean;
  
  // Categorías con gastos
  categorias: CategoriaGasto[];
  
  // Totales
  totalGastosUSD: number;
  totalGastosFormateado: string;
  
  // Metadata
  fechaConsolidacion?: string;
  fechaUltimaActualizacion?: string;
  notasInternas?: string;
  
  // Estadísticas
  meta: {
    categoriaMayorGasto: string;
    categoriaConMasGastos: string;
    promedioGastoPorDia: number;
    promedioGastoPorDiaFormateado: string;
  };
}

/** Request: Registrar nuevo gasto */
export interface RegistrarGastoRequest {
  mes: number;
  anio: number;
  nombreCategoria: string;
  concepto: string;
  montoUSD: number;
  notas?: string;
}

/** Request: Actualizar gasto existente */
export interface ActualizarGastoRequest {
  mes: number;
  anio: number;
  nombreCategoria: string;
  indiceGasto: number; // Índice del gasto en el array (0-based)
  concepto?: string;
  montoUSD?: number;
  notas?: string;
}

/** Request: Eliminar gasto */
export interface EliminarGastoRequest {
  mes: number;
  anio: number;
  nombreCategoria: string;
  indiceGasto: number;
}

/** Request: Crear categoría personalizada */
export interface CrearCategoriaRequest {
  mes: number;
  anio: number;
  nombre: string;
  descripcion?: string;
  color?: string; // Hex color
}

/** Request: Eliminar categoría */
export interface EliminarCategoriaRequest {
  mes: number;
  anio: number;
  nombreCategoria: string;
}

/** Request: Consolidar costos del mes */
export interface ConsolidarCostosRequest {
  notasCierre?: string;
}

/** Response: Consolidación exitosa */
export interface ConsolidarCostosResponse {
  periodo: string;
  totalGastosUSD: number;
  totalGastosFormateado: string;
  categorias: number;
  gastos: number;
  consolidado: boolean;
  fechaConsolidacion: string;
  message: string;
}
