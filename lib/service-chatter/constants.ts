import type { TipoVenta, TurnoChatter } from './types';

// Etiquetas de tipos de venta
export const TIPO_VENTA_LABELS: Record<TipoVenta, string> = {
  TIP: 'Propina',
  CONTENIDO_PERSONALIZADO: 'Contenido Personalizado',
  SUSCRIPCION: 'Suscripción',
  PPV: 'Pay Per View',
  SEXTING: 'Sexting',
  VIDEO_CALL: 'Videollamada',
  AUDIO_CALL: 'Llamada de Audio',
  MENSAJE_MASIVO: 'Mensaje Masivo',
  OTRO: 'Otro',
} as const;

// Etiquetas de turnos
export const TURNO_LABELS: Record<TurnoChatter, string> = {
  AM: 'Turno Mañana',
  PM: 'Turno Tarde',
  MADRUGADA: 'Turno Madrugada',
  SUPERNUMERARIO: 'Supernumerario',
} as const;

// Colores para turnos (usando tema OnlyTop)
export const TURNO_COLORS: Record<TurnoChatter, { bg: string; text: string; border: string }> = {
  AM: {
    bg: '#dbeafe',
    text: '#1e40af',
    border: '#3b82f6',
  },
  PM: {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#f59e0b',
  },
  MADRUGADA: {
    bg: '#e0e7ff',
    text: '#3730a3',
    border: '#6366f1',
  },
  SUPERNUMERARIO: {
    bg: '#d1fae5',
    text: '#065f46',
    border: '#10b981',
  },
} as const;

// Colores para tipos de venta
export const TIPO_VENTA_COLORS: Record<TipoVenta, string> = {
  TIP: '#10b981',
  CONTENIDO_PERSONALIZADO: '#3b82f6',
  SUSCRIPCION: '#8b5cf6',
  PPV: '#f59e0b',
  SEXTING: '#ec4899',
  VIDEO_CALL: '#06b6d4',
  AUDIO_CALL: '#14b8a6',
  MENSAJE_MASIVO: '#6366f1',
  OTRO: '#6b7280',
} as const;

// Plataformas comunes
export const PLATAFORMAS = [
  'OnlyFans',
  'Fansly',
  'ManyVids',
  'JustForFans',
  'Fancentro',
  'F2F',
  'Otras',
] as const;

// Monedas
export const MONEDAS = ['USD', 'EUR', 'COP', 'MXN'] as const;

// Permisos
export const CHATTER_PERMISSIONS = {
  create: 'ventas:chatting:create',
  read: 'ventas:chatting:read',
  update: 'ventas:chatting:update',
  delete: 'ventas:chatting:delete',
} as const;

