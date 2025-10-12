"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';

export function AttendanceHeader() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex-1 min-w-0">
        <h1 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold truncate ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Configuración de Asistencia
        </h1>
        <p className={`text-sm sm:text-base lg:text-lg mt-1 sm:mt-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Administra horarios fijos y turnos rotativos para tu organización
        </p>
      </div>
    </div>
  );
}

export default AttendanceHeader;
