"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { BarChart3, Loader2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  empleadoObtenerMiReporte,
  type AttendanceSummary,
  getStatusLabel,
  getStatusColor,
  formatDuration
} from '@/lib/service-rrhh/attendance.api';
import { useAuth } from '@/lib/auth';

export default function MiReporte() {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [reporte, setReporte] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Establecer fechas por defecto (últimas 2 semanas)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const cargarReporte = async () => {
    if (!token || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      const data = await empleadoObtenerMiReporte(token, startDate, endDate);
      setReporte(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    if (reporte.length === 0) return null;

    const totalDays = reporte.length;
    const diasPresentes = reporte.filter(r => r.status === 'PRESENT').length;
    const diasTarde = reporte.filter(r => r.status === 'LATE').length;
    const diasAusentes = reporte.filter(r => r.status === 'ABSENT').length;
    const totalHorasTrabajadas = reporte.reduce((sum, r) => sum + r.workedHours, 0);
    const promedioHorasDiarias = totalHorasTrabajadas / totalDays;
    const totalMinutosTarde = reporte.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);

    return {
      totalDays,
      diasPresentes,
      diasTarde,
      diasAusentes,
      totalHorasTrabajadas,
      promedioHorasDiarias,
      totalMinutosTarde
    };
  }, [reporte]);

  if (loading && reporte.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filtros */}
      <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 ot-theme-text-secondary">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ot-input"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 ot-theme-text-secondary">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ot-input"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={cargarReporte} 
              variant="primary" 
              full
              disabled={loading}
              className="text-xs sm:text-sm"
            >
              {loading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : 'Generar Reporte'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className={`rounded-xl p-3 sm:p-4 border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold ot-theme-text">
                {stats.diasPresentes}
              </div>
              <div className="text-xs sm:text-sm mt-1 ot-theme-text-secondary">
                Días a Tiempo
              </div>
            </div>

            <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold ot-theme-text">
                {stats.diasTarde}
              </div>
              <div className="text-xs sm:text-sm mt-1 ot-theme-text-secondary">
                Tardanzas
              </div>
            </div>

            <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold ot-theme-text">
                {formatDuration(stats.totalHorasTrabajadas)}
              </div>
              <div className="text-xs sm:text-sm mt-1 ot-theme-text-secondary">
                Total Trabajado
              </div>
            </div>

            <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold ot-theme-text">
                {formatDuration(stats.promedioHorasDiarias)}
              </div>
              <div className="text-xs sm:text-sm mt-1 ot-theme-text-secondary">
                Promedio Diario
              </div>
            </div>
          </div>

          {/* Detalle por Día */}
          <div className="rounded-xl border overflow-hidden ot-theme-card">
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold ot-theme-text">
                Detalle Diario
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="ot-theme-surface">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium ot-theme-text-secondary">
                      Fecha
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium ot-theme-text-secondary">
                      Estado
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium ot-theme-text-secondary">
                      Entrada
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium ot-theme-text-secondary">
                      Salida
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium ot-theme-text-secondary">
                      Horas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y ot-theme-border">
                  {reporte.map((dia) => (
                    <tr key={dia.date} className="ot-hover-surface">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ot-theme-text">
                        {new Date(dia.date).toLocaleDateString('es-CO', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                          style={{ 
                            backgroundColor: `${getStatusColor(dia.status)}20`,
                            color: getStatusColor(dia.status)
                          }}
                        >
                          {getStatusLabel(dia.status)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ot-theme-text-secondary">
                        {dia.checkIn 
                          ? new Date(dia.checkIn).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ot-theme-text-secondary">
                        {dia.checkOut 
                          ? new Date(dia.checkOut).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ot-theme-text">
                        {formatDuration(dia.workedHours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && reporte.length === 0 && (
        <div className="rounded-xl p-6 sm:p-8 border text-center ot-theme-card ot-theme-text-muted">
          <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm sm:text-base">Selecciona un rango de fechas y genera un reporte</p>
        </div>
      )}
    </div>
  );
}
