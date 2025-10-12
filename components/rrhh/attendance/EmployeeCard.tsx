"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  History,
  LogIn,
  LogOut,
  Coffee,
  CoffeeIcon,
  AlertTriangle,
  FileText,
  Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { markAttendanceForEmployee, formatTime } from '@/lib/service-rrhh/attendance.api';
import { useAttendanceContext, type EnrichedEmployee } from './AttendanceContext';

interface EmployeeCardProps {
  employee: EnrichedEmployee;
  onViewHistory: () => void;
  onViewDetails: () => void;
  formatScheduleDisplay: (schedule: any) => {
    type: string;
    name: string;
    timeRange: string;
    description: string;
    fullDisplay: string;
  };
}

export function EmployeeCard({ employee, onViewHistory, onViewDetails, formatScheduleDisplay }: EmployeeCardProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const { refreshSingleEmployee, timeFormat, isAttendanceAllowed, enabledFromIso } = useAttendanceContext();
  const [actionLoading, setActionLoading] = useState(false);

  const use12h = timeFormat === '12h';
  const fromDate = enabledFromIso ? new Date(enabledFromIso) : null;

  const handleAction = async (type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END') => {
    if (!token) return;
    
    setActionLoading(true);
    try {
      await markAttendanceForEmployee(token, employee._id, {
        type,
        notes: `Marcado por administrador`,
        deviceInfo: {
          userAgent: navigator.userAgent,
          ipAddress: '0.0.0.0',
          platform: 'Admin Panel'
        }
      });
      
      toast({
        type: 'success',
        title: 'Asistencia registrada',
        description: `${type} registrado correctamente`
      });
      
      await refreshSingleEmployee(employee._id);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const StatusIcon = employee.status === 'PRESENT' ? CheckCircle : 
                     employee.status === 'LATE' ? AlertCircle : Clock;

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

  return (
    <Card className="p-3 sm:p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Header con foto y nombre */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {employee.nombre[0]}{employee.apellido[0]}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-gray-800
              ${employee.status === 'PRESENT' ? 'bg-green-500' : 
                employee.status === 'LATE' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {employee.nombre} {employee.apellido}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {employee.correoElectronico}
            </p>
          </div>
        </div>
        
        {/* Badge de estado */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
            employee.status === 'PRESENT' ? 'text-green-600' :
            employee.status === 'LATE' ? 'text-yellow-600' : 'text-gray-400'
          }`} />
        </div>
      </div>

      {/* Información de área y cargo */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded truncate max-w-full">
          {employee.areaId?.name || 'Sin área'}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 truncate max-w-full">
          {employee.cargoId?.name || 'Sin cargo'}
        </span>
        {employee.isSupernumerary && (
          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
            <span className="hidden sm:inline">🌟 Supernumerario</span>
            <span className="sm:hidden">🌟</span>
          </span>
        )}
      </div>

      {/* Estado del turno */}
      {employee.currentShiftStatus && employee.currentShiftName && (
        <div className={`mb-3 p-2 rounded-lg border ${shiftColors.bg} ${shiftColors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${shiftColors.text}`}>
              {employee.currentShiftName}
            </span>
            <span className={`text-xs ${shiftColors.text}`}>
              {employee.currentShiftStatus === 'EN_CURSO' && '🟢 En Curso'}
              {employee.currentShiftStatus === 'FUTURO' && '🕒 Próximo'}
              {employee.currentShiftStatus === 'FINALIZADO' && '🔴 Finalizado'}
            </span>
          </div>
        </div>
      )}

      {/* Horario simplificado */}
      <div className="mb-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {(() => {
          const scheduleInfo = formatScheduleDisplay(employee.schedule);
          return (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {scheduleInfo.name}
              </p>
              {scheduleInfo.timeRange && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {scheduleInfo.timeRange}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Estado de asistencia simplificado */}
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Estado:</span>
          <span className={`font-medium ${
            employee.status === 'PRESENT' ? 'text-green-600' :
            employee.status === 'LATE' ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {employee.status === 'PRESENT' ? 'Presente' :
             employee.status === 'LATE' ? 'Tardanza' : 'Ausente'}
          </span>
        </div>
        {employee.checkIn && (
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600 dark:text-gray-400">Entrada:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(employee.checkIn, use12h)}
            </span>
          </div>
        )}
      </div>

      {/* Alertas compactas */}
      <div className="mb-3 space-y-1">
        {employee.isLate && employee.lateMinutes && (
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Tardanza: {employee.lateMinutes} min</span>
          </div>
        )}
        {(employee.memorandumsPendientes || 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{employee.memorandumsPendientes} memorando(s)</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        {/* Botones principales - Grid responsivo */}
        <div className="grid grid-cols-2 gap-2">
          {employee.currentAttendance?.allowedTypes?.includes('CHECK_IN') && (
            <Button
              onClick={() => handleAction('CHECK_IN')}
              disabled={actionLoading || !isAttendanceAllowed}
              className="text-xs h-8"
              variant="primary"
            >
              <LogIn className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Entrada</span>
              <span className="sm:hidden">Ent.</span>
            </Button>
          )}

          {employee.currentAttendance?.allowedTypes?.includes('BREAK_START') && (
            <Button
              onClick={() => handleAction('BREAK_START')}
              disabled={actionLoading || !isAttendanceAllowed}
              className="text-xs h-8"
              variant="secondary"
            >
              <Coffee className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Inicio Descanso</span>
              <span className="sm:hidden">Desc.</span>
            </Button>
          )}

          {employee.currentAttendance?.allowedTypes?.includes('BREAK_END') && (
            <Button
              onClick={() => handleAction('BREAK_END')}
              disabled={actionLoading || !isAttendanceAllowed}
              className="text-xs h-8"
              variant="secondary"
            >
              <CoffeeIcon className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Fin Descanso</span>
              <span className="sm:hidden">Fin Desc.</span>
            </Button>
          )}

          {employee.currentAttendance?.allowedTypes?.includes('CHECK_OUT') && (
            <Button
              onClick={() => handleAction('CHECK_OUT')}
              disabled={actionLoading || !isAttendanceAllowed}
              className="text-xs h-8"
              variant="secondary"
            >
              <LogOut className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Salida</span>
              <span className="sm:hidden">Sal.</span>
            </Button>
          )}

          {(!employee.currentAttendance?.allowedTypes || employee.currentAttendance.allowedTypes.length === 0) && (
            <Button
              disabled
              className="col-span-2 text-xs h-8"
              variant="secondary"
            >
              No hay acciones disponibles
            </Button>
          )}
        </div>
        
        {/* Botones de información - Grid responsivo */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onViewDetails}
            className="text-xs h-8"
            variant="ghost"
          >
            <Eye className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Detalles</span>
            <span className="sm:hidden">Det.</span>
          </Button>
          
          <Button
            onClick={onViewHistory}
            className="text-xs h-8"
            variant="ghost"
          >
            <History className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Historial</span>
            <span className="sm:hidden">Hist.</span>
          </Button>
        </div>
      </div>

      {!isAttendanceAllowed && fromDate && (
        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-orange-700 dark:text-orange-300 truncate">
              Disponible desde {fromDate.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
