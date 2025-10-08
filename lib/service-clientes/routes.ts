// Rutas del módulo de clientes/modelos
export const CLIENTES_ROUTES = {
  modelos: {
    list: '/api/rrhh/modelos',
    create: '/api/rrhh/modelos',
    detail: (id: string) => `/api/rrhh/modelos/${id}`,
    update: (id: string) => `/api/rrhh/modelos/${id}`,
    delete: (id: string) => `/api/rrhh/modelos/${id}`,
    stats: '/api/rrhh/modelos/stats',
    uploadPhoto: '/api/rrhh/modelos/upload-photo',
  },
  contratos: {
    list: '/api/rrhh/contratos-modelo',
    create: '/api/rrhh/contratos-modelo',
    detail: (id: string) => `/api/rrhh/contratos-modelo/${id}`,
    update: (id: string) => `/api/rrhh/contratos-modelo/${id}`,
    delete: (id: string) => `/api/rrhh/contratos-modelo/${id}`,
    stats: '/api/rrhh/contratos-modelo/stats',
    enviarParaFirma: '/api/rrhh/contratos-modelo/enviar-para-firma',
    enviarEnlaceFirma: '/api/rrhh/contratos-modelo/enviar-enlace-firma',
    solicitarOtp: '/api/rrhh/contratos-modelo/solicitar-otp',
    firmar: '/api/rrhh/contratos-modelo/firmar',
    // PDF endpoints
    pdfView: (contratoId: string, filename: string) => `/api/pdf/contratos-modelo/${contratoId}/A4/${filename}.pdf`,
    pdfDownload: (contratoId: string) => `/api/pdf/contratos-modelo/${contratoId}/download`,
    pdfInfo: (contratoId: string) => `/api/pdf/contratos-modelo/${contratoId}/info`,
  },
  firmaPublica: {
    obtenerContrato: (token: string) => `/api/firma-contrato/${token}`,
    solicitarOtp: (token: string) => `/api/firma-contrato/${token}/solicitar-otp`,
    firmar: (token: string) => `/api/firma-contrato/${token}/firmar`,
  },
  disponibles: {
    salesClosers: '/api/rrhh/modelos/disponibles/sales-closers',
    chatters: '/api/rrhh/modelos/disponibles/chatters',
    traffickers: '/api/rrhh/modelos/disponibles/traffickers',
  },
} as const;

