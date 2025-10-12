export const RRHH_STORAGE_KEYS = {
  lastSelectedArea: 'ot_rrhh_last_area',
} as const;

export const RRHH_ERRORS = {
  areaNotFound: 'Área no encontrada',
  cargoNotFound: 'Cargo no encontrado',
  areaCodeExists: 'Ya existe un área con este código',
  cargoCodeExists: 'Ya existe un cargo con este código',
  areaHasCargos: 'No se puede eliminar el área porque tiene cargos asociados',
  invalidAreaId: 'ID de área inválido',
  invalidCargoId: 'ID de cargo inválido',
  unauthorized: 'No tienes permisos para realizar esta acción',
} as const;

export const AREA_COLORS = [
  '#F59E0B', // Marketing - Amber
  '#8B5CF6', // Traffic - Purple
  '#10B981', // Sales - Emerald
  '#3B82F6', // Recruitment - Blue
  '#6B7280', // Administrativo - Gray
  '#EF4444', // Red
  '#F97316', // Orange
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#8B5A2B', // Brown
] as const;

export const HIERARCHY_LEVELS = [
  { value: 1, label: 'Nivel 1 - Ejecutivo' },
  { value: 2, label: 'Nivel 2 - Gerencial' },
  { value: 3, label: 'Nivel 3 - Supervisión' },
  { value: 4, label: 'Nivel 4 - Operativo' },
  { value: 5, label: 'Nivel 5 - Apoyo' },
] as const;

// ========== Endowment (Dotación) ==========
export const ENDOWMENT_CONSTANTS = {
  labels: {
    endowment: 'Dotación',
    categories: 'Categorías',
    items: 'Elementos',
    tracking: 'Seguimiento',
    stats: 'Estadísticas',
  },
  actions: {
    ENTREGA: 'Entrega',
    DEVOLUCION: 'Devolución',
    MANTENIMIENTO: 'Mantenimiento',
    REPARACION: 'Reparación',
    REEMPLAZO: 'Reemplazo',
  },
  colors: {
    primary: '#1e338a',
    accent: '#1c3fb8',
  },
  messages: {
    categoryCreated: 'Categoría creada',
    itemCreated: 'Elemento creado',
    trackingCreated: 'Seguimiento registrado',
    categoryUpdated: 'Categoría actualizada',
    itemUpdated: 'Elemento actualizado',
    trackingUpdated: 'Seguimiento actualizado',
    categoryDeleted: 'Categoría eliminada',
    itemDeleted: 'Elemento eliminado',
    trackingDeleted: 'Seguimiento eliminado',
  }
} as const;