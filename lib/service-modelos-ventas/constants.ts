/**
 * Constantes del módulo de ventas de modelos
 */

import type { TipoVenta, TurnoChatter, GroupByOption } from './types';

// Opciones de tipo de venta
export const TIPO_VENTA_OPTIONS: { value: TipoVenta; label: string }[] = [
  { value: 'TIP', label: 'TIP' },
  { value: 'CONTENIDO_PERSONALIZADO', label: 'Contenido Personalizado' },
  { value: 'SUSCRIPCION', label: 'Suscripción' },
  { value: 'PPV', label: 'PPV (Pay Per View)' },
  { value: 'SEXTING', label: 'Sexting' },
  { value: 'VIDEO_CALL', label: 'Video Call' },
  { value: 'AUDIO_CALL', label: 'Audio Call' },
  { value: 'MENSAJE_MASIVO', label: 'Mensaje Masivo' },
  { value: 'OTRO', label: 'Otro' },
];

// Opciones de turno
export const TURNO_OPTIONS: { value: TurnoChatter; label: string }[] = [
  { value: 'AM', label: 'Turno AM' },
  { value: 'PM', label: 'Turno PM' },
  { value: 'MADRUGADA', label: 'Turno Madrugada' },
  { value: 'SUPERNUMERARIO', label: 'Supernumerario' },
];

// Opciones de agrupación
export const GROUP_BY_OPTIONS: { value: GroupByOption; label: string; description: string }[] = [
  { 
    value: 'salesCloser', 
    label: 'Sales Closer', 
    description: 'Agrupar por responsable comercial' 
  },
  { 
    value: 'trafficker', 
    label: 'Trafficker', 
    description: 'Agrupar por responsable de tráfico' 
  },
  { 
    value: 'estado', 
    label: 'Estado', 
    description: 'Agrupar por estado de modelo' 
  },
  { 
    value: 'mes', 
    label: 'Mes', 
    description: 'Agrupar por mes' 
  },
];

// Colores para gráficas por tipo de venta
export const TIPO_VENTA_COLORS: Record<TipoVenta, string> = {
  TIP: '#3b82f6',
  CONTENIDO_PERSONALIZADO: '#8b5cf6',
  SUSCRIPCION: '#10b981',
  PPV: '#f59e0b',
  SEXTING: '#ec4899',
  VIDEO_CALL: '#06b6d4',
  AUDIO_CALL: '#14b8a6',
  MENSAJE_MASIVO: '#f97316',
  OTRO: '#6b7280',
};

// Colores para gráficas por turno
export const TURNO_COLORS: Record<TurnoChatter, string> = {
  AM: '#3b82f6',
  PM: '#8b5cf6',
  MADRUGADA: '#f59e0b',
  SUPERNUMERARIO: '#10b981',
};

// Nombres de meses
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Nombres de días de la semana (1=Domingo, 7=Sábado)
export const DAY_NAMES = [
  '', // índice 0 no se usa
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

// Mensajes de error
export const ERROR_MESSAGES = {
  loadFailed: 'Error al cargar las ventas',
  noData: 'No hay datos disponibles para el periodo seleccionado',
  invalidFilters: 'Los filtros seleccionados no son válidos',
} as const;

