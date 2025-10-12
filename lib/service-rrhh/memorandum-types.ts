/**
 * Tipos para el Sistema de Memorandos
 */

export type MemorandumStatus = 
  | 'PENDIENTE' 
  | 'SUBSANADO' 
  | 'EN_REVISIÓN' 
  | 'APROBADO' 
  | 'RECHAZADO' 
  | 'CERRADO' 
  | 'EXPIRADO';

export type MemorandumType = 
  | 'LLEGADA_TARDE' 
  | 'SALIDA_ANTICIPADA' 
  | 'AUSENCIA' 
  | 'SALIDA_OMITIDA';

export interface StatusHistoryEntry {
  status: MemorandumStatus;
  timestamp: Date;
  changedBy: string;
  reason?: string;
}

export interface Memorandum {
  _id: string;
  memorandumCode: string;
  userId: string;
  empleadoId: string | { _id: string; nombre: string; apellido: string; correoElectronico: string };
  employeeName: string;
  areaId?: string;
  cargoId?: string;
  type: MemorandumType;
  status: MemorandumStatus;
  attendanceRecordId: string;
  incidentDate: Date;
  expectedTime?: Date;
  actualTime?: Date;
  delayMinutes?: number;
  earlyMinutes?: number;
  shiftId?: string;
  shiftName?: string;
  description: string;
  subsanationDeadline: Date;
  employeeJustification?: string;
  attachments: string[];
  reviewedBy?: string;
  reviewedByUserId?: string;
  reviewDate?: Date;
  reviewComments?: string;
  affectsRecord: boolean;
  statusHistory: StatusHistoryEntry[];
  createdBy: string;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubsaneMemorandumDto {
  justification: string;
  attachments?: string[];
}

export interface ReviewMemorandumDto {
  approved: boolean;
  comments: string;
  affectsRecord?: boolean;
}

export interface MemorandumStats {
  total: number;
  byStatus: Record<MemorandumStatus, number>;
  byType: Record<MemorandumType, number>;
  avgResponseTime?: number;
  pendingReview: number;
  expired: number;
  affectingRecord: number;
}

export interface MemorandumFilters {
  status?: MemorandumStatus;
  type?: MemorandumType;
  startDate?: string;
  endDate?: string;
  areaId?: string;
  cargoId?: string;
  userId?: string; // NUEVO: Para filtrar por usuario específico (admin)
}

// Helpers para UI
export function getMemorandumStatusLabel(status: MemorandumStatus): string {
  const labels: Record<MemorandumStatus, string> = {
    'PENDIENTE': 'Pendiente',
    'SUBSANADO': 'Subsanado',
    'EN_REVISIÓN': 'En Revisión',
    'APROBADO': 'Aprobado',
    'RECHAZADO': 'Rechazado',
    'CERRADO': 'Cerrado',
    'EXPIRADO': 'Expirado'
  };
  return labels[status];
}

export function getMemorandumStatusColor(status: MemorandumStatus): string {
  const colors: Record<MemorandumStatus, string> = {
    'PENDIENTE': 'yellow',
    'SUBSANADO': 'blue',
    'EN_REVISIÓN': 'purple',
    'APROBADO': 'green',
    'RECHAZADO': 'red',
    'CERRADO': 'gray',
    'EXPIRADO': 'orange'
  };
  return colors[status];
}

export function getMemorandumTypeLabel(type: MemorandumType): string {
  const labels: Record<MemorandumType, string> = {
    'LLEGADA_TARDE': 'Llegada Tarde',
    'SALIDA_ANTICIPADA': 'Salida Anticipada',
    'AUSENCIA': 'Ausencia',
    'SALIDA_OMITIDA': 'Salida Omitida'
  };
  return labels[type];
}

export function getMemorandumTypeIcon(type: MemorandumType): string {
  const icons: Record<MemorandumType, string> = {
    'LLEGADA_TARDE': '🕐',
    'SALIDA_ANTICIPADA': '🏃',
    'AUSENCIA': '❌',
    'SALIDA_OMITIDA': '🚪'
  };
  return icons[type];
}

export function canBeSubsaned(memorandum: Memorandum): boolean {
  if (memorandum.status !== 'PENDIENTE') return false;
  const deadline = new Date(memorandum.subsanationDeadline);
  const now = new Date();
  return now < deadline;
}

export function isExpired(memorandum: Memorandum): boolean {
  const deadline = new Date(memorandum.subsanationDeadline);
  const now = new Date();
  return now > deadline && memorandum.status === 'PENDIENTE';
}

export function getDaysRemaining(deadline: Date | string): number {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDeadlineWarning(deadline: Date | string): string {
  const days = getDaysRemaining(deadline);
  
  if (days < 0) return 'Plazo vencido';
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  return `Vence en ${days} días`;
}
