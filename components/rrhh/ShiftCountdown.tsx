"use client";
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ShiftCountdownProps {
  endTime: string; // Formato "HH:MM"
  status: 'EN_CURSO' | 'FUTURO' | 'FINALIZADO' | 'NO_AUTORIZADO';
  shiftName: string;
}

export default function ShiftCountdown({ endTime, status, shiftName }: ShiftCountdownProps) {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } | null>(null);

  useEffect(() => {
    // Solo mostrar countdown para turnos en curso
    if (status !== 'EN_CURSO') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Crear fecha objetivo con la hora de fin
      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);
      
      // Si la hora de fin es menor que la actual, es para el día siguiente
      if (endDate <= now) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      const diffMs = endDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeRemaining(null);
        return;
      }
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setTimeRemaining({ hours, minutes, seconds, totalSeconds });
    };

    // Calcular inmediatamente
    calculateTimeRemaining();
    
    // Actualizar cada segundo
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endTime, status]);

  // No mostrar si no es turno en curso o no hay tiempo calculado
  if (status !== 'EN_CURSO' || !timeRemaining) {
    return null;
  }

  // Determinar color según tiempo restante
  const getColorClasses = () => {
    if (timeRemaining.totalSeconds <= 1800) { // Menos de 30 minutos
      return {
        bg: theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200',
        text: theme === 'dark' ? 'text-red-200' : 'text-red-700',
        icon: 'text-red-500'
      };
    } else if (timeRemaining.totalSeconds <= 3600) { // Menos de 1 hora
      return {
        bg: theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
        text: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700',
        icon: 'text-yellow-500'
      };
    } else {
      return {
        bg: theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200',
        text: theme === 'dark' ? 'text-green-200' : 'text-green-700',
        icon: 'text-green-500'
      };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`rounded-lg p-2 sm:p-3 border ${colors.bg}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.icon}`} />
        <span className={`text-xs sm:text-sm font-medium ${colors.text}`}>
          Tu turno termina en:
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {/* Horas */}
        <div className="flex flex-col items-center">
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold tabular-nums ${colors.text}`}>
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
          <span className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            horas
          </span>
        </div>
        
        <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${colors.text}`}>:</span>
        
        {/* Minutos */}
        <div className="flex flex-col items-center">
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold tabular-nums ${colors.text}`}>
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          <span className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            minutos
          </span>
        </div>
        
        <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${colors.text}`}>:</span>
        
        {/* Segundos */}
        <div className="flex flex-col items-center">
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold tabular-nums ${colors.text}`}>
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <span className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            segundos
          </span>
        </div>
      </div>
      
      {/* Mensaje adicional según tiempo restante */}
      {timeRemaining.totalSeconds <= 1800 && (
        <div className={`text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 text-center ${colors.text}`}>
          ⚠️ Recuerda marcar tu salida antes de que termine tu turno
        </div>
      )}
    </div>
  );
}
