"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';
import { X, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type { ReplacementInfo, AttendanceType } from '@/lib/service-rrhh/attendance.api';

interface ReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  replacementInfo: ReplacementInfo | null;
  attendanceType: AttendanceType;
  loading?: boolean;
}

export default function ReplacementModal({
  isOpen,
  onClose,
  onConfirm,
  replacementInfo,
  attendanceType,
  loading = false
}: ReplacementModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getTypeLabel = (type: AttendanceType) => {
    const labels = {
      'CHECK_IN': 'Entrada',
      'CHECK_OUT': 'Salida',
      'BREAK_START': 'Inicio de Descanso',
      'BREAK_END': 'Fin de Descanso'
    };
    return labels[type] || type;
  };

  const getShiftLabel = (shiftType: string) => {
    const labels = {
      'AM': 'Mañana',
      'PM': 'Tarde',
      'MADRUGADA': 'Madrugada'
    };
    return labels[shiftType as keyof typeof labels] || shiftType;
  };

  const shift = replacementInfo?.currentShift;
  const employee = replacementInfo?.primaryEmployee;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmación de Reemplazo"
      icon={
        <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10 flex-shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Descripción */}
        <div className="text-xs sm:text-sm ot-theme-text-muted text-center mb-4">
          Verifica la información antes de continuar
        </div>
          {/* Acción */}
          <div className={`p-3 sm:p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-blue-900/20 border-blue-800'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  Acción a Registrar
                </div>
                <div className={`text-base sm:text-lg font-bold ${
                  theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
                }`}>
                  {getTypeLabel(attendanceType)}
                </div>
              </div>
            </div>
          </div>

          {/* Turno */}
          {shift && (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              theme === 'dark'
                ? 'bg-purple-900/20 border-purple-800'
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-purple-200' : 'text-purple-900'
                  }`}>
                    Turno a Cubrir
                  </div>
                  <div className={`text-base sm:text-lg font-bold mb-1 ${
                    theme === 'dark' ? 'text-purple-100' : 'text-purple-800'
                  }`}>
                    {shift.name} ({getShiftLabel(shift.type)})
                  </div>
                  <div className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    <span className="font-mono">
                      {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                    </span>
                  </div>
                  {shift.description && (
                    <div className={`text-xs mt-2 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {shift.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empleado a Reemplazar */}
          {employee ? (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              theme === 'dark'
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-green-200' : 'text-green-900'
                  }`}>
                    Empleado Principal del Turno
                  </div>
                  <div className={`text-base sm:text-lg font-bold mb-1 ${
                    theme === 'dark' ? 'text-green-100' : 'text-green-800'
                  }`}>
                    {employee.nombreCompleto}
                  </div>
                  <div className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>
                    {employee.correoElectronico}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Empleado Principal del Turno
                  </div>
                  <div className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No hay empleado asignado a este turno
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de confirmación */}
          <div className={`p-3 sm:p-4 rounded-xl text-center border-2 border-dashed ${
            theme === 'dark'
              ? 'bg-orange-900/10 border-orange-800 text-orange-200'
              : 'bg-orange-50 border-orange-300 text-orange-900'
          }`}>
            <p className="text-xs sm:text-sm font-medium">
              {employee 
                ? `Estás a punto de cubrir la ausencia del turno ${shift ? getShiftLabel(shift.type) : ''} correspondiente al empleado ${employee.nombreCompleto}.`
                : `Estás a punto de registrar ${getTypeLabel(attendanceType).toLowerCase()} para el turno ${shift ? getShiftLabel(shift.type) : ''}.`
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t ot-theme-border">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1 text-xs sm:text-sm"
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2 text-xs sm:text-sm"
          >
            {loading ? 'Registrando...' : 'Confirmar Reemplazo'}
          </Button>
        </div>
    </Modal>
  );
}
