"use client";
import React, { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { X, Clock, User, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AttendanceRecord, AttendanceType, AttendanceStatus } from '@/lib/service-rrhh/attendance.api';

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
  record: AttendanceRecord | null;
  loading?: boolean;
}

export default function JustificationModal({
  isOpen,
  onClose,
  onConfirm,
  record,
  loading = false
}: JustificationModalProps) {
  const { theme } = useTheme();
  const [justification, setJustification] = useState('');
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
    onConfirm(justification.trim());
  };

  const handleClose = () => {
    setJustification('');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${
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
              <FileText className={`w-5 h-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Justificar Asistencia
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Agregar justificación para este registro
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
        <div className="p-6 space-y-4">
          {/* Record Details */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
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
                <User className={`w-4 h-4 ${
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
          </div>

          {/* Justification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Justificación *
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Describe la razón de tu tardanza o ausencia..."
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
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Enviar Justificación
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
