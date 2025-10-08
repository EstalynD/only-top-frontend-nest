"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { getAllEmpleados } from '@/lib/service-rrhh/empleados-api';
import { 
  markAttendanceForUser,
  getAdminAttendanceSummary,
  getUserScheduleByUserId,
  formatTime,
  formatDuration,
  getStatusColor,
  getStatusLabel,
  calculateWorkProgress,
  type AttendanceSummary,
  type UserSchedule
} from '@/lib/service-rrhh/attendance.api';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Search,
  RefreshCw,
  MapPin,
  Calendar,
  TrendingUp,
  Coffee,
  LogOut,
  History,
  Zap
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { getAttendanceConfig, getAttendanceEnabledFrom, type AttendanceConfig } from '@/lib/service-sistema/attendance.api';
import { getSelectedTimeFormat } from '@/lib/service-sistema/api';
import type { TimeFormat } from '@/lib/service-sistema/types';
import AttendanceHistoryModal from '@/components/rrhh/attendance/AttendanceHistoryModal';

interface EnrichedEmployee {
  _id: string;
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
}

export default function AttendancePage() {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [employees, setEmployees] = React.useState<EnrichedEmployee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [attendanceConfig, setAttendanceConfig] = React.useState<AttendanceConfig | null>(null);
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h');
  const [enabledFromIso, setEnabledFromIso] = React.useState<string | null>(null);
  const [historyForUser, setHistoryForUser] = React.useState<{ id: string; name: string } | null>(null);

  // Auto-refresh every 60 seconds
  React.useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      refreshData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [token, employees]);

  // Estado calculado de habilitación global
  const fromDate = React.useMemo(() => (enabledFromIso ? new Date(enabledFromIso) : null), [enabledFromIso]);
  const isAttendanceAllowed = React.useMemo(() => (fromDate ? Date.now() >= fromDate.getTime() : true), [fromDate]);

  // Cargar empleados inicialmente
  React.useEffect(() => {
    if (!token) return;
    loadEmployees();
  }, [token]);

  const loadEmployees = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Cargar configuración
      const [config, format, enabledFrom] = await Promise.all([
        getAttendanceConfig(token).catch(() => null),
        getSelectedTimeFormat(token).catch(() => '24h' as TimeFormat),
        getAttendanceEnabledFrom(token).catch(() => ({ attendanceEnabledFrom: null }))
      ]);
      
      if (config) setAttendanceConfig(config);
      if (format) setTimeFormat(format);
      setEnabledFromIso(enabledFrom?.attendanceEnabledFrom ?? null);
      
      const empleados = await getAllEmpleados(token);
      
      // Enriquecer con datos de asistencia
      const enrichedEmployees = await enrichEmployeesWithAttendance(empleados, config);
      
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
  };

  const refreshData = async (silent = false) => {
    if (!token) return;
    
    if (!silent) setRefreshing(true);
    
    try {
      const empleados = await getAllEmpleados(token);
      const enrichedEmployees = await enrichEmployeesWithAttendance(empleados, attendanceConfig);
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
  };

  const enrichEmployeesWithAttendance = async (empleados: any[], config: AttendanceConfig | null): Promise<EnrichedEmployee[]> => {
    return Promise.all(
      empleados.map(async (emp) => {
        try {
          const [todaySummary, userSchedule] = await Promise.all([
            getAdminAttendanceSummary(token!, emp._id, new Date().toISOString().split('T')[0]).catch(() => null),
            getUserScheduleByUserId(token!, emp._id, {
              areaId: (emp.areaId && typeof emp.areaId === 'object') ? emp.areaId._id : emp.areaId,
              cargoId: (emp.cargoId && typeof emp.cargoId === 'object') ? emp.cargoId._id : emp.cargoId,
            }).catch(() => null)
          ]);

          const workProgress = todaySummary?.checkIn && !todaySummary?.checkOut
            ? calculateWorkProgress(todaySummary.checkIn, todaySummary.expectedHours)
            : undefined;
          
          return {
            ...emp,
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
            workProgress
          };
        } catch (error) {
          return {
            ...emp,
            status: 'ABSENT',
            checkIn: null,
            checkOut: null,
            breakStart: null,
            breakEnd: null,
            isLate: false,
            location: 'Oficina Principal',
            schedule: null,
            workProgress: undefined
          };
        }
      })
    );
  };

  const handleMarkAttendance = async (employeeId: string, type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END') => {
    if (!token) return;
    
    // Verificación global
    if (!isAttendanceAllowed) {
      toast({ 
        type: 'info', 
        color: 'warning', 
        title: 'Marcación no disponible', 
        description: fromDate ? `Disponible desde ${fromDate.toLocaleString()}` : 'Fecha de inicio no definida'
      });
      return;
    }

    try {
      const response = await markAttendanceForUser(token, employeeId, {
        type,
        notes: `Marcado por administrador`,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: getDevicePlatform()
        }
      });

      toast({
        type: response.status === 'LATE' ? 'info' : 'success',
        color: response.status === 'LATE' ? 'warning' : 'success',
        title: 'Asistencia registrada',
        description: response.message
      });

      // Refresh solo el empleado afectado
      await refreshSingleEmployee(employeeId);

    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al registrar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const refreshSingleEmployee = async (employeeId: string) => {
    if (!token) return;
    
    try {
      const emp = employees.find(e => e._id === employeeId);
      if (!emp) return;

      const [todaySummary, userSchedule] = await Promise.all([
        getAdminAttendanceSummary(token, emp._id, new Date().toISOString().split('T')[0]).catch(() => null),
        getUserScheduleByUserId(token, emp._id, {
          areaId: (emp.areaId && typeof emp.areaId === 'object') ? emp.areaId._id : emp.areaId,
          cargoId: (emp.cargoId && typeof emp.cargoId === 'object') ? emp.cargoId._id : emp.cargoId,
        }).catch(() => null)
      ]);

      const workProgress = todaySummary?.checkIn && !todaySummary?.checkOut
        ? calculateWorkProgress(todaySummary.checkIn, todaySummary.expectedHours)
        : undefined;

      setEmployees(prev => prev.map(e => 
        e._id === employeeId 
          ? {
              ...e,
              status: todaySummary?.status || 'ABSENT',
              checkIn: todaySummary?.checkIn,
              checkOut: todaySummary?.checkOut,
              breakStart: todaySummary?.breakStart,
              breakEnd: todaySummary?.breakEnd,
              isLate: todaySummary?.isLate || false,
              lateMinutes: todaySummary?.lateMinutes ?? null,
              schedule: userSchedule,
              summary: todaySummary || undefined,
              workProgress
            }
          : e
      ));
    } catch (error) {
      console.error('Error refreshing employee:', error);
    }
  };

  // Filtrar empleados
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.correoElectronico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.areaId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || employee.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Calcular estadísticas
  const stats = React.useMemo(() => ({
    present: employees.filter(e => e.status === 'PRESENT').length,
    late: employees.filter(e => e.status === 'LATE').length,
    absent: employees.filter(e => e.status === 'ABSENT' || !e.checkIn).length,
    total: employees.length
  }), [employees]);

  const formatScheduleDisplay = (schedule: UserSchedule | null) => {
    if (!schedule) return 'Sin horario asignado';
    
    const { assignedSchedule } = schedule;
    
    if (assignedSchedule.type === 'FIXED' && 'monday' in assignedSchedule.schedule) {
      const fixedSchedule = assignedSchedule.schedule as any;
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
      const dayKey = getDayKey(today);
      
      const todaySchedule = fixedSchedule[dayKey];
      if (todaySchedule) {
        return `${formatHHmm(todaySchedule.startTime)} - ${formatHHmm(todaySchedule.endTime)}`;
      }
      return 'Descanso';
    } else if (assignedSchedule.type === 'ROTATING' && 'timeSlot' in assignedSchedule.schedule) {
      const rotatingShift = assignedSchedule.schedule as any;
      return `${formatHHmm(rotatingShift.timeSlot.startTime)} - ${formatHHmm(rotatingShift.timeSlot.endTime)}`;
    }
    
    return assignedSchedule.name || 'Horario asignado';
  };

  const formatHHmm = (hhmm: string) => {
    if (!hhmm) return '';
    const [hStr, mStr] = hhmm.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr?.padStart(2, '0') ?? '00';
    if (timeFormat === '12h') {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHours = (h % 12) || 12;
      return `${displayHours}:${m} ${period}`;
    }
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const getDayKey = (dayName: string): string => {
    const dayMap: Record<string, string> = {
      'lunes': 'monday',
      'martes': 'tuesday',
      'miércoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday'
    };
    return dayMap[dayName] || 'monday';
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" label="Cargando empleados..." />
      </div>
    );
  }

  const use12h = timeFormat === '12h';

  return (
    <div className="space-y-6">
      {/* Estado de habilitación global */}
      {fromDate && !isAttendanceAllowed && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: 'var(--ot-yellow-600)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--ot-yellow-700)' }}>
                Marcación de asistencia bloqueada
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Disponible desde {fromDate.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Control de Asistencia
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Gestiona la asistencia de empleados en tiempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--ot-green-100)' }}>
              <CheckCircle size={20} style={{ color: 'var(--ot-green-600)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Presentes</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stats.present}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--ot-yellow-100)' }}>
              <AlertCircle size={20} style={{ color: 'var(--ot-yellow-600)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Con Retraso</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stats.late}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--ot-red-100)' }}>
              <Clock size={20} style={{ color: 'var(--ot-red-600)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ausentes</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stats.absent}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--ot-blue-100)' }}>
              <Users size={20} style={{ color: 'var(--ot-blue-600)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stats.total}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 rounded-lg border outline-none transition-colors"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="present">Presentes</option>
              <option value="late">Con retraso</option>
              <option value="absent">Ausentes</option>
            </select>
          </div>

          <Button
            onClick={() => refreshData()}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onMarkAttendance={handleMarkAttendance}
            onViewHistory={() => setHistoryForUser({ id: employee._id, name: employee.nombre || 'Empleado' })}
            formatScheduleDisplay={formatScheduleDisplay}
            isAttendanceAllowed={isAttendanceAllowed}
            fromDate={fromDate}
            use12h={use12h}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="p-8 text-center">
          <Users size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No se encontraron empleados
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay empleados registrados'}
          </p>
        </Card>
      )}

      {/* History Modal */}
      {historyForUser && (
        <AttendanceHistoryModal
          isOpen={true}
          onClose={() => setHistoryForUser(null)}
          userId={historyForUser.id}
          titleSuffix={historyForUser.name}
        />
      )}
    </div>
  );
}

// Employee Card Component
function EmployeeCard({ 
  employee, 
  onMarkAttendance, 
  onViewHistory,
  formatScheduleDisplay,
  isAttendanceAllowed,
  fromDate,
  use12h
}: {
  employee: EnrichedEmployee;
  onMarkAttendance: (id: string, type: any) => Promise<void>;
  onViewHistory: () => void;
  formatScheduleDisplay: (schedule: UserSchedule | null) => string;
  isAttendanceAllowed: boolean;
  fromDate: Date | null;
  use12h: boolean;
}) {
  const [actionLoading, setActionLoading] = React.useState(false);

  const handleAction = async (type: any) => {
    setActionLoading(true);
    try {
      await onMarkAttendance(employee._id, type);
    } finally {
      setActionLoading(false);
    }
  };

  const StatusIcon = employee.status === 'PRESENT' ? CheckCircle : employee.status === 'LATE' ? AlertCircle : Clock;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
          >
            {employee.nombre?.split(' ').map((n: string) => n[0]).join('') || 'E'}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {employee.nombre || 'Sin nombre'} {employee.apellido || ''}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {employee.cargoId?.name || 'Sin cargo'}
            </p>
          </div>
        </div>
        
        <span 
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: `${getStatusColor(employee.status as any)}20`,
            color: getStatusColor(employee.status as any)
          }}
        >
          <StatusIcon size={12} />
          {getStatusLabel(employee.status as any)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>{employee.areaId?.name || 'Sin área'}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} style={{ color: 'var(--ot-blue-500)' }} />
          <span style={{ color: 'var(--text-muted)' }}>
            {formatScheduleDisplay(employee.schedule)}
          </span>
        </div>

        {employee.checkIn && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} style={{ color: 'var(--ot-green-600)' }} />
              <span style={{ color: 'var(--text-muted)' }}>
                Entrada: <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                  {formatTime(employee.checkIn, use12h)}
                </span>
              </span>
            </div>

            {employee.workProgress !== undefined && !employee.checkOut && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Progreso de jornada</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">{employee.workProgress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${employee.workProgress}%`,
                      background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-600))'
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {employee.checkOut && employee.summary && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={14} style={{ color: 'var(--ot-blue-600)' }} />
            <span style={{ color: 'var(--text-muted)' }}>
              Trabajadas: <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                {formatDuration(employee.summary.workedHours)}
              </span>
            </span>
          </div>
        )}

        {employee.isLate && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={14} style={{ color: 'var(--ot-yellow-600)' }} />
            <span style={{ color: 'var(--ot-yellow-700)' }}>
              Tardanza: {employee.lateMinutes ?? 0} min
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!employee.checkIn && (
          <Button
            onClick={() => handleAction('CHECK_IN')}
            disabled={actionLoading || !isAttendanceAllowed}
            title={!isAttendanceAllowed && fromDate ? `Bloqueado hasta ${fromDate.toLocaleString()}` : undefined}
            className="flex-1 text-sm"
          >
            {actionLoading ? <Loader size="xs" /> : <CheckCircle size={14} className="mr-1" />}
            Entrada
          </Button>
        )}
        
        {employee.checkIn && !employee.checkOut && (
          <>
            {/* Break buttons */}
            {!employee.breakStart && (
              <Button
                onClick={() => handleAction('BREAK_START')}
                disabled={actionLoading || !isAttendanceAllowed}
                variant="secondary"
                className="flex-1 text-sm"
              >
                {actionLoading ? <Loader size="xs" /> : <Coffee size={14} className="mr-1" />}
                Descanso
              </Button>
            )}
            
            {employee.breakStart && !employee.breakEnd && (
              <Button
                onClick={() => handleAction('BREAK_END')}
                disabled={actionLoading || !isAttendanceAllowed}
                variant="secondary"
                className="flex-1 text-sm"
              >
                {actionLoading ? <Loader size="xs" /> : <Coffee size={14} className="mr-1" />}
                Fin Descanso
              </Button>
            )}

            <Button
              onClick={() => handleAction('CHECK_OUT')}
              disabled={actionLoading || !isAttendanceAllowed || Boolean(employee.breakStart && !employee.breakEnd)}
              title={
                !isAttendanceAllowed && fromDate 
                  ? `Bloqueado hasta ${fromDate.toLocaleString()}`
                  : employee.breakStart && !employee.breakEnd
                  ? 'Finaliza el descanso primero'
                  : undefined
              }
              className="flex-1 text-sm"
            >
              {actionLoading ? <Loader size="xs" /> : <LogOut size={14} className="mr-1" />}
              Salida
            </Button>
          </>
        )}

        {employee.checkOut && (
          <div className="flex-1 text-center py-2 text-sm rounded-lg" style={{ background: 'var(--ot-green-100)', color: 'var(--ot-green-700)' }}>
            Jornada completada
          </div>
        )}

        <Button
          variant="secondary"
          onClick={onViewHistory}
          className="flex items-center gap-1 text-sm"
        >
          <History size={14} />
          Historial
        </Button>
      </div>
    </Card>
  );
}

function getDevicePlatform(): string {
  const userAgent = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(userAgent)) return 'Mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent)) return 'Mac';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Desktop';
}
