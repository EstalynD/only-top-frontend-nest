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
  categoria: CategoriaGasto;
  
  montoUSD: number; // Backend devuelve number
  montoOriginalUSD: string; // Alias para compatibilidad
  montoFormateado: string;
  
  concepto: string;
  fechaPago: string;
  estado: EstadoGasto;
  
  empleadoId?: string;
  empleadoNombre?: string;
  
  numeroFactura?: string;
  archivoComprobante?: string;
  
  registradoPor: string; // Backend usa este nombre
  creadoPor: string; // Alias para compatibilidad
  fechaRegistro: string; // Backend usa este nombre
  fechaCreacion: string; // Alias para compatibilidad
  
  aprobadoPor?: string;
  fechaAprobacion?: string;
  notas?: string; // Backend usa este nombre
  notasAprobacion?: string; // Alias para compatibilidad
  
  periodoId: string;
  proveedor?: string;
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
  
  primeraQuincena: {
    totalFormateado: string;
    cantidadGastos: number;
  };
  
  segundaQuincena: {
    totalFormateado: string;
    cantidadGastos: number;
  };
  
  totalGastosFormateado: string;
  totalIngresosFormateado: string;
  
  // 🎯 UTILIDAD NETA CON COLOR
  utilidadNeta: {
    montoFormateado: string;
    indicadorColor: 'verde' | 'rojo';
    esPositivo: boolean;
  };
  
  // 📊 COMPARATIVA MES ANTERIOR
  comparativa: {
    mesAnterior: string;
    utilidadAnteriorFormateada: string;
    porcentajeCrecimiento: number;
    direccion: 'crecimiento' | 'decrecimiento' | 'neutro';
    indicadorColor: 'verde' | 'rojo' | 'gris';
  };
  
  // Desglose por categoría
  desgloseCategoria: Array<{
    categoria: CategoriaGasto;
    primeraQuincenaFormateada: string;
    segundaQuincenaFormateada: string;
    totalCategoriaFormateado: string;
    porcentajeDelTotal: number;
  }>;
  
  estado: EstadoResumen;
  consolidado: boolean;
  
  consolidadoPor?: string;
  fechaConsolidacion?: string;
}

export interface ComparativaMensualDto {
  anio: number;
  meses: Array<{
    mes: number;
    nombreMes: string;
    totalGastosFormateado: string;
    totalIngresosFormateado: string;
    utilidadNetaFormateada: string;
    porcentajeCrecimiento: number | null;
    consolidado: boolean;
  }>;
}

export interface GenerarNominaResultado {
  generados: number;
  totalNominaUSD: string;
  empleados: Array<{
    empleadoId: string;
    nombreCompleto: string;
    salarioQuincenal: string;
  }>;
  advertencias?: string[];
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
  data: ComparativaMensualDto;
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
