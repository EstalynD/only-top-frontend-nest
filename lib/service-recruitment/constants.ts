import { EstadoModeloCerrada } from './types';

// Estados de modelo cerrada
export const ESTADOS_MODELO_CERRADA = [
  { value: EstadoModeloCerrada.EN_ESPERA, label: 'En Espera', color: '#f59e0b' },
  { value: EstadoModeloCerrada.REGISTRADA, label: 'Registrada', color: '#3b82f6' },
  { value: EstadoModeloCerrada.FIRMADA, label: 'Firmada', color: '#10b981' },
] as const;

// Límites y validaciones
export const VALIDATION_LIMITS = {
  MAX_CONTACTOS: 50,
  MAX_MODELOS_CERRADAS: 20,
  MIN_FACTURACION: 0,
  MAX_FACTURACION: 1000000,
} as const;

// Mensajes
export const MESSAGES = {
  ACTIVITY_CREATED: 'Actividad registrada exitosamente',
  ACTIVITY_UPDATED: 'Actividad actualizada exitosamente',
  ACTIVITY_DELETED: 'Actividad eliminada exitosamente',
  MODELO_VINCULADA: 'Modelo vinculada exitosamente',
  ERROR_LOADING: 'Error al cargar las actividades',
  ERROR_SAVING: 'Error al guardar la actividad',
  ERROR_DELETING: 'Error al eliminar la actividad',
  CONFIRM_DELETE: '¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.',
} as const;

// Placeholder texts
export const PLACEHOLDERS = {
  FECHA: 'Selecciona una fecha',
  SALES_CLOSER: 'Selecciona un Sales Closer',
  CUENTAS_TEXTEADAS: 'Cantidad de cuentas DM',
  LIKES: 'Cantidad de likes',
  COMENTARIOS: 'Cantidad de comentarios',
  CONTACTOS: 'Número de contacto',
  PERFIL_IG: '@username o link de IG',
  NOMBRE_PROSPECTO: 'Nombre del prospecto',
  REUNIONES_AGENDADAS: 'Reuniones programadas',
  REUNIONES_REALIZADAS: 'Reuniones efectivas',
  MODELO_NOMBRE: 'Nombre completo de la modelo',
  MODELO_PERFIL: '@username de Instagram',
  FACTURACION: 'Monto en USD',
  NOTAS: 'Notas adicionales del día...',
} as const;

// Labels para formularios
export const LABELS = {
  FECHA_ACTIVIDAD: 'Fecha de Actividad',
  SALES_CLOSER: 'Sales Closer',
  METRICAS_IG: 'Métricas de Instagram',
  CUENTAS_TEXTEADAS: 'Cuentas Texteadas (DM)',
  LIKES_REALIZADOS: 'Likes Realizados',
  COMENTARIOS_REALIZADOS: 'Comentarios Realizados',
  CONTACTOS_OBTENIDOS: 'Contactos Obtenidos',
  REUNIONES: 'Reuniones',
  REUNIONES_AGENDADAS: 'Agendadas',
  REUNIONES_REALIZADAS: 'Realizadas',
  MODELOS_CERRADAS: 'Modelos Cerradas',
  NOTAS_DIA: 'Notas del Día',
  NOMBRE_MODELO: 'Nombre de la Modelo',
  PERFIL_INSTAGRAM: 'Perfil de Instagram',
  FACTURACION_ULTIMOS_3_MESES: 'Facturación Últimos 3 Meses',
  FACTURACION_MES: (n: number) => `Mes ${n}`,
  PROMEDIO_FACTURACION: 'Promedio',
  FECHA_CIERRE: 'Fecha de Cierre',
  ESTADO: 'Estado',
  NOTAS: 'Notas',
} as const;

// Tooltips
export const TOOLTIPS = {
  CUENTAS_TEXTEADAS: 'Cantidad de mensajes directos (DM) enviados a potenciales modelos',
  LIKES_REALIZADOS: 'Cantidad de "me gusta" dados en publicaciones de posibles modelos',
  COMENTARIOS_REALIZADOS: 'Cantidad de comentarios dejados en posts como técnica de visibilidad',
  CONTACTOS_OBTENIDOS: 'Leads que proporcionaron su número de WhatsApp u otro contacto',
  REUNIONES_AGENDADAS: 'Reuniones programadas con prospectas para presentación de la agencia',
  REUNIONES_REALIZADAS: 'Reuniones que se concretaron efectivamente',
  MODELOS_CERRADAS: 'Modelos que finalmente firmaron o acordaron unirse a la agencia',
  PROMEDIO_FACTURACION: 'Se calcula automáticamente basado en los últimos 3 meses',
} as const;

