/**
 * Finanzas Service - Index
 */

export * from './types';
export * from './api';
export * from './routes';
export * from './constants';
export * from './helpers';

// Exportar transacciones con namespace para evitar conflictos
export * as Transacciones from './service-transacciones';

// Exportar gastos fijos quincenales con namespace
export * as GastosFijos from './service-gastos-fijos';
