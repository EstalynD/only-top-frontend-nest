"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import EmpleadoDetallePage from '@/components/rrhh/EmpleadoDetallePage';

export default function EmpleadoDetalle() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuth();
  const { theme } = useTheme();

  const empleadoId = params.id as string;

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <p className={`font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <svg className={`w-8 h-8 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Acceso no autorizado</h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  if (!empleadoId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'
          }`}>
            <svg className={`w-8 h-8 ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>ID de empleado no válido</h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            El ID del empleado no es válido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <EmpleadoDetallePage 
          empleadoId={empleadoId} 
          token={token}
          onBack={() => router.push('/rrhh/empleados')}
        />
      </div>
    </div>
  );
}
