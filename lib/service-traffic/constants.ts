/**
 * Constantes para el módulo de Traffic
 */

// Nota: Las monedas se cargan dinámicamente desde el sistema
// Ver: lib/service-sistema/api.ts -> getCurrencies()
// No usar AVAILABLE_CURRENCIES hardcodeadas

// Países comunes para segmentación
export const COMMON_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Mexico',
  'Colombia',
  'Argentina',
  'Chile',
  'Peru',
  'Brazil',
  'Japan',
  'South Korea',
] as const;

// Rangos de edad predefinidos
export const AGE_RANGES = [
  { min: 18, max: 24, label: '18-24' },
  { min: 25, max: 34, label: '25-34' },
  { min: 35, max: 44, label: '35-44' },
  { min: 45, max: 54, label: '45-54' },
  { min: 55, max: 64, label: '55-64' },
  { min: 65, max: 99, label: '65+' },
] as const;

// Intereses comunes
export const COMMON_INTERESTS = [
  'Fitness',
  'Wellness',
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Travel',
  'Photography',
  'Art',
  'Music',
  'Gaming',
  'Technology',
  'Sports',
  'Food',
  'Health',
] as const;

// Mensajes de error
export const TRAFFIC_ERRORS = {
  campaignNotFound: 'Campaña no encontrada',
  invalidBudget: 'El presupuesto gastado no puede exceder el asignado',
  invalidDates: 'Las fechas de la campaña son inválidas',
  createFailed: 'Error al crear la campaña',
  updateFailed: 'Error al actualizar la campaña',
  deleteFailed: 'Error al eliminar la campaña',
  loadFailed: 'Error al cargar las campañas',
  unauthorized: 'No tienes permisos para realizar esta acción',
} as const;

// Mensajes de éxito
export const TRAFFIC_SUCCESS = {
  campaignCreated: 'Campaña creada exitosamente',
  campaignUpdated: 'Campaña actualizada exitosamente',
  campaignDeleted: 'Campaña eliminada exitosamente',
} as const;

// Límites y validaciones
export const CAMPAIGN_LIMITS = {
  maxCopyLength: 500,
  maxNotesLength: 1000,
  maxInterests: 20,
  maxCountries: 50,
  minAge: 18,
  maxAge: 99,
} as const;
