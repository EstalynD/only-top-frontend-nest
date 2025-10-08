"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Calendar, RotateCcw } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <div className="p-4 rounded-lg border" style={{ background: fixedEnabled ? 'var(--ot-blue-50)' : 'var(--surface-muted)', borderColor: fixedEnabled ? 'var(--ot-blue-500)' : 'var(--border)', opacity: fixedEnabled ? 1 : 0.7 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: 'var(--ot-blue-600)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Horario Fijo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full" style={{ background: fixedEnabled ? 'var(--ot-green-100)' : 'var(--ot-red-100)', color: fixedEnabled ? 'var(--ot-green-700)' : 'var(--ot-red-700)' }}>{fixedEnabled ? 'Habilitado' : 'Deshabilitado'}</span>
              <Button onClick={() => onToggleFixed(!fixedEnabled)} variant={fixedEnabled ? 'danger' : 'success'} className="p-1 text-xs">
                {fixedEnabled ? 'Deshabilitar' : 'Habilitar'}
              </Button>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Horario estándar de oficina con horarios fijos para cada día de la semana.</p>
        </div>
      </Card>

      <Card>
        <div className="p-4 rounded-lg border" style={{ background: rotatingEnabled ? 'var(--ot-green-50)' : 'var(--surface-muted)', borderColor: rotatingEnabled ? 'var(--ot-green-500)' : 'var(--border)', opacity: rotatingEnabled ? 1 : 0.7 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <RotateCcw size={18} style={{ color: 'var(--ot-green-600)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Turnos Rotativos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full" style={{ background: rotatingEnabled ? 'var(--ot-green-100)' : 'var(--ot-red-100)', color: rotatingEnabled ? 'var(--ot-green-700)' : 'var(--ot-red-700)' }}>{rotatingEnabled ? 'Habilitado' : 'Deshabilitado'}</span>
              <Button onClick={() => onToggleRotating(!rotatingEnabled)} variant={rotatingEnabled ? 'danger' : 'success'} className="p-1 text-xs">
                {rotatingEnabled ? 'Deshabilitar' : 'Habilitar'}
              </Button>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sistema de turnos flexibles que pueden asignarse según área y cargo.</p>
        </div>
      </Card>
    </div>
  );
}

export default AttendanceStatusCards;
