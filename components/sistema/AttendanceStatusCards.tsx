"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Calendar, RotateCcw } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export function AttendanceStatusCards({
  fixedEnabled,
  rotatingEnabled,
  onToggleFixed,
  onToggleRotating,
}: {
  fixedEnabled: boolean;
  rotatingEnabled: boolean;
  onToggleFixed: (next: boolean) => void;
  onToggleRotating: (next: boolean) => void;
}) {
  const { theme } = useTheme();
  const [confirmModal, setConfirmModal] = React.useState<{
    show: boolean;
    type: 'fixed' | 'rotating';
    action: 'enable' | 'disable';
  }>({ show: false, type: 'fixed', action: 'enable' });

  const handleToggle = (type: 'fixed' | 'rotating', currentState: boolean) => {
    const action = currentState ? 'disable' : 'enable';
    
    if (action === 'disable') {
      // Mostrar confirmación para deshabilitar
      setConfirmModal({ show: true, type, action });
    } else {
      // Habilitar directamente
      if (type === 'fixed') {
        onToggleFixed(true);
      } else {
        onToggleRotating(true);
      }
    }
  };

  const handleConfirm = () => {
    if (confirmModal.type === 'fixed') {
      onToggleFixed(false);
    } else {
      onToggleRotating(false);
    }
    setConfirmModal({ show: false, type: 'fixed', action: 'enable' });
  };
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Horario Fijo Card */}
        <Card>
          <div className={`p-3 sm:p-4 lg:p-6 rounded-xl border transition-all duration-200 ${
            fixedEnabled 
              ? theme === 'dark'
                ? 'bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/10'
              : theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700 opacity-70'
                : 'bg-gray-50 border-gray-200 opacity-70'
          }`}>
            {/* Header - Responsive Layout */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  fixedEnabled 
                    ? theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <Calendar size={16} className={`sm:w-[18px] sm:h-[18px] ${
                    fixedEnabled 
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold text-sm sm:text-base lg:text-lg truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Horario Fijo
                  </h3>
                </div>
              </div>
              
              {/* Controls - Responsive Layout */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <span className={`px-2 py-1 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap ${
                  fixedEnabled
                    ? theme === 'dark'
                      ? 'bg-green-900/30 text-green-400 border border-green-800'
                      : 'bg-green-100 text-green-800 border border-green-200'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400 border border-gray-700'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {fixedEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
                <Button 
                  onClick={() => handleToggle('fixed', fixedEnabled)} 
                  variant={fixedEnabled ? 'danger' : 'success'} 
                  size="sm"
                  className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">
                    {fixedEnabled ? 'Deshabilitar' : 'Habilitar'}
                  </span>
                  <span className="sm:hidden">
                    {fixedEnabled ? 'Desact.' : 'Activar'}
                  </span>
                </Button>
              </div>
            </div>
            
            {/* Description */}
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Horario estándar de oficina con horarios fijos para cada día de la semana.
            </p>
          </div>
        </Card>

        {/* Turnos Rotativos Card */}
        <Card>
          <div className={`p-3 sm:p-4 lg:p-6 rounded-xl border transition-all duration-200 ${
            rotatingEnabled 
              ? theme === 'dark'
                ? 'bg-green-900/20 border-green-500/50 shadow-lg shadow-green-500/10'
                : 'bg-green-50 border-green-500 shadow-lg shadow-green-500/10'
              : theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700 opacity-70'
                : 'bg-gray-50 border-gray-200 opacity-70'
          }`}>
            {/* Header - Responsive Layout */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  rotatingEnabled 
                    ? theme === 'dark' ? 'bg-green-800/50' : 'bg-green-100'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <RotateCcw size={16} className={`sm:w-[18px] sm:h-[18px] ${
                    rotatingEnabled 
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold text-sm sm:text-base lg:text-lg truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Turnos Rotativos
                  </h3>
                </div>
              </div>
              
              {/* Controls - Responsive Layout */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <span className={`px-2 py-1 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap ${
                  rotatingEnabled
                    ? theme === 'dark'
                      ? 'bg-green-900/30 text-green-400 border border-green-800'
                      : 'bg-green-100 text-green-800 border border-green-200'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400 border border-gray-700'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {rotatingEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
                <Button 
                  onClick={() => handleToggle('rotating', rotatingEnabled)} 
                  variant={rotatingEnabled ? 'danger' : 'success'} 
                  size="sm"
                  className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">
                    {rotatingEnabled ? 'Deshabilitar' : 'Habilitar'}
                  </span>
                  <span className="sm:hidden">
                    {rotatingEnabled ? 'Desact.' : 'Activar'}
                  </span>
                </Button>
              </div>
            </div>
            
            {/* Description */}
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Sistema de turnos flexibles que pueden asignarse según área y cargo.
            </p>
          </div>
        </Card>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, type: 'fixed', action: 'enable' })}
        onConfirm={handleConfirm}
        title={`Deshabilitar ${confirmModal.type === 'fixed' ? 'Horario Fijo' : 'Turnos Rotativos'}`}
        message={
          confirmModal.type === 'fixed'
            ? '¿Estás seguro de que deseas deshabilitar el horario fijo? Esto afectará a todos los empleados que tengan asignado este tipo de horario.'
            : '¿Estás seguro de que deseas deshabilitar los turnos rotativos? Esto afectará a todos los empleados que tengan asignado este tipo de horario.'
        }
        confirmText="Deshabilitar"
        cancelText="Cancelar"
        variant="warning"
        icon={<Calendar size={20} />}
      />
    </>
  );
}

export default AttendanceStatusCards;
