"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';
import { Clock, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AttendanceConfig, SupernumeraryMode, Shift } from '@/lib/service-sistema/attendance.api';

interface SupernumeraryConfigProps {
  config: AttendanceConfig;
  onUpdate: (updates: Partial<AttendanceConfig>) => Promise<void>;
}

export default function SupernumeraryConfig({ config, onUpdate }: SupernumeraryConfigProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<SupernumeraryMode>(config.supernumeraryMode || 'REPLACEMENT');
  const [selectedShifts, setSelectedShifts] = React.useState<string[]>(config.allowedReplacementShifts || []);

  const handleModeChange = async (newMode: SupernumeraryMode) => {
    setLoading(true);
    try {
      setMode(newMode);
      await onUpdate({ supernumeraryMode: newMode });
    } finally {
      setLoading(false);
    }
  };

  const handleShiftToggle = async (shiftId: string) => {
    const newShifts = selectedShifts.includes(shiftId)
      ? selectedShifts.filter(id => id !== shiftId)
      : [...selectedShifts, shiftId];
    
    setLoading(true);
    try {
      setSelectedShifts(newShifts);
      await onUpdate({ allowedReplacementShifts: newShifts });
    } finally {
      setLoading(false);
    }
  };

  const availableShifts = config.rotatingShifts.filter(s => 
    s.isActive && ['AM', 'PM', 'MADRUGADA'].includes(s.type)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Configuración de Supernumerarios
          </h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Define cómo funcionan los turnos para personal supernumerario (Chatters y Traffickers de reemplazo)
          </p>
        </div>
      </div>

      {/* Modo de Operación */}
      <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Modalidad de Trabajo
        </h4>
        <div className="space-y-3">
          {/* REPLACEMENT Mode */}
          <button
            onClick={() => handleModeChange('REPLACEMENT')}
            disabled={loading}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              mode === 'REPLACEMENT'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-900'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                mode === 'REPLACEMENT'
                  ? 'border-blue-500 bg-blue-500'
                  : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                {mode === 'REPLACEMENT' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Reemplazo de Turnos
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  El supernumerario puede cubrir cualquiera de los turnos seleccionados (AM, PM, Madrugada)
                </div>
              </div>
            </div>
          </button>

          {/* FIXED_SCHEDULE Mode */}
          <button
            onClick={() => handleModeChange('FIXED_SCHEDULE')}
            disabled={loading}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              mode === 'FIXED_SCHEDULE'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-900'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                mode === 'FIXED_SCHEDULE'
                  ? 'border-blue-500 bg-blue-500'
                  : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                {mode === 'FIXED_SCHEDULE' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Horario Fijo
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  El supernumerario tiene un horario fijo específico configurado en Horario Fijo Supernumerario
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Selector de Turnos (solo en modo REPLACEMENT) */}
      {mode === 'REPLACEMENT' && (
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Turnos Permitidos para Reemplazo
          </h4>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Selecciona los turnos que el supernumerario puede cubrir
          </p>

          {availableShifts.length === 0 ? (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    No hay turnos configurados
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Primero debes configurar los turnos rotativos (AM, PM, Madrugada)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {availableShifts.map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => handleShiftToggle(shift.id)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedShifts.includes(shift.id)
                      ? theme === 'dark'
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-green-500 bg-green-50'
                      : theme === 'dark'
                        ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-900'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedShifts.includes(shift.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className={`w-5 h-5 rounded border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {shift.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {shift.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {shift.timeSlot.startTime} - {shift.timeSlot.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
              ¿Cómo funciona?
            </p>
            <ul className={`text-xs mt-2 space-y-1 list-disc list-inside ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              <li><strong>Reemplazo de Turnos:</strong> El supernumerario ve todos los turnos permitidos y puede marcar asistencia en cualquiera</li>
              <li><strong>Horario Fijo:</strong> El supernumerario tiene un horario específico independiente de los turnos rotativos</li>
              <li>Esta configuración aplica a todos los empleados con cargo "Chatter Supernumerario"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
