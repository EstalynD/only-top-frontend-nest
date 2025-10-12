"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import ShiftCountdown from './ShiftCountdown';
import {
  empleadoMarcarAsistencia,
  empleadoObtenerEstadoActual,
  empleadoObtenerMisPendientes,
  empleadoObtenerInfoReemplazo,
  type CurrentAttendanceStatus,
  type AttendanceType,
  type AttendanceRecord,
  type ReplacementInfo,
  getTypeLabel,
  getStatusLabel,
  getStatusColor
} from '@/lib/service-rrhh/attendance.api';
import { empleadoGetMemorandos } from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum } from '@/lib/service-rrhh/memorandum-types';
import { canBeSubsaned, getDaysRemaining } from '@/lib/service-rrhh/memorandum-types';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import ReplacementModal from './ReplacementModal';

interface MarcadorAsistenciaProps {
  onSuccess?: () => void;
}

export default function MarcadorAsistencia({ onSuccess }: MarcadorAsistenciaProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [estado, setEstado] = useState<CurrentAttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [horaActual, setHoraActual] = useState(new Date());
  const [loadingEstado, setLoadingEstado] = useState(true);
  const [pendientes, setPendientes] = useState<AttendanceRecord[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [memorandosPendientes, setMemorandosPendientes] = useState<Memorandum[]>([]);
  const [replacementInfo, setReplacementInfo] = useState<ReplacementInfo | null>(null);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [pendingAttendanceType, setPendingAttendanceType] = useState<AttendanceType | null>(null);

  // Actualizar hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cargar estado al montar
  useEffect(() => {
    cargarEstado();
    cargarPendientes();
    cargarMemorandosPendientes();
    cargarInfoReemplazo();
  }, []);

  const cargarEstado = async () => {
    if (!token) return;
    
    try {
      setLoadingEstado(true);
      const data = await empleadoObtenerEstadoActual(token);
      setEstado(data);
      setError(null);
    } catch (err: any) {
      // Si el error indica que no hay horario asignado, es crítico
      const errorMsg = err.message || 'Error al cargar el estado';
      setError(errorMsg);
      setEstado(null);
    } finally {
      setLoadingEstado(false);
    }
  };

  const cargarPendientes = async () => {
    if (!token) return;
    
    try {
      setLoadingPendientes(true);
      const data = await empleadoObtenerMisPendientes(token);
      setPendientes(data);
    } catch (err: any) {
      // No mostrar error para pendientes, es opcional
      console.warn('Error al cargar justificaciones pendientes:', err);
    } finally {
      setLoadingPendientes(false);
    }
  };

  const cargarMemorandosPendientes = async () => {
    if (!token) return;
    
    try {
      const data = await empleadoGetMemorandos(token, { status: 'PENDIENTE' });
      const subsanables = data.filter(m => canBeSubsaned(m));
      setMemorandosPendientes(subsanables);
    } catch (err: any) {
      console.warn('Error al cargar memorandos pendientes:', err);
    }
  };

  const cargarInfoReemplazo = async () => {
    if (!token) return;

    try {
      const data = await empleadoObtenerInfoReemplazo(token);
      setReplacementInfo(data);
    } catch (err: any) {
      console.warn('Error al cargar información de reemplazo:', err);
    }
  };

  const marcar = async (type: AttendanceType) => {
    if (!token) return;

    // Si es supernumerario en modo reemplazo y va a marcar CHECK_IN o CHECK_OUT
    // Mostrar modal de confirmación
    if (
      replacementInfo?.isSupernumerary &&
      replacementInfo?.replacementMode &&
      (type === 'CHECK_IN' || type === 'CHECK_OUT')
    ) {
      setPendingAttendanceType(type);
      setShowReplacementModal(true);
      return;
    }

    // Si no es supernumerario o no aplica modal, marcar directamente
    await ejecutarMarcacion(type);
  };

  const ejecutarMarcacion = async (type: AttendanceType) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const resultado = await empleadoMarcarAsistencia(token, { 
        type,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });
      
      setSuccess(resultado.message);
      
      // Recargar estado, pendientes y memorandos después de 500ms
      setTimeout(() => {
        cargarEstado();
        cargarPendientes();
        cargarMemorandosPendientes();
        onSuccess?.();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error al marcar asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleReplacementConfirm = async () => {
    if (pendingAttendanceType) {
      setShowReplacementModal(false);
      await ejecutarMarcacion(pendingAttendanceType);
      setPendingAttendanceType(null);
    }
  };

  const handleReplacementCancel = () => {
    setShowReplacementModal(false);
    setPendingAttendanceType(null);
  };

  const getTipoIcon = (type: AttendanceType) => {
    const icons = {
      'CHECK_IN': <LogIn className="w-5 h-5" />,
      'CHECK_OUT': <LogOut className="w-5 h-5" />,
      'BREAK_START': <Coffee className="w-5 h-5" />,
      'BREAK_END': <Play className="w-5 h-5" />
    };
    return icons[type] || null;
  };

  const getTipoColor = (type: AttendanceType) => {
    switch (type) {
      case 'CHECK_IN': return 'bg-green-600 hover:bg-green-700';
      case 'CHECK_OUT': return 'bg-blue-600 hover:bg-blue-700';
      case 'BREAK_START': return 'bg-orange-600 hover:bg-orange-700';
      case 'BREAK_END': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (loadingEstado) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Si hay un error crítico (sin horario asignado o sin modelos), mostrar solo el error
  if (error && (error.includes('no tiene un horario asignado') || error.toLowerCase().includes('no estás asignado a ningún modelo') || error.toLowerCase().includes('modelos asociados no tienen turnos'))) {
    return (
      <div className="space-y-4">
        {/* Reloj */}
        <div className="rounded-xl p-6 border ot-theme-card">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 ot-theme-text">
              {horaActual.toLocaleTimeString('es-CO', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-sm ot-theme-text-secondary">
              {horaActual.toLocaleDateString('es-CO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Error Crítico */}
        <div className={`rounded-xl p-6 border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-red-900/40' : 'bg-red-100'
            }`}>
              <AlertCircle className={`w-6 h-6 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-red-200' : 'text-red-800'
              }`}>
                No puedes marcar asistencia
              </h3>
              <p className={`text-sm mb-4 ${
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              }`}>
                {error}
              </p>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                <p className="font-medium mb-2">¿Qué debes hacer?</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {error.toLowerCase().includes('no estás asignado a ningún modelo') && <li>Pide asignación a un Modelo (AM / PM / Madrugada) si corresponde a tu rol.</li>}
                  {error.toLowerCase().includes('modelos asociados no tienen turnos') && <li>Solicita que configuren los turnos en la Configuración de Asistencia.</li>}
                  {error.includes('no tiene un horario asignado') && <li>Solicita asignación de horario (fijo o turno rotativo).</li>}
                  <li>Refresca esta página cuando te confirmen los cambios.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Reloj */}
      <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ot-theme-text">
            {horaActual.toLocaleTimeString('es-CO', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="text-xs sm:text-sm ot-theme-text-secondary">
            {horaActual.toLocaleDateString('es-CO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Alerta de Justificaciones Pendientes */}
      {pendientes.length > 0 && (
        <div className={`rounded-xl p-3 sm:p-4 border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/40' : 'bg-yellow-100'}`}>
              <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs sm:text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                Justificaciones Pendientes
              </h3>
              <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                Tienes {pendientes.length} {pendientes.length === 1 ? 'registro' : 'registros'} pendiente{pendientes.length === 1 ? '' : 's'} de justificación.
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {pendientes.slice(0, 3).map((record) => (
                  <div key={record._id} className={`text-xs p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100/50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                      <span className={`font-medium ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        {getTypeLabel(record.type)} - {getStatusLabel(record.status)}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {new Date(record.timestamp).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </div>
                ))}
                {pendientes.length > 3 && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    +{pendientes.length - 3} más...
                  </div>
                )}
              </div>
              <div className="mt-2 sm:mt-3">
                <a 
                  href="#mis-registros" 
                  className={`text-xs font-medium underline ${theme === 'dark' ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-700 hover:text-yellow-800'}`}
                >
                  Ver todos y justificar →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Memorandos Pendientes */}
      {memorandosPendientes.length > 0 && (
        <div className={`rounded-xl p-3 sm:p-4 border ${
          theme === 'dark' ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${
              theme === 'dark' ? 'bg-orange-900/40' : 'bg-orange-100'
            }`}>
              <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs sm:text-sm font-semibold mb-1 ${
                theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
              }`}>
                Memorandos Pendientes de Subsanación
              </h3>
              <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
              }`}>
                Tienes {memorandosPendientes.length} memorando{memorandosPendientes.length === 1 ? '' : 's'} pendiente{memorandosPendientes.length === 1 ? '' : 's'} de subsanar.
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {memorandosPendientes.slice(0, 2).map((memorandum) => {
                  const daysRemaining = getDaysRemaining(memorandum.subsanationDeadline);
                  const isUrgent = daysRemaining <= 2;
                  
                  return (
                    <div
                      key={memorandum._id}
                      className={`text-xs p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                        }`}>
                          {memorandum.memorandumCode}
                        </span>
                        <span className={`font-semibold ${
                          isUrgent
                            ? 'text-red-600'
                            : theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          {daysRemaining === 0
                            ? '¡Vence hoy!'
                            : daysRemaining === 1
                            ? '¡Vence mañana!'
                            : `${daysRemaining} días`}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        {memorandum.description}
                      </p>
                    </div>
                  );
                })}
                {memorandosPendientes.length > 2 && (
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    +{memorandosPendientes.length - 2} más...
                  </div>
                )}
              </div>
              <Link
                href="/mi-asistencia?tab=memorandos"
                className={`mt-2 sm:mt-3 inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                Ver Todos los Memorandos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Configuración de Horario */}
      {estado?.scheduleInfo?.isUsingDefaultSchedule && estado?.scheduleInfo?.configurationMessage && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-2 sm:gap-3 ${
          theme === 'dark'
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-medium mb-1">Horario por Defecto</div>
            <div className="text-xs sm:text-sm">{estado.scheduleInfo.configurationMessage}</div>
          </div>
        </div>
      )}

      {/* NUEVA SECCIÓN: Información de Reemplazo para Supernumerarios - SOLO DESPUÉS DE CHECK_IN */}
      {replacementInfo?.isSupernumerary && 
       replacementInfo?.replacementMode && 
       replacementInfo?.currentShift && 
       estado?.lastRecord?.type === 'CHECK_IN' && (
        <div className={`rounded-xl p-4 sm:p-5 border-2 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700' 
            : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              <Clock className={`w-5 h-5 ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm sm:text-base font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Estás Cubriendo un Turno
              </h4>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                Modo Supernumerario Activo
              </p>
            </div>
          </div>

          {/* Información del Turno y Empleado Principal */}
          <div className="space-y-3">
            {/* Turno Activo */}
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Turno Activo
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  theme === 'dark' 
                    ? 'bg-green-900/50 text-green-300 border border-green-800' 
                    : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                  🟢 En Curso
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {replacementInfo.currentShift.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {replacementInfo.currentShift.type}
                </span>
              </div>
              <div className={`text-sm font-medium mt-1 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                ⏰ {replacementInfo.currentShift.timeSlot.startTime} - {replacementInfo.currentShift.timeSlot.endTime}
              </div>
            </div>

            {/* Empleado que Reemplazas */}
            {replacementInfo.primaryEmployee && (
              <div className={`p-3 rounded-lg border-l-4 ${
                theme === 'dark' 
                  ? 'bg-blue-900/20 border-blue-600' 
                  : 'bg-blue-50 border-blue-400'
              }`}>
                <div className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  👤 Reemplazando a:
                </div>
                <div className={`text-sm font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {replacementInfo.primaryEmployee.nombreCompleto}
                </div>
                <div className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {replacementInfo.primaryEmployee.correoElectronico}
                </div>
              </div>
            )}

            {/* Mensaje Informativo */}
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
              }`}>
                <strong>ℹ️ Importante:</strong> Tus marcaciones de entrada y salida serán registradas bajo este turno. 
                Asegúrate de cumplir con el horario establecido.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Turnos múltiples (rotativos) - Separar turnos principales de turnos de reemplazo */}
      {estado?.scheduleInfo?.multipleShifts && estado.scheduleInfo.allAssignedShifts && estado.scheduleInfo.allAssignedShifts.length > 1 && (() => {
        // Separar turnos principales de turnos de reemplazo
        const turnosPrincipales = estado.scheduleInfo.allAssignedShifts.filter((s: any) => !s.name.includes('(Reemplazo)'));
        const turnosReemplazo = estado.scheduleInfo.allAssignedShifts.filter((s: any) => s.name.includes('(Reemplazo)'));

        return (
          <div className="space-y-3 sm:space-y-4">
            {/* Turnos Principales */}
            {turnosPrincipales.length > 0 && (
              <div className={`rounded-xl p-3 sm:p-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {turnosPrincipales.length === 1 ? 'Tu Turno Principal' : 'Tus Turnos Principales'}
                  </h4>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {turnosPrincipales.map((s, idx) => {
                    const shift: any = s.schedule;
                    const status = s.status || 'NO_AUTORIZADO';
                    const statusLabel = s.statusLabel || 'Sin Estado';
                    
                    // Colores según estado
                    const statusBadgeColors = {
                      'EN_CURSO': theme === 'dark' ? 'bg-green-900/30 text-green-200 border-green-800' : 'bg-green-100 text-green-700 border-green-200',
                      'FUTURO': theme === 'dark' ? 'bg-blue-900/30 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200',
                      'FINALIZADO': theme === 'dark' ? 'bg-gray-900/30 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200',
                      'NO_AUTORIZADO': theme === 'dark' ? 'bg-red-900/30 text-red-200 border-red-800' : 'bg-red-100 text-red-700 border-red-200'
                    };
                    
                    const borderColors = {
                      'EN_CURSO': theme === 'dark' ? 'border-green-700' : 'border-green-200',
                      'FUTURO': theme === 'dark' ? 'border-blue-700' : 'border-blue-200',
                      'FINALIZADO': theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
                      'NO_AUTORIZADO': theme === 'dark' ? 'border-red-700' : 'border-red-200'
                    };
                    
                    return (
                      <div key={`principal-${shift.id}`} className={`p-2 sm:p-3 rounded-lg border-l-4 ${borderColors[status]} ${
                        theme === 'dark' ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {s.name.replace(' (Reemplazo)', '')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border font-semibold ${statusBadgeColors[status]}`}>
                                  {statusLabel}
                                </span>
                                <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium">
                                  {shift.type}
                                </span>
                              </div>
                            </div>
                            <div className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                              ⏰ {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                            </div>
                            
                            {/* Modelos asignadas */}
                            {s.modelosAsignados && s.modelosAsignados.length > 0 && (
                              <div className="mt-2">
                                <div className={`text-[10px] font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Modelos bajo tu responsabilidad:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {s.modelosAsignados.map((modelo, mIdx) => (
                                    <span 
                                      key={mIdx}
                                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        theme === 'dark' 
                                          ? 'bg-purple-900/30 text-purple-200' 
                                          : 'bg-purple-100 text-purple-700'
                                      }`}
                                    >
                                      {modelo}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Turnos de Reemplazo */}
            {turnosReemplazo.length > 0 && (
              <div className={`rounded-xl p-3 sm:p-4 border-2 border-dashed ${
                theme === 'dark' ? 'bg-orange-900/10 border-orange-700' : 'bg-orange-50 border-orange-300'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-orange-200' : 'text-orange-900'}`}>
                      Turnos Disponibles para Reemplazo
                    </h4>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                      Puedes cubrir estos turnos en caso de emergencia
                    </p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {turnosReemplazo.map((s, idx) => {
                    const shift: any = s.schedule;
                    const status = s.status || 'NO_AUTORIZADO';
                    const statusLabel = s.statusLabel || 'Sin Estado';
                    
                    // Colores según estado (más tenues para reemplazos)
                    const statusBadgeColors = {
                      'EN_CURSO': theme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-800' : 'bg-green-50 text-green-600 border-green-200',
                      'FUTURO': theme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200',
                      'FINALIZADO': theme === 'dark' ? 'bg-gray-800/20 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200',
                      'NO_AUTORIZADO': theme === 'dark' ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-red-50 text-red-600 border-red-200'
                    };
                    
                    return (
                      <div key={`reemplazo-${shift.id}`} className={`p-2 sm:p-3 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800/30 border-gray-600' : 'bg-white/50 border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {s.name.replace(' (Reemplazo)', '')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border ${statusBadgeColors[status]}`}>
                                  {statusLabel}
                                </span>
                                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full ${
                                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {shift.type}
                                </span>
                                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full ${
                                  theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  🔄 Reemplazo
                                </span>
                              </div>
                            </div>
                            <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              ⏰ {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                            </div>
                            
                            {/* Modelos disponibles para reemplazo */}
                            {s.modelosAsignados && s.modelosAsignados.length > 0 && (
                              <div className="mt-2">
                                <div className={`text-[10px] font-medium mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Modelos disponibles:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {s.modelosAsignados.map((modelo, mIdx) => (
                                    <span 
                                      key={mIdx}
                                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        theme === 'dark' 
                                          ? 'bg-gray-700 text-gray-300' 
                                          : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {modelo}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Contador Regresivo del Turno Activo */}
      {estado?.scheduleInfo?.allAssignedShifts && estado.scheduleInfo.allAssignedShifts.length > 0 && (() => {
        // Buscar el turno EN_CURSO
        const activeShift = estado.scheduleInfo.allAssignedShifts.find((s: any) => s.status === 'EN_CURSO');
        if (activeShift && activeShift.status) {
          const shift: any = activeShift.schedule;
          return (
            <ShiftCountdown
              endTime={shift.timeSlot.endTime}
              status={activeShift.status as 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO'}
              shiftName={activeShift.name}
            />
          );
        }
        return null;
      })()}

      {/* Última Marcación */}
      {estado?.lastRecord && (
        <div className={`rounded-xl p-3 sm:p-4 border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {getTipoIcon(estado.lastRecord.type)}
              </div>
              <div className="min-w-0">
                <div className={`text-sm sm:text-base font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {getTypeLabel(estado.lastRecord.type)}
                </div>
                <div className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {new Date(estado.lastRecord.timestamp).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0`}
              style={{ 
                backgroundColor: `${getStatusColor(estado.lastRecord.status)}20`,
                color: getStatusColor(estado.lastRecord.status)
              }}
            >
              {getStatusLabel(estado.lastRecord.status)}
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-2 sm:gap-3 ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm min-w-0">{error}</div>
        </div>
      )}

      {success && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-2 sm:gap-3 ${
          theme === 'dark'
            ? 'bg-green-900/20 border-green-800 text-green-200'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm min-w-0">{success}</div>
        </div>
      )}

      {/* Botones de Marcación */}
      <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 ot-theme-text">
          Marcar Asistencia
        </h3>

        {estado?.nextExpectedType && (
          <div className="text-xs sm:text-sm mb-3 sm:mb-4 ot-theme-text-secondary">
            Próxima acción: <span className="font-medium">
              {getTypeLabel(estado.nextExpectedType)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {estado?.allowedTypes.map((type) => (
            <button
              key={type}
              onClick={() => marcar(type)}
              disabled={loading}
              className={`
                h-16 sm:h-20 lg:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2
                rounded-lg text-white font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:shadow-lg active:scale-95
                ${getTipoColor(type)}
              `}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin" />
              ) : (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                    {getTipoIcon(type)}
                  </div>
                  <span className="text-xs sm:text-sm">{getTypeLabel(type)}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {(!estado?.canMarkAttendance || estado?.allowedTypes.length === 0) && (
          <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            No puedes marcar asistencia en este momento
          </div>
        )}
      </div>

      {/* Resumen del Día */}
      {estado?.summary && (
        <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 ot-theme-text">
            Resumen de Hoy
          </h3>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold ot-theme-text">
                {estado.summary.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs mt-1 ot-theme-text-secondary">
                Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold ot-theme-text">
                {estado.summary.workedHours.toFixed(1)}h
              </div>
              <div className="text-xs mt-1 ot-theme-text-secondary">
                Trabajadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold ot-theme-text">
                {estado.summary.breakHours.toFixed(1)}h
              </div>
              <div className="text-xs mt-1 ot-theme-text-secondary">
                Descanso
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Reemplazo */}
      {showReplacementModal && pendingAttendanceType && (
        <ReplacementModal
          isOpen={showReplacementModal}
          onClose={handleReplacementCancel}
          onConfirm={handleReplacementConfirm}
          replacementInfo={replacementInfo}
          attendanceType={pendingAttendanceType}
          loading={loading}
        />
      )}
    </div>
  );
}
