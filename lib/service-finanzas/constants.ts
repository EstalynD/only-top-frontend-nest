/**
 * Constantes para el módulo de Finanzas
 */

// Estados de finanzas
export const ESTADOS_FINANZAS = {
  CALCULADO: 'CALCULADO',
  PENDIENTE_REVISION: 'PENDIENTE_REVISION',
  APROBADO: 'APROBADO',
  PAGADO: 'PAGADO',
} as const;

// Labels de estados
export const ESTADO_LABELS: Record<string, string> = {
  CALCULADO: 'Calculado',
  PENDIENTE_REVISION: 'Pendiente Revisión',
  APROBADO: 'Aprobado',
  PAGADO: 'Pagado',
};

// Colores de estados
export const ESTADO_COLORS: Record<string, string> = {
  CALCULADO: '#3b82f6', // azul
  PENDIENTE_REVISION: '#f59e0b', // amarillo/naranja
  APROBADO: '#10b981', // verde
  PAGADO: '#6b7280', // gris
};

// Meses del año
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

// Mensajes de error
export const FINANZAS_ERRORS = {
  finanzasNotFound: 'Finanzas no encontradas',
  modeloNotFound: 'Modelo no encontrado',
  contratoNotFound: 'Contrato no encontrado',
  sinVentas: 'No hay ventas registradas para el periodo',
  calculoFailed: 'Error al calcular finanzas',
  updateFailed: 'Error al actualizar finanzas',
  loadFailed: 'Error al cargar finanzas',
  unauthorized: 'No tienes permisos para realizar esta acción',
} as const;

// Mensajes de éxito
export const FINANZAS_SUCCESS = {
  finanzasCalculadas: 'Finanzas calculadas exitosamente',
  estadoActualizado: 'Estado actualizado exitosamente',
  finanzasAprobadas: 'Finanzas aprobadas exitosamente',
  finanzasPagadas: 'Finanzas marcadas como pagadas',
} as const;

// Límites y validaciones
export const FINANZAS_LIMITS = {
  maxNotasLength: 1000,
  minMes: 1,
  maxMes: 12,
  minAnio: 2020,
  maxAnio: 2030,
} as const;

// Estados de periodo consolidado
export const ESTADOS_PERIODO = {
  ABIERTO: 'ABIERTO',
  EN_REVISION: 'EN_REVISION',
  CONSOLIDADO: 'CONSOLIDADO',
  CERRADO: 'CERRADO',
} as const;

// Labels de estados de periodo
export const ESTADO_PERIODO_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_REVISION: 'En Revisión',
  CONSOLIDADO: 'Consolidado',
  CERRADO: 'Cerrado',
};

// Colores de estados de periodo
export const ESTADO_PERIODO_COLORS: Record<string, string> = {
  ABIERTO: '#3b82f6',
  EN_REVISION: '#f59e0b',
  CONSOLIDADO: '#10b981',
  CERRADO: '#6b7280',
};

// ========== COSTOS FIJOS MENSUALES ==========

// Categorías base predefinidas
export const CATEGORIAS_BASE = [
  {
    nombre: 'Administrativos',
    descripcion: 'Alquiler, servicios, mantenimiento',
    color: '#3b82f6',
    icon: '🏢',
  },
  {
    nombre: 'Marketing',
    descripcion: 'Publicidad, redes, diseño, campañas',
    color: '#8b5cf6',
    icon: '📢',
  },
  {
    nombre: 'Tráfico',
    descripcion: 'Plataformas, pasarelas, tráfico web',
    color: '#f59e0b',
    icon: '🌐',
  },
  {
    nombre: 'RRHH',
    descripcion: 'Nómina, comisiones, beneficios',
    color: '#10b981',
    icon: '👥',
  },
  {
    nombre: 'Otros',
    descripcion: 'Gastos no clasificados',
    color: '#6b7280',
    icon: '📦',
  },
] as const;

// Estados de costos fijos
export const ESTADOS_COSTOS = {
  ABIERTO: 'ABIERTO',
  CONSOLIDADO: 'CONSOLIDADO',
} as const;

// Labels de estados de costos
export const ESTADO_COSTOS_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  CONSOLIDADO: 'Consolidado',
};

// Colores de estados de costos
export const ESTADO_COSTOS_COLORS: Record<string, string> = {
  ABIERTO: '#10b981',      // Verde (editable)
  CONSOLIDADO: '#6b7280',  // Gris (inmutable)
};

// Mensajes de costos fijos
export const COSTOS_FIJOS_MESSAGES = {
  // Éxito
  gastoRegistrado: 'Gasto registrado exitosamente',
  gastoActualizado: 'Gasto actualizado exitosamente',
  gastoEliminado: 'Gasto eliminado exitosamente',
  categoriaCreada: 'Categoría creada exitosamente',
  categoriaEliminada: 'Categoría eliminada exitosamente',
  costosConsolidados: 'Costos del mes consolidados exitosamente',
  
  // Errores
  errorCargarCostos: 'Error al cargar los costos fijos',
  errorRegistrarGasto: 'Error al registrar el gasto',
  errorActualizarGasto: 'Error al actualizar el gasto',
  errorEliminarGasto: 'Error al eliminar el gasto',
  errorCrearCategoria: 'Error al crear la categoría',
  errorEliminarCategoria: 'Error al eliminar la categoría',
  errorConsolidar: 'Error al consolidar los costos',
  
  // Confirmaciones
  confirmarEliminarGasto: '¿Estás seguro de eliminar este gasto?',
  confirmarEliminarCategoria: '¿Estás seguro de eliminar esta categoría? Solo se pueden eliminar categorías vacías.',
  confirmarConsolidar: '¿Estás seguro de consolidar este mes? Esta acción es irreversible y no se podrán hacer más cambios.',
  
  // Validaciones
  montoInvalido: 'El monto debe ser mayor a 0',
  conceptoRequerido: 'El concepto es requerido',
  categoriaRequerida: 'Selecciona una categoría',
  mesInvalido: 'Mes inválido (debe ser entre 1 y 12)',
  periodoConsolidado: 'Este periodo ya está consolidado y no se puede modificar',
  categoriaConGastos: 'No se puede eliminar una categoría con gastos registrados',
} as const;

// Validaciones de costos fijos
export const COSTOS_VALIDATIONS = {
  montoMin: 0,
  montoMax: 1000000,
  conceptoMinLength: 3,
  conceptoMaxLength: 200,
  notasMaxLength: 500,
  categoriaNameMinLength: 2,
  categoriaNameMaxLength: 50,
  categoriaDescMaxLength: 200,
} as const;
