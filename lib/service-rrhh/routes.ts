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
  contratosByEmpleado: (empleadoId: string) => `/api/rrhh/empleados/${empleadoId}/contratos`,
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

  // Plantillas de Contratos
  contractTemplates: '/api/rrhh/empleados/contratos/plantillas',
  contractTemplatesByArea: (areaCode: string) => `/api/rrhh/empleados/contratos/plantillas/area/${areaCode}`,
  contractTemplatesByCargo: (cargoCode: string) => `/api/rrhh/empleados/contratos/plantillas/cargo/${cargoCode}`,
  assignContractTemplates: '/api/rrhh/empleados/contratos/plantillas/asignar',
  verifyTemplateAssignments: '/api/rrhh/empleados/contratos/plantillas/verificar',
  clearTemplateAssignments: '/api/rrhh/empleados/contratos/plantillas/limpiar',
  
  // Contratos Laborales con Plantillas
  generarContratoLaboral: (empleadoId: string) => `/api/rrhh/empleados/${empleadoId}/contrato-laboral`,
  getInfoContratoLaboral: (empleadoId: string) => `/api/rrhh/empleados/${empleadoId}/contrato-laboral/info`,
  validarPlantillaContrato: (empleadoId: string) => `/api/rrhh/empleados/${empleadoId}/contrato-laboral/validar`,
  plantillasContratos: '/api/rrhh/empleados/contratos/plantillas',

  // Seeder
  seedDefaults: '/api/rrhh/seed-defaults',

  // Endowment (Dotación)
  endowment: {
    base: '/api/rrhh/endowment',
    categories: '/api/rrhh/endowment/categories',
    categoryById: (id: string) => `/api/rrhh/endowment/categories/${id}`,
    items: '/api/rrhh/endowment/items',
    itemById: (id: string) => `/api/rrhh/endowment/items/${id}`,
    tracking: '/api/rrhh/endowment/tracking',
    trackingById: (id: string) => `/api/rrhh/endowment/tracking/${id}`,
    trackingByEmpleado: (empleadoId: string) => `/api/rrhh/endowment/tracking/empleado/${empleadoId}`,
    stats: '/api/rrhh/endowment/stats',
    empleado: {
      historial: (empleadoId: string) => `/api/rrhh/endowment/empleados/${empleadoId}/historial`,
      itemsActivos: (empleadoId: string) => `/api/rrhh/endowment/empleados/${empleadoId}/items-activos`,
      resumen: (empleadoId: string) => `/api/rrhh/endowment/empleados/${empleadoId}/resumen`,
    },
    areas: {
      estadisticas: (areaId: string) => `/api/rrhh/endowment/areas/${areaId}/estadisticas`,
      empleadosConDotacion: (areaId: string) => `/api/rrhh/endowment/areas/${areaId}/empleados-con-dotacion`,
    },
    reportes: {
      entregasPendientes: '/api/rrhh/endowment/reportes/entregas-pendientes',
      itemsMasEntregados: (limit?: number) => `/api/rrhh/endowment/reportes/items-mas-entregados${typeof limit === 'number' ? `?limit=${limit}` : ''}`,
      valorTotalDotacion: '/api/rrhh/endowment/reportes/valor-total-dotacion',
    }
  }
} as const;
