// Estados de modelo cerrada
export enum EstadoModeloCerrada {
  EN_ESPERA = 'EN_ESPERA',
  REGISTRADA = 'REGISTRADA',
  FIRMADA = 'FIRMADA',
}

// Lista estática de estados para selects/iteraciones
export const ESTADOS_MODELO_CERRADA = [
  EstadoModeloCerrada.EN_ESPERA,
  EstadoModeloCerrada.REGISTRADA,
  EstadoModeloCerrada.FIRMADA,
] as const;

// Contacto obtenido
export interface ContactoObtenido {
  numero: string;
  perfilInstagram?: string | null;
  nombreProspecto?: string | null;
  fechaObtencion: string;
}

// Modelo cerrada
export interface ModeloCerrada {
  nombreModelo: string;
  perfilInstagram: string;
  facturacionUltimosTresMeses: [number, number, number];
  promedioFacturacion: number;
  fechaCierre: string;
  estado: EstadoModeloCerrada;
  modeloId?: string | null;
  notas?: string | null;
}

// Actividad de recruitment
export interface RecruitmentActivity {
  _id: string;
  fechaActividad: string;
  salesCloserId: string | {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
    cargoId?: any;
  };
  cuentasTexteadas: number;
  likesRealizados: number;
  comentariosRealizados: number;
  contactosObtenidos: ContactoObtenido[];
  reunionesAgendadas: number;
  reunionesRealizadas: number;
  modelosCerradas: ModeloCerrada[];
  notasDia?: string | null;
  creadoPor?: string | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// DTOs para crear/actualizar
export interface CreateRecruitmentActivityDto {
  fechaActividad: string;
  salesCloserId?: string;
  cuentasTexteadas: number;
  likesRealizados: number;
  comentariosRealizados: number;
  contactosObtenidos?: ContactoObtenido[];
  reunionesAgendadas: number;
  reunionesRealizadas: number;
  modelosCerradas?: ModeloCerrada[];
  notasDia?: string;
}

export interface UpdateRecruitmentActivityDto {
  fechaActividad?: string;
  cuentasTexteadas?: number;
  likesRealizados?: number;
  comentariosRealizados?: number;
  contactosObtenidos?: ContactoObtenido[];
  reunionesAgendadas?: number;
  reunionesRealizadas?: number;
  modelosCerradas?: ModeloCerrada[];
  notasDia?: string;
}

export interface VincularModeloDto {
  actividadId: string;
  modeloCerradaIndex: number;
  modeloId: string;
}

// Estadísticas
export interface RecruitmentStats {
  totales: {
    cuentasTexteadas: number;
    likesRealizados: number;
    comentariosRealizados: number;
    contactosObtenidos: number;
    reunionesAgendadas: number;
    reunionesRealizadas: number;
    modelosCerradas: number;
  };
  tasasConversion: {
    contactoReunion: string;
    reunionCierre: string;
    agendadaRealizada: string;
  };
  promedioFacturacionModelosCerradas: string;
  modelosPorEstado: {
    [key in EstadoModeloCerrada]: number;
  };
  cantidadActividades: number;
  rangoFechas: {
    desde: string | null;
    hasta: string | null;
  };
}

export interface GeneralStats {
  totalesGenerales: {
    cuentasTexteadas: number;
    contactosObtenidos: number;
    reunionesRealizadas: number;
    modelosCerradas: number;
  };
  topSalesClosers: Array<{
    salesCloserId: string;
    nombre: string;
    modelos: number;
  }>;
  cantidadSalesClosers: number;
  cantidadActividades: number;
}

// Sales Closer (empleado)
export interface SalesCloser {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  cargoId: any;
  areaId: any;
  estado: string;
}

