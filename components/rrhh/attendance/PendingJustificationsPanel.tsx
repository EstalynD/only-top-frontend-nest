"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { AlertCircle, Clock, User, FileText, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  adminObtenerPendientes, 
  adminJustificarAsistencia,
  type AttendanceRecord,
  getTypeLabel,
  getStatusLabel,
  getStatusColor
} from '@/lib/service-rrhh/attendance.api';
import { useAuth } from '@/lib/auth';
import AdminJustificationModal from './AdminJustificationModal';

interface PendingJustificationsPanelProps {
  areas?: Array<{ _id: string; name: string; code: string }>;
  cargos?: Array<{ _id: string; name: string; code: string }>;
  empleados?: Array<{ _id: string; nombre: string; apellido: string; correoElectronico: string }>;
  onJustificationUpdate?: () => void;
}

export default function PendingJustificationsPanel({ 
  areas = [], 
  cargos = [], 
  empleados = [],
  onJustificationUpdate 
}: PendingJustificationsPanelProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [pendientes, setPendientes] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justifying, setJustifying] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    areaId: '',
    cargoId: '',
    userId: '',
    status: '',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Última semana
    endDate: new Date().toISOString().split('T')[0] // Hoy
  });

  // Modal de justificación
  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    record: AttendanceRecord | null;
  }>({ isOpen: false, record: null });

  useEffect(() => {
    cargarPendientes();
  }, [filters]);

  const cargarPendientes = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await adminObtenerPendientes(token, filters);
      setPendientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar justificaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleJustifyClick = (record: AttendanceRecord) => {
    setJustificationModal({ isOpen: true, record });
  };

  const handleJustificationConfirm = async (justification: string, status: 'JUSTIFIED' | 'REJECTED') => {
    if (!token || !justificationModal.record) return;

    try {
      setJustifying(justificationModal.record._id);
      await adminJustificarAsistencia(token, justificationModal.record._id, { 
        justification, 
        status 
      });
      
      // Recargar pendientes
      await cargarPendientes();
      onJustificationUpdate?.();
      
      setJustificationModal({ isOpen: false, record: null });
    } catch (err: any) {
      setError(err.message || 'Error al procesar la justificación');
    } finally {
      setJustifying(null);
    }
  };

  const handleJustificationClose = () => {
    setJustificationModal({ isOpen: false, record: null });
  };

  const getDaysPending = (timestamp: string) => {
    const days = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (days: number) => {
    if (days > 3) return 'text-red-600';
    if (days > 1) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getUrgencyBg = (days: number) => {
    if (days > 3) return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    if (days > 1) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`rounded-xl p-6 border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-100'
            }`}>
              <AlertCircle className={`w-5 h-5 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Justificaciones Pendientes
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {pendientes.length} registro{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''} de justificación
              </p>
            </div>
          </div>
          <Button
            onClick={cargarPendientes}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Área
            </label>
            <select
              value={filters.areaId}
              onChange={(e) => setFilters(prev => ({ ...prev, areaId: e.target.value }))}
              className={`w-full px-2 py-1 text-sm rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`w-full px-2 py-1 text-sm rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Todos los estados</option>
              <option value="LATE">Tardanza</option>
              <option value="ABSENT">Ausente</option>
            </select>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className={`w-full px-2 py-1 text-sm rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className={`w-full px-2 py-1 text-sm rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`rounded-xl p-4 border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {error}
        </div>
      )}

      {/* Lista de Pendientes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : pendientes.length === 0 ? (
        <div className={`rounded-xl p-8 border text-center ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-gray-400' 
            : 'bg-white border-gray-200 text-gray-600'
        }`}>
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay justificaciones pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map((record) => {
            const daysPending = getDaysPending(record.timestamp);
            const empleado = typeof record.empleadoId === 'object' ? record.empleadoId : null;
            const area = typeof record.areaId === 'object' ? record.areaId : null;
            const cargo = typeof record.cargoId === 'object' ? record.cargoId : null;

            return (
              <div
                key={record._id}
                className={`rounded-xl border p-4 ${getUrgencyBg(daysPending)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {getTypeLabel(record.type) === 'Entrada' ? (
                          <Clock className="w-4 h-4 text-green-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getTypeLabel(record.type)} - {getStatusLabel(record.status)}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDate(record.timestamp)} a las {formatTime(record.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A'}
                        </span>
                      </div>
                      {area && (
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {area.name}
                        </div>
                      )}
                      {cargo && (
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {cargo.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getUrgencyColor(daysPending)}`}>
                        {daysPending} día{daysPending !== 1 ? 's' : ''} pendiente{daysPending !== 1 ? 's' : ''}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {daysPending > 3 ? 'Urgente' : daysPending > 1 ? 'Pendiente' : 'Reciente'}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJustifyClick(record)}
                      variant="secondary"
                      size="sm"
                      disabled={justifying === record._id}
                    >
                      {justifying === record._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Justificación Administrativa */}
      <AdminJustificationModal
        isOpen={justificationModal.isOpen}
        onClose={handleJustificationClose}
        onConfirm={handleJustificationConfirm}
        record={justificationModal.record}
        loading={justifying !== null}
      />
    </div>
  );
}
