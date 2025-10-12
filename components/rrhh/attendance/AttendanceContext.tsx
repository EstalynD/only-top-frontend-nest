"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import {
  adminObtenerEmpleadosConHorarios,
  getAdminAttendanceSummary,
  type EmployeeWithSchedule,
  type AttendanceSummary,
  type UserSchedule,
  calculateWorkProgress
} from '@/lib/service-rrhh/attendance.api';
import { adminGetMemorandosUsuario } from '@/lib/service-rrhh/memorandum.api';
import { getSelectedTimeFormat } from '@/lib/service-sistema/api';
import { getAttendanceEnabledFrom } from '@/lib/service-sistema/attendance.api';

export type TimeFormat = '12h' | '24h';

export interface EnrichedEmployee {
  _id: string;
  userId: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  areaId: any;
  cargoId: any;
  status: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  isLate: boolean;
  lateMinutes?: number | null;
  location: string;
  schedule: UserSchedule | null;
  summary?: AttendanceSummary;
  workProgress?: number;
  currentShiftStatus?: 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO';
  currentShiftName?: string;
  currentShiftEndTime?: string;
  memorandumsPendientes?: number;
  isSupernumerary?: boolean;
  // Información de modelos asignadas
  modelosAsignadas?: Array<{
    nombreCompleto: string;
    turnoAsignado: 'AM' | 'PM' | 'MADRUGADA' | 'SUPERNUMERARIO';
    isPrimary: boolean;
  }>;
  // Estado actual de asistencia del backend
  currentAttendance?: {
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    hasActiveBreak: boolean;
    allowedTypes: string[];
    todayRecords: any[];
  };
}

interface AttendanceContextType {
  // Data
  employees: EnrichedEmployee[];
  loading: boolean;
  refreshing: boolean;
  
  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'present' | 'late' | 'absent';
  setFilterStatus: (status: 'all' | 'present' | 'late' | 'absent') => void;
  filterShiftStatus: 'all' | 'EN_CURSO' | 'FUTURO' | 'FINALIZADO';
  setFilterShiftStatus: (status: 'all' | 'EN_CURSO' | 'FUTURO' | 'FINALIZADO') => void;
  
  // Config
  timeFormat: TimeFormat;
  enabledFromIso: string | null;
  isAttendanceAllowed: boolean;
  
  // Actions
  loadEmployees: () => Promise<void>;
  refreshData: (silent?: boolean) => Promise<void>;
  refreshSingleEmployee: (employeeId: string) => Promise<void>;
  
  // Stats
  stats: {
    present: number;
    late: number;
    absent: number;
    total: number;
    onBreak: number;
    enCurso: number;
    memorandosPendientes: number;
    supernumerarios: number;
  };
  
  // Filtered data
  filteredEmployees: EnrichedEmployee[];
  
  // Metadata
  areas: Array<{ _id: string; name: string; code: string }>;
  cargos: Array<{ _id: string; name: string; code: string }>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [filterShiftStatus, setFilterShiftStatus] = useState<'all' | 'EN_CURSO' | 'FUTURO' | 'FINALIZADO'>('all');
  
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h');
  const [enabledFromIso, setEnabledFromIso] = useState<string | null>(null);
  
  const [areas, setAreas] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [cargos, setCargos] = useState<Array<{ _id: string; name: string; code: string }>>([]);

  // Estado calculado de habilitación global
  const fromDate = React.useMemo(() => (enabledFromIso ? new Date(enabledFromIso) : null), [enabledFromIso]);
  const isAttendanceAllowed = React.useMemo(() => (fromDate ? Date.now() >= fromDate.getTime() : true), [fromDate]);

  // Enriquece empleados con datos de asistencia del día
  const enrichEmployeesWithAttendance = useCallback(async (empleadosConHorarios: EmployeeWithSchedule[]): Promise<EnrichedEmployee[]> => {
    const today = new Date().toISOString().split('T')[0];
    
    return Promise.all(
      empleadosConHorarios.map(async (emp) => {
        try {
          // Usar la información de status que ya viene del backend
          const attendanceStatus = emp.attendanceStatus;
          const todaySummary = attendanceStatus ? {
            status: attendanceStatus.status,
            checkIn: attendanceStatus.checkIn,
            checkOut: attendanceStatus.checkOut,
            isLate: attendanceStatus.isLate,
            lateMinutes: attendanceStatus.lateMinutes,
            expectedHours: 8, // Valor por defecto, se puede calcular más precisamente si es necesario
            breakStart: undefined, // No disponible en la información básica
            breakEnd: undefined // No disponible en la información básica
          } : null;

          const workProgress = todaySummary?.checkIn && !todaySummary?.checkOut
            ? calculateWorkProgress(todaySummary.checkIn, todaySummary.expectedHours)
            : undefined;
          
          // Determinar estado del turno actual desde los datos que YA TENEMOS
          let currentShiftStatus: 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO' | undefined;
          let currentShiftName: string | undefined;
          let currentShiftEndTime: string | undefined;
          
          if (emp.schedule?.activeShifts && emp.schedule.activeShifts.length > 0) {
            const activeShift = emp.schedule.activeShifts.find(s => s.status === 'EN_CURSO');
            if (activeShift) {
              currentShiftStatus = 'EN_CURSO';
              currentShiftName = activeShift.name;
              currentShiftEndTime = activeShift.endTime;
            } else {
              const futureShift = emp.schedule.activeShifts.find(s => s.status === 'FUTURO');
              if (futureShift) {
                currentShiftStatus = 'FUTURO';
                currentShiftName = futureShift.name;
              }
            }
          }
          
          // Obtener memorandos pendientes
          let memorandumsPendientes = 0;
          try {
            const memorandos = await adminGetMemorandosUsuario(token!, emp._id, {
              startDate: today,
              endDate: today
            });
            memorandumsPendientes = memorandos.filter(m => 
              m.status === 'PENDIENTE' || m.status === 'SUBSANADO'
            ).length;
          } catch (e) {
            // Ignorar errores
          }
          
          // Obtener información de modelos asignadas
          let modelosAsignadas: Array<{
            nombreCompleto: string;
            turnoAsignado: 'AM' | 'PM' | 'MADRUGADA' | 'SUPERNUMERARIO';
            isPrimary: boolean;
          }> = [];
          
          try {
            // Buscar modelos donde el empleado está asignado
            if (emp.schedule?.activeShifts) {
              for (const shift of emp.schedule.activeShifts) {
                // Usar la información disponible del turno
                modelosAsignadas.push({
                  nombreCompleto: `Modelo asignada (${shift.name})`,
                  turnoAsignado: shift.name.includes('AM') ? 'AM' : 
                                shift.name.includes('PM') ? 'PM' : 
                                shift.name.includes('MADRUGADA') ? 'MADRUGADA' : 'SUPERNUMERARIO',
                  isPrimary: true
                });
              }
            }
          } catch (e) {
            // Ignorar errores
          }
          
          // Construir el schedule en el formato esperado
          const userSchedule: UserSchedule | null = emp.schedule ? {
            userId: emp.userId || '',
            scheduleType: emp.schedule.type === 'ROTATING' || emp.schedule.type === 'ROTATING_SUPERNUMERARY' ? 'ROTATING' : 'FIXED',
            assignedSchedule: {
              type: emp.schedule.type === 'ROTATING' || emp.schedule.type === 'ROTATING_SUPERNUMERARY' ? 'ROTATING' : 'FIXED',
              schedule: emp.schedule.schedule,
              name: emp.schedule.name,
              description: emp.schedule.description
            },
            areaId: emp.area._id,
            cargoId: emp.cargo._id,
            toleranceMinutes: emp.attendanceConfig.toleranceMinutes,
            breakDurationMinutes: emp.attendanceConfig.breakDurationMinutes,
            multipleShifts: emp.schedule.hasMultipleShifts,
            allAssignedShifts: emp.schedule.activeShifts.map(shift => ({
              type: 'ROTATING' as const,
              schedule: {
                id: shift.shiftId,
                name: shift.name,
                type: shift.type as 'AM' | 'PM' | 'MADRUGADA' | 'CUSTOM',
                timeSlot: {
                  startTime: shift.startTime,
                  endTime: shift.endTime
                },
                isActive: true
              },
              name: shift.name,
              description: '',
              status: shift.status
            }))
          } : null;
          
          return {
            _id: emp._id,
            userId: emp.userId || '',
            nombre: emp.nombre,
            apellido: emp.apellido,
            correoElectronico: emp.correoElectronico,
            areaId: emp.area,
            cargoId: emp.cargo,
            status: todaySummary?.status || 'ABSENT',
            checkIn: todaySummary?.checkIn,
            checkOut: todaySummary?.checkOut,
            breakStart: todaySummary?.breakStart,
            breakEnd: todaySummary?.breakEnd,
            isLate: todaySummary?.isLate || false,
            lateMinutes: todaySummary?.lateMinutes ?? null,
            location: 'Oficina Principal',
            schedule: userSchedule,
            summary: todaySummary || undefined,
            workProgress,
            currentShiftStatus,
            currentShiftName,
            currentShiftEndTime,
            memorandumsPendientes,
            isSupernumerary: emp.schedule?.isSupernumerary || false,
            modelosAsignadas,
            currentAttendance: emp.currentAttendance
          } as EnrichedEmployee;
        } catch (error) {
          console.error('Error enriching employee:', error);
          return {
            _id: emp._id,
            userId: emp.userId || '',
            nombre: emp.nombre,
            apellido: emp.apellido,
            correoElectronico: emp.correoElectronico,
            areaId: emp.area,
            cargoId: emp.cargo,
            status: 'ABSENT',
            isLate: false,
            lateMinutes: null,
            location: 'Desconocido',
            schedule: null,
            memorandumsPendientes: 0,
            isSupernumerary: false,
            modelosAsignadas: [],
            currentAttendance: undefined
          } as EnrichedEmployee;
        }
      })
    );
  }, [token]);

  // Cargar empleados inicialmente
  const loadEmployees = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Cargar configuración y datos en paralelo
      const [format, enabledFrom, employeesData] = await Promise.all([
        getSelectedTimeFormat(token).catch(() => '24h' as TimeFormat),
        getAttendanceEnabledFrom(token).catch(() => ({ attendanceEnabledFrom: null })),
        adminObtenerEmpleadosConHorarios(token)
      ]);
      
      if (format) setTimeFormat(format);
      setEnabledFromIso(enabledFrom?.attendanceEnabledFrom ?? null);
      
      if (!employeesData.success || !employeesData.employees) {
        throw new Error('No se pudieron cargar los empleados');
      }

      // Extraer áreas y cargos únicos
      const uniqueAreas = Array.from(new Map(
        employeesData.employees
          .filter((emp: EmployeeWithSchedule) => emp.area && emp.area._id)
          .map((emp: EmployeeWithSchedule) => [emp.area._id, emp.area])
      ).values()) as Array<{ _id: string; name: string; code: string }>;
      
      const uniqueCargos = Array.from(new Map(
        employeesData.employees
          .filter((emp: EmployeeWithSchedule) => emp.cargo && emp.cargo._id)
          .map((emp: EmployeeWithSchedule) => [emp.cargo._id, emp.cargo])
      ).values()) as Array<{ _id: string; name: string; code: string }>;
      
      setAreas(uniqueAreas);
      setCargos(uniqueCargos);
      
      // Enriquecer con datos de asistencia del día actual
      const enrichedEmployees = await enrichEmployeesWithAttendance(employeesData.employees);
      
      setEmployees(enrichedEmployees);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cargar empleados',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast, enrichEmployeesWithAttendance]);

  // Refrescar datos
  const refreshData = useCallback(async (silent = false) => {
    if (!token) return;
    
    if (!silent) setRefreshing(true);
    
    try {
      const employeesData = await adminObtenerEmpleadosConHorarios(token);
      
      if (!employeesData.success || !employeesData.employees) {
        throw new Error('No se pudieron cargar los empleados');
      }
      
      const enrichedEmployees = await enrichEmployeesWithAttendance(employeesData.employees);
      setEmployees(enrichedEmployees);
      
      if (!silent) {
        toast({
          type: 'success',
          title: 'Datos actualizados',
          description: 'La información de asistencia ha sido actualizada'
        });
      }
    } catch (error) {
      if (!silent) {
        toast({
          type: 'error',
          title: 'Error al actualizar',
          description: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [token, toast, enrichEmployeesWithAttendance]);

  // Refrescar un solo empleado
  const refreshSingleEmployee = useCallback(async (employeeId: string) => {
    if (!token) return;
    
    try {
      const employeesData = await adminObtenerEmpleadosConHorarios(token);
      
      if (!employeesData.success || !employeesData.employees) {
        return;
      }
      
      const updatedEmployee = employeesData.employees.find(e => e._id === employeeId);
      if (!updatedEmployee) return;
      
      const enriched = await enrichEmployeesWithAttendance([updatedEmployee]);
      
      setEmployees(prev => 
        prev.map(emp => emp._id === employeeId ? enriched[0] : emp)
      );
    } catch (error) {
      console.error('Error refreshing employee:', error);
    }
  }, [token, enrichEmployeesWithAttendance]);

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    if (!token || employees.length === 0) return;
    
    const interval = setInterval(() => {
      refreshData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [token, employees.length, refreshData]);

  // Cargar empleados inicialmente
  useEffect(() => {
    if (!token) return;
    loadEmployees();
  }, [token, loadEmployees]);

  // Filtrar empleados
  const filteredEmployees = React.useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        `${employee.nombre} ${employee.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || employee.status === filterStatus.toUpperCase();
      
      const matchesShiftStatus = filterShiftStatus === 'all' || employee.currentShiftStatus === filterShiftStatus;
      
      return matchesSearch && matchesStatus && matchesShiftStatus;
    });
  }, [employees, searchTerm, filterStatus, filterShiftStatus]);

  // Calcular estadísticas
  const stats = React.useMemo(() => ({
    present: employees.filter(e => e.status === 'PRESENT').length,
    late: employees.filter(e => e.status === 'LATE').length,
    absent: employees.filter(e => e.status === 'ABSENT' || !e.checkIn).length,
    total: employees.length,
    onBreak: employees.filter(e => e.breakStart && !e.breakEnd).length,
    enCurso: employees.filter(e => e.currentShiftStatus === 'EN_CURSO').length,
    memorandosPendientes: employees.reduce((sum, e) => sum + (e.memorandumsPendientes || 0), 0),
    supernumerarios: employees.filter(e => e.isSupernumerary).length
  }), [employees]);

  const value: AttendanceContextType = {
    employees,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterShiftStatus,
    setFilterShiftStatus,
    timeFormat,
    enabledFromIso,
    isAttendanceAllowed,
    loadEmployees,
    refreshData,
    refreshSingleEmployee,
    stats,
    filteredEmployees,
    areas,
    cargos
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
}
