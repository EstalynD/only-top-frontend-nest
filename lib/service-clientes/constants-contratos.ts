import { PeriodicidadPago, TipoComision, EstadoContrato } from './types-contratos';

export const PERIODICIDADES_PAGO = [
  { value: PeriodicidadPago.QUINCENAL, label: 'Quincenal (1-15, 16-30/31)' },
  { value: PeriodicidadPago.MENSUAL, label: 'Mensual (1-30/31)' },
] as const;

export const TIPOS_COMISION = [
  { value: TipoComision.FIJO, label: 'Porcentaje Fijo' },
  { value: TipoComision.ESCALONADO, label: 'Escala Escalonada' },
] as const;

export const ESTADOS_CONTRATO = [
  { value: EstadoContrato.BORRADOR, label: 'Borrador', color: '#6b7280' },
  { value: EstadoContrato.PENDIENTE_FIRMA, label: 'Pendiente de Firma', color: '#f59e0b' },
  { value: EstadoContrato.FIRMADO, label: 'Firmado', color: '#10b981' },
  { value: EstadoContrato.RECHAZADO, label: 'Rechazado', color: '#ef4444' },
  { value: EstadoContrato.CANCELADO, label: 'Cancelado', color: '#6b7280' },
] as const;

