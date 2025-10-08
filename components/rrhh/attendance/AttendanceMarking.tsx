"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { getProfile } from '@/lib/service-user/api';
import { 
  markAttendance, 
  getTimeRemainingForCheckIn,
  getAttendanceSummary,
  type AttendanceType,
  type AttendanceStatus,
  type TimeRemaining
} from '@/lib/service-rrhh/attendance.api';
import { getUserSchedule, type UserSchedule, type FixedSchedule } from '@/lib/service-rrhh/attendance.api';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Coffee, 
  LogOut,
  MapPin,
  Smartphone
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { getAttendanceEnabledFrom } from '@/lib/service-sistema/attendance.api';
import AttendanceHistoryModal from '@/components/rrhh/attendance/AttendanceHistoryModal';

interface AttendanceMarkingProps {
  className?: string;
}

export function AttendanceMarking({ className = '' }: AttendanceMarkingProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState<TimeRemaining | null>(null);
  const [todaySummary, setTodaySummary] = React.useState<any>(null);
  const [markingType, setMarkingType] = React.useState<AttendanceType | null>(null);
  const [enabledFromIso, setEnabledFromIso] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [userSchedule, setUserSchedule] = React.useState<UserSchedule | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const fromDate = React.useMemo(() => (enabledFromIso ? new Date(enabledFromIso) : null), [enabledFromIso]);
  const isAttendanceAllowed = React.useMemo(() => (fromDate ? Date.now() >= fromDate.getTime() : false), [fromDate]);
  const breaksEnabled = React.useMemo(() => {
    if (!userSchedule?.assignedSchedule) return false;
    if (userSchedule.assignedSchedule.type !== 'FIXED') return false; // Por ahora solo horario fijo
    const fixed = userSchedule.assignedSchedule.schedule as FixedSchedule;
    return !!fixed?.lunchBreakEnabled; // rango puede ser opcional
  }, [userSchedule]);

  // Load initial data
  React.useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const [timeRemainingRes, todaySummaryRes, enabledFromRes, userScheduleRes] = await Promise.all([
          getTimeRemainingForCheckIn(token),
          getAttendanceSummary(token, new Date().toISOString().split('T')[0]),
          getAttendanceEnabledFrom(token).catch(() => ({ attendanceEnabledFrom: null })),
          getUserSchedule(token).catch(() => null)
        ]);
        
        setTimeRemaining(timeRemainingRes);
        setTodaySummary(todaySummaryRes);
        setEnabledFromIso(enabledFromRes?.attendanceEnabledFrom ?? null);
        setUserSchedule(userScheduleRes);
      } catch (error) {
        console.error('Error loading attendance data:', error);
      }
    };

    loadData();
    // Cargar userId del perfil
    getProfile(token)
      .then((res) => setUserId(res.user.id))
      .catch(() => setUserId(null));
    
    // Refresh time remaining every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAttendance = async (type: AttendanceType) => {
    if (!token) return;

    // Guardia por configuración global
    if (!enabledFromIso) {
      toast({ type: 'info', color: 'warning', title: 'Marcación no disponible', description: 'Aún no se ha definido la fecha de inicio para marcar asistencia.' });
      return;
    }
    const from = new Date(enabledFromIso);
    if (Date.now() < from.getTime()) {
      toast({ type: 'info', color: 'warning', title: 'Aún no permitido', description: `Podrás marcar asistencia desde ${from.toLocaleString()}` });
      return;
    }

    setLoading(true);
    setMarkingType(type);
    
    try {
      // Get current location if available
      let location;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });
        
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (geoError) {
        console.warn('Geolocation not available:', geoError);
      }

      const response = await markAttendance(token, {
        type,
        location,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: getDevicePlatform()
        }
      });

      toast({
        type: response.status === 'LATE' ? 'info' : 'success',
        color: response.status === 'LATE' ? 'warning' : undefined,
        title: getAttendanceTitle(type),
        description: response.message
      });

      // Refresh data
      const [timeRemainingRes, todaySummaryRes] = await Promise.all([
        getTimeRemainingForCheckIn(token),
        getAttendanceSummary(token, new Date().toISOString().split('T')[0])
      ]);
      
      setTimeRemaining(timeRemainingRes);
      setTodaySummary(todaySummaryRes);

    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al marcar asistencia',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
      setMarkingType(null);
    }
  };

  const getAttendanceTitle = (type: AttendanceType): string => {
    const titles = {
      'CHECK_IN': 'Entrada',
      'CHECK_OUT': 'Salida',
      'BREAK_START': 'Inicio de Descanso',
      'BREAK_END': 'Fin de Descanso'
    };
    return titles[type];
  };

  const getAttendanceIcon = (type: AttendanceType) => {
    const icons = {
      'CHECK_IN': CheckCircle,
      'CHECK_OUT': LogOut,
      'BREAK_START': Coffee,
      'BREAK_END': Coffee
    };
    return icons[type];
  };

  const getAttendanceColor = (type: AttendanceType): string => {
    const colors = {
      'CHECK_IN': 'var(--ot-green-500)',
      'CHECK_OUT': 'var(--ot-blue-500)',
      'BREAK_START': 'var(--ot-yellow-500)',
      'BREAK_END': 'var(--ot-orange-500)'
    };
    return colors[type];
  };

  const getAttendanceActions = (): Array<{type: AttendanceType, label: string, description: string, disabled: boolean}> => {
    if (!todaySummary) return [];

    const hasCheckIn = !!todaySummary.checkIn;
    const hasCheckOut = !!todaySummary.checkOut;
    const hasBreakStart = !!todaySummary.breakStart;
    const hasBreakEnd = !!todaySummary.breakEnd;

    const actions: Array<{type: AttendanceType, label: string, description: string, disabled: boolean}> = [
      {
        type: 'CHECK_IN',
        label: 'Marcar Entrada',
        description: 'Registra tu hora de llegada',
        disabled: hasCheckIn
      },
      {
        type: 'CHECK_OUT',
        label: 'Marcar Salida',
        description: 'Registra tu hora de salida',
        disabled: !hasCheckIn || hasCheckOut
      }
    ];

    // Agregar acciones de descanso solo si están habilitadas por config (horario fijo)
    if (breaksEnabled) {
      actions.push(
        {
          type: 'BREAK_START',
          label: 'Iniciar Descanso',
          description: 'Registra el inicio de tu descanso',
          disabled: !hasCheckIn || (hasBreakStart && !hasBreakEnd)
        },
        {
          type: 'BREAK_END',
          label: 'Finalizar Descanso',
          description: 'Registra el fin de tu descanso',
          disabled: !hasBreakStart || hasBreakEnd
        }
      );
    }

    return actions;
  };

  if (loading && markingType) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader size="lg" label={`Marcando ${getAttendanceTitle(markingType)}...`} />
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estado de habilitación global */}
      <Card className="p-4">
        {fromDate === null ? (
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Aún no se ha definido la fecha/hora desde la cual se permite marcar asistencia.
              </p>
            </div>
          </div>
        ) : isAttendanceAllowed ? (
          <div className="flex items-start gap-3">
            <CheckCircle size={18} style={{ color: 'var(--ot-green-600)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--ot-green-700)' }}>
                La marcación está habilitada.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Configurada desde {fromDate.toLocaleString()}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: 'var(--ot-yellow-600)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--ot-yellow-700)' }}>
                Aún no permitido marcar asistencia.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Podrás marcar asistencia desde {fromDate.toLocaleString()}.
              </p>
            </div>
          </div>
        )}
      </Card>
      {/* Time Remaining Alert */}
      {timeRemaining && (
        <Card className="p-4">
          <div className="flex items-center gap-3 p-1 rounded" style={{ 
            background: timeRemaining.isUrgent ? 'var(--ot-red-50)' : 'var(--ot-blue-50)',
            border: `1px solid ${timeRemaining.isUrgent ? 'var(--ot-red-200)' : 'var(--ot-blue-200)'}`
          }}>
            <AlertCircle 
              size={20} 
              style={{ color: timeRemaining.isUrgent ? 'var(--ot-red-600)' : 'var(--ot-blue-600)' }}
            />
            <div>
              <p className="font-medium" style={{ 
                color: timeRemaining.isUrgent ? 'var(--ot-red-800)' : 'var(--ot-blue-800)' 
              }}>
                {timeRemaining.isUrgent ? '¡Tiempo crítico!' : 'Tiempo restante para marcar entrada'}
              </p>
              <p className="text-sm" style={{ 
                color: timeRemaining.isUrgent ? 'var(--ot-red-700)' : 'var(--ot-blue-700)' 
              }}>
                {timeRemaining.minutesRemaining} minutos restantes
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Today's Summary */}
      {todaySummary && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} style={{ color: 'var(--ot-blue-500)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Resumen de Hoy
            </h3>
            <div className="ml-auto">
              <Button onClick={() => setShowHistory(true)}>
                Ver historial
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Entrada</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {todaySummary.checkIn ? new Date(todaySummary.checkIn).toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Salida</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {todaySummary.checkOut ? new Date(todaySummary.checkOut).toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Horas</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {todaySummary.totalHours}h
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Estado</p>
              <p className="font-medium" style={{ 
                color: todaySummary.isLate ? 'var(--ot-red-600)' : 'var(--ot-green-600)' 
              }}>
                {todaySummary.isLate ? 'Retraso' : 'Puntual'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Marcar Asistencia
        </h3>
        {!isAttendanceAllowed && (
          <div className="mb-3 flex items-start gap-2">
            <AlertCircle size={16} style={{ color: 'var(--ot-yellow-600)' }} />
            <span className="text-xs" style={{ color: 'var(--ot-yellow-700)' }}>
              Marcación bloqueada {fromDate ? `hasta ${fromDate.toLocaleString()}` : 'hasta definir fecha/hora de inicio'}
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getAttendanceActions().map((action) => {
            const Icon = getAttendanceIcon(action.type);
            const color = getAttendanceColor(action.type);
            
            return (
              <button
                key={action.type}
                onClick={() => handleMarkAttendance(action.type)}
                disabled={loading || action.disabled || !isAttendanceAllowed}
                className="p-4 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                style={{
                  background: action.disabled ? 'var(--surface-muted)' : 'var(--background)',
                  borderColor: action.disabled || !isAttendanceAllowed ? 'var(--border)' : color,
                  opacity: action.disabled || !isAttendanceAllowed ? 0.6 : 1
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} style={{ color: action.disabled || !isAttendanceAllowed ? 'var(--text-muted)' : color }} />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {action.label}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {action.disabled ? 'Ya registrado' : !isAttendanceAllowed ? (fromDate ? `Bloqueado hasta ${fromDate.toLocaleString()}` : 'Bloqueado hasta definir fecha') : action.description}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Location Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm rounded p-2" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
          <MapPin size={16} />
          <span>Ubicación: {navigator.geolocation ? 'Disponible' : 'No disponible'}</span>
          <Smartphone size={16} className="ml-2" />
          <span>Dispositivo: {getDevicePlatform()}</span>
        </div>
      </Card>

      {/* Modal: Historial */}
      {userId && (
        <AttendanceHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          userId={userId}
        />
      )}
    </div>
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
