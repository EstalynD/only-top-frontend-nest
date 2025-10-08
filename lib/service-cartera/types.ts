/**
 * Cartera Types - Frontend
 * 
 * Tipos TypeScript para el módulo de Cartera.
 * Espejo de los DTOs del backend.
 */

// ========== ENUMS ==========

export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  PARCIAL = 'PARCIAL',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

export enum MetodoPago {
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
  CHEQUE = 'CHEQUE',
  TARJETA = 'TARJETA',
  OTRO = 'OTRO',
}

export enum TipoRecordatorio {
  PROXIMO_VENCIMIENTO = 'PROXIMO_VENCIMIENTO',
  VENCIDO = 'VENCIDO',
  MORA = 'MORA',
  CONFIRMACION_PAGO = 'CONFIRMACION_PAGO',
}

export enum EstadoRecordatorio {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  ERROR = 'ERROR',
}

// ========== INTERFACES ==========

export interface PeriodoFacturacion {
  anio: number;
  mes: number;
  quincena?: number | null;
}

export interface ItemFactura {
  concepto: string;
  cantidad: number;
  valorUnitario: string; // BigInt serializado como string
  subtotal: string; // BigInt serializado como string
  // Valores formateados dinámicamente desde backend (MoneyService)
  valorUnitarioFormateado: string;
  subtotalFormateado: string;
  notas?: string | null;
}

export interface Factura {
  _id: string;
  numeroFactura: string;
  modeloId: string | {
    _id: string;
    nombreCompleto: string;
    correoElectronico: string;
  };
  contratoId: string | {
    _id: string;
    numeroContrato: string;
    periodicidadPago: string;
    tipoComision: string;
  };
  periodo: PeriodoFacturacion;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  moneda: 'USD' | 'COP'; // Moneda de la factura
  items: ItemFactura[];
  
  // Valores BigInt serializados como string
  subtotal: string;
  descuento: string;
  total: string;
  saldoPendiente: string;
  
  // Valores formateados dinámicamente desde backend (MoneyService)
  subtotalFormateado: string;
  descuentoFormateado: string;
  totalFormateado: string;
  saldoPendienteFormateado: string;
  montoPagadoFormateado: string;
  
  // Pagos relacionados
  pagos: any[];
  
  // Campos adicionales
  notas?: string | null;
  observaciones?: string | null;
  diasVencido?: number;
  creadaPor: string | null;
  modificadaPor?: string | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ComprobanteInfo {
  publicId: string;
  url: string;
  downloadUrl: string;
  format: string;
  size: number;
  fechaSubida: string;
}

export interface Pago {
  _id: string;
  numeroRecibo: string;
  facturaId: string;
  fechaPago: string;
  moneda: 'USD' | 'COP'; // Moneda del pago
  monto: string; // BigInt serializado como string
  montoFormateado: string; // Valor formateado dinámicamente desde backend
  metodoPago: MetodoPago;
  referencia?: string | null;
  comprobante?: ComprobanteInfo | null;
  observaciones?: string | null;
  registradoPor: string;
  modificadoPor?: string | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Recordatorio {
  _id: string;
  facturaId: string;
  tipo: TipoRecordatorio;
  fechaEnvio: string;
  emailDestino: string;
  asunto: string;
  contenidoHTML: string;
  estado: EstadoRecordatorio;
  errorMensaje?: string | null;
  emailsCC?: string[];
  notasInternas?: string | null;
  enviadoPor: string | 'SISTEMA';
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracionCartera {
  _id?: string;
  diasVencimientoFactura: number;
  diasAntesAlerta1: number;
  diasAntesAlerta2: number;
  diasDespuesAlertaMora: number;
  diasDespuesAlertaMora2: number;
  emailCC?: string[];
  emailFrom?: string;
  plantillaRecordatorioProximo?: string | null;
  plantillaRecordatorioVencido?: string | null;
  plantillaConfirmacionPago?: string | null;
  generacionAutomaticaActiva: boolean;
  diaGeneracionFacturas: number;
  recordatoriosAutomaticosActivos: boolean;
  horaEjecucionRecordatorios?: string;
  activo: boolean;
  formatosComprobantePermitidos?: string[];
  tamanoMaximoComprobante?: number;
  meta?: Record<string, any>;
}

// ========== ESTADO DE CUENTA ==========

export interface ModeloInfoEstadoCuenta {
  nombreCompleto: string;
  numeroIdentificacion: string;
  correoElectronico: string;
  telefono?: string;
}

export interface FacturaEstadoCuenta {
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  concepto: string;
  moneda: 'USD' | 'COP';
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: EstadoFactura;
  diasVencido?: number;
}

export interface PagoEstadoCuenta {
  numeroRecibo: string;
  fechaPago: string;
  moneda: 'USD' | 'COP';
  montoPagado: number;
  facturaNumero: string;
  metodoPago: string;
  referencia?: string;
  comprobanteUrl?: string;
}

export interface TotalesEstadoCuenta {
  moneda: 'USD' | 'COP';
  totalFacturado: number;
  totalPagado: number;
  saldoPendiente: number;
  facturasVencidas: number;
  montoVencido: number;
}

export interface EstadoCuenta {
  modelo: ModeloInfoEstadoCuenta;
  facturas: FacturaEstadoCuenta[];
  pagos: PagoEstadoCuenta[];
  totales: TotalesEstadoCuenta;
  periodo: {
    inicio: string;
    fin: string;
  };
}

// ========== DTOs ==========

export interface CreateFacturaDto {
  modeloId: string;
  contratoId: string;
  periodo: PeriodoFacturacion;
  items: Array<{
    concepto: string;
    cantidad: number;
    valorUnitarioUSD: number;
    notas?: string;
  }>;
  fechaEmision?: string;
  fechaVencimiento?: string;
  observaciones?: string;
}

export interface UpdateFacturaDto {
  items?: Array<{
    concepto: string;
    cantidad: number;
    valorUnitarioUSD: number;
    notas?: string;
  }>;
  estado?: EstadoFactura;
  fechaVencimiento?: string;
  observaciones?: string;
}

export interface GenerarFacturaModeloDto {
  periodo: PeriodoFacturacion;
  incluirVentasCero?: boolean;
  observaciones?: string;
}

export interface GenerarFacturasPorPeriodoDto {
  anio: number;
  mes: number;
  quincena?: number;
  modeloIds?: string[];
  incluirVentasCero?: boolean;
}

export interface CreatePagoDto {
  facturaId: string;
  fechaPago: string;
  montoUSD: number;
  metodoPago: MetodoPago;
  referencia?: string;
  observaciones?: string;
  // file se envía como FormData
}

export interface FiltrosFacturasDto {
  modeloId?: string;
  estado?: EstadoFactura;
  desde?: string;
  hasta?: string;
  mes?: number;
  anio?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FiltrosPagosDto {
  facturaId?: string;
  modeloId?: string;
  metodoPago?: MetodoPago;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}

export interface ObtenerEstadoCuentaDto {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface EnviarRecordatorioDto {
  tipo?: TipoRecordatorio;
  emailsCC?: string[];
  notasInternas?: string;
}

export interface UpdateConfiguracionDto {
  diasVencimientoFactura?: number;
  diasAntesAlerta1?: number;
  diasAntesAlerta2?: number;
  diasDespuesAlertaMora?: number;
  diasDespuesAlertaMora2?: number;
  emailCC?: string[];
  emailFrom?: string;
  generacionAutomaticaActiva?: boolean;
  diaGeneracionFacturas?: number;
  recordatoriosAutomaticosActivos?: boolean;
  horaEjecucionRecordatorios?: string;
  activo?: boolean;
}

// ========== RESPUESTAS ==========

export interface TotalesCartera {
  moneda: 'USD' | 'COP';
  // Valores BigInt serializados
  totalFacturado: string;
  totalPagado: string;
  saldoPendiente: string;
  montoVencido: string;
  // Valores formateados dinámicamente desde backend (MoneyService)
  totalFacturadoFormateado: string;
  totalPagadoFormateado: string;
  saldoPendienteFormateado: string;
  montoVencidoFormateado: string;
  // Estadísticas
  facturasPendientes: number;
  facturasParciales: number;
  facturasVencidas: number;
  facturasPagadas: number;
  tasaCobranza: number;
}

export interface DashboardCartera {
  periodo: {
    desde: string;
    hasta: string;
  };
  totales: TotalesCartera;
  topModelos: {
    mayorFacturacion: Array<{
      modeloId: string;
      nombreCompleto: string;
      totalFacturado: string;
      totalFacturadoFormateado: string;
    }>;
    mayorDeuda: Array<{
      modeloId: string;
      nombreCompleto: string;
      saldoPendiente: string;
      saldoPendienteFormateado: string;
    }>;
  };
  estadisticas: {
    tasaCobranza: number;
    diasPromedioCobranza: number;
    facturasAlDia: number;
    facturasAtrasadas: number;
  };
  graficoMensual?: Array<{
    mes: string;
    totalFacturado: number;
    totalPagado: number;
    saldoPendiente: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
