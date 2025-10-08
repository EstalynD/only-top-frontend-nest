/**
 * Rutas del API de Cartera
 * IMPORTANTE: Todas las rutas deben incluir el prefijo /api/ según el estándar del proyecto
 */

export const CARTERA_ROUTES = {
  // ========== FACTURAS ==========
  facturas: {
    // CRUD básico
    list: '/api/cartera/facturas',
    create: '/api/cartera/facturas',
    byId: (id: string) => `/api/cartera/facturas/${id}`,
    update: (id: string) => `/api/cartera/facturas/${id}`,
    delete: (id: string) => `/api/cartera/facturas/${id}`,

    // PDF
    pdf: (id: string) => `/api/cartera/facturas/${id}/pdf`,
    pdfDownload: (id: string) => `/api/cartera/facturas/${id}/pdf?download=true`,

    // Generación
    generarPorModelo: (modeloId: string) => `/api/cartera/facturas/${modeloId}/generar`,
    generarPorPeriodo: '/api/cartera/facturas/periodo',

    // Consultas especiales
    proximasVencer: '/api/cartera/facturas-proximas-vencer',
    vencidas: '/api/cartera/facturas-vencidas',
  },

  // ========== PAGOS ==========
  pagos: {
    // CRUD básico
    list: '/api/cartera/pagos',
    create: '/api/cartera/pagos',
    byId: (id: string) => `/api/cartera/pagos/${id}`,

    // Por factura
    byFactura: (facturaId: string) => `/api/cartera/facturas/${facturaId}/pagos`,
  },

  // ========== ESTADO DE CUENTA ==========
  estadoCuenta: {
    get: (modeloId: string) => `/api/cartera/estado-cuenta/${modeloId}`,
    pdf: (modeloId: string) => `/api/cartera/estado-cuenta/${modeloId}/pdf`,
  },

  // ========== RECORDATORIOS ==========
  recordatorios: {
    list: '/api/cartera/recordatorios',
    enviar: (facturaId: string) => `/api/cartera/recordatorios/${facturaId}`,
  },

  // ========== TOTALES Y ESTADÍSTICAS ==========
  totales: '/api/cartera/totales',
  dashboard: '/api/cartera/dashboard',
  estadisticas: '/api/cartera/estadisticas',

  // ========== CONFIGURACIÓN ==========
  configuracion: {
    get: '/api/cartera/configuracion',
    update: '/api/cartera/configuracion',
  },
} as const;
