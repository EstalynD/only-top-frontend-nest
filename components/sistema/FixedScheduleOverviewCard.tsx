"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Edit3 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { FixedSchedule, TimeSlot } from '@/lib/service-sistema/attendance.api';
import { formatTimeRange, calculateClientDuration, formatDuration } from '@/lib/service-sistema/attendance.api';

function getDayName(day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') {
  const map = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' } as const;
  return map[day];
}

function getShiftDuration(ts: TimeSlot) {
  const d = calculateClientDuration(ts);
  return formatDuration(d.minutes);
}

export function FixedScheduleOverviewCard({ fixedSchedule, onEdit }: { fixedSchedule?: FixedSchedule; onEdit: () => void }) {
  const { theme } = useTheme();
  
  if (!fixedSchedule) return null;
  
  return (
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
              Horario Fijo (Oficina Estándar)
            </h2>
          </div>
          <Button 
            onClick={onEdit} 
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            size="sm"
          >
            <Edit3 size={16} />
            <span className="hidden sm:inline">Editar Horario</span>
            <span className="sm:hidden">Editar</span>
          </Button>
        </div>

        {/* Grid Responsivo de Días */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(fixedSchedule).map(([day, timeSlot]) => (
            timeSlot && (
              <div 
                key={day} 
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Header del día */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className={`font-medium text-sm sm:text-base ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getDayName(day as any)}
                  </span>
                  <span className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium ${
                    theme === 'dark'
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {getShiftDuration(timeSlot as TimeSlot)}
                  </span>
                </div>
                
                {/* Horario */}
                <p className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {formatTimeRange(timeSlot as TimeSlot)}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    </Card>
  );
}

export default FixedScheduleOverviewCard;
