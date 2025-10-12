"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Calendar, Loader2, ChevronDown, ChevronUp, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  empleadoObtenerMisRegistros,
  empleadoJustificarAsistencia,
  type AttendanceRecord,
  getTypeLabel,
  getStatusLabel,
  getStatusColor,
  formatTime
} from '@/lib/service-rrhh/attendance.api';
import { useAuth } from '@/lib/auth';
import JustificationModal from './attendance/JustificationModal';

export default function MisRegistros() {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [registros, setRegistros] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  
  // Justification modal state
  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    record: AttendanceRecord | null;
  }>({ isOpen: false, record: null });
  const [justifying, setJustifying] = useState(false);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      cargarRegistros();
    }
  }, [startDate, endDate]);

  const cargarRegistros = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await empleadoObtenerMisRegistros(token, {
        startDate,
        endDate,
        populate: true
      });
      setRegistros(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const newSet = new Set(expandedDays);
    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }
    setExpandedDays(newSet);
  };

  const handleJustifyClick = (record: AttendanceRecord) => {
    setJustificationModal({ isOpen: true, record });
  };

  const handleJustificationConfirm = async (justification: string) => {
    if (!token || !justificationModal.record) return;

    try {
      setJustifying(true);
      await empleadoJustificarAsistencia(token, justificationModal.record._id, { justification });
      
      // Recargar registros para mostrar la justificación actualizada
      await cargarRegistros();
      
      setJustificationModal({ isOpen: false, record: null });
    } catch (err: any) {
      setError(err.message || 'Error al enviar la justificación');
    } finally {
      setJustifying(false);
    }
  };

  const handleJustificationClose = () => {
    setJustificationModal({ isOpen: false, record: null });
  };

  const needsJustification = (record: AttendanceRecord) => {
    return record.justificationStatus === 'PENDING' && (record.status === 'LATE' || record.status === 'ABSENT');
  };

  const getJustificationStatusIcon = (record: AttendanceRecord) => {
    if (!record.justificationStatus) return null;
    
    switch (record.justificationStatus) {
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'JUSTIFIED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Agrupar registros por día
  const registrosPorDia = registros.reduce((acc, registro) => {
    const fecha = new Date(registro.timestamp).toLocaleDateString('es-CO');
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(registro);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  if (loading) {
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
              onClick={cargarRegistros} 
              variant="primary" 
              full
              disabled={loading}
              className="text-xs sm:text-sm"
            >
              {loading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : 'Buscar'}
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

      {/* Registros Agrupados por Día */}
      {Object.keys(registrosPorDia).length === 0 ? (
        <div className="rounded-xl p-6 sm:p-8 border text-center ot-theme-card ot-theme-text-muted">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm sm:text-base">No hay registros para el período seleccionado</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {Object.entries(registrosPorDia)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([fecha, regs]) => {
              const isExpanded = expandedDays.has(fecha);
              const primerRegistro = regs[0];
              const ultimoRegistro = regs[regs.length - 1];

              return (
                <div 
                  key={fecha}
                  className="rounded-xl border overflow-hidden ot-theme-card"
                >
                  {/* Header del día */}
                  <button
                    onClick={() => toggleDay(fecha)}
                    className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-opacity-80 transition-colors ot-hover-surface"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="text-sm sm:text-base font-medium ot-theme-text">
                          {new Date(primerRegistro.timestamp).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs sm:text-sm ot-theme-text-secondary">
                          {regs.length} {regs.length === 1 ? 'registro' : 'registros'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full`}
                        style={{ 
                          backgroundColor: `${getStatusColor(primerRegistro.status)}20`,
                          color: getStatusColor(primerRegistro.status)
                        }}
                      >
                        {getStatusLabel(primerRegistro.status)}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Registros del día */}
                  {isExpanded && (
                    <div className="border-t ot-theme-border">
                      {regs.map((registro, idx) => (
                        <div
                          key={registro._id}
                          className={`p-3 sm:p-4 ${
                            idx !== regs.length - 1 
                              ? 'border-b ot-theme-border'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-sm sm:text-base font-medium ot-theme-text">
                                  {getTypeLabel(registro.type)}
                                </div>
                                {getJustificationStatusIcon(registro)}
                              </div>
                              {registro.notes && (
                                <div className="text-xs sm:text-sm mt-1 ot-theme-text-secondary">
                                  {registro.notes}
                                </div>
                              )}
                              {registro.justification && (
                                <div className="text-xs sm:text-sm mt-2 p-2 rounded-lg ot-theme-surface ot-theme-text-secondary">
                                  <div className="font-medium mb-1">Justificación:</div>
                                  <div>{registro.justification}</div>
                                  {registro.justifiedAt && (
                                    <div className="text-xs mt-1 ot-theme-text-muted">
                                      Justificado el {new Date(registro.justifiedAt).toLocaleString('es-CO')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                              <div className="text-sm sm:text-base font-medium ot-theme-text">
                                {formatTime(new Date(registro.timestamp))}
                              </div>
                              {registro.deviceInfo && (
                                <div className="text-xs mt-1 ot-theme-text-muted">
                                  {registro.deviceInfo.platform}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Botón de justificación */}
                          {needsJustification(registro) && (
                            <div className="mt-3 pt-3 border-t ot-theme-border">
                              <Button
                                onClick={() => handleJustifyClick(registro)}
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-2 text-xs sm:text-sm"
                              >
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                Justificar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modal de Justificación */}
      <JustificationModal
        isOpen={justificationModal.isOpen}
        onClose={handleJustificationClose}
        onConfirm={handleJustificationConfirm}
        record={justificationModal.record}
        loading={justifying}
      />
    </div>
  );
}
