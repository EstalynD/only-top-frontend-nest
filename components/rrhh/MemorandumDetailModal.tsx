"use client";
import React, { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import {
  X,
  FileText,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { empleadoSubsanarMemorandum } from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum } from '@/lib/service-rrhh/memorandum-types';
import {
  getMemorandumStatusLabel,
  getMemorandumStatusColor,
  getMemorandumTypeLabel,
  getMemorandumTypeIcon,
  canBeSubsaned,
  formatDeadlineWarning
} from '@/lib/service-rrhh/memorandum-types';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface MemorandumDetailModalProps {
  memorandum: Memorandum;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MemorandumDetailModal({
  memorandum,
  isOpen,
  onClose,
  onSuccess
}: MemorandumDetailModalProps) {
  const { theme } = useTheme();
  const { token } = useAuth();

  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const canSubsane = canBeSubsaned(memorandum);
  const statusColor = getMemorandumStatusColor(memorandum.status);

  const handleSubmit = async () => {
    if (!token || !justification.trim()) {
      setError('Debes proporcionar una justificación');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await empleadoSubsanarMemorandum(token, memorandum._id, {
        justification: justification.trim(),
        attachments: [] // TODO: Implementar subida de archivos
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al subsanar el memorando');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColors = () => {
    const isDark = theme === 'dark';
    const colors: Record<string, string> = {
      'yellow': isDark ? 'bg-yellow-900/20 text-yellow-200 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'blue': isDark ? 'bg-blue-900/20 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-300',
      'purple': isDark ? 'bg-purple-900/20 text-purple-200 border-purple-800' : 'bg-purple-100 text-purple-800 border-purple-300',
      'green': isDark ? 'bg-green-900/20 text-green-200 border-green-800' : 'bg-green-100 text-green-800 border-green-300',
      'red': isDark ? 'bg-red-900/20 text-red-200 border-red-800' : 'bg-red-100 text-red-800 border-red-300',
      'orange': isDark ? 'bg-orange-900/20 text-orange-200 border-orange-800' : 'bg-orange-100 text-orange-800 border-orange-300',
      'gray': isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[statusColor] || colors['gray'];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Memorando"
      icon={
        <div className={`p-1.5 sm:p-2 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
        }`}>
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Código del memorando */}
        <div className="text-xs sm:text-sm font-mono ot-theme-text-muted text-center">
          {memorandum.memorandumCode}
        </div>
          {success && (
            <div className={`rounded-xl p-3 sm:p-4 border flex items-center gap-2 sm:gap-3 ${
              theme === 'dark'
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-sm sm:text-base font-medium ${
                  theme === 'dark' ? 'text-green-200' : 'text-green-800'
                }`}>
                  Memorando subsanado exitosamente
                </p>
                <p className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>
                  Ahora está en revisión por RRHH
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className={`rounded-xl p-3 sm:p-4 border flex items-center gap-2 sm:gap-3 ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-800'} min-w-0`}>
                {error}
              </p>
            </div>
          )}

          {/* Estado */}
          <div className="rounded-xl p-3 sm:p-4 border ot-theme-surface ot-theme-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium ot-theme-text-secondary">
                Estado Actual
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusBadgeColors()}`}>
                {getMemorandumStatusLabel(memorandum.status)}
              </span>
            </div>
          </div>

          {/* Información del Incidente */}
          <div className="rounded-xl p-3 sm:p-4 border space-y-2 sm:space-y-3 ot-theme-surface ot-theme-border">
            <h3 className="text-sm sm:text-base font-semibold ot-theme-text">
              Información del Incidente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs font-medium mb-1 ot-theme-text-muted">
                  Tipo de Infracción
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base md:text-lg">{getMemorandumTypeIcon(memorandum.type)}</span>
                  <span className="text-xs sm:text-sm font-medium ot-theme-text truncate">
                    {getMemorandumTypeLabel(memorandum.type)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-1 ot-theme-text-muted">
                  Fecha del Incidente
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm ot-theme-text truncate">
                    {new Date(memorandum.incidentDate).toLocaleString('es-CO', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              {memorandum.delayMinutes && memorandum.delayMinutes > 0 && (
                <div>
                  <p className={`text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Minutos de Retraso
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className={`text-xs sm:text-sm font-semibold ${
                      theme === 'dark' ? 'text-orange-200' : 'text-orange-700'
                    }`}>
                      {memorandum.delayMinutes} minutos
                    </span>
                  </div>
                </div>
              )}

              {memorandum.earlyMinutes && memorandum.earlyMinutes > 0 && (
                <div>
                  <p className={`text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Salida Anticipada
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className={`text-xs sm:text-sm font-semibold ${
                      theme === 'dark' ? 'text-orange-200' : 'text-orange-700'
                    }`}>
                      {memorandum.earlyMinutes} minutos
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium mb-1 ot-theme-text-muted">
                Descripción
              </p>
              <p className="text-xs sm:text-sm ot-theme-text break-words">
                {memorandum.description}
              </p>
            </div>
          </div>

          {/* Plazo de Subsanación */}
          {memorandum.status === 'PENDIENTE' && (
            <div className={`rounded-xl p-3 sm:p-4 border ${
              canSubsane
                ? theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                : theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                {canSubsane ? (
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm sm:text-base font-medium mb-1 ${
                    canSubsane
                      ? theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                      : theme === 'dark' ? 'text-red-200' : 'text-red-800'
                  }`}>
                    {canSubsane ? 'Plazo para Subsanar' : 'Plazo Vencido'}
                  </p>
                  <p className={`text-xs sm:text-sm ${
                    canSubsane
                      ? theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
                      : theme === 'dark' ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {canSubsane
                      ? formatDeadlineWarning(memorandum.subsanationDeadline)
                      : 'El plazo de subsanación ha expirado. El memorando será revisado por RRHH.'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Fecha límite: {new Date(memorandum.subsanationDeadline).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Justificación del Empleado (si ya existe) */}
          {memorandum.employeeJustification && (
            <div className={`rounded-xl p-3 sm:p-4 border ${
              theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm sm:text-base font-semibold mb-2 ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
              }`}>
                Tu Justificación
              </h4>
              <p className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-blue-100' : 'text-blue-900'
              } break-words`}>
                {memorandum.employeeJustification}
              </p>
            </div>
          )}

          {/* Revisión de RRHH (si existe) */}
          {memorandum.reviewComments && (
            <div className={`rounded-xl p-3 sm:p-4 border ${
              memorandum.status === 'APROBADO'
                ? theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                : theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                {memorandum.status === 'APROBADO' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h4 className={`text-sm sm:text-base font-semibold ${
                    memorandum.status === 'APROBADO'
                      ? theme === 'dark' ? 'text-green-200' : 'text-green-800'
                      : theme === 'dark' ? 'text-red-200' : 'text-red-800'
                  }`}>
                    Revisión de RRHH
                  </h4>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Revisado por {memorandum.reviewedBy} • {new Date(memorandum.reviewDate!).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
              <p className={`text-xs sm:text-sm ${
                memorandum.status === 'APROBADO'
                  ? theme === 'dark' ? 'text-green-100' : 'text-green-900'
                  : theme === 'dark' ? 'text-red-100' : 'text-red-900'
              } break-words`}>
                {memorandum.reviewComments}
              </p>
              {memorandum.affectsRecord && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${
                  theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                }`}>
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Este memorando afecta tu expediente laboral</span>
                </div>
              )}
            </div>
          )}

          {/* Formulario de Subsanación */}
          {canSubsane && !memorandum.employeeJustification && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className={`text-sm sm:text-base font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Subsanar Memorando
              </h4>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Justificación *
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explica la razón del incidente..."
                  rows={3}
                  disabled={submitting}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border resize-none text-xs sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Mínimo 20 caracteres. Sé claro y específico.
                </p>
              </div>

              {/* TODO: Agregar subida de archivos */}
              <div className={`rounded-lg border-2 border-dashed p-3 sm:p-4 md:p-6 text-center ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700/50'
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <Upload className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Adjuntar documentos (opcional)
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Comprobantes médicos, permisos, etc.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t ot-theme-border">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto order-2 sm:order-1 text-xs sm:text-sm"
          >
            {canSubsane && !memorandum.employeeJustification ? 'Cancelar' : 'Cerrar'}
          </Button>

          {canSubsane && !memorandum.employeeJustification && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || justification.trim().length < 20}
              className="w-full sm:w-auto order-1 sm:order-2 text-xs sm:text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="sm:hidden">Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Subsanar Memorando</span>
                  <span className="sm:hidden">Subsanar</span>
                </>
              )}
            </Button>
          )}
        </div>
    </Modal>
  );
}
