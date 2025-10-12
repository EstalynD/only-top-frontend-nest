"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Plus, ToggleRight, ToggleLeft, Edit3, Trash2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { Shift, TimeSlot } from '@/lib/service-sistema/attendance.api';
import { formatTimeRange, calculateClientDuration, formatDuration, getShiftTypeIcon } from '@/lib/service-sistema/attendance.api';

function getShiftDuration(ts: TimeSlot) {
  const d = calculateClientDuration(ts);
  return formatDuration(d.minutes);
}

export function RotatingShiftsList({
  shifts,
  onNew,
  onToggle,
  onEdit,
  onDelete,
}: {
  shifts: Shift[];
  onNew: () => void;
  onToggle: (shift: Shift) => void;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
}) {
  const { theme } = useTheme();
  
  return (
    <Card>
      <div className="p-4 sm:p-6">
        {/* Header Responsivo */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
            }`}>
              <RotateCcw size={18} className={`sm:w-5 sm:h-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Turnos Rotativos
            </h2>
          </div>
          <Button 
            onClick={onNew} 
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            size="sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Turno</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {shifts.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {shifts.map((shift) => (
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
                      {getShiftTypeIcon(shift.type)}
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
                        <span>{formatTimeRange(shift.timeSlot)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{getShiftDuration(shift.timeSlot)}</span>
                        {shift.description && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="break-words max-w-[200px] sm:max-w-none">
                              {shift.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                  <Button 
                    onClick={() => onToggle(shift)} 
                    variant={shift.isActive ? 'danger' : 'success'} 
                    className="p-2 sm:p-2.5" 
                    size="sm"
                    title={shift.isActive ? 'Desactivar turno' : 'Activar turno'}
                  >
                    {shift.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </Button>
                  <Button 
                    onClick={() => onEdit(shift)} 
                    variant="neutral" 
                    className="p-2 sm:p-2.5" 
                    size="sm"
                    title="Editar turno"
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button 
                    onClick={() => onDelete(shift)} 
                    variant="danger" 
                    className="p-2 sm:p-2.5" 
                    size="sm"
                    title="Eliminar turno"
                  >
                    <Trash2 size={16} />
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
            <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Crea el primer turno rotativo
            </p>
            <Button
              onClick={onNew}
              variant="primary"
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium"
            >
              Crear Primer Turno
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default RotatingShiftsList;
