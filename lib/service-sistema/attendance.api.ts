import { requestJSON } from '../utils/fetcher';

export type ShiftType = 'AM' | 'PM' | 'MADRUGADA' | 'CUSTOM';
export type SupernumeraryMode = 'REPLACEMENT' | 'FIXED_SCHEDULE';

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
  assignedAreas?: string[]; // IDs de áreas asignadas al turno
  assignedCargos?: string[]; // IDs de cargos asignados al turno
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
  assignedAreas?: string[]; // IDs de áreas asignadas al horario fijo
  assignedCargos?: string[]; // IDs de cargos asignados al horario fijo
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
  attendanceEnabledFrom?: string | null;
  // Configuración de supernumerarios
  supernumeraryMode: SupernumeraryMode;
  allowedReplacementShifts: string[];
  supernumeraryFixedSchedule?: FixedSchedule;
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
  attendanceEnabledFrom?: string | null;
  // Configuración de supernumerarios
  supernumeraryMode?: SupernumeraryMode;
  allowedReplacementShifts?: string[];
  supernumeraryFixedSchedule?: FixedSchedule;
}

export interface CreateShiftRequest {
  name: string;
  type: ShiftType;
  timeSlot: TimeSlot;
  description?: string;
  isActive?: boolean;
  assignedAreas?: string[];
  assignedCargos?: string[];
}

export interface UpdateShiftRequest {
  name?: string;
  type?: ShiftType;
  timeSlot?: TimeSlot;
  description?: string;
  isActive?: boolean;
  assignedAreas?: string[];
  assignedCargos?: string[];
}

export interface ShiftDurationResponse {
  durationMinutes: number;
  durationHours: number;
  isOvernight: boolean;
  formattedDuration: string;
}

export interface ShiftAssignmentsResponse {
  assignedAreas: string[];
  assignedCargos: string[];
}

export interface AssignAreasRequest {
  areaIds: string[];
}

export interface AssignCargosRequest {
  cargoIds: string[];
}

export interface FixedScheduleAssignmentsResponse {
  assignedAreas: string[];
  assignedCargos: string[];
}

export interface AssignToFixedScheduleRequest {
  areaIds?: string[];
  cargoIds?: string[];
}

export type ScheduleType = 'FIXED' | 'ROTATING';

const ATTENDANCE_ROUTES = {
  config: '/sistema/attendance/config',
  attendanceEnabledFrom: '/sistema/attendance/enabled-from',
  activeShifts: '/sistema/attendance/shifts/active',
  shiftByType: (type: string) => `/sistema/attendance/shifts/by-type/${type}`,
  shifts: '/sistema/attendance/shifts',
  shift: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}`,
  toggleShift: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}/toggle`,
  calculateDuration: '/sistema/attendance/calculate-duration',
  toggleFixedSchedule: '/sistema/attendance/fixed-schedule/toggle',
  toggleRotatingShifts: '/sistema/attendance/rotating-shifts/toggle',
  // Area and Cargo assignments
  assignAreas: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}/assign-areas`,
  assignCargos: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}/assign-cargos`,
  removeArea: (shiftId: string, areaId: string) => `/sistema/attendance/shifts/${shiftId}/areas/${areaId}`,
  removeCargo: (shiftId: string, cargoId: string) => `/sistema/attendance/shifts/${shiftId}/cargos/${cargoId}`,
  shiftAssignments: (shiftId: string) => `/sistema/attendance/shifts/${shiftId}/assignments`,
  shiftsByArea: (areaId: string) => `/sistema/attendance/shifts/by-area/${areaId}`,
  shiftsByCargo: (cargoId: string) => `/sistema/attendance/shifts/by-cargo/${cargoId}`,
  // Fixed schedule assignments
  fixedScheduleAssignments: '/sistema/attendance/fixed-schedule/assignments',
  assignToFixedSchedule: '/sistema/attendance/fixed-schedule/assign',
  removeAreaFromFixed: (areaId: string) => `/sistema/attendance/fixed-schedule/areas/${areaId}`,
  removeCargoFromFixed: (cargoId: string) => `/sistema/attendance/fixed-schedule/cargos/${cargoId}`,
  // Unified assignment methods
  assignmentsByType: (scheduleType: string) => `/sistema/attendance/assignments/${scheduleType}`,
  assignByType: (scheduleType: string) => `/sistema/attendance/assign/${scheduleType}`,
} as const;

// === ATTENDANCE CONFIGURATION ===

export function getAttendanceConfig(token: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.config, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateAttendanceConfig(token: string, data: UpdateAttendanceConfigRequest) {
  const sanitized = deepOmitKeys(data, ['_id', 'assignedAreas', 'assignedCargos']);
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.config, {
    method: 'PUT',
    body: JSON.stringify(sanitized),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === ENABLED-FROM MANAGEMENT ===
export function getAttendanceEnabledFrom(token: string) {
  return requestJSON<{ attendanceEnabledFrom: string | null }>(ATTENDANCE_ROUTES.attendanceEnabledFrom, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function setAttendanceEnabledFrom(token: string, attendanceEnabledFrom: string | null) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.attendanceEnabledFrom, {
    method: 'PUT',
    body: JSON.stringify({ attendanceEnabledFrom }),
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

// El backend usa ValidationPipe con whitelist/forbidNonWhitelisted. No permite assignedAreas/assignedCargos en UpdateAttendanceConfigDto.
function deepOmitKeys<T>(obj: T, keys: string[]): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((i) => deepOmitKeys(i, keys)) as unknown as T;
  if (typeof obj === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (keys.includes(k)) continue;
      clone[k] = deepOmitKeys(v, keys);
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

// === AREA AND CARGO ASSIGNMENTS ===

export function assignAreasToShift(token: string, shiftId: string, data: AssignAreasRequest) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.assignAreas(shiftId), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function assignCargosToShift(token: string, shiftId: string, data: AssignCargosRequest) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.assignCargos(shiftId), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function removeAreaFromShift(token: string, shiftId: string, areaId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.removeArea(shiftId, areaId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function removeCargoFromShift(token: string, shiftId: string, cargoId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.removeCargo(shiftId, cargoId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getShiftAssignments(token: string, shiftId: string) {
  return requestJSON<ShiftAssignmentsResponse>(ATTENDANCE_ROUTES.shiftAssignments(shiftId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getShiftsByArea(token: string, areaId: string) {
  return requestJSON<Shift[]>(ATTENDANCE_ROUTES.shiftsByArea(areaId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getShiftsByCargo(token: string, cargoId: string) {
  return requestJSON<Shift[]>(ATTENDANCE_ROUTES.shiftsByCargo(cargoId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === FIXED SCHEDULE ASSIGNMENTS ===

export function getFixedScheduleAssignments(token: string) {
  return requestJSON<FixedScheduleAssignmentsResponse>(ATTENDANCE_ROUTES.fixedScheduleAssignments, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function assignToFixedSchedule(token: string, data: AssignToFixedScheduleRequest) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.assignToFixedSchedule, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function removeAreaFromFixedSchedule(token: string, areaId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.removeAreaFromFixed(areaId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function removeCargoFromFixedSchedule(token: string, cargoId: string) {
  return requestJSON<AttendanceConfig>(ATTENDANCE_ROUTES.removeCargoFromFixed(cargoId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// === UNIFIED ASSIGNMENT METHODS ===

export function getAssignmentsByScheduleType(token: string, scheduleType: ScheduleType, shiftId?: string) {
  const url = scheduleType === 'FIXED' 
    ? ATTENDANCE_ROUTES.fixedScheduleAssignments
    : ATTENDANCE_ROUTES.shiftAssignments(shiftId!);
    
  return requestJSON<ShiftAssignmentsResponse | FixedScheduleAssignmentsResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function assignByScheduleType(token: string, scheduleType: ScheduleType, data: AssignToFixedScheduleRequest | AssignAreasRequest | AssignCargosRequest, shiftId?: string) {
  let url: string;
  let body: any;
  
  if (scheduleType === 'FIXED') {
    url = ATTENDANCE_ROUTES.assignToFixedSchedule;
    body = data;
  } else {
    if ('areaIds' in data) {
      url = ATTENDANCE_ROUTES.assignAreas(shiftId!);
      body = data;
    } else if ('cargoIds' in data) {
      url = ATTENDANCE_ROUTES.assignCargos(shiftId!);
      body = data;
    } else {
      throw new Error('Invalid data for rotating schedule assignment');
    }
  }
  
  return requestJSON<AttendanceConfig>(url, {
    method: 'POST',
    body: JSON.stringify(body),
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

export function getDayName(day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'): string {
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

// === ASSIGNMENT UTILITIES ===

export function hasAreaAssigned(shift: Shift, areaId: string): boolean {
  return shift.assignedAreas?.includes(areaId) ?? false;
}

export function hasCargoAssigned(shift: Shift, cargoId: string): boolean {
  return shift.assignedCargos?.includes(cargoId) ?? false;
}

export function getAssignedAreasCount(shift: Shift): number {
  return shift.assignedAreas?.length ?? 0;
}

export function getAssignedCargosCount(shift: Shift): number {
  return shift.assignedCargos?.length ?? 0;
}

export function formatAssignmentsSummary(shift: Shift): string {
  const areasCount = getAssignedAreasCount(shift);
  const cargosCount = getAssignedCargosCount(shift);
  
  if (areasCount === 0 && cargosCount === 0) {
    return 'Sin asignaciones';
  }
  
  const parts: string[] = [];
  if (areasCount > 0) {
    parts.push(`${areasCount} área${areasCount > 1 ? 's' : ''}`);
  }
  if (cargosCount > 0) {
    parts.push(`${cargosCount} cargo${cargosCount > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

export function validateAssignments(areaIds: string[], cargoIds: string[]): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(areaIds)) {
    errors.push('Los IDs de áreas deben ser un array');
  }
  
  if (!Array.isArray(cargoIds)) {
    errors.push('Los IDs de cargos deben ser un array');
  }
  
  if (areaIds.length === 0 && cargoIds.length === 0) {
    errors.push('Debe asignar al menos un área o cargo');
  }
  
  return errors;
}

// === FIXED SCHEDULE UTILITIES ===

export function hasAreaAssignedToFixed(fixedSchedule: FixedSchedule | undefined | null, areaId: string): boolean {
  return fixedSchedule?.assignedAreas?.includes(areaId) ?? false;
}

export function hasCargoAssignedToFixed(fixedSchedule: FixedSchedule | undefined | null, cargoId: string): boolean {
  return fixedSchedule?.assignedCargos?.includes(cargoId) ?? false;
}

export function getFixedScheduleAssignmentsCount(fixedSchedule: FixedSchedule | undefined | null): { areas: number; cargos: number } {
  return {
    areas: fixedSchedule?.assignedAreas?.length ?? 0,
    cargos: fixedSchedule?.assignedCargos?.length ?? 0
  };
}

export function formatFixedScheduleAssignmentsSummary(fixedSchedule: FixedSchedule | undefined | null): string {
  const counts = getFixedScheduleAssignmentsCount(fixedSchedule);
  
  if (counts.areas === 0 && counts.cargos === 0) {
    return 'Sin asignaciones';
  }
  
  const parts: string[] = [];
  if (counts.areas > 0) {
    parts.push(`${counts.areas} área${counts.areas > 1 ? 's' : ''}`);
  }
  if (counts.cargos > 0) {
    parts.push(`${counts.cargos} cargo${counts.cargos > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

// === UNIFIED UTILITIES ===

export function getScheduleTypeDisplayName(scheduleType: ScheduleType): string {
  switch (scheduleType) {
    case 'FIXED':
      return 'Horario Fijo';
    case 'ROTATING':
      return 'Turnos Rotativos';
    default:
      return 'Desconocido';
  }
}

export function getScheduleTypeIcon(scheduleType: ScheduleType): string {
  switch (scheduleType) {
    case 'FIXED':
      return '🕐'; // Clock
    case 'ROTATING':
      return '🔄'; // Rotating arrows
    default:
      return '❓'; // Question mark
  }
}

export function validateScheduleTypeAssignment(scheduleType: ScheduleType, shiftId?: string): string[] {
  const errors: string[] = [];
  
  if (scheduleType === 'ROTATING' && !shiftId) {
    errors.push('El ID del turno es requerido para turnos rotativos');
  }
  
  return errors;
}
