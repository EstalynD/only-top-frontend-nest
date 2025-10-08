// Types for Chatter Goals

export enum GoalStatus {
  ACTIVA = 'ACTIVA',
  COMPLETADA = 'COMPLETADA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
}

export interface GoalNotificationRecord {
  percentage: number;
  sentAt: string;
  message: string;
  recipients: string[];
}

export interface ChatterGoal {
  _id: string;
  modeloId: {
    _id: string;
    nombreCompleto: string;
    correoElectronico: string;
    fotoPerfil?: string;
    estado: string;
  };
  montoObjetivo: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  estado: GoalStatus;
  montoActual: number;
  porcentajeCumplimiento: number;
  ultimaActualizacion?: string;
  nivelesNotificacion: number[];
  notificacionesActivas: boolean;
  notificacionesEnviadas: GoalNotificationRecord[];
  descripcion?: string;
  notas?: string;
  creadoPor?: {
    _id: string;
    username: string;
    displayName: string;
  };
  montoFinal?: number;
  porcentajeFinal?: number;
  fechaCierre?: string;
  cerradoPor?: {
    _id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatterGoalDto {
  modeloId: string;
  montoObjetivo: number;
  moneda?: string;
  fechaInicio: string;
  fechaFin: string;
  nivelesNotificacion?: number[];
  notificacionesActivas?: boolean;
  descripcion?: string;
  notas?: string;
}

export interface UpdateChatterGoalDto {
  montoObjetivo?: number;
  moneda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: GoalStatus;
  nivelesNotificacion?: number[];
  notificacionesActivas?: boolean;
  descripcion?: string;
  notas?: string;
}

export interface CloseChatterGoalDto {
  notas?: string;
}

export interface FilterChatterGoalsDto {
  modeloId?: string;
  estado?: GoalStatus;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface GoalProgress {
  goal: ChatterGoal;
  currentAmount: number;
  percentage: number;
  remaining: number;
  daysRemaining: number;
  shouldNotify: boolean;
  nextNotificationLevel?: number;
}

export interface GoalStatistics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  cancelledGoals: number;
  goalsAchieved: number;
  achievementRate: number;
  avgCompletion: number;
}

