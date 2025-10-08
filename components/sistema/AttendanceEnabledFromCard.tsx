"use client";
import React from 'react';
import { CardSection } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { getAttendanceEnabledFrom, setAttendanceEnabledFrom, type AttendanceConfig } from '@/lib/service-sistema/attendance.api';
import { toIsoFromLocalInput, toLocalDatetimeInputValue } from '@/lib/utils/datetime';

export function AttendanceEnabledFromCard({ token, onUpdated }: { token: string; onUpdated: (cfg: AttendanceConfig) => void }) {
  const { toast } = useToast();
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
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Input
              type="datetime-local"
              label="Fecha y hora de habilitación"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || saving || !token}>Guardar</Button>
            <Button variant="secondary" onClick={handleReset} disabled={loading || saving || !token}>Quitar restricción</Button>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Actual: {currentIso ? new Date(currentIso).toLocaleString() : 'Sin restricción (permitido siempre)'}
        </p>
      </div>
    </CardSection>
  );
}

export default AttendanceEnabledFromCard;
