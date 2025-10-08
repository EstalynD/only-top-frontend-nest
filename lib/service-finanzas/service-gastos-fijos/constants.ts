/**
 * Constantes para Gastos Fijos Quincenales
 */

import { CategoriaGasto, EstadoGasto, EstadoResumen, QuincenaEnum } from './types';

// ========== LABELS Y DESCRIPCIONES ==========

export const QUINCENA_LABELS: Record<QuincenaEnum, string> = {
  [QuincenaEnum.PRIMERA_QUINCENA]: 'Primera Quincena (1-15)',
  [QuincenaEnum.SEGUNDA_QUINCENA]: 'Segunda Quincena (16-fin)',
};

export const QUINCENA_SHORT_LABELS: Record<QuincenaEnum, string> = {
  [QuincenaEnum.PRIMERA_QUINCENA]: 'Q1',
  [QuincenaEnum.SEGUNDA_QUINCENA]: 'Q2',
};

export const CATEGORIA_LABELS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.NOMINA]: 'Nómina',
  [CategoriaGasto.ALQUILER]: 'Alquiler',
  [CategoriaGasto.SERVICIOS]: 'Servicios',
  [CategoriaGasto.MARKETING]: 'Marketing',
  [CategoriaGasto.TECNOLOGIA]: 'Tecnología',
  [CategoriaGasto.TRANSPORTE]: 'Transporte',
  [CategoriaGasto.MANTENIMIENTO]: 'Mantenimiento',
  [CategoriaGasto.LEGAL]: 'Legal',
  [CategoriaGasto.OTROS]: 'Otros',
};

export const CATEGORIA_DESCRIPTIONS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.NOMINA]: 'Salarios y pagos a empleados',
  [CategoriaGasto.ALQUILER]: 'Alquiler de oficinas y espacios',
  [CategoriaGasto.SERVICIOS]: 'Internet, electricidad, agua, telefonía',
  [CategoriaGasto.MARKETING]: 'Publicidad, campañas, diseño',
  [CategoriaGasto.TECNOLOGIA]: 'Licencias de software, herramientas',
  [CategoriaGasto.TRANSPORTE]: 'Combustible, mantenimiento vehículos',
  [CategoriaGasto.MANTENIMIENTO]: 'Reparaciones y mantenimiento',
  [CategoriaGasto.LEGAL]: 'Honorarios legales, asesoría',
  [CategoriaGasto.OTROS]: 'Gastos no clasificados',
};

export const ESTADO_GASTO_LABELS: Record<EstadoGasto, string> = {
  [EstadoGasto.PENDIENTE]: 'Pendiente',
  [EstadoGasto.APROBADO]: 'Aprobado',
  [EstadoGasto.PAGADO]: 'Pagado',
  [EstadoGasto.RECHAZADO]: 'Rechazado',
};

export const ESTADO_RESUMEN_LABELS: Record<EstadoResumen, string> = {
  [EstadoResumen.ABIERTO]: 'Abierto',
  [EstadoResumen.EN_REVISION]: 'En Revisión',
  [EstadoResumen.CONSOLIDADO]: 'Consolidado',
};

// ========== COLORES ==========

export const CATEGORIA_COLORS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.NOMINA]: '#10b981',      // Verde
  [CategoriaGasto.ALQUILER]: '#3b82f6',    // Azul
  [CategoriaGasto.SERVICIOS]: '#f59e0b',   // Naranja
  [CategoriaGasto.MARKETING]: '#8b5cf6',   // Púrpura
  [CategoriaGasto.TECNOLOGIA]: '#06b6d4',  // Cyan
  [CategoriaGasto.TRANSPORTE]: '#ec4899',  // Rosa
  [CategoriaGasto.MANTENIMIENTO]: '#f97316', // Naranja oscuro
  [CategoriaGasto.LEGAL]: '#6366f1',       // Índigo
  [CategoriaGasto.OTROS]: '#6b7280',       // Gris
};

export const ESTADO_GASTO_COLORS: Record<EstadoGasto, string> = {
  [EstadoGasto.PENDIENTE]: '#f59e0b',   // Amarillo/Naranja
  [EstadoGasto.APROBADO]: '#10b981',    // Verde
  [EstadoGasto.PAGADO]: '#6b7280',      // Gris
  [EstadoGasto.RECHAZADO]: '#ef4444',   // Rojo
};

export const ESTADO_RESUMEN_COLORS: Record<EstadoResumen, string> = {
  [EstadoResumen.ABIERTO]: '#10b981',      // Verde (editable)
  [EstadoResumen.EN_REVISION]: '#f59e0b',  // Amarillo
  [EstadoResumen.CONSOLIDADO]: '#6b7280',  // Gris (inmutable)
};

// ========== ICONOS ==========

export const CATEGORIA_ICONS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.NOMINA]: '👥',
  [CategoriaGasto.ALQUILER]: '🏢',
  [CategoriaGasto.SERVICIOS]: '⚡',
  [CategoriaGasto.MARKETING]: '📢',
  [CategoriaGasto.TECNOLOGIA]: '💻',
  [CategoriaGasto.TRANSPORTE]: '🚗',
  [CategoriaGasto.MANTENIMIENTO]: '🔧',
  [CategoriaGasto.LEGAL]: '⚖️',
  [CategoriaGasto.OTROS]: '📦',
};

// ========== INDICADORES DE COLOR ==========

export const INDICADOR_COLORS = {
  verde: {
    bg: '#d4edda',
    text: '#155724',
    border: '#c3e6cb',
  },
  rojo: {
    bg: '#f8d7da',
    text: '#721c24',
    border: '#f5c6cb',
  },
  gris: {
    bg: '#e2e8f0',
    text: '#475569',
    border: '#cbd5e1',
  },
} as const;

// ========== MENSAJES ==========

export const GASTOS_FIJOS_MESSAGES = {
  // Éxito
  gastoRegistrado: 'Gasto registrado exitosamente',
  gastoActualizado: 'Gasto actualizado exitosamente',
  gastoEliminado: 'Gasto eliminado exitosamente',
  gastoAprobado: 'Gasto aprobado exitosamente',
  gastoRechazado: 'Gasto rechazado exitosamente',
  nominaGenerada: 'Nómina generada exitosamente',
  periodoConsolidado: 'Periodo consolidado exitosamente',
  
  // Errores
  errorCargarResumen: 'Error al cargar el resumen',
  errorRegistrarGasto: 'Error al registrar el gasto',
  errorActualizarGasto: 'Error al actualizar el gasto',
  errorEliminarGasto: 'Error al eliminar el gasto',
  errorAprobarGasto: 'Error al aprobar el gasto',
  errorGenerarNomina: 'Error al generar la nómina',
  errorConsolidar: 'Error al consolidar el periodo',
  
  // Confirmaciones
  confirmarEliminarGasto: '¿Estás seguro de eliminar este gasto?',
  confirmarConsolidar: '¿Estás seguro de consolidar este periodo? Esta acción es irreversible.',
  confirmarGenerarNomina: '¿Generar nómina automática para todos los empleados activos?',
  
  // Validaciones
  montoInvalido: 'El monto debe ser mayor a 0',
  conceptoRequerido: 'El concepto es requerido',
  categoriaRequerida: 'Selecciona una categoría',
  mesInvalido: 'Mes inválido (debe ser entre 1 y 12)',
  empleadoRequerido: 'Para nómina, el empleado es requerido',
  periodoConsolidadoNoEditable: 'Este periodo está consolidado y no se puede modificar',
  
  // Información
  nominaInfo: 'Se creará un gasto por cada empleado activo con salario configurado',
  consolidarInfo: 'Al consolidar, no se podrán hacer más cambios en este periodo',
  quincenal1Info: 'Primera quincena: días 1 al 15 del mes',
  quincenal2Info: 'Segunda quincena: días 16 al fin de mes',
} as const;

// ========== VALIDACIONES ==========

export const GASTOS_FIJOS_VALIDATIONS = {
  montoMin: 0,
  montoMax: 1_000_000,
  conceptoMinLength: 3,
  conceptoMaxLength: 200,
  notasMaxLength: 500,
  mesMin: 1,
  mesMax: 12,
  anioMin: 2020,
  anioMax: 2030,
} as const;

// ========== CONFIGURACIÓN DE GRÁFICOS ==========

export const CHART_COLORS = [
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#f59e0b', // Naranja
  '#8b5cf6', // Púrpura
  '#06b6d4', // Cyan
  '#ec4899', // Rosa
  '#f97316', // Naranja oscuro
  '#6366f1', // Índigo
  '#6b7280', // Gris
];

// ========== OPCIONES DE FILTRO ==========

export const OPCIONES_MESES = [
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

export const OPCIONES_QUINCENA = [
  { value: QuincenaEnum.PRIMERA_QUINCENA, label: 'Primera Quincena (1-15)' },
  { value: QuincenaEnum.SEGUNDA_QUINCENA, label: 'Segunda Quincena (16-fin)' },
];

export const OPCIONES_CATEGORIA = Object.entries(CATEGORIA_LABELS).map(([value, label]) => ({
  value: value as CategoriaGasto,
  label,
  icon: CATEGORIA_ICONS[value as CategoriaGasto],
  description: CATEGORIA_DESCRIPTIONS[value as CategoriaGasto],
}));

export const OPCIONES_ESTADO = Object.entries(ESTADO_GASTO_LABELS).map(([value, label]) => ({
  value: value as EstadoGasto,
  label,
  color: ESTADO_GASTO_COLORS[value as EstadoGasto],
}));
