/**
 * Constantes del módulo de Cartera
 */

import { EstadoFactura, MetodoPago, TipoRecordatorio, EstadoRecordatorio } from './types';

// ========== LABELS ==========

export const ESTADO_FACTURA_LABELS: Record<EstadoFactura, string> = {
  [EstadoFactura.PENDIENTE]: 'Pendiente',
  [EstadoFactura.PARCIAL]: 'Pago Parcial',
  [EstadoFactura.PAGADO]: 'Pagado',
  [EstadoFactura.VENCIDO]: 'Vencido',
  [EstadoFactura.CANCELADO]: 'Cancelado',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  [MetodoPago.TRANSFERENCIA]: 'Transferencia Bancaria',
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.CHEQUE]: 'Cheque',
  [MetodoPago.TARJETA]: 'Tarjeta de Crédito/Débito',
  [MetodoPago.OTRO]: 'Otro',
};

export const TIPO_RECORDATORIO_LABELS: Record<TipoRecordatorio, string> = {
  [TipoRecordatorio.PROXIMO_VENCIMIENTO]: 'Próximo a Vencer',
  [TipoRecordatorio.VENCIDO]: 'Factura Vencida',
  [TipoRecordatorio.MORA]: 'En Mora',
  [TipoRecordatorio.CONFIRMACION_PAGO]: 'Confirmación de Pago',
};

export const ESTADO_RECORDATORIO_LABELS: Record<EstadoRecordatorio, string> = {
  [EstadoRecordatorio.PENDIENTE]: 'Pendiente',
  [EstadoRecordatorio.ENVIADO]: 'Enviado',
  [EstadoRecordatorio.ERROR]: 'Error',
};

// ========== COLORES ==========

export const ESTADO_FACTURA_COLORS: Record<EstadoFactura, string> = {
  [EstadoFactura.PENDIENTE]: 'warning',
  [EstadoFactura.PARCIAL]: 'primary',
  [EstadoFactura.PAGADO]: 'success',
  [EstadoFactura.VENCIDO]: 'danger',
  [EstadoFactura.CANCELADO]: 'default',
};

export const METODO_PAGO_COLORS: Record<MetodoPago, string> = {
  [MetodoPago.TRANSFERENCIA]: 'primary',
  [MetodoPago.EFECTIVO]: 'success',
  [MetodoPago.CHEQUE]: 'secondary',
  [MetodoPago.TARJETA]: 'primary',
  [MetodoPago.OTRO]: 'default',
};

export const ESTADO_RECORDATORIO_COLORS: Record<EstadoRecordatorio, string> = {
  [EstadoRecordatorio.PENDIENTE]: 'warning',
  [EstadoRecordatorio.ENVIADO]: 'success',
  [EstadoRecordatorio.ERROR]: 'danger',
};

// ========== MENSAJES ==========

export const CARTERA_MESSAGES = {
  success: {
    facturaCreada: 'Factura creada exitosamente',
    facturaActualizada: 'Factura actualizada exitosamente',
    facturaEliminada: 'Factura eliminada exitosamente',
    facturasGeneradas: 'Facturas generadas exitosamente',
    pagoRegistrado: 'Pago registrado exitosamente',
    recordatorioEnviado: 'Recordatorio enviado exitosamente',
    configuracionActualizada: 'Configuración actualizada exitosamente',
  },
  error: {
    errorGeneral: 'Error al procesar la solicitud',
    errorCargarFacturas: 'Error al cargar las facturas',
    errorCrearFactura: 'Error al crear la factura',
    errorActualizarFactura: 'Error al actualizar la factura',
    errorEliminarFactura: 'Error al eliminar la factura',
    errorGenerarFacturas: 'Error al generar facturas',
    errorCargarPagos: 'Error al cargar los pagos',
    errorRegistrarPago: 'Error al registrar el pago',
    errorCargarEstadoCuenta: 'Error al cargar el estado de cuenta',
    errorExportarPDF: 'Error al exportar PDF',
    errorEnviarRecordatorio: 'Error al enviar recordatorio',
    errorCargarConfiguracion: 'Error al cargar configuración',
    errorActualizarConfiguracion: 'Error al actualizar configuración',
    comprobanteRequerido: 'El comprobante de pago es requerido',
    formatoComprobanteInvalido: 'Formato de comprobante inválido',
    tamanoComprobanteExcedido: 'El tamaño del comprobante excede el límite permitido',
  },
  validation: {
    modeloRequerido: 'La modelo es requerida',
    contratoRequerido: 'El contrato es requerido',
    periodoRequerido: 'El periodo es requerido',
    itemsRequeridos: 'Debe agregar al menos un item a la factura',
    facturaRequerida: 'La factura es requerida',
    montoInvalido: 'El monto ingresado es inválido',
    montoExcedeSaldo: 'El monto excede el saldo pendiente',
    fechaPagoRequerida: 'La fecha de pago es requerida',
    metodoPagoRequerido: 'El método de pago es requerido',
  },
};

// ========== OPCIONES ==========

export const METODOS_PAGO_OPTIONS = Object.values(MetodoPago).map((value) => ({
  value,
  label: METODO_PAGO_LABELS[value],
}));

export const ESTADOS_FACTURA_OPTIONS = Object.values(EstadoFactura).map((value) => ({
  value,
  label: ESTADO_FACTURA_LABELS[value],
}));

// ========== CONFIGURACIÓN ==========

export const FORMATOS_COMPROBANTE_PERMITIDOS = ['jpg', 'jpeg', 'png', 'pdf'];
export const TAMANO_MAXIMO_COMPROBANTE = 5 * 1024 * 1024; // 5MB

export const MESES_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export const QUINCENA_OPTIONS = [
  { value: null, label: 'Mes completo' },
  { value: 1, label: 'Primera quincena (1-15)' },
  { value: 2, label: 'Segunda quincena (16-31)' },
];
