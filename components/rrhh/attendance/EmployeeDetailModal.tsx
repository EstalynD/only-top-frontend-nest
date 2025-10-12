"use client";

import React from 'react';
import { useTheme } from '@/lib/theme';
import {
  X,
  User,
  Clock,
  Calendar,
  MapPin,
  FileText,
  Coffee,
  LogIn,
  LogOut,
  CoffeeIcon,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatTime } from '@/lib/service-rrhh/attendance.api';
import type { EnrichedEmployee } from './AttendanceContext';

interface EmployeeDetailModalProps {
  employee: EnrichedEmployee | null;
  isOpen: boolean;
  onClose: () => void;
  formatScheduleDisplay: (schedule: any) => {
    type: string;
    name: string;
    timeRange: string;
    description: string;
    fullDisplay: string;
  };
  timeFormat: '12h' | '24h';
  isAttendanceAllowed: boolean;
  enabledFromIso: string | null;
}

export default function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
  formatScheduleDisplay,
  timeFormat,
  isAttendanceAllowed,
  enabledFromIso
}: EmployeeDetailModalProps) {
  const { theme } = useTheme();

  if (!isOpen || !employee) return null;

  const use12h = timeFormat === '12h';
  const fromDate = enabledFromIso ? new Date(enabledFromIso) : null;

  const getShiftStatusColor = (status?: string) => {
    switch (status) {
      case 'EN_CURSO':
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' };
      case 'FUTURO':
        return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
      case 'FINALIZADO':
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };
      default:
        return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
    }
  };

  const shiftColors = getShiftStatusColor(employee.currentShiftStatus);
  const scheduleInfo = formatScheduleDisplay(employee.schedule);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Empleado"
      icon={
        <div className={`p-1.5 sm:p-2 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
        }`}>
          <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header con foto y nombre */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg sm:text-xl">
              {employee.nombre[0]}{employee.apellido[0]}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-gray-800
              ${employee.status === 'PRESENT' ? 'bg-green-500' : 
                employee.status === 'LATE' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {employee.nombre} {employee.apellido}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
              {employee.correoElectronico}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                {employee.areaId?.name || 'Sin área'}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
                {employee.cargoId?.name || 'Sin cargo'}
              </span>
              {employee.isSupernumerary && (
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Supernumerario
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estado del turno */}
        {employee.currentShiftStatus && employee.currentShiftName && (
          <div className={`p-3 sm:p-4 rounded-lg border ${shiftColors.bg} ${shiftColors.border}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm sm:text-base font-medium ${shiftColors.text}`}>
                {employee.currentShiftName}
              </span>
              <span className={`text-xs sm:text-sm ${shiftColors.text}`}>
                {employee.currentShiftStatus === 'EN_CURSO' && '🟢 En Curso'}
                {employee.currentShiftStatus === 'FUTURO' && '🕒 Próximo'}
                {employee.currentShiftStatus === 'FINALIZADO' && '🔴 Finalizado'}
              </span>
            </div>
          </div>
        )}

        {/* Información de horario */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
            Información de Horario
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tipo de Horario</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {scheduleInfo.type === 'ROTATING' ? 'Turnos Rotativos' : 
                 scheduleInfo.type === 'FIXED' ? 'Horario Fijo' : 'Configurado'}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Nombre del Horario</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {scheduleInfo.name}
              </p>
            </div>
            
            {scheduleInfo.timeRange && (
              <div>
                <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Horario Asignado</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {scheduleInfo.timeRange}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tolerancia</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {employee.schedule?.toleranceMinutes || 15} minutos
              </p>
            </div>
            
            <div>
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Duración de Descanso</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {employee.schedule?.breakDurationMinutes || 30} minutos
              </p>
            </div>
            
            <div>
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Estado de Asistencia</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isAttendanceAllowed ? 'Habilitado' : 'Deshabilitado'}
              </p>
            </div>
          </div>
          
          {scheduleInfo.description && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Descripción</p>
              <p className="text-sm text-gray-900 dark:text-white break-words">
                {scheduleInfo.description}
              </p>
            </div>
          )}
        </div>

        {/* Tiempos de asistencia del día */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
            Asistencia del Día
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <LogIn className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Entrada</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.checkIn ? formatTime(employee.checkIn, use12h) : 'No registrada'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Salida</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.checkOut ? formatTime(employee.checkOut, use12h) : 'No registrada'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Coffee className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Inicio de Descanso</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.breakStart ? formatTime(employee.breakStart, use12h) : 'No registrado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CoffeeIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Fin de Descanso</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.breakEnd ? formatTime(employee.breakEnd, use12h) : 'No registrado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas y notificaciones */}
        {(employee.isLate || (employee.memorandumsPendientes || 0) > 0) && (
          <div className="space-y-3">
            {employee.isLate && employee.lateMinutes && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Llegada Tardía
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Llegó {employee.lateMinutes} minutos tarde
                  </p>
                </div>
              </div>
            )}

            {(employee.memorandumsPendientes || 0) > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Memorandos Pendientes
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {employee.memorandumsPendientes} memorando(s) pendiente(s) de revisión
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progreso del día */}
        {employee.workProgress !== undefined && (
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
              Progreso del Día
            </h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progreso de trabajo</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.round(employee.workProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(employee.workProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Modelos asignadas */}
        {employee.schedule?.allAssignedShifts && employee.schedule.allAssignedShifts.length > 0 && (
          <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-sm sm:text-base font-semibold text-purple-800 dark:text-purple-200 mb-3">
              Modelos Asignadas
            </h3>
            <div className="space-y-2">
              {employee.schedule.allAssignedShifts.map((shift, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {shift.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {shift.schedule?.timeSlot?.startTime} - {shift.schedule?.timeSlot?.endTime}
                    </p>
                  </div>
                  {shift.modelosAsignados && shift.modelosAsignados.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                      {shift.modelosAsignados.length} modelo{shift.modelosAsignados.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado de disponibilidad */}
        {!isAttendanceAllowed && fromDate && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Asistencia Deshabilitada
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Disponible desde {fromDate.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-sm"
        >
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
