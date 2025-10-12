"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, RotateCcw, Building2, Briefcase, Users2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { AttendanceConfig } from '@/lib/service-sistema/attendance.api';
import type { Area, Cargo } from '@/lib/service-rrhh/types';

interface AttendanceAssignmentsSectionProps {
  config: AttendanceConfig | null;
  areas: Area[];
  cargos: Cargo[];
  onOpenAssignmentsModal: (scheduleType: 'FIXED' | 'ROTATING', shift?: any) => void;
}

export function AttendanceAssignmentsSection({
  config,
  areas,
  cargos,
  onOpenAssignmentsModal,
}: AttendanceAssignmentsSectionProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Horario Fijo - Asignaciones */}
      {config?.fixedScheduleEnabled && (
        <Card>
          <div className="p-4 sm:p-6">
            {/* Header Responsivo */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
                }`}>
                  <Calendar size={18} className={`sm:w-5 sm:h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <h2 className={`text-base sm:text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Horario Fijo - Asignaciones
                </h2>
              </div>
              <Button 
                onClick={() => onOpenAssignmentsModal('FIXED')}
                className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                size="sm"
              >
                <Users2 size={16} />
                <span className="hidden sm:inline">Gestionar Asignaciones</span>
                <span className="sm:hidden">Gestionar</span>
              </Button>
            </div>

            {/* Grid de Asignaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Áreas Asignadas */}
              <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className={`p-1.5 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
                  }`}>
                    <Building2 size={16} className={`sm:w-4 sm:h-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Áreas Asignadas
                  </span>
                </div>
                <p className={`text-sm sm:text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {config.fixedSchedule?.assignedAreas?.length || 0} áreas asignadas
                </p>
                {config.fixedSchedule?.assignedAreas && config.fixedSchedule.assignedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {config.fixedSchedule.assignedAreas.slice(0, 3).map(areaId => {
                      const area = areas.find(a => a._id === areaId);
                      return area ? (
                        <span 
                          key={areaId}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {area.name}
                        </span>
                      ) : null;
                    })}
                    {config.fixedSchedule.assignedAreas.length > 3 && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-800 text-gray-400 border border-gray-700'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        +{config.fixedSchedule.assignedAreas.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Cargos Asignados */}
              <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className={`p-1.5 rounded-lg ${
                    theme === 'dark' ? 'bg-green-800/50' : 'bg-green-100'
                  }`}>
                    <Briefcase size={16} className={`sm:w-4 sm:h-4 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Cargos Asignados
                  </span>
                </div>
                <p className={`text-sm sm:text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {config.fixedSchedule?.assignedCargos?.length || 0} cargos asignados
                </p>
                {config.fixedSchedule?.assignedCargos && config.fixedSchedule.assignedCargos.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {config.fixedSchedule.assignedCargos.slice(0, 3).map(cargoId => {
                      const cargo = cargos.find(c => c._id === cargoId);
                      return cargo ? (
                        <span 
                          key={cargoId}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            theme === 'dark'
                              ? 'bg-green-900/30 text-green-400 border border-green-800'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}
                        >
                          {cargo.name}
                        </span>
                      ) : null;
                    })}
                    {config.fixedSchedule.assignedCargos.length > 3 && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-800 text-gray-400 border border-gray-700'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        +{config.fixedSchedule.assignedCargos.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Turnos Rotativos - Asignaciones */}
      {config?.rotatingShiftsEnabled && (
        <Card>
          <div className="p-4 sm:p-6">
            {/* Header Responsivo */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-green-800/50' : 'bg-green-100'
                }`}>
                  <RotateCcw size={18} className={`sm:w-5 sm:h-5 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <h2 className={`text-base sm:text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Turnos Rotativos - Asignaciones
                </h2>
              </div>
            </div>

            {config.rotatingShifts.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {config.rotatingShifts.map((shift) => (
                  <div 
                    key={shift.id}
                    className={`flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Información del turno */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-lg sm:text-xl flex-shrink-0">
                          {/* Aquí iría el icono del tipo de turno */}
                          <span>🕐</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className={`font-medium text-sm sm:text-base truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {shift.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                              shift.isActive
                                ? theme === 'dark'
                                  ? 'bg-green-900/30 text-green-400 border border-green-800'
                                  : 'bg-green-100 text-green-800 border border-green-200'
                                : theme === 'dark'
                                  ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {shift.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <span>{shift.timeSlot.startTime} - {shift.timeSlot.endTime}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{shift.assignedAreas?.length || 0} áreas</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{shift.assignedCargos?.length || 0} cargos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón de gestión */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                      <Button
                        onClick={() => onOpenAssignmentsModal('ROTATING', shift)}
                        variant="neutral"
                        className="flex items-center gap-2 w-full sm:w-auto"
                        size="sm"
                      >
                        <Users2 size={16} />
                        <span className="hidden sm:inline">Gestionar</span>
                        <span className="sm:hidden">Gestionar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <RotateCcw size={32} className={`sm:w-10 sm:h-10 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  No hay turnos configurados
                </h3>
                <p className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Crea turnos para gestionar asignaciones
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AttendanceAssignmentsSection;
