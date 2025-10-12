"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import ShiftCountdown from './ShiftCountdown';
import {
  empleadoObtenerMiHorario,
  type UserSchedule,
  type FixedSchedule,
  type RotatingShift
} from '@/lib/service-rrhh/attendance.api';
import { useAuth } from '@/lib/auth';

export default function MiHorario() {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [horario, setHorario] = useState<UserSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHorario();
  }, []);

  const cargarHorario = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await empleadoObtenerMiHorario(token);
      setHorario(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el horario');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day: string) => {
    const names: Record<string, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return names[day] || day;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    // Mensajes específicos
    const isNoSchedule = error.includes('no tiene un horario asignado');
    const isNoModels = error.toLowerCase().includes('no estás asignado a ningún modelo');
    const isModelsNoShifts = error.toLowerCase().includes('modelos asociados no tienen turnos');

    if (isNoSchedule || isNoModels || isModelsNoShifts) {
      return (
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
                {isNoModels ? 'Sin asignación a modelos' : isModelsNoShifts ? 'Modelos sin turnos configurados' : 'Sin horario asignado'}
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
                  {isNoModels && <li>Solicita ser asignado a uno o más modelos (AM / PM / Madrugada) si aplica a tu rol.</li>}
                  {isModelsNoShifts && <li>Solicita a RRHH / Coordinación configurar los turnos en la configuración global.</li>}
                  {isNoSchedule && <li>Contacta a RRHH para asignar un horario (fijo o turno rotativo).</li>}
                  <li>Actualiza esta vista después de que te confirmen los cambios.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error genérico
    return (
      <div className={`rounded-xl p-4 border ${
        theme === 'dark'
          ? 'bg-red-900/20 border-red-800 text-red-200'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        {error}
      </div>
    );
  }

  if (!horario) {
    return (
      <div className="rounded-xl p-6 border ot-theme-card ot-theme-text-secondary">
        No se encontró información de horario
      </div>
    );
  }

  const isFixedSchedule = horario.scheduleType === 'FIXED' && 
    horario.assignedSchedule.type === 'FIXED';
  const isRotatingSchedule = horario.scheduleType === 'ROTATING' && 
    horario.assignedSchedule.type === 'ROTATING';

  const hasMultiple = horario.multipleShifts && Array.isArray(horario.allAssignedShifts) && horario.allAssignedShifts.length > 1;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mensaje de Configuración de Horario */}
      {horario.isUsingDefaultSchedule && horario.configurationMessage && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-2 sm:gap-3 ${
          theme === 'dark'
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-medium mb-1">Horario por Defecto</div>
            <div className="text-xs sm:text-sm">{horario.configurationMessage}</div>
          </div>
        </div>
      )}

      {/* Información General */}
      <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className={`p-1.5 sm:p-2 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold ot-theme-text">
              {horario.assignedSchedule.name}
            </h3>
            <p className="text-xs sm:text-sm ot-theme-text-secondary">
              {horario.assignedSchedule.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-xs sm:text-sm ot-theme-text-muted">
              Tipo de Horario
            </div>
            <div className="text-sm sm:text-base font-medium mt-1 ot-theme-text">
              {horario.scheduleType === 'FIXED' ? 'Horario Fijo' : 
               horario.scheduleType === 'ROTATING' ? 'Turnos Rotativos' : 
               'Por Defecto'}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm ot-theme-text-muted">
              Tolerancia
            </div>
            <div className="text-sm sm:text-base font-medium mt-1 ot-theme-text">
              {horario.toleranceMinutes} minutos
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de Turnos (Rotativos Múltiples) - Separar principales de reemplazo */}
      {isRotatingSchedule && hasMultiple && (() => {
        // Separar turnos principales de turnos de reemplazo
        const turnosPrincipales = horario.allAssignedShifts!.filter((s: any) => !s.name.includes('(Reemplazo)'));
        const turnosReemplazo = horario.allAssignedShifts!.filter((s: any) => s.name.includes('(Reemplazo)'));

        return (
          <div className="space-y-3 sm:space-y-4">
            {/* Turnos Principales */}
            {turnosPrincipales.length > 0 && (
              <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
                <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 ot-theme-text">
                  {turnosPrincipales.length === 1 ? '📋 Tu Turno Principal' : '📋 Tus Turnos Principales'}
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  {turnosPrincipales.map((s, idx) => {
                    const shift = s.schedule as RotatingShift;
                    const status = s.status || 'NO_AUTORIZADO';
                    const statusLabel = s.statusLabel || 'Sin Estado';
                    
                    // Colores según estado
                    const statusColors = {
                      'EN_CURSO': 'bg-green-500',
                      'FUTURO': 'bg-blue-500',
                      'FINALIZADO': 'bg-gray-500',
                      'NO_AUTORIZADO': 'bg-red-500'
                    };
                    
                    const statusBadgeColors = {
                      'EN_CURSO': theme === 'dark' ? 'bg-green-900/30 text-green-200 border-green-800' : 'bg-green-100 text-green-800 border-green-200',
                      'FUTURO': theme === 'dark' ? 'bg-blue-900/30 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200',
                      'FINALIZADO': theme === 'dark' ? 'bg-gray-900/30 text-gray-200 border-gray-800' : 'bg-gray-100 text-gray-800 border-gray-200',
                      'NO_AUTORIZADO': theme === 'dark' ? 'bg-red-900/30 text-red-200 border-red-800' : 'bg-red-100 text-red-800 border-red-200'
                    };
                    
                    return (
                      <div key={`principal-${shift.id}`} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                        status === 'EN_CURSO' ? 'border-green-500' : 
                        status === 'FUTURO' ? 'border-blue-500' :
                        status === 'FINALIZADO' ? 'border-gray-500' : 'border-red-500'
                      } ${theme === 'dark' ? 'border border-gray-700 bg-gray-900/40' : 'border border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`w-1.5 sm:w-2 h-8 sm:h-12 rounded-full mt-1 ${statusColors[status]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <span className="text-xs sm:text-sm font-semibold ot-theme-text">
                                {s.name.replace(' (Reemplazo)', '')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full border font-semibold ${statusBadgeColors[status]}`}>
                                  {statusLabel}
                                </span>
                                <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium">
                                  {shift.type}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs sm:text-sm mb-2 font-medium text-blue-600 dark:text-blue-400">
                              ⏰ {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                            </div>
                            {s.description && (
                              <div className="text-xs mb-2 ot-theme-text-muted">{s.description}</div>
                            )}
                            
                            {/* Lista de Modelos Asignadas */}
                            {s.modelosAsignados && s.modelosAsignados.length > 0 && (
                              <div className="mt-2 sm:mt-3">
                                <div className="text-xs font-medium mb-1 ot-theme-text-secondary">
                                  Modelos bajo tu responsabilidad:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {s.modelosAsignados.map((modelo, mIdx) => (
                                    <span 
                                      key={mIdx}
                                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                                        theme === 'dark' 
                                          ? 'bg-purple-900/30 text-purple-200 border border-purple-800' 
                                          : 'bg-purple-100 text-purple-800 border border-purple-200'
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
              <div className={`rounded-xl p-4 sm:p-6 border-2 border-dashed ${
                theme === 'dark' ? 'bg-orange-900/10 border-orange-700' : 'bg-orange-50 border-orange-300'
              }`}>
                <h4 className={`text-sm sm:text-base font-semibold mb-1 ${
                  theme === 'dark' ? 'text-orange-200' : 'text-orange-900'
                }`}>
                  🔄 Turnos Disponibles para Reemplazo
                </h4>
                <p className={`text-xs mb-3 sm:mb-4 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                  Puedes cubrir estos turnos en caso de emergencia o cuando sea necesario
                </p>
                <div className="space-y-3 sm:space-y-4">
                  {turnosReemplazo.map((s, idx) => {
                    const shift = s.schedule as RotatingShift;
                    const status = s.status || 'NO_AUTORIZADO';
                    const statusLabel = s.statusLabel || 'Sin Estado';
                    
                    // Colores más tenues para reemplazos
                    const statusBadgeColors = {
                      'EN_CURSO': theme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-800' : 'bg-green-50 text-green-600 border-green-200',
                      'FUTURO': theme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200',
                      'FINALIZADO': theme === 'dark' ? 'bg-gray-800/20 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200',
                      'NO_AUTORIZADO': theme === 'dark' ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-red-50 text-red-600 border-red-200'
                    };
                    
                    return (
                      <div key={`reemplazo-${shift.id}`} className={`p-3 sm:p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800/30 border-gray-600' : 'bg-white/50 border-gray-300'
                      }`}>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <span className="text-xs sm:text-sm font-medium ot-theme-text">
                                {s.name.replace(' (Reemplazo)', '')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full border ${statusBadgeColors[status]}`}>
                                  {statusLabel}
                                </span>
                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {shift.type}
                                </span>
                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                                  theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  Opcional
                                </span>
                              </div>
                            </div>
                            <div className="text-xs sm:text-sm mb-2 ot-theme-text-secondary">
                              ⏰ {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                            </div>
                            
                            {/* Lista de Modelos Disponibles */}
                            {s.modelosAsignados && s.modelosAsignados.length > 0 && (
                              <div className="mt-2 sm:mt-3">
                                <div className="text-xs font-medium mb-1 ot-theme-text-muted">
                                  Modelos disponibles para reemplazo:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {s.modelosAsignados.map((modelo, mIdx) => (
                                    <span 
                                      key={mIdx}
                                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                                        theme === 'dark' 
                                          ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                                          : 'bg-gray-200 text-gray-600 border border-gray-300'
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

            {/* Nota informativa */}
            <p className="text-xs ot-theme-text-muted text-center">
              El turno <strong className="text-green-600 dark:text-green-400">En Curso</strong> se usa para validar tu marcación actual.
            </p>
          </div>
        );
      })()}

      {/* Contador Regresivo del Turno Activo */}
      {isRotatingSchedule && hasMultiple && (() => {
        // Buscar el turno EN_CURSO
        const activeShift = horario.allAssignedShifts?.find((s: any) => s.status === 'EN_CURSO');
        if (activeShift && activeShift.status) {
          const shift: any = activeShift.schedule;
          return (
            <div className="mt-3 sm:mt-4">
              <ShiftCountdown
                endTime={shift.timeSlot.endTime}
                status={activeShift.status as 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO'}
                shiftName={activeShift.name}
              />
            </div>
          );
        }
        return null;
      })()}

      {/* Horario Fijo */}
      {isFixedSchedule && (
        <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
          <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 ot-theme-text">
            Horario Semanal
          </h4>

          <div className="space-y-2 sm:space-y-3">
            {Object.entries(horario.assignedSchedule.schedule as FixedSchedule).map(([day, slot]) => {
              if (day === 'lunchBreakEnabled' || day === 'lunchBreak' || !slot) return null;
              
              return (
                <div 
                  key={day} 
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm sm:text-base font-medium ot-theme-text">
                    {getDayName(day)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm ot-theme-text-secondary">
                      {(slot as any).startTime} - {(slot as any).endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {(horario.assignedSchedule.schedule as FixedSchedule).lunchBreakEnabled && 
           (horario.assignedSchedule.schedule as FixedSchedule).lunchBreak && (
            <div className={`mt-3 sm:mt-4 p-3 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-orange-900/20 border-orange-800' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                }`}>
                  Descanso para almuerzo
                </span>
                <span className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                }`}>
                  {(horario.assignedSchedule.schedule as FixedSchedule).lunchBreak?.startTime} - {' '}
                  {(horario.assignedSchedule.schedule as FixedSchedule).lunchBreak?.endTime}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Turno Rotativo */}
      {isRotatingSchedule && !hasMultiple && (
        <div className="rounded-xl p-4 sm:p-6 border ot-theme-card">
          <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 ot-theme-text">
            Turno Asignado
          </h4>

          <div className={`p-3 sm:p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-base sm:text-lg font-semibold mb-2 ot-theme-text">
              {horario.assignedSchedule.name}
            </div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-xs sm:text-sm ot-theme-text-secondary">
                {(horario.assignedSchedule.schedule as RotatingShift).timeSlot.startTime} - {' '}
                {(horario.assignedSchedule.schedule as RotatingShift).timeSlot.endTime}
              </span>
            </div>
            {horario.assignedSchedule.description && (
              <p className="text-xs sm:text-sm mb-2 sm:mb-3 ot-theme-text-muted">
                {horario.assignedSchedule.description}
              </p>
            )}
            
            {/* Lista de Modelos Asignadas */}
            {horario.assignedSchedule.modelosAsignados && horario.assignedSchedule.modelosAsignados.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <div className="text-xs font-medium mb-1 sm:mb-2 ot-theme-text-secondary">
                  Modelos asignadas:
                </div>
                <div className="flex flex-wrap gap-1">
                  {horario.assignedSchedule.modelosAsignados.map((modelo, mIdx) => (
                    <span 
                      key={mIdx}
                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                        theme === 'dark' 
                          ? 'bg-purple-900/30 text-purple-200 border border-purple-800' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {modelo.length > 15 ? `${modelo.substring(0, 15)}...` : modelo}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
