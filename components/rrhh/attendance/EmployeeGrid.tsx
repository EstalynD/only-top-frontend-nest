"use client";

import React, { useState } from 'react';
import { EmployeeCard } from './EmployeeCard';
import { useAttendanceContext } from './AttendanceContext';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import EmployeeDetailModal from './EmployeeDetailModal';

export function EmployeeGrid() {
  const { filteredEmployees, loading, timeFormat, isAttendanceAllowed, enabledFromIso } = useAttendanceContext();
  const [historyForUser, setHistoryForUser] = useState<{ id: string; name: string } | null>(null);
  const [detailForUser, setDetailForUser] = useState<any>(null);

  const formatScheduleDisplay = (schedule: any) => {
    if (!schedule) return {
      type: 'NONE',
      name: 'Sin horario asignado',
      timeRange: '',
      description: 'No hay horario asignado',
      fullDisplay: 'Sin horario asignado'
    };
    
    if (schedule.scheduleType === 'ROTATING' && schedule.assignedSchedule?.schedule) {
      const shift = schedule.assignedSchedule.schedule;
      const name = shift.name || 'Turno';
      const startTime = shift.timeSlot?.startTime || '';
      const endTime = shift.timeSlot?.endTime || '';
      const description = shift.description || '';
      
      return {
        type: 'ROTATING',
        name,
        timeRange: `${startTime} - ${endTime}`,
        description: description || `${name} - ${startTime} a ${endTime}`,
        fullDisplay: `${name}\n${name} - ${startTime} a ${endTime}`
      };
    }
    
    if (schedule.scheduleType === 'FIXED' && schedule.assignedSchedule?.schedule) {
      const fixed = schedule.assignedSchedule.schedule;
      const monday = fixed.monday;
      if (monday) {
        return {
          type: 'FIXED',
          name: 'Horario Fijo',
          timeRange: `${monday.startTime} - ${monday.endTime}`,
          description: `Lunes a Viernes ${monday.startTime} - ${monday.endTime}`,
          fullDisplay: `Horario Fijo\nLunes a Viernes ${monday.startTime} - ${monday.endTime}`
        };
      }
    }
    
    return {
      type: 'UNKNOWN',
      name: 'Horario configurado',
      timeRange: '',
      description: 'Horario configurado',
      fullDisplay: 'Horario configurado'
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 animate-pulse h-full">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 sm:mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
          No se encontraron empleados
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Intenta ajustar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onViewHistory={() => setHistoryForUser({ 
              id: employee._id, 
              name: `${employee.nombre} ${employee.apellido}` 
            })}
            onViewDetails={() => setDetailForUser(employee)}
            formatScheduleDisplay={formatScheduleDisplay}
          />
        ))}
      </div>

      {/* Modal de historial */}
      {historyForUser && (
        <AttendanceHistoryModal
          isOpen={true}
          userId={historyForUser.id}
          titleSuffix={historyForUser.name}
          isEmpleadoId={true}
          onClose={() => setHistoryForUser(null)}
        />
      )}

      {/* Modal de detalles */}
      {detailForUser && (
        <EmployeeDetailModal
          employee={detailForUser}
          isOpen={true}
          onClose={() => setDetailForUser(null)}
          formatScheduleDisplay={formatScheduleDisplay}
          timeFormat={timeFormat}
          isAttendanceAllowed={isAttendanceAllowed}
          enabledFromIso={enabledFromIso}
        />
      )}
    </>
  );
}
