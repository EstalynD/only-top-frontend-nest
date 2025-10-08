"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Edit3 } from 'lucide-react';
import type { FixedSchedule, TimeSlot } from '@/lib/service-sistema/attendance.api';
import { formatTimeRange, calculateClientDuration, formatDuration } from '@/lib/service-sistema/attendance.api';

function getDayName(day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') {
  const map = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' } as const;
  return map[day];
}

function getShiftDuration(ts: TimeSlot) {
  const d = calculateClientDuration(ts);
  return formatDuration(d.minutes);
}

export function FixedScheduleOverviewCard({ fixedSchedule, onEdit }: { fixedSchedule?: FixedSchedule; onEdit: () => void }) {
  if (!fixedSchedule) return null;
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar size={20} style={{ color: 'var(--ot-blue-500)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Horario Fijo (Oficina Estándar)</h2>
          </div>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit3 size={16} />
            Editar Horario
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(fixedSchedule).map(([day, timeSlot]) => (
            timeSlot && (
              <div key={day} className="p-3 rounded-lg border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{getDayName(day as any)}</span>
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>{getShiftDuration(timeSlot as TimeSlot)}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{formatTimeRange(timeSlot as TimeSlot)}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </Card>
  );
}

export default FixedScheduleOverviewCard;
