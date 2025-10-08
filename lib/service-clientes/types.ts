// Tipos e interfaces para el módulo de clientes/modelos

export type TipoDocumento =
  | 'CEDULA_CIUDADANIA'
  | 'CEDULA_EXTRANJERIA'
  | 'PASAPORTE'
  | 'PPT'
  | 'ID_EXTRANJERO'
  | 'OTRO';

export type PlataformaContenido =
  | 'ONLYFANS'
  | 'FANSLY'
  | 'MANYVIDS'
  | 'F2F'
  | 'JUSTFORFANS'
  | 'FANCENTRO'
  | 'OTRAS';

export type TipoTrafico =
  | 'REDDIT_ORGANICO'
  | 'REDDIT_ADS'
  | 'PAUTA_RRSS'
  | 'RRSS_ORGANICO'
  | 'DATING_APPS';

export type EstadoModelo = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA' | 'TERMINADA';

export interface CuentaPlataforma {
  plataforma: PlataformaContenido;
  links: string[];
  notas?: string;
}

export interface RedSocial {
  plataforma: string;
  link: string;
  username?: string;
}

export interface FuenteTrafico {
  tipo: TipoTrafico;
  activo: boolean;
  inversionUSD?: number;
  porcentaje?: number;
  notas?: string;
}

export interface FacturacionMensual {
  mes: number;
  anio: number;
  monto: number;
  moneda: string;
}

export interface EquipoChatters {
  turnoAM: string;
  turnoPM: string;
  turnoMadrugada: string;
  supernumerario: string;
}

export interface EmpleadoBasico {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefono?: string;
}

export interface Modelo {
  _id: string;
  nombreCompleto: string;
  numeroIdentificacion: string;
  tipoDocumento: TipoDocumento;
  telefono: string;
  correoElectronico: string;
  fechaNacimiento: string | Date;
  paisResidencia: string;
  ciudadResidencia: string;
  plataformas: CuentaPlataforma[];
  redesSociales: RedSocial[];
  facturacionHistorica: FacturacionMensual[];
  promedioFacturacionMensual: number;
  fuentesTrafico: FuenteTrafico[];
  salesCloserAsignado: string | EmpleadoBasico;
  equipoChatters: EquipoChatters | {
    turnoAM: EmpleadoBasico;
    turnoPM: EmpleadoBasico;
    turnoMadrugada: EmpleadoBasico;
    supernumerario: EmpleadoBasico;
  };
  traffickerAsignado: string | EmpleadoBasico;
  linkFormularioRegistro?: string;
  fotoPerfil?: string;
  fotoPerfilPublicId?: string;
  estado: EstadoModelo;
  fechaRegistro: string | Date;
  fechaInicio?: string | Date;
  fechaTerminacion?: string | Date;
  notasInternas?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateModeloDto {
  nombreCompleto: string;
  numeroIdentificacion: string;
  tipoDocumento: TipoDocumento;
  telefono: string;
  correoElectronico: string;
  fechaNacimiento: string;
  paisResidencia: string;
  ciudadResidencia: string;
  plataformas?: CuentaPlataforma[];
  redesSociales?: RedSocial[];
  facturacionHistorica?: FacturacionMensual[];
  fuentesTrafico?: FuenteTrafico[];
  salesCloserAsignado: string;
  equipoChatters: EquipoChatters;
  traffickerAsignado: string;
  linkFormularioRegistro?: string;
  fotoPerfil?: string;
  fotoPerfilPublicId?: string;
  fechaInicio?: string;
  notasInternas?: string;
  estado?: EstadoModelo;
}

export interface UpdateModeloDto extends Partial<CreateModeloDto> {}

export interface ModelosStats {
  totalModelos: number;
  modelosActivas: number;
  modelosInactivas: number;
  promedioFacturacionMensual: number;
  modelosPorSalesCloser: Array<{ empleado: string; count: number }>;
  modelosPorTrafficker: Array<{ empleado: string; count: number }>;
}

export interface UploadPhotoResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
  };
}

export interface EmpleadosDisponibles {
  chatters: EmpleadoBasico[];
  supernumerarios: EmpleadoBasico[];
  todos: EmpleadoBasico[];
}

