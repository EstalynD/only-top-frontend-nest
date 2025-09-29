import { requestJSON } from '../utils/fetcher';

export type ShiftType = 'AM' | 'PM' | 'MADRUGADA' | 'CUSTOM';

export interface TimeSlot {
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
}

export interface Shift {
  id: string;
  name: string;
  type: ShiftType;
  timeSlot: TimeSlot;
  description?: string;
  isActive: boolean;
}

export interface FixedSchedule {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

export interface AttendanceConfig {
  _id: string;
  key: string;
  fixedScheduleEnabled: boolean;
  rotatingShiftsEnabled: boolean;
  fixedSchedule?: FixedSchedule;
  rotatingShifts: Shift[];
  breakDurationMinutes: number;
  toleranceMinutes: number;
  weekendEnabled: boolean;
  overtimeEnabled: boolean;
  timezone?: string;
  description?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAttendanceConfigRequest {
  fixedScheduleEnabled?: boolean;
  rotatingShiftsEnabled?: boolean;
  fixedSchedule?: FixedSchedule;
  rotatingShifts?: Shift[];
  breakDurationMinutes?: number;
  toleranceMinutes?: number;
  weekendEnabled?: boolean;
  overtimeEnabled?: boolean;
  timezone?: string;
  description?: string;
}

export interface CreateShiftRequest {
  name: string;
  type: ShiftType;
  timeSlot: TimeSlot;
  description?: string;
  isActive?: boolean;
}

export interface UpdateShiftRequest {
  name?: string;
  type?: ShiftType;
  timeSlot?: TimeSlot;
  description?: string;
  isActive?: boolean;
}

export interface ShiftDurationResponse {
  durationMinutes: number;
  durationHours: number;
  isOvernight: boolean;
  formattedDuration: string;
}

const ATTENDANCE_ROUTES = {
  config: '/sistema/attendance/config',
  activeShifts: '/sistema/attendance/shifts/active',
  shiftByType: (type: string) => `/sistema/attendance/shifts/by-type/${type}`,
  shifts: '/sistema/attendance/shifts',
  shift: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}`,
  toggleShift: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}/toggle`,
  calculateDuration: '/sistema/attendance/calculate-duration',
  toggleFixedSchedule: '/sistema/attendance/fixed-schedule/toggle',
  toggleRotatingShifts: '/sistema/attendance/rotating-shifts/toggle',
} as const;

// === ATTENDANCE CONFIGURATION ===

export function getAttendanceConfig(token: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.config, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateAttendanceConfig(token: string, data: UpdateAttendanceConfigRequest) {
  const sanitized = deepOmitId(data);
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.config, {
    method: 'PUT',
    body: JSON.stringify(sanitized),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

function deepOmitId<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepOmitId) as unknown as T;
  if (typeof obj === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === '_id') continue;
      clone[k] = deepOmitId(v);
    }
    return clone as T;
  }
  return obj;
}

// === SHIFT MANAGEMENT ===

export function getActiveShifts(token: string) {
  return requestJSON<Shift[]>(ATTENDANCE_ROUTES.activeShifts, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getShiftByType(token: string, type: string) {
  return requestJSON<Shift | null>(ATTENDANCE_ROUTES.shiftByType(type), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function addShift(token: string, data: CreateShiftRequest) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.shifts, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateShift(token: string, shiftId: string, data: UpdateShiftRequest) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.shift(shiftId), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function deleteShift(token: string, shiftId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.shift(shiftId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function toggleShiftStatus(token: string, shiftId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.toggleShift(shiftId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === UTILITIES ===

export function calculateShiftDuration(token: string, timeSlot: TimeSlot) {
  return requestJSON<ShiftDurationResponse>(ATTENDANCE_ROUTES.calculateDuration, {
    method: 'POST',
    body: JSON.stringify(timeSlot),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function toggleFixedSchedule(token: string, enabled: boolean) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.toggleFixedSchedule, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function toggleRotatingShifts(token: string, enabled: boolean) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.toggleRotatingShifts, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === CLIENT-SIDE UTILITIES ===

export function formatTime(time: string | undefined | null): string {
  if (!time || typeof time !== 'string' || !isValidTimeFormat(time)) return '';
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatTimeRange(timeSlot: TimeSlot | undefined | null): string {
  if (!timeSlot) return '';
  return `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`;
}

export function calculateClientDuration(timeSlot: TimeSlot | undefined | null): { minutes: number; hours: number; isOvernight: boolean } {
  if (!timeSlot || !isValidTimeFormat(timeSlot.startTime) || !isValidTimeFormat(timeSlot.endTime)) {
    return { minutes: 0, hours: 0, isOvernight: false };
  }
  const startMinutes = timeToMinutes(timeSlot.startTime);
  const endMinutes = timeToMinutes(timeSlot.endTime);
  const isOvernight = endMinutes <= startMinutes;
  const minutes = isOvernight ? (24 * 60) - startMinutes + endMinutes : endMinutes - startMinutes;
  return {
    minutes,
    hours: Math.round((minutes / 60) * 100) / 100,
    isOvernight,
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

export function isValidTimeFormat(time: string | undefined | null): boolean {
  if (typeof time !== 'string') return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

export function timeToMinutes(time: string | undefined | null): number {
  if (!isValidTimeFormat(time)) return 0;
  const [hoursStr, minutesStr] = (time as string).split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getShiftTypeColor(type: ShiftType): string {
  switch (type) {
    case 'AM':
      return 'var(--ot-yellow-600)'; // Morning - Yellow/Orange
    case 'PM':
      return 'var(--ot-blue-600)';   // Afternoon - Blue
    case 'MADRUGADA':
      return 'var(--ot-purple-600)'; // Night - Purple
    case 'CUSTOM':
      return 'var(--ot-green-600)';  // Custom - Green
    default:
      return 'var(--text-muted)';
  }
}

export function getShiftTypeIcon(type: ShiftType): string {
  switch (type) {
    case 'AM':
      return '🌅'; // Sunrise
    case 'PM':
      return '🌆'; // Sunset
    case 'MADRUGADA':
      return '🌙'; // Moon
    case 'CUSTOM':
      return '⚙️'; // Gear
    default:
      return '🕐'; // Clock
  }
}

export function getDayName(day: keyof FixedSchedule): string {
  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };
  return dayNames[day];
}

export function validateShift(shift: CreateShiftRequest | UpdateShiftRequest): string[] {
  const errors: string[] = [];
  
  if ('name' in shift && (!shift.name || shift.name.trim().length < 3)) {
    errors.push('El nombre del turno debe tener al menos 3 caracteres');
  }
  
  if ('timeSlot' in shift && shift.timeSlot) {
    if (!isValidTimeFormat(shift.timeSlot.startTime)) {
      errors.push('Hora de inicio inválida. Use formato HH:mm (ej: 09:30)');
    }
    
    if (!isValidTimeFormat(shift.timeSlot.endTime)) {
      errors.push('Hora de fin inválida. Use formato HH:mm (ej: 17:30)');
    }
    
    if (isValidTimeFormat(shift.timeSlot.startTime) && isValidTimeFormat(shift.timeSlot.endTime)) {
      const duration = calculateClientDuration(shift.timeSlot);
      
      if (duration.minutes < 60) {
        errors.push('La duración del turno debe ser de al menos 1 hora');
      }
      
      if (duration.minutes > 12 * 60) {
        errors.push('La duración del turno no puede exceder 12 horas');
      }
    }
  }
  
  return errors;
}
