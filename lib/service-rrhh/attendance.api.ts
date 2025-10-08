import { requestJSON } from '../utils/fetcher';

const ATTENDANCE_ROUTES = {
  mark: `/api/rrhh/attendance/mark`,
  adminMark: (userId: string) => `/api/rrhh/attendance/admin/mark/${userId}`,
  records: `/api/rrhh/attendance/records`,
  summary: (date: string) => `/api/rrhh/attendance/summary/${date}`,
  summaryToday: `/api/rrhh/attendance/summary/today`,
  timeRemaining: `/api/rrhh/attendance/time-remaining`,
  userSchedule: `/api/rrhh/attendance/user-schedule`,
  userScheduleById: (userId: string) => `/api/rrhh/attendance/user-schedule/${userId}`,
  report: `/api/rrhh/attendance/report`,
  adminRecords: (userId: string) => `/api/rrhh/attendance/admin/records/${userId}`,
  adminSummary: (userId: string, date: string) => `/api/rrhh/attendance/admin/summary/${userId}/${date}`,
  adminUserSchedule: (userId: string) => `/api/rrhh/attendance/admin/user-schedule/${userId}`,
  adminReport: (userId: string) => `/api/rrhh/attendance/admin/report/${userId}`,
  statsToday: `/api/rrhh/attendance/stats/today`
} as const;

export type AttendanceType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface AttendanceRecord {
  _id: string;
  userId: string;
  empleadoId: string | {
    _id: string;
    nombre: string;
    apellido: string;
    correoElectronico: string;
  };
  type: AttendanceType;
  timestamp: string;
  status: AttendanceStatus;
  shiftId?: string;
  areaId?: string | {
    _id: string;
    name: string;
    code: string;
  };
  cargoId?: string | {
    _id: string;
    name: string;
    code: string;
  };
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    platform: string;
  };
  markedBy?: string;
  markedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceRequest {
  type: AttendanceType;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
  };
}

export interface MarkAttendanceResponse {
  id: string;
  type: AttendanceType;
  timestamp: string;
  status: AttendanceStatus;
  message: string;
  empleadoNombre?: string;
  areaId?: string;
  cargoId?: string;
}

export interface AttendanceSummary {
  userId: string;
  empleadoId: string;
  empleadoNombre?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  workedHours: number;
  breakHours: number;
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes?: number;
  overtimeMinutes?: number;
  expectedHours?: number;
  scheduleName?: string;
  areaName?: string;
  cargoName?: string;
}

export interface TimeRemaining {
  minutesRemaining: number;
  deadline: string;
  isUrgent: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface FixedSchedule {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
  lunchBreakEnabled?: boolean;
  lunchBreak?: TimeSlot;
}

export interface RotatingShift {
  id: string;
  name: string;
  type: 'AM' | 'PM' | 'MADRUGADA' | 'CUSTOM';
  timeSlot: TimeSlot;
  description?: string;
  isActive: boolean;
}

export interface UserSchedule {
  userId: string;
  scheduleType: 'FIXED' | 'ROTATING' | null;
  assignedSchedule: {
    type: 'FIXED' | 'ROTATING' | 'DEFAULT';
    schedule: FixedSchedule | RotatingShift;
    name: string;
    description: string;
  };
  areaId: string;
  cargoId: string;
  toleranceMinutes: number;
  breakDurationMinutes: number;
}

export interface AttendanceStats {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  onBreak: number;
}

// === MARK ATTENDANCE ===

export function markAttendance(token: string, body: MarkAttendanceRequest) {
  return requestJSON<MarkAttendanceResponse>(ATTENDANCE_ROUTES.mark, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function markAttendanceForUser(token: string, userId: string, body: MarkAttendanceRequest) {
  return requestJSON<MarkAttendanceResponse>(ATTENDANCE_ROUTES.adminMark(userId), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === GET ATTENDANCE RECORDS ===

export function getUserAttendance(token: string, startDate?: string, endDate?: string, populate = false) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (populate) params.set('populate', 'true');
  
  const url = params.toString() 
    ? `${ATTENDANCE_ROUTES.records}?${params.toString()}`
    : ATTENDANCE_ROUTES.records;
    
  return requestJSON<AttendanceRecord[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAttendanceSummary(token: string, date: string) {
  return requestJSON<AttendanceSummary>(ATTENDANCE_ROUTES.summary(date), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getTodayAttendanceSummary(token: string) {
  return requestJSON<AttendanceSummary>(ATTENDANCE_ROUTES.summaryToday, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === TIME REMAINING ===

export function getTimeRemainingForCheckIn(token: string) {
  return requestJSON<TimeRemaining | null>(ATTENDANCE_ROUTES.timeRemaining, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === USER SCHEDULE ===

export function getUserSchedule(token: string) {
  return requestJSON<UserSchedule>(ATTENDANCE_ROUTES.userSchedule, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getUserScheduleByUserId(token: string, userId: string, opts?: { areaId?: string; cargoId?: string }) {
  const url = (() => {
    const base = ATTENDANCE_ROUTES.userScheduleById(userId);
    const params = new URLSearchParams();
    if (opts?.areaId) params.set('areaId', opts.areaId);
    if (opts?.cargoId) params.set('cargoId', opts.cargoId);
    return params.toString() ? `${base}?${params.toString()}` : base;
  })();
  return requestJSON<UserSchedule>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAdminUserScheduleByUserId(token: string, userId: string, opts?: { areaId?: string; cargoId?: string }) {
  const url = (() => {
    const base = ATTENDANCE_ROUTES.adminUserSchedule(userId);
    const params = new URLSearchParams();
    if (opts?.areaId) params.set('areaId', opts.areaId);
    if (opts?.cargoId) params.set('cargoId', opts.cargoId);
    return params.toString() ? `${base}?${params.toString()}` : base;
  })();
  return requestJSON<UserSchedule>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === REPORTS ===

export function getAttendanceReport(token: string, startDate: string, endDate: string) {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  
  const url = `${ATTENDANCE_ROUTES.report}?${params.toString()}`;
    
  return requestJSON<AttendanceSummary[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAdminAttendanceReport(token: string, userId: string, startDate: string, endDate: string) {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  const url = `${ATTENDANCE_ROUTES.adminReport(userId)}?${params.toString()}`;
  return requestJSON<AttendanceSummary[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === ADMIN ENDPOINTS ===

export function getAdminUserAttendance(token: string, userId: string, startDate?: string, endDate?: string, populate = false) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (populate) params.set('populate', 'true');
  
  const url = params.toString() 
    ? `${ATTENDANCE_ROUTES.adminRecords(userId)}?${params.toString()}`
    : ATTENDANCE_ROUTES.adminRecords(userId);
    
  return requestJSON<AttendanceRecord[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAdminAttendanceSummary(token: string, userId: string, date: string) {
  return requestJSON<AttendanceSummary>(ATTENDANCE_ROUTES.adminSummary(userId, date), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === STATS ===

export function getTodayStats(token: string) {
  return requestJSON<AttendanceStats>(ATTENDANCE_ROUTES.statsToday, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === CLIENT-SIDE UTILITIES ===

export function formatTime(date: Date | string | null | undefined, format12h = false): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const hh = d.getHours();
  const mm = d.getMinutes().toString().padStart(2, '0');
  
  if (format12h) {
    const period = hh >= 12 ? 'PM' : 'AM';
    const displayHours = hh % 12 || 12;
    return `${displayHours}:${mm} ${period}`;
  }
  
  return `${hh.toString().padStart(2, '0')}:${mm}`;
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT': return 'var(--ot-green-500)';
    case 'LATE': return 'var(--ot-yellow-500)';
    case 'ABSENT': return 'var(--ot-red-500)';
    case 'EXCUSED': return 'var(--ot-blue-500)';
    default: return 'var(--text-muted)';
  }
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT': return 'Presente';
    case 'LATE': return 'Tardanza';
    case 'ABSENT': return 'Ausente';
    case 'EXCUSED': return 'Justificado';
    default: return 'Desconocido';
  }
}

export function getTypeLabel(type: AttendanceType): string {
  switch (type) {
    case 'CHECK_IN': return 'Entrada';
    case 'CHECK_OUT': return 'Salida';
    case 'BREAK_START': return 'Inicio descanso';
    case 'BREAK_END': return 'Fin descanso';
    default: return type;
  }
}

export function calculateWorkProgress(checkIn?: string, expectedHours = 8): number {
  if (!checkIn) return 0;
  
  const start = new Date(checkIn);
  const now = new Date();
  const hoursWorked = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
  const progress = Math.min((hoursWorked / expectedHours) * 100, 100);
  
  return Math.round(progress);
}
