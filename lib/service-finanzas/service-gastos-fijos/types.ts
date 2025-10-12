/**
 * Types para Gastos Fijos Quincenales - Frontend
 * Espejo de los DTOs del backend
 */

// ========== ENUMS ==========

export enum QuincenaEnum {
  PRIMERA_QUINCENA = 'PRIMERA_QUINCENA',
  SEGUNDA_QUINCENA = 'SEGUNDA_QUINCENA',
}

export enum CategoriaGasto {
  NOMINA = 'NOMINA',
  ALQUILER = 'ALQUILER',
  SERVICIOS = 'SERVICIOS',
  MARKETING = 'MARKETING',
  TECNOLOGIA = 'TECNOLOGIA',
  TRANSPORTE = 'TRANSPORTE',
  MANTENIMIENTO = 'MANTENIMIENTO',
  LEGAL = 'LEGAL',
  OTROS = 'OTROS',
}

export enum EstadoGasto {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  PAGADO = 'PAGADO',
  RECHAZADO = 'RECHAZADO',
}

export enum EstadoResumen {
  ABIERTO = 'ABIERTO',
  EN_REVISION = 'EN_REVISION',
  CONSOLIDADO = 'CONSOLIDADO',
}

// ========== REQUEST DTOs ==========

export interface RegistrarGastoFijoDto {
  mes: number;
  anio: number;
  quincena: QuincenaEnum;
  categoria: CategoriaGasto;
  empleadoId?: string;
  montoUSD: number;
  concepto: string;
  fechaPago?: string;
  numeroFactura?: string;
  archivoComprobante?: string;
}

export interface ActualizarGastoFijoDto {
  montoUSD?: number;
  concepto?: string;
  fechaPago?: string;
  numeroFactura?: string;
  archivoComprobante?: string;
}

export interface AprobarGastoDto {
  estado: EstadoGasto.APROBADO | EstadoGasto.PAGADO | EstadoGasto.RECHAZADO;
  notas?: string;
}

export interface ConsolidarResumenMensualDto {
  mes: number;
  anio: number;
}

export interface GenerarNominaQuincenalDto {
  mes: number;
  anio: number;
  quincena: QuincenaEnum;
  modoPago?: 'MENSUAL_COMPLETO' | 'QUINCENAL_DIVIDIDO';
  empleadosSeleccionados?: string[];
}

// ========== RESPONSE DTOs ==========

export interface GastoFijoFormateadoDto {
  id: string;
  _id: string; // Mantener para compatibilidad con backend
  mes: number;
  anio: number;
  quincena: QuincenaEnum;
  periodoId: string;
  categoria: CategoriaGasto;
  
  // Montos
  montoUSD: number; // Backend devuelve number
  montoFormateado: string;
  
  // Información básica
  concepto: string;
  fechaPago: string;
  estado: EstadoGasto;
  
  // Empleado (si aplica)
  empleadoId?: string;
  empleadoNombre?: string;
  
  // Documentación
  numeroFactura?: string | null;
  archivoComprobante?: string | null;
  proveedor?: string | null;
  
  // Auditoría - Registro
  registradoPor: string;
  fechaRegistro: string;
  
  // Auditoría - Aprobación
  aprobadoPor?: string | null;
  fechaAprobacion?: string | null;
  notas?: string | null;
  
  // Metadata adicional
  meta?: any;
}

export interface ResumenQuincenalDto {
  mes: number;
  anio: number;
  quincena: QuincenaEnum;
  periodoId: string;
  
  totales: {
    totalGastosUSD: number;
    totalGastosFormateado: string;
    cantidadGastos: number;
  };
  
  gastos: GastoFijoFormateadoDto[];
  
  porCategoria: Array<{
    categoria: CategoriaGasto;
    totalUSD: number;
    totalFormateado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  porEstado: {
    pendientes: number;
    aprobados: number;
    pagados: number;
    rechazados: number;
  };
}

export interface ResumenMensualConsolidadoDto {
  mes: number;
  anio: number;
  periodoId: string;
  
  primeraQuincena: {
    totalUSD: number;
    totalFormateado: string;
    cantidadGastos: number;
  };
  
  segundaQuincena: {
    totalUSD: number;
    totalFormateado: string;
    cantidadGastos: number;
  };
  
  totalGastosMensual: {
    totalUSD: number;
    totalFormateado: string;
    cantidadGastos: number;
  };
  
  totalIngresos: {
    totalUSD: number;
    totalFormateado: string;
  };
  
  // 🎯 UTILIDAD NETA CON COLOR
  utilidadNeta: {
    totalUSD: number;
    totalFormateado: string;
    esPositiva: boolean;
    color: 'verde' | 'rojo';
  };
  
  // 📊 COMPARATIVA MES ANTERIOR
  comparativa?: {
    mesAnterior: string;
    utilidadMesAnteriorUSD: number;
    utilidadMesAnteriorFormateado: string;
    porcentajeCrecimiento: number;
    direccion: 'crecimiento' | 'decrecimiento' | 'neutro';
  };
  
  // Desglose por categoría
  desgloseCategoria: Array<{
    categoria: CategoriaGasto;
    primeraQuincenaUSD: number;
    segundaQuincenaUSD: number;
    totalUSD: number;
    totalFormateado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  
  estado: EstadoResumen;
  fechaConsolidacion?: string;
  
  meta?: {
    mayorGasto?: {
      concepto: string;
      montoFormateado: string;
      categoria: CategoriaGasto;
    };
    categoriaMayorGasto?: CategoriaGasto;
    totalGastos: number;
    gastosPendientes: number;
    gastosAprobados: number;
    gastosPagados: number;
  };
}

export interface ComparativaMensualDto {
  periodo: string;
  mes: number;
  anio: number;
  totalGastosUSD: number;
  totalGastosFormateado: string;
  totalIngresosUSD: number;
  totalIngresosFormateado: string;
  utilidadNetaUSD: number;
  utilidadNetaFormateado: string;
  porcentajeCrecimiento?: number;
}

export interface GenerarNominaResultado {
  generados: number;
  errores: string[];
}

// ========== RESPONSES DE API ==========

export interface RegistrarGastoResponse {
  success: boolean;
  message: string;
  data: GastoFijoFormateadoDto;
}

export interface ActualizarGastoResponse {
  success: boolean;
  message: string;
  data: GastoFijoFormateadoDto;
}

export interface AprobarGastoResponse {
  success: boolean;
  message: string;
  data: GastoFijoFormateadoDto;
}

export interface ResumenQuincenalResponse {
  success: boolean;
  data: ResumenQuincenalDto;
}

export interface ResumenMensualResponse {
  success: boolean;
  data: ResumenMensualConsolidadoDto;
}

export interface ComparativaResponse {
  success: boolean;
  data: ComparativaMensualDto[];
}

export interface ConsolidarResponse {
  success: boolean;
  message: string;
  data: ResumenMensualConsolidadoDto;
}

export interface GenerarNominaResponse {
  success: boolean;
  message: string;
  data: GenerarNominaResultado;
}

// ========== FILTROS ==========

export interface FiltrosGastosFijos {
  mes?: number;
  anio?: number;
  quincena?: QuincenaEnum;
  categoria?: CategoriaGasto;
  estado?: EstadoGasto;
  busqueda?: string;
}
