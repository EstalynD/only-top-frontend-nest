/**
 * Tipos para el módulo de Traffic/Trafficker - Campañas de Marketing
 */

// ============= ENUMS =============
export enum PlataformaCampana {
  REDDIT_ORGANICO = 'REDDIT_ORGANICO',
  REDDIT_ADS = 'REDDIT_ADS',
  INSTAGRAM = 'INSTAGRAM',
  X_TWITTER = 'X_TWITTER',
  TIKTOK = 'TIKTOK',
  APP_DATES = 'APP_DATES',
}

export enum EstadoCampana {
  ACTIVA = 'ACTIVA',
  PAUSADA = 'PAUSADA',
  FINALIZADA = 'FINALIZADA',
}

export enum AcortadorURL {
  BITLY = 'BITLY',
  TINYURL = 'TINYURL',
  REBRANDLY = 'REBRANDLY',
  BLINK = 'BLINK',
  SHORT_IO = 'SHORT_IO',
  LINKTREE = 'LINKTREE',
  PICKLINK = 'PICKLINK',
  BEACONS = 'BEACONS',
}

// ============= SUBDOCUMENTOS =============
export type Segmentacion = {
  descripcion?: string;
  paises?: string[];
  regiones?: string[];
  edadObjetivo?: {
    min?: number;
    max?: number;
  };
  intereses?: string[];
};

export type PresupuestoCampana = {
  asignado: number;
  gastado: number;
  moneda: string;
};

// ============= ENTIDAD PRINCIPAL =============
export type TrafficCampaign = {
  _id: string;
  modeloId: {
    _id: string;
    nombre: string;
    apellido: string;
    dni?: string;
  };
  traffickerId: {
    _id: string;
    nombre: string;
    apellido: string;
  };
  plataforma: PlataformaCampana;
  segmentaciones?: Segmentacion;
  fechaActivacion: string;
  fechaPublicacion?: string;
  fechaFinalizacion?: string;
  presupuesto: PresupuestoCampana;
  estado: EstadoCampana;
  copyUtilizado?: string;
  linkPauta?: string;
  trackLinkOF?: string;
  acortadorUtilizado?: AcortadorURL;
  rendimiento?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
};

// ============= DTOs =============
export type CreateCampaignDto = {
  modeloId: string;
  traffickerId?: string; // ID del trafficker responsable (opcional)
  plataforma: PlataformaCampana;
  descripcionSegmentacion?: string;
  segmentaciones?: {
    paises?: string[];
    regiones?: string[];
    edadMin?: string;
    edadMax?: string;
    intereses?: string[];
  };
  fechaActivacion: string;
  fechaPublicacion?: string;
  fechaFinalizacion?: string;
  presupuestoAsignado: number;
  presupuestoGastado?: number;
  moneda?: string;
  estado: EstadoCampana;
  copyUtilizado?: string;
  linkPauta?: string;
  trackLinkOF?: string;
  acortadorUtilizado?: AcortadorURL;
  rendimiento?: string;
  notas?: string;
};

export type UpdateCampaignDto = Partial<CreateCampaignDto>;

export type FilterCampaignsDto = {
  modeloId?: string;
  traffickerId?: string;
  plataforma?: PlataformaCampana;
  estado?: EstadoCampana;
  fechaInicio?: string;
  fechaFin?: string;
  pais?: string;
};

// ============= RESPUESTAS =============
export type CampaignStatistics = {
  totalCampaigns: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  finishedCampaigns: number;
  totalBudgetAssigned: number;
  totalBudgetSpent: number;
  avgBudgetPerCampaign: number;
  campaignsByPlatform: Record<string, number>;
  topCountries: Array<{
    pais: string;
    campañas: number;
  }>;
};

export type CampaignsListResponse = {
  campaigns: TrafficCampaign[];
  total: number;
};

// ============= UI HELPERS =============
export const PLATAFORMA_LABELS: Record<PlataformaCampana, string> = {
  [PlataformaCampana.REDDIT_ORGANICO]: 'Reddit Orgánico',
  [PlataformaCampana.REDDIT_ADS]: 'Reddit Ads',
  [PlataformaCampana.INSTAGRAM]: 'Instagram',
  [PlataformaCampana.X_TWITTER]: 'X (Twitter)',
  [PlataformaCampana.TIKTOK]: 'TikTok',
  [PlataformaCampana.APP_DATES]: 'App Dates',
};

export const ESTADO_LABELS: Record<EstadoCampana, string> = {
  [EstadoCampana.ACTIVA]: 'Activa',
  [EstadoCampana.PAUSADA]: 'Pausada',
  [EstadoCampana.FINALIZADA]: 'Finalizada',
};

export const ESTADO_COLORS: Record<EstadoCampana, string> = {
  [EstadoCampana.ACTIVA]: '#10b981', // green
  [EstadoCampana.PAUSADA]: '#f59e0b', // amber
  [EstadoCampana.FINALIZADA]: '#6b7280', // gray
};

export const ACORTADOR_LABELS: Record<AcortadorURL, string> = {
  [AcortadorURL.BITLY]: 'Bitly',
  [AcortadorURL.TINYURL]: 'TinyURL',
  [AcortadorURL.REBRANDLY]: 'Rebrandly',
  [AcortadorURL.BLINK]: 'BLINK',
  [AcortadorURL.SHORT_IO]: 'Short.io',
  [AcortadorURL.LINKTREE]: 'Linktree',
  [AcortadorURL.PICKLINK]: 'Picklink',
  [AcortadorURL.BEACONS]: 'Beacons',
};

// ============= TRAFFICKER =============
export type Trafficker = {
  _id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  correoElectronico: string;
  correoCorporativo?: string | null;
  fotoPerfil?: string | null;
};
