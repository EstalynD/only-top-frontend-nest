"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Plus, ToggleRight, ToggleLeft, Edit3, Trash2 } from 'lucide-react';
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
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <RotateCcw size={20} style={{ color: 'var(--ot-blue-500)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Turnos Rotativos</h2>
          </div>
          <Button onClick={onNew} className="flex items-center gap-2">
            <Plus size={16} />
            Nuevo Turno
          </Button>
        </div>

        {shifts.length > 0 ? (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.2em' }}>{getShiftTypeIcon(shift.type)}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{shift.name}</h3>
                        <span className="px-2 py-1 text-xs rounded-full" style={{ background: shift.isActive ? 'var(--ot-green-100)' : 'var(--ot-red-100)', color: shift.isActive ? 'var(--ot-green-700)' : 'var(--ot-red-700)' }}>{shift.isActive ? 'Activo' : 'Inactivo'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                        <span>{formatTimeRange(shift.timeSlot)}</span>
                        <span>•</span>
                        <span>{getShiftDuration(shift.timeSlot)}</span>
                        {shift.description && (<><span>•</span><span className="break-words max-w-[220px] sm:max-w-none">{shift.description}</span></>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                  <Button onClick={() => onToggle(shift)} variant={shift.isActive ? 'danger' : 'success'} className="p-2" title={shift.isActive ? 'Desactivar turno' : 'Activar turno'}>
                    {shift.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </Button>
                  <Button onClick={() => onEdit(shift)} variant="neutral" className="p-2" title="Editar turno">
                    <Edit3 size={16} />
                  </Button>
                  <Button onClick={() => onDelete(shift)} variant="danger" className="p-2" title="Eliminar turno">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <RotateCcw size={32} className="mx-auto mb-2 opacity-50" />
            <p>No hay turnos configurados</p>
            <p className="text-xs">Crea el primer turno rotativo</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default RotatingShiftsList;
