"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import {
  getAdminUserAttendance,
  getAdminAttendanceReport,
  type AttendanceRecord,
  type AttendanceSummary,
  formatTime,
  formatDuration,
  getStatusColor,
  getStatusLabel,
  getTypeLabel
} from '@/lib/service-rrhh/attendance.api';
import { getSelectedTimeFormat } from '@/lib/service-sistema/api';
import type { TimeFormat } from '@/lib/service-sistema/types';
import { MemorandumActions } from './MemorandumActions';
import {
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Coffee,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  titleSuffix?: string;
}

type ViewMode = 'records' | 'summary';
type PeriodFilter = '7d' | '15d' | '30d' | 'custom';

export default function AttendanceHistoryModal({ 
  isOpen, 
  onClose, 
  userId,
  titleSuffix 
}: AttendanceHistoryModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = React.useState(true);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = React.useState<AttendanceSummary[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('summary');
  const [periodFilter, setPeriodFilter] = React.useState<PeriodFilter>('7d');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h');

  React.useEffect(() => {
    if (!token || !isOpen) return;
    loadData();
    loadTimeFormat();
  }, [token, isOpen, userId, periodFilter, customStartDate, customEndDate, viewMode]);

  const loadTimeFormat = async () => {
    if (!token) return;
    try {
      const format = await getSelectedTimeFormat(token);
      setTimeFormat(format || '24h');
    } catch (error) {
      // Use default
    }
  };

  const loadData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      if (viewMode === 'records') {
        const data = await getAdminUserAttendance(token, userId, startDate, endDate, true);
        setRecords(data);
      } else {
        const data = await getAdminAttendanceReport(token, userId, startDate, endDate);
        setSummaries(data);
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cargar historial',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (): { startDate: string; endDate: string } => {
    const end = new Date();
    let start = new Date();

    if (periodFilter === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }

    switch (periodFilter) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '15d':
        start.setDate(end.getDate() - 15);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const handleExport = () => {
    // Export to CSV
    const { startDate, endDate } = getDateRange();
    const data = viewMode === 'records' ? records : summaries;
    
    const csvContent = exportToCSV(data, viewMode);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${userId}-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any[], mode: ViewMode): string => {
    if (mode === 'records') {
      const headers = ['Fecha', 'Tipo', 'Hora', 'Estado', 'Notas', 'Marcado por'];
      const rows = (data as AttendanceRecord[]).map(r => [
        new Date(r.timestamp).toLocaleDateString(),
        getTypeLabel(r.type),
        formatTime(r.timestamp, timeFormat === '12h'),
        getStatusLabel(r.status),
        r.notes || '',
        r.markedBy || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['Fecha', 'Entrada', 'Salida', 'Horas trabajadas', 'Descanso', 'Estado', 'Tardanza', 'Horas extra'];
      const rows = (data as AttendanceSummary[]).map(s => [
        s.date,
        s.checkIn ? formatTime(s.checkIn, timeFormat === '12h') : '',
        s.checkOut ? formatTime(s.checkOut, timeFormat === '12h') : '',
        formatDuration(s.workedHours),
        formatDuration(s.breakHours),
        getStatusLabel(s.status),
        s.lateMinutes ? `${s.lateMinutes} min` : '',
        s.overtimeMinutes ? `${s.overtimeMinutes} min` : ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  const use12h = timeFormat === '12h';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de Asistencia${titleSuffix ? ` - ${titleSuffix}` : ''}`}
      icon={<Calendar size={20} style={{ color: 'var(--ot-blue-600)' }} />}
      maxWidth="max-w-6xl"
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              className="px-3 py-1.5 text-sm"
              variant={viewMode === 'summary' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('summary')}
            >
              <TrendingUp size={16} className="mr-1" />
              Resumen
            </Button>
            <Button
              className="px-3 py-1.5 text-sm"
              variant={viewMode === 'records' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('records')}
            >
              <Clock size={16} className="mr-1" />
              Registros
            </Button>
          </div>

          {/* Period Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              className="px-3 py-1.5 text-sm rounded-lg border outline-none"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="15d">Últimos 15 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="custom">Personalizado</option>
            </select>

            {periodFilter === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border outline-none"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border outline-none"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </>
            )}

            <Button className="px-3 py-1.5 text-sm" onClick={handleExport}>
              <Download size={16} className="mr-1" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" label="Cargando historial..." />
          </div>
        ) : (
          <>
            {viewMode === 'summary' ? (
              <SummaryView summaries={summaries} use12h={use12h} userId={userId} />
            ) : (
              <RecordsView records={records} use12h={use12h} />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// Summary View Component
function SummaryView({ summaries, use12h, userId }: { summaries: AttendanceSummary[]; use12h: boolean; userId: string }) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No hay registros en este período</p>
      </div>
    );
  }

  // Calculate totals
  const totals = summaries.reduce((acc, s) => ({
    totalHours: acc.totalHours + s.workedHours,
    lateCount: acc.lateCount + (s.isLate ? 1 : 0),
    totalDays: acc.totalDays + (s.checkIn ? 1 : 0)
  }), { totalHours: 0, lateCount: 0, totalDays: 0 });

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg" style={{ background: 'var(--card-background)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Horas Trabajadas</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {formatDuration(totals.totalHours)}
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ background: 'var(--card-background)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Días Trabajados</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {totals.totalDays}
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ background: 'var(--card-background)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tardanzas</p>
          <p className="text-2xl font-bold mt-1" style={{ color: totals.lateCount > 0 ? 'var(--ot-yellow-600)' : 'var(--ot-green-600)' }}>
            {totals.lateCount}
          </p>
        </div>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Fecha</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Entrada</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Salida</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Trabajadas</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Descanso</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Estado</th>
              <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.date} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>
                  {new Date(summary.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </td>
                <td className="p-3">
                  {summary.checkIn ? (
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>
                        {formatTime(summary.checkIn, use12h)}
                      </span>
                      {summary.isLate && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--ot-yellow-100)', color: 'var(--ot-yellow-700)' }}>
                          +{summary.lateMinutes}m
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
                <td className="p-3">
                  {summary.checkOut ? (
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>
                        {formatTime(summary.checkOut, use12h)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
                <td className="p-3">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDuration(summary.workedHours)}
                  </span>
                  {summary.overtimeMinutes && summary.overtimeMinutes > 0 && (
                    <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>
                      +{summary.overtimeMinutes}m extra
                    </span>
                  )}
                </td>
                <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                  {summary.breakHours > 0 ? formatDuration(summary.breakHours) : '-'}
                </td>
                <td className="p-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: `${getStatusColor(summary.status)}20`,
                      color: getStatusColor(summary.status)
                    }}
                  >
                    {summary.status === 'PRESENT' && <CheckCircle size={12} />}
                    {summary.status === 'LATE' && <AlertCircle size={12} />}
                    {getStatusLabel(summary.status)}
                  </span>
                </td>
                <td className="p-3">
                  <div style={{ maxWidth: '300px' }}>
                    <MemorandumActions userId={userId} summary={summary} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Records View Component
function RecordsView({ records, use12h }: { records: AttendanceRecord[]; use12h: boolean }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No hay registros en este período</p>
      </div>
    );
  }

  // Group by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedRecords).map(([date, dayRecords]) => (
        <div key={date} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="p-3" style={{ background: 'var(--card-background)', borderBottom: '1px solid var(--border)' }}>
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
          </div>
          
          <div className="p-3 space-y-2">
            {dayRecords.map((record) => (
              <div
                key={record._id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--background)' }}
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{
                    background: `${getStatusColor(record.status)}20`,
                    color: getStatusColor(record.status)
                  }}
                >
                  {record.type === 'CHECK_IN' && <CheckCircle size={20} />}
                  {record.type === 'CHECK_OUT' && <Clock size={20} />}
                  {(record.type === 'BREAK_START' || record.type === 'BREAK_END') && <Coffee size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {getTypeLabel(record.type)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: `${getStatusColor(record.status)}20`,
                        color: getStatusColor(record.status)
                      }}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(record.timestamp, use12h)}
                    </span>
                    
                    {record.markedBy && (
                      <span className="text-xs">
                        Marcado por: {record.markedBy}
                      </span>
                    )}
                  </div>
                  
                  {record.notes && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
