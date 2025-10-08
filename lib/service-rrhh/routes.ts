export const RRHH_ROUTES = {
  // Áreas
  areas: '/api/rrhh/areas',
  areasWithCargos: '/api/rrhh/areas/with-cargos',
  areaById: (id: string) => `/api/rrhh/areas/${id}`,
  areaByCode: (code: string) => `/api/rrhh/areas/code/${code}`,
  
  // Cargos
  cargos: '/api/rrhh/cargos',
  cargoById: (id: string) => `/api/rrhh/cargos/${id}`,
  cargoByCode: (code: string) => `/api/rrhh/cargos/code/${code}`,

  // Contratos
  contratos: '/api/rrhh/contratos',
  contratoById: (id: string) => `/api/rrhh/contratos/${id}`,
  contratosByEmpleado: (empleadoId: string) => `/api/rrhh/contratos/empleado/${empleadoId}`,
  aprobarContrato: (id: string) => `/api/rrhh/contratos/${id}/aprobar`,
  renovarContrato: (id: string) => `/api/rrhh/contratos/${id}/renovar`,
  contratosProximosAVencer: '/api/rrhh/contratos/alertas/proximos-vencer',
  contratosVencidos: '/api/rrhh/contratos/alertas/vencidos',
  marcarContratosVencidos: '/api/rrhh/contratos/alertas/marcar-vencidos',
  estadisticasContratos: '/api/rrhh/contratos/estadisticas/generales',
  buscarContratos: '/api/rrhh/contratos/buscar/criterios',
  generarPdfContrato: (id: string) => `/api/rrhh/contratos/${id}/pdf`,

  // Documentos
  documentos: '/api/rrhh/documentos',
  documentoById: (id: string) => `/api/rrhh/documentos/${id}`,
  documentosByEmpleado: (empleadoId: string) => `/api/rrhh/documentos/empleado/${empleadoId}`,
  validarDocumento: (id: string) => `/api/rrhh/documentos/${id}/validar`,
  renovarDocumento: (id: string) => `/api/rrhh/documentos/${id}/renovar`,
  documentosProximosAVencer: '/api/rrhh/documentos/alertas/proximos-vencer',
  documentosVencidos: '/api/rrhh/documentos/alertas/vencidos',
  marcarDocumentosVencidos: '/api/rrhh/documentos/alertas/marcar-vencidos',
  estadisticasDocumentos: (empleadoId: string) => `/api/rrhh/documentos/estadisticas/empleado/${empleadoId}`,
  buscarDocumentos: '/api/rrhh/documentos/buscar/criterios',
  descargarDocumento: (id: string) => `/api/rrhh/documentos/${id}/descargar`,

  // Seeder
  seedDefaults: '/api/rrhh/seed-defaults',
} as const;
