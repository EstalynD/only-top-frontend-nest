/**
 * Constantes del módulo de Horas Extras
 */

import { TipoHoraExtra, EstadoHoraExtra } from './types';

// ========== RECARGOS LEGALES COLOMBIA ==========

export const RECARGOS_COLOMBIA = {
  [TipoHoraExtra.DIURNA]: 0.25, // 25%
  [TipoHoraExtra.NOCTURNA]: 0.75, // 75%
  [TipoHoraExtra.RECARGO_NOCTURNO]: 0.35, // 35%
  [TipoHoraExtra.DOMINGO]: 0.75, // 75%
  [TipoHoraExtra.FESTIVO]: 0.75, // 75%
  [TipoHoraExtra.DOMINGO_NOCTURNO]: 1.10, // 110%
  [TipoHoraExtra.FESTIVO_NOCTURNO]: 1.10, // 110%
} as const;

// ========== LABELS Y DESCRIPCIONES ==========

export const TIPO_HORA_LABELS: Record<TipoHoraExtra, string> = {
  [TipoHoraExtra.DIURNA]: 'Extra Diurna',
  [TipoHoraExtra.NOCTURNA]: 'Extra Nocturna',
  [TipoHoraExtra.RECARGO_NOCTURNO]: 'Recargo Nocturno',
  [TipoHoraExtra.DOMINGO]: 'Domingo',
  [TipoHoraExtra.FESTIVO]: 'Festivo',
  [TipoHoraExtra.DOMINGO_NOCTURNO]: 'Domingo Nocturno',
  [TipoHoraExtra.FESTIVO_NOCTURNO]: 'Festivo Nocturno',
};

export const TIPO_HORA_DESCRIPTIONS: Record<TipoHoraExtra, string> = {
  [TipoHoraExtra.DIURNA]: 'Hora extra diurna (25% recargo)',
  [TipoHoraExtra.NOCTURNA]: 'Hora extra nocturna (75% recargo)',
  [TipoHoraExtra.RECARGO_NOCTURNO]: 'Trabajo nocturno ordinario (35% recargo)',
  [TipoHoraExtra.DOMINGO]: 'Trabajo en domingo (75% recargo)',
  [TipoHoraExtra.FESTIVO]: 'Trabajo en festivo (75% recargo)',
  [TipoHoraExtra.DOMINGO_NOCTURNO]: 'Domingo nocturno (110% recargo)',
  [TipoHoraExtra.FESTIVO_NOCTURNO]: 'Festivo nocturno (110% recargo)',
};

export const ESTADO_LABELS: Record<EstadoHoraExtra, string> = {
  [EstadoHoraExtra.PENDIENTE]: 'Pendiente',
  [EstadoHoraExtra.APROBADO]: 'Aprobado',
  [EstadoHoraExtra.RECHAZADO]: 'Rechazado',
};

// ========== COLORES POR ESTADO ==========

export const ESTADO_COLORS: Record<EstadoHoraExtra, string> = {
  [EstadoHoraExtra.PENDIENTE]: '#f59e0b', // warning/amber
  [EstadoHoraExtra.APROBADO]: '#10b981', // success/green
  [EstadoHoraExtra.RECHAZADO]: '#ef4444', // danger/red
};

export const ESTADO_BG_COLORS: Record<EstadoHoraExtra, string> = {
  [EstadoHoraExtra.PENDIENTE]: '#fef3c7',
  [EstadoHoraExtra.APROBADO]: '#d1fae5',
  [EstadoHoraExtra.RECHAZADO]: '#fee2e2',
};

// ========== COLORES POR TIPO DE HORA ==========

export const TIPO_HORA_COLORS: Record<TipoHoraExtra, string> = {
  [TipoHoraExtra.DIURNA]: '#3b82f6', // blue
  [TipoHoraExtra.NOCTURNA]: '#8b5cf6', // purple
  [TipoHoraExtra.RECARGO_NOCTURNO]: '#6366f1', // indigo
  [TipoHoraExtra.DOMINGO]: '#10b981', // green
  [TipoHoraExtra.FESTIVO]: '#f59e0b', // amber
  [TipoHoraExtra.DOMINGO_NOCTURNO]: '#ec4899', // pink
  [TipoHoraExtra.FESTIVO_NOCTURNO]: '#ef4444', // red
};

// ========== CONSTANTES DE CÁLCULO ==========

export const HORAS_LABORALES_MES_DEFAULT = 220; // 44h/semana × 5 días × 4 semanas
export const MESES_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const QUINCENAS = [
  { value: 1, label: 'Primera Quincena (1-15)' },
  { value: 2, label: 'Segunda Quincena (16-fin de mes)' },
] as const;

// ========== MENSAJES ==========

export const MESSAGES = {
  success: {
    created: 'Registro de horas extras creado exitosamente',
    updated: 'Registro actualizado correctamente',
    approved: 'Registro aprobado exitosamente',
    rejected: 'Registro rechazado',
    deleted: 'Registro eliminado',
  },
  error: {
    create: 'Error al crear el registro de horas extras',
    update: 'Error al actualizar el registro',
    approve: 'Error al aprobar el registro',
    delete: 'Error al eliminar el registro',
    fetch: 'Error al obtener los datos',
    validation: 'Por favor complete todos los campos requeridos',
    duplicate: 'Ya existe un registro para este empleado en este periodo',
    unauthorized: 'No tiene permisos para realizar esta acción',
  },
  confirmation: {
    delete: '¿Está seguro de eliminar este registro?',
    approve: '¿Confirma la aprobación de este registro?',
    reject: '¿Está seguro de rechazar este registro?',
  },
} as const;

// ========== PERMISOS ==========

export const PERMISSIONS = {
  CREATE: 'rrhh:horas_extras:create',
  READ: 'rrhh:horas_extras:read',
  UPDATE: 'rrhh:horas_extras:update',
  DELETE: 'rrhh:horas_extras:delete',
  APPROVE: 'rrhh:horas_extras:approve',
  STATS: 'rrhh:horas_extras:stats',
} as const;

// ========== OPCIONES DE SELECT ==========

export const TIPO_HORA_OPTIONS = Object.entries(TIPO_HORA_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ESTADO_OPTIONS = Object.entries(ESTADO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const QUINCENA_OPTIONS = QUINCENAS.map(q => ({
  value: String(q.value),
  label: q.label,
}));

// ========== CONFIGURACIÓN DE TABLA ==========

export const TABLE_CONFIG = {
  itemsPerPage: 20,
  maxPaginationButtons: 5,
};
