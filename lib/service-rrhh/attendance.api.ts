import { requestJSON } from '../utils/fetcher';

const ATTENDANCE_ROUTES = {
  mark: `/api/rrhh/attendance/mark`,
  adminMark: (userId: string) => `/api/rrhh/attendance/admin/mark/${userId}`,
  adminMarkEmployee: (employeeId: string) => `/api/rrhh/attendance/admin/mark-employee/${employeeId}`,
  records: `/api/rrhh/attendance/records`,
  summary: (date: string) => `/api/rrhh/attendance/summary/${date}`,
  summaryToday: `/api/rrhh/attendance/summary/today`,
  timeRemaining: `/api/rrhh/attendance/time-remaining`,
  userSchedule: `/api/rrhh/attendance/user-schedule`,
  userScheduleById: (userId: string) => `/api/rrhh/attendance/user-schedule/${userId}`,
  report: `/api/rrhh/attendance/report`,
  adminRecords: (userId: string) => `/api/rrhh/attendance/admin/records/${userId}`,
  adminRecordsByEmployee: (empleadoId: string) => `/api/rrhh/attendance/admin/records-by-employee/${empleadoId}`,
  adminSummary: (userId: string, date: string) => `/api/rrhh/attendance/admin/summary/${userId}/${date}`,
  adminUserSchedule: (userId: string) => `/api/rrhh/attendance/admin/user-schedule/${userId}`,
  adminReport: (userId: string) => `/api/rrhh/attendance/admin/report/${userId}`,
  statsToday: `/api/rrhh/attendance/stats/today`,
  
  // Endpoints para empleados (autoservicio)
  empleadoMarcar: `/api/rrhh/attendance/empleado/marcar`,
  empleadoMiResumen: `/api/rrhh/attendance/empleado/mi-resumen`,
  empleadoMiResumenFecha: (date: string) => `/api/rrhh/attendance/empleado/mi-resumen/${date}`,
  empleadoMisRegistros: `/api/rrhh/attendance/empleado/mis-registros`,
  empleadoMiHorario: `/api/rrhh/attendance/empleado/mi-horario`,
  empleadoEstadoActual: `/api/rrhh/attendance/empleado/estado-actual`,
  empleadoTiempoRestante: `/api/rrhh/attendance/empleado/tiempo-restante`,
  empleadoMiReporte: `/api/rrhh/attendance/empleado/mi-reporte`,
  empleadoJustificar: (recordId: string) => `/api/rrhh/attendance/empleado/justificar/${recordId}`,
  empleadoMisPendientes: `/api/rrhh/attendance/empleado/mis-pendientes`,
  
  // Endpoints de justificación admin
  adminJustificar: (recordId: string) => `/api/rrhh/attendance/admin/justificar/${recordId}`,
  adminPendientes: `/api/rrhh/attendance/admin/pendientes`,
  adminJustificaciones: `/api/rrhh/attendance/admin/justificaciones`,
  
  // Endpoints de exportación
  adminExportExcel: `/api/rrhh/attendance/admin/export/excel`,
  adminExportIndividual: (userId: string) => `/api/rrhh/attendance/admin/export/individual/${userId}`,
  adminExportTeam: `/api/rrhh/attendance/admin/export/team`
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
  // Justification fields
  justification?: string;
  justifiedBy?: string;
  justifiedByUserId?: string;
  justifiedAt?: string;
  justificationStatus?: 'PENDING' | 'JUSTIFIED' | 'REJECTED';
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
    modelosAsignados?: string[]; // Lista de modelos asignadas a este turno
  };
  areaId: string;
  cargoId: string;
  toleranceMinutes: number;
  breakDurationMinutes: number;
  isUsingDefaultSchedule?: boolean;
  configurationMessage?: string;
  multipleShifts?: boolean;
  allAssignedShifts?: Array<{
    type: 'ROTATING';
    schedule: RotatingShift;
    name: string;
    description: string;
    modelosAsignados?: string[]; // Lista de modelos asignadas a este turno
    status?: 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO'; // Estado del turno
    statusLabel?: string; // Etiqueta del estado (ej: "🟢 En Curso")
    statusDescription?: string; // Descripción del estado
  }>;
}

export interface AttendanceStats {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  onBreak: number;
}

export interface CurrentAttendanceStatus {
  lastRecord: {
    id: string;
    type: AttendanceType;
    timestamp: string;
    status: AttendanceStatus;
    notes?: string;
  } | null;
  nextExpectedType: AttendanceType | null;
  todayRecords: Array<{
    id: string;
    type: AttendanceType;
    timestamp: string;
    status: AttendanceStatus;
  }>;
  summary: AttendanceSummary;
  scheduleInfo: UserSchedule | null;
  canMarkAttendance: boolean;
  allowedTypes: AttendanceType[];
}

export interface ReplacementInfo {
  isSupernumerary: boolean;
  replacementMode: boolean;
  currentShift?: {
    id: string;
    name: string;
    type: 'AM' | 'PM' | 'MADRUGADA' | 'CUSTOM';
    timeSlot: TimeSlot;
    description?: string;
  } | null;
  primaryEmployee?: {
    id: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    correoElectronico: string;
  } | null;
  message?: string;
}

// Justification interfaces
export interface JustificationRequest {
  justification: string;
}

export interface AdminJustificationRequest extends JustificationRequest {
  status: 'JUSTIFIED' | 'REJECTED';
}

export interface JustificationResponse {
  id: string;
  justification: string;
  justificationStatus: 'JUSTIFIED' | 'REJECTED';
  justifiedBy?: string;
  justifiedAt: string;
  message: string;
}

export interface ExportFilters {
  startDate: string;
  endDate: string;
  areaId?: string;
  cargoId?: string;
  userId?: string;
  status?: string;
  hasJustification?: boolean;
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

export function markAttendanceForEmployee(token: string, employeeId: string, body: MarkAttendanceRequest) {
  return requestJSON<MarkAttendanceResponse>(ATTENDANCE_ROUTES.adminMarkEmployee(employeeId), {
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

export function getAdminEmployeeAttendance(token: string, empleadoId: string, startDate?: string, endDate?: string, populate = false) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (populate) params.set('populate', 'true');
  
  const url = params.toString() 
    ? `${ATTENDANCE_ROUTES.adminRecordsByEmployee(empleadoId)}?${params.toString()}`
    : ATTENDANCE_ROUTES.adminRecordsByEmployee(empleadoId);
    
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

// === EMPLEADO ENDPOINTS (AUTOSERVICIO) ===

/**
 * Marcar asistencia del empleado autenticado
 */
export function empleadoMarcarAsistencia(token: string, body: MarkAttendanceRequest) {
  return requestJSON<MarkAttendanceResponse>(ATTENDANCE_ROUTES.empleadoMarcar, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener estado actual de asistencia del empleado
 */
export function empleadoObtenerEstadoActual(token: string) {
  return requestJSON<CurrentAttendanceStatus>(ATTENDANCE_ROUTES.empleadoEstadoActual, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener información de reemplazo (turno activo y empleado principal)
 * Solo aplica para supernumerarios en modo REPLACEMENT
 */
export function empleadoObtenerInfoReemplazo(token: string) {
  return requestJSON<ReplacementInfo>(`/api/rrhh/attendance/empleado/info-reemplazo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener resumen del día actual
 */
export function empleadoObtenerMiResumenHoy(token: string) {
  return requestJSON<AttendanceSummary>(ATTENDANCE_ROUTES.empleadoMiResumen, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener resumen de fecha específica
 */
export function empleadoObtenerMiResumen(token: string, date: string) {
  return requestJSON<AttendanceSummary>(ATTENDANCE_ROUTES.empleadoMiResumenFecha(date), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener registros del empleado con filtros
 */
export function empleadoObtenerMisRegistros(
  token: string, 
  params?: {
    startDate?: string;
    endDate?: string;
    populate?: boolean;
  }
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.populate) queryParams.append('populate', 'true');
  
  const url = queryParams.toString() 
    ? `${ATTENDANCE_ROUTES.empleadoMisRegistros}?${queryParams.toString()}`
    : ATTENDANCE_ROUTES.empleadoMisRegistros;
    
  return requestJSON<AttendanceRecord[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener horario asignado del empleado
 */
export function empleadoObtenerMiHorario(token: string) {
  return requestJSON<UserSchedule>(ATTENDANCE_ROUTES.empleadoMiHorario, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener tiempo restante para check-in
 */
export function empleadoObtenerTiempoRestante(token: string) {
  return requestJSON<TimeRemaining | null>(ATTENDANCE_ROUTES.empleadoTiempoRestante, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener reporte del empleado
 */
export function empleadoObtenerMiReporte(token: string, startDate: string, endDate: string) {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  
  const url = `${ATTENDANCE_ROUTES.empleadoMiReporte}?${params.toString()}`;
    
  return requestJSON<AttendanceSummary[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === JUSTIFICATION FUNCTIONS ===

/**
 * Justificar un registro de asistencia del empleado autenticado
 */
export function empleadoJustificarAsistencia(token: string, recordId: string, body: JustificationRequest) {
  return requestJSON<JustificationResponse>(ATTENDANCE_ROUTES.empleadoJustificar(recordId), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener registros pendientes de justificación del empleado autenticado
 */
export function empleadoObtenerMisPendientes(token: string) {
  return requestJSON<AttendanceRecord[]>(ATTENDANCE_ROUTES.empleadoMisPendientes, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Justificar un registro de asistencia (admin)
 */
export function adminJustificarAsistencia(token: string, recordId: string, body: AdminJustificationRequest) {
  return requestJSON<JustificationResponse>(ATTENDANCE_ROUTES.adminJustificar(recordId), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener registros pendientes de justificación (admin)
 */
export function adminObtenerPendientes(token: string, filters?: {
  areaId?: string;
  cargoId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.areaId) params.append('areaId', filters.areaId);
  if (filters?.cargoId) params.append('cargoId', filters.cargoId);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const url = params.toString() 
    ? `${ATTENDANCE_ROUTES.adminPendientes}?${params.toString()}`
    : ATTENDANCE_ROUTES.adminPendientes;
    
  return requestJSON<AttendanceRecord[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

/**
 * Obtener historial de justificaciones (admin)
 */
export function adminObtenerJustificaciones(token: string, filters?: {
  areaId?: string;
  cargoId?: string;
  userId?: string;
  status?: string;
  justificationStatus?: string;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.areaId) params.append('areaId', filters.areaId);
  if (filters?.cargoId) params.append('cargoId', filters.cargoId);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.justificationStatus) params.append('justificationStatus', filters.justificationStatus);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const url = params.toString() 
    ? `${ATTENDANCE_ROUTES.adminJustificaciones}?${params.toString()}`
    : ATTENDANCE_ROUTES.adminJustificaciones;
    
  return requestJSON<AttendanceRecord[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === EXPORT FUNCTIONS ===

/**
 * Exportar registros de asistencia a Excel (admin)
 */
export async function adminExportarExcel(token: string, filters: ExportFilters): Promise<void> {
  const params = new URLSearchParams();
  params.set('startDate', filters.startDate);
  params.set('endDate', filters.endDate);
  if (filters.areaId) params.set('areaId', filters.areaId);
  if (filters.cargoId) params.set('cargoId', filters.cargoId);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.status) params.set('status', filters.status);
  if (filters.hasJustification !== undefined) params.set('hasJustification', filters.hasJustification.toString());

  const url = `${ATTENDANCE_ROUTES.adminExportExcel}?${params.toString()}`;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al exportar Excel: ${errorText || response.statusText}`);
    }

    // Get filename from Content-Disposition header or create default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `asistencia_${filters.startDate}_${filters.endDate}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Download the Excel file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
}

/**
 * Exportar resumen individual a Excel (admin)
 */
export async function adminExportarIndividual(token: string, userId: string, startDate: string, endDate: string): Promise<void> {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);

  const url = `${ATTENDANCE_ROUTES.adminExportIndividual(userId)}?${params.toString()}`;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al exportar Excel individual: ${errorText || response.statusText}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `asistencia_individual_${userId}_${startDate}_${endDate}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error exporting individual Excel:', error);
    throw error;
  }
}

/**
 * Exportar reporte de equipo a Excel (admin)
 */
export async function adminExportarEquipo(token: string, startDate: string, endDate: string, areaId?: string, cargoId?: string): Promise<void> {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  if (areaId) params.set('areaId', areaId);
  if (cargoId) params.set('cargoId', cargoId);

  const url = `${ATTENDANCE_ROUTES.adminExportTeam}?${params.toString()}`;

  try {
    const response = await fetch(requestJSON.base(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al exportar Excel de equipo: ${errorText || response.statusText}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    const teamType = areaId ? 'area' : cargoId ? 'cargo' : 'equipo';
    let filename = `asistencia_${teamType}_${startDate}_${endDate}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error exporting team Excel:', error);
    throw error;
  }
}

// ========== ADMIN: EMPLOYEES WITH SCHEDULE ==========

export interface EmployeeWithSchedule {
  _id: string;
  userId: string | null;
  empleadoId: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  numeroIdentificacion: string;
  telefono: string;
  area: {
    _id: string;
    name: string;
    code: string;
    color?: string;
  };
  cargo: {
    _id: string;
    name: string;
    code: string;
    hierarchyLevel?: number;
  };
  schedule: {
    type: 'FIXED' | 'ROTATING' | 'ROTATING_SUPERNUMERARY' | 'FIXED_SUPERNUMERARY' | 'DEFAULT';
    schedule: any;
    name: string;
    description: string;
    isSupernumerary: boolean;
    hasMultipleShifts: boolean;
    activeShifts: Array<{
      shiftId: string;
      name: string;
      type: string;
      startTime: string;
      endTime: string;
      status: 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO';
    }>;
  };
  attendanceConfig: {
    toleranceMinutes: number;
    breakDurationMinutes: number;
    enabledFrom: Date | null;
  };
  currentAttendance?: {
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    hasActiveBreak: boolean;
    allowedTypes: string[];
    todayRecords: any[];
  };
  attendanceStatus?: {
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    isLate: boolean;
    lateMinutes?: number;
    checkIn?: string;
    checkOut?: string;
  };
  estado: string;
  fechaInicio: Date;
  fotoPerfil?: string;
}

export interface AdminEmployeesWithScheduleResponse {
  success: boolean;
  total: number;
  employees: EmployeeWithSchedule[];
  timestamp: string;
}

/**
 * Endpoint administrativo optimizado para obtener todos los empleados con su información de horario
 * Evita llamadas repetitivas y consultas innecesarias
 */
export function adminObtenerEmpleadosConHorarios(token: string) {
  return requestJSON<AdminEmployeesWithScheduleResponse>('/api/rrhh/attendance/admin/employees-with-schedule', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

