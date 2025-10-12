"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/Toast';
import {
  getAdminUserAttendance,
  getAdminEmployeeAttendance,
  getAdminAttendanceReport,
  type AttendanceRecord,
  type AttendanceSummary,
  formatTime,
  formatDuration,
  getStatusColor,
  getStatusLabel,
  getTypeLabel
} from '@/lib/service-rrhh/attendance.api';
import { adminGetMemorandosUsuario, adminGetMemorandosEmpleado } from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum } from '@/lib/service-rrhh/memorandum-types';
import { getMemorandumStatusLabel, getMemorandumTypeLabel } from '@/lib/service-rrhh/memorandum-types';
import { getSelectedTimeFormat } from '@/lib/service-sistema/api';
import type { TimeFormat } from '@/lib/service-sistema/types';
import { MemorandumActions } from './MemorandumActions';
import {
  Clock,
  Calendar,
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
  userId: string; // Puede ser userId o empleadoId, el componente lo maneja
  titleSuffix?: string;
  isEmpleadoId?: boolean; // Nuevo prop para indicar si el userId es realmente un empleadoId
}

type ViewMode = 'records';
type PeriodFilter = '7d' | '15d' | '30d' | 'custom';

export default function AttendanceHistoryModal({ 
  isOpen, 
  onClose, 
  userId,
  titleSuffix,
  isEmpleadoId = false 
}: AttendanceHistoryModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = React.useState(true);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = React.useState<AttendanceSummary[]>([]);
  const [viewMode] = React.useState<ViewMode>('records');
  const [periodFilter, setPeriodFilter] = React.useState<PeriodFilter>('7d');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h');
  const [memos, setMemos] = React.useState<Memorandum[]>([]);

  React.useEffect(() => {
    if (!token || !isOpen || !userId) return;
    loadData();
    loadTimeFormat();
  }, [token, isOpen, userId, periodFilter, customStartDate, customEndDate]);

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
    if (!token || !userId) return;
    
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Cargar asistencia y memorandos en paralelo
      const recordsPromise = isEmpleadoId
        ? getAdminEmployeeAttendance(token, userId, startDate, endDate, true)
        : getAdminUserAttendance(token, userId, startDate, endDate, true);
      
      const memosPromise = isEmpleadoId
        ? adminGetMemorandosEmpleado(token, userId, { startDate, endDate })
        : adminGetMemorandosUsuario(token, userId, { startDate, endDate });
      
      const [recordsData, memosData] = await Promise.all([
        recordsPromise,
        memosPromise
      ]);
      setRecords(recordsData);
      setMemos(memosData);
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
      maxWidth="7xl"
    >
      <div className="space-y-6">
        {/* Filters mejorados */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Title section - only Records */}
          <div className="flex gap-2">
            <span className={`inline-flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Clock size={16} className="mr-2" /> Registros
            </span>
          </div>

          {/* Period Filter */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              className={`px-4 py-2 text-sm rounded-lg border outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
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
                  className={`px-4 py-2 text-sm rounded-lg border outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`px-4 py-2 text-sm rounded-lg border outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                />
              </>
            )}

            <Button size="sm" onClick={handleExport}>
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
            <RecordsView records={records} use12h={use12h} theme={theme} />

            {/* Memorandos del período */}
            <MemorandumsPanel memos={memos} theme={theme} />
          </>
        )}
      </div>
    </Modal>
  );
}

// (Resumen eliminado según requerimiento)

// Records View Component
function RecordsView({ records, use12h, theme }: { records: AttendanceRecord[]; use12h: boolean; theme: 'light' | 'dark' }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className={`mx-auto mb-4 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No hay registros en este período</p>
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
    <div className="space-y-6">
      {Object.entries(groupedRecords).map(([date, dayRecords]) => (
        <div key={date} className={`rounded-lg overflow-hidden border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            theme === 'dark' 
              ? 'border-gray-700 bg-gray-800/50' 
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
          </div>
          
          <div className="p-4 space-y-3">
            {dayRecords.map((record) => (
              <div
                key={record._id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50' 
                    : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/50'
                } transition-colors`}
              >
                <div
                  className="p-3 rounded-lg flex-shrink-0"
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
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getTypeLabel(record.type)}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        background: `${getStatusColor(record.status)}20`,
                        color: getStatusColor(record.status)
                      }}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock size={14} />
                      {formatTime(record.timestamp, use12h)}
                    </span>
                    
                    {record.markedBy && (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Marcado por: {record.markedBy}
                      </span>
                    )}
                  </div>
                  
                  {record.notes && (
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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

// Memorandums Panel
function MemorandumsPanel({ memos, theme }: { memos: Memorandum[]; theme: 'light' | 'dark' }) {
  return (
    <div className="mt-8">
      <div className={`p-4 rounded-lg mb-4 border ${
        theme === 'dark' 
          ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        <p className="text-sm">
          <strong>Nota:</strong> Los memorandos se generan automáticamente cuando el sistema detecta anomalías de asistencia (ausencias, llegadas tarde, salidas anticipadas u omitidas).
        </p>
      </div>

      <div className={`rounded-lg border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`p-4 border-b ${
          theme === 'dark' 
            ? 'border-gray-700 bg-gray-800/50' 
            : 'border-gray-200 bg-gray-50/50'
        }`}>
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Memorandos en el período
          </h4>
        </div>
        {memos.length === 0 ? (
          <div className={`p-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="text-sm">No hay memorandos registrados en el período seleccionado.</p>
          </div>
        ) : (
          <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {memos.map((m) => (
              <div key={m._id} className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`font-mono text-sm font-semibold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      {(m as any).memorandumCode || (m as any).code}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getMemorandumTypeLabel(m.type)}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getMemorandumStatusLabel(m.status)}
                    </span>
                  </div>
                  <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Incidencia:</strong> {new Date(m.incidentDate).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {m.employeeJustification && (
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                          Justificación:
                        </span>{' '}
                        {m.employeeJustification}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
