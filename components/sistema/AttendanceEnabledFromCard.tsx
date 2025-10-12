"use client";
import React from 'react';
import { CardSection } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { getAttendanceEnabledFrom, setAttendanceEnabledFrom, type AttendanceConfig } from '@/lib/service-sistema/attendance.api';
import { toIsoFromLocalInput, toLocalDatetimeInputValue } from '@/lib/utils/datetime';

export function AttendanceEnabledFromCard({ token, onUpdated }: { token: string; onUpdated: (cfg: AttendanceConfig) => void }) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [currentIso, setCurrentIso] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { attendanceEnabledFrom } = await getAttendanceEnabledFrom(token);
      setCurrentIso(attendanceEnabledFrom);
      setInputValue(toLocalDatetimeInputValue(attendanceEnabledFrom));
    } catch (e) {
      toast({ type: 'error', title: 'No se pudo cargar configuración', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  React.useEffect(() => { void load(); }, [load]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const iso = toIsoFromLocalInput(inputValue);
      const updated = await setAttendanceEnabledFrom(token, iso);
      setCurrentIso(updated?.attendanceEnabledFrom as any);
      toast({ type: 'success', title: 'Fecha de habilitación actualizada' });
      onUpdated(updated);
    } catch (e) {
      toast({ type: 'error', title: 'Error al guardar', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await setAttendanceEnabledFrom(token, null);
      setCurrentIso(null);
      setInputValue('');
      toast({ type: 'success', title: 'Restricción desactivada' });
      onUpdated(updated);
    } catch (e) {
      toast({ type: 'error', title: 'Error al desactivar', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardSection title="Habilitar Marcación desde" description="Define desde qué fecha y hora se permitirá registrar asistencia en todo el sistema.">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Layout Responsivo */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-end lg:space-y-0 lg:gap-4">
          {/* Input Field */}
          <div className="flex-1 min-w-0">
            <Input
              type="datetime-local"
              label="Fecha y hora de habilitación"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          
          {/* Buttons - Responsive Layout */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 lg:flex-shrink-0">
            <Button 
              onClick={handleSave} 
              disabled={loading || saving || !token}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
              size="sm"
            >
              <span className="hidden sm:inline">Guardar</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleReset} 
              disabled={loading || saving || !token}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
              size="sm"
            >
              <span className="hidden sm:inline">Quitar restricción</span>
              <span className="sm:hidden">Quitar</span>
            </Button>
          </div>
        </div>
        
        {/* Status Text - Responsive */}
        <div className={`p-3 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span className="font-medium">Actual:</span>{' '}
            {currentIso ? (
              <span className={`${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {new Date(currentIso).toLocaleString()}
              </span>
            ) : (
              <span className={`${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                Sin restricción (permitido siempre)
              </span>
            )}
          </p>
        </div>
      </div>
    </CardSection>
  );
}

export default AttendanceEnabledFromCard;
