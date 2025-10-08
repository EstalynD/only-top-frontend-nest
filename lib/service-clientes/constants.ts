import type { TipoDocumento, PlataformaContenido, TipoTrafico, EstadoModelo } from './types';

// Opciones de tipo de documento
export const TIPOS_DOCUMENTO: Array<{ value: TipoDocumento; label: string }> = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'PPT', label: 'Permiso de Protección Temporal (PPT)' },
  { value: 'ID_EXTRANJERO', label: 'ID Extranjero' },
  { value: 'OTRO', label: 'Otro' },
];

// Opciones de plataformas de contenido
export const PLATAFORMAS_CONTENIDO: Array<{ value: PlataformaContenido; label: string }> = [
  { value: 'ONLYFANS', label: 'OnlyFans' },
  { value: 'FANSLY', label: 'Fansly' },
  { value: 'MANYVIDS', label: 'ManyVids' },
  { value: 'F2F', label: 'F2F' },
  { value: 'JUSTFORFANS', label: 'JustForFans' },
  { value: 'FANCENTRO', label: 'FanCentro' },
  { value: 'OTRAS', label: 'Otras' },
];

// Opciones de redes sociales
export const REDES_SOCIALES = [
  { value: 'Instagram', label: 'Instagram', icon: '📷' },
  { value: 'Twitter', label: 'Twitter (X)', icon: '🐦' },
  { value: 'TikTok', label: 'TikTok', icon: '🎵' },
  { value: 'Telegram', label: 'Telegram', icon: '✈️' },
  { value: 'Reddit', label: 'Reddit', icon: '🤖' },
  { value: 'Snapchat', label: 'Snapchat', icon: '👻' },
  { value: 'Facebook', label: 'Facebook', icon: '👥' },
  { value: 'YouTube', label: 'YouTube', icon: '📺' },
  { value: 'Otra', label: 'Otra', icon: '🌐' },
];

// Opciones de tipo de tráfico
export const TIPOS_TRAFICO: Array<{ value: TipoTrafico; label: string; isPaid: boolean }> = [
  { value: 'REDDIT_ORGANICO', label: 'Reddit Orgánico', isPaid: false },
  { value: 'REDDIT_ADS', label: 'Reddit Ads', isPaid: true },
  { value: 'PAUTA_RRSS', label: 'Pauta en RRSS', isPaid: true },
  { value: 'RRSS_ORGANICO', label: 'RRSS Orgánico', isPaid: false },
  { value: 'DATING_APPS', label: 'Apps de Citas', isPaid: false },
];

// Opciones de estado de modelo
export const ESTADOS_MODELO: Array<{ value: EstadoModelo; label: string; color: string }> = [
  { value: 'ACTIVA', label: 'Activa', color: '#10b981' },
  { value: 'INACTIVA', label: 'Inactiva', color: '#6b7280' },
  { value: 'SUSPENDIDA', label: 'Suspendida', color: '#f59e0b' },
  { value: 'TERMINADA', label: 'Terminada', color: '#ef4444' },
];

// Meses del año
export const MESES = [
  { value: 1, label: 'Enero', short: 'Ene' },
  { value: 2, label: 'Febrero', short: 'Feb' },
  { value: 3, label: 'Marzo', short: 'Mar' },
  { value: 4, label: 'Abril', short: 'Abr' },
  { value: 5, label: 'Mayo', short: 'May' },
  { value: 6, label: 'Junio', short: 'Jun' },
  { value: 7, label: 'Julio', short: 'Jul' },
  { value: 8, label: 'Agosto', short: 'Ago' },
  { value: 9, label: 'Septiembre', short: 'Sep' },
  { value: 10, label: 'Octubre', short: 'Oct' },
  { value: 11, label: 'Noviembre', short: 'Nov' },
  { value: 12, label: 'Diciembre', short: 'Dic' },
];

// Países comunes
export const PAISES_COMUNES = [
  'Colombia',
  'Venezuela',
  'Argentina',
  'México',
  'España',
  'Estados Unidos',
  'Brasil',
  'Perú',
  'Chile',
  'Ecuador',
];

// Mensajes de error
export const CLIENTES_ERRORS = {
  loadFailed: 'Error al cargar los modelos',
  createFailed: 'Error al crear el modelo',
  updateFailed: 'Error al actualizar el modelo',
  deleteFailed: 'Error al eliminar el modelo',
  photoUploadFailed: 'Error al subir la foto',
  invalidData: 'Datos inválidos',
  required: 'Este campo es obligatorio',
  invalidEmail: 'Correo electrónico inválido',
  invalidPhone: 'Teléfono inválido',
  invalidUrl: 'URL inválida',
} as const;

