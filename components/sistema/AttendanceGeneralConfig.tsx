"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Settings, Timer, Clock, Calendar, Users } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { AttendanceConfig } from '@/lib/service-sistema/attendance.api';

interface AttendanceGeneralConfigProps {
  config: AttendanceConfig | null;
}

export function AttendanceGeneralConfig({ config }: AttendanceGeneralConfigProps) {
  const { theme } = useTheme();

  if (!config) return null;

  return (
    <Card>
      <div className="p-4 sm:p-6">
        {/* Header Responsivo */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className={`p-2 rounded-lg ${
            theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
          }`}>
            <Settings size={18} className={`sm:w-5 sm:h-5 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <h2 className={`text-base sm:text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Configuración General
          </h2>
        </div>
        
        {/* Grid Responsivo de Configuraciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Duración de descanso */}
          <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
              }`}>
                <Timer size={16} className={`sm:w-4 sm:h-4 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Duración de descanso
              </span>
            </div>
            <p className={`text-lg sm:text-xl font-semibold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {config.breakDurationMinutes} min
            </p>
          </div>
          
          {/* Tolerancia */}
          <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-green-800/50' : 'bg-green-100'
              }`}>
                <Clock size={16} className={`sm:w-4 sm:h-4 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Tolerancia
              </span>
            </div>
            <p className={`text-lg sm:text-xl font-semibold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              {config.toleranceMinutes} min
            </p>
          </div>
          
          {/* Fines de semana */}
          <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-purple-800/50' : 'bg-purple-100'
              }`}>
                <Calendar size={16} className={`sm:w-4 sm:h-4 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Fines de semana
              </span>
            </div>
            <p className={`text-sm sm:text-base font-semibold ${
              config.weekendEnabled 
                ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                : theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {config.weekendEnabled ? 'Habilitado' : 'Deshabilitado'}
            </p>
          </div>
          
          {/* Horas extra */}
          <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className={`p-1.5 rounded-lg ${
                theme === 'dark' ? 'bg-yellow-800/50' : 'bg-yellow-100'
              }`}>
                <Users size={16} className={`sm:w-4 sm:h-4 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Horas extra
              </span>
            </div>
            <p className={`text-sm sm:text-base font-semibold ${
              config.overtimeEnabled 
                ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                : theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {config.overtimeEnabled ? 'Habilitado' : 'Deshabilitado'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AttendanceGeneralConfig;
