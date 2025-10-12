"use client";
import React, { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { X, Clock, User, AlertTriangle, CheckCircle, XCircle, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AttendanceRecord, AttendanceType, AttendanceStatus } from '@/lib/service-rrhh/attendance.api';

interface AdminJustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justification: string, status: 'JUSTIFIED' | 'REJECTED') => void;
  record: AttendanceRecord | null;
  loading?: boolean;
}

export default function AdminJustificationModal({
  isOpen,
  onClose,
  onConfirm,
  record,
  loading = false
}: AdminJustificationModalProps) {
  const { theme } = useTheme();
  const [justification, setJustification] = useState('');
  const [status, setStatus] = useState<'JUSTIFIED' | 'REJECTED'>('JUSTIFIED');
  const [error, setError] = useState('');

  if (!isOpen || !record) return null;

  const getTypeLabel = (type: AttendanceType) => {
    const labels = {
      'CHECK_IN': 'Entrada',
      'CHECK_OUT': 'Salida',
      'BREAK_START': 'Inicio de Descanso',
      'BREAK_END': 'Fin de Descanso'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    const labels = {
      'PRESENT': 'Presente',
      'LATE': 'Tardanza',
      'ABSENT': 'Ausente',
      'EXCUSED': 'Justificado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'LATE': return 'text-yellow-600';
      case 'ABSENT': return 'text-red-600';
      case 'PRESENT': return 'text-green-600';
      case 'EXCUSED': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!justification.trim()) {
      setError('La justificación es requerida');
      return;
    }

    if (justification.trim().length < 10) {
      setError('La justificación debe tener al menos 10 caracteres');
      return;
    }

    setError('');
    onConfirm(justification.trim(), status);
  };

  const handleClose = () => {
    setJustification('');
    setStatus('JUSTIFIED');
    setError('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getDaysPending = (timestamp: string) => {
    const days = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const empleado = typeof record.empleadoId === 'object' ? record.empleadoId : null;
  const area = typeof record.areaId === 'object' ? record.areaId : null;
  const cargo = typeof record.cargoId === 'object' ? record.cargoId : null;
  const daysPending = getDaysPending(record.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-gray-900 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
            }`}>
              <Shield className={`w-5 h-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Justificación Administrativa
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Aprobar o rechazar justificación de empleado
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Record Details */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatDate(record.timestamp)}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatTime(record.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {getTypeLabel(record.type)}
                    </div>
                    <div className={`text-sm ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A'}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {empleado?.correoElectronico || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${
                    daysPending > 3 ? 'text-red-500' : daysPending > 1 ? 'text-yellow-500' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {daysPending} día{daysPending !== 1 ? 's' : ''} pendiente{daysPending !== 1 ? 's' : ''}
                    </div>
                    <div className={`text-sm ${
                      daysPending > 3 ? 'text-red-500' : daysPending > 1 ? 'text-yellow-500' : 'text-gray-500'
                    }`}>
                      {daysPending > 3 ? 'Urgente' : daysPending > 1 ? 'Pendiente' : 'Reciente'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Area y Cargo */}
            {(area || cargo) && (
              <div className={`mt-3 pt-3 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex gap-4 text-sm">
                  {area && (
                    <div>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Área:
                      </span>
                      <span className={`ml-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {area.name}
                      </span>
                    </div>
                  )}
                  {cargo && (
                    <div>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Cargo:
                      </span>
                      <span className={`ml-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {cargo.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Justification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Justificación Administrativa *
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Describe la decisión administrativa sobre esta justificación..."
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                rows={4}
                maxLength={500}
                disabled={loading}
              />
              <div className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {justification.length}/500 caracteres
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Decisión *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('JUSTIFIED')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    status === 'JUSTIFIED'
                      ? theme === 'dark'
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-green-500 bg-green-50'
                      : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${
                      status === 'JUSTIFIED' ? 'text-green-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Aprobar
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Justificación válida
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('REJECTED')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    status === 'REJECTED'
                      ? theme === 'dark'
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-red-500 bg-red-50'
                      : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center gap-3">
                    <XCircle className={`w-5 h-5 ${
                      status === 'REJECTED' ? 'text-red-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Rechazar
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Justificación no válida
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className={`p-3 rounded-lg border flex items-start gap-2 ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-800 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !justification.trim()}
                className={`flex-1 ${
                  status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {status === 'JUSTIFIED' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {status === 'JUSTIFIED' ? 'Aprobar' : 'Rechazar'} Justificación
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
