"use client";

import React from 'react';
import { FileText, Eye, AlertCircle, Clock, XCircle, Loader2, Calendar, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  adminGetMemorandosUsuario,
  empleadoSubsanarMemorandum
} from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum } from '@/lib/service-rrhh/memorandum-types';
import { 
  getMemorandumStatusLabel, 
  getMemorandumStatusColor,
  getMemorandumTypeLabel,
  getMemorandumTypeIcon,
  canBeSubsaned,
  getDaysRemaining
} from '@/lib/service-rrhh/memorandum-types';
import type { AttendanceSummary } from '@/lib/service-rrhh/attendance.api';

interface MemorandumActionsProps {
  userId: string;
  summary: AttendanceSummary;
  onSuccess?: () => void;
}

export function MemorandumActions({ userId, summary, onSuccess }: MemorandumActionsProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [showMemorandums, setShowMemorandums] = React.useState(false);
  const [memorandums, setMemorandums] = React.useState<Memorandum[]>([]);
  const [selectedMemo, setSelectedMemo] = React.useState<Memorandum | null>(null);
  const [showSubsanacion, setShowSubsanacion] = React.useState(false);
  const [justification, setJustification] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleViewMemorandums = async () => {
    if (!token) return;

    setLoading(true);
    setShowMemorandums(true);

    try {
      // Obtener memorandos del usuario para la fecha específica
      const date = new Date(summary.date);
      const startDate = date.toISOString().split('T')[0];
      const endDate = date.toISOString().split('T')[0];
      
      const memos = await adminGetMemorandosUsuario(token, userId, {
        startDate,
        endDate
      });
      
      setMemorandums(memos);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cargar memorandos',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      setShowMemorandums(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubsanar = (memo: Memorandum) => {
    setSelectedMemo(memo);
    setJustification(memo.employeeJustification || '');
    setShowSubsanacion(true);
  };

  const handleSubmitSubsanacion = async () => {
    if (!token || !selectedMemo) return;
    if (!justification.trim()) {
      toast({
        type: 'error',
        title: 'Justificación requerida',
        description: 'Debes proporcionar una justificación para subsanar el memorando'
      });
      return;
    }

    setSubmitting(true);
    try {
      await empleadoSubsanarMemorandum(token, selectedMemo._id, {
        justification: justification.trim(),
        attachments: []
      });

      toast({
        type: 'success',
        title: 'Memorando subsanado',
        description: 'Tu justificación ha sido enviada a Recursos Humanos para revisión'
      });

      setShowSubsanacion(false);
      setSelectedMemo(null);
      setJustification('');
      
      // Recargar memorandos
      handleViewMemorandums();
      onSuccess?.();
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al subsanar memorando',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if there are any anomalies that would generate memorandums
  const hasAnomalies = !summary.checkIn || summary.isLate || 
    (summary.checkOut && summary.expectedHours && summary.workedHours < (summary.expectedHours - 0.5));

  if (!hasAnomalies) {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleViewMemorandums}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Eye size={16} />
        )}
        Ver Memorandos
      </Button>

      {/* Memorandums Modal */}
      <Modal
        isOpen={showMemorandums}
        onClose={() => setShowMemorandums(false)}
        title={`Memorandos - ${new Date(summary.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}`}
        icon={<FileText size={20} style={{ color: 'var(--ot-blue-600)' }} />}
        maxWidth="3xl"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={32} className={`mx-auto mb-4 animate-spin ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Cargando memorandos...</p>
            </div>
          ) : memorandums.length === 0 ? (
            <div className={`text-center py-8 rounded-lg border ${
              theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            }`}>
              <FileText size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                No hay memorandos para esta fecha
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                Los memorandos se generan automáticamente cuando el sistema detecta anomalías de asistencia
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {memorandums.map((memo) => {
                const canSubsane = canBeSubsaned(memo);
                const daysRemaining = getDaysRemaining(memo.subsanationDeadline);
                const statusColor = getMemorandumStatusColor(memo.status);

                return (
                  <div
                    key={memo._id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getMemorandumTypeIcon(memo.type)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-mono text-sm font-semibold ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                            }`}>
                              {(memo as any).code || (memo as any).memorandumCode}
                            </span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: `var(--ot-${statusColor}-100)`,
                                color: `var(--ot-${statusColor}-700)`
                              }}
                            >
                              {getMemorandumStatusLabel(memo.status)}
                            </span>
                          </div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getMemorandumTypeLabel(memo.type)}
                          </p>
                        </div>
                      </div>
                      
                      {canSubsane && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSubsanar(memo)}
                        >
                          Subsanar
                        </Button>
                      )}
                    </div>

                    <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          Incidencia: {new Date(memo.incidentDate).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {memo.delayMinutes !== undefined && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Tardanza: {memo.delayMinutes} minutos</span>
                        </div>
                      )}
                      
                      {memo.earlyMinutes !== undefined && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Salida anticipada: {memo.earlyMinutes} minutos</span>
                        </div>
                      )}

                      {canSubsane && (
                        <div className={`mt-3 p-2 rounded text-xs ${
                          daysRemaining <= 1
                            ? theme === 'dark'
                              ? 'bg-red-900/20 text-red-400'
                              : 'bg-red-50 text-red-700'
                            : theme === 'dark'
                              ? 'bg-yellow-900/20 text-yellow-400'
                              : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          <AlertCircle size={12} className="inline mr-1" />
                          {daysRemaining < 0 
                            ? 'Plazo vencido' 
                            : daysRemaining === 0 
                              ? 'Vence hoy'
                              : `Vence en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}`
                          }
                        </div>
                      )}

                      {memo.employeeJustification && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-900/50 border-gray-700' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Justificación:
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {memo.employeeJustification}
                          </p>
                        </div>
                      )}

                      {memo.reviewComments && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-900/50 border-gray-700' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Comentarios de RRHH:
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {memo.reviewComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Subsanacion Modal */}
      <Modal
        isOpen={showSubsanacion}
        onClose={() => {
          setShowSubsanacion(false);
          setSelectedMemo(null);
          setJustification('');
        }}
        title="Subsanar Memorando"
        icon={<FileText size={20} style={{ color: 'var(--ot-orange-600)' }} />}
      >
        {selectedMemo && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Código:</strong> {(selectedMemo as any).code || (selectedMemo as any).memorandumCode}
              </p>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Tipo:</strong> {getMemorandumTypeLabel(selectedMemo.type)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Fecha:</strong> {new Date(selectedMemo.incidentDate).toLocaleDateString('es-ES')}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Justificación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explica el motivo de tu ausencia o tardanza..."
                rows={5}
                className={`w-full px-3 py-2 rounded-lg border resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Proporciona una explicación clara y detallada. Será revisada por Recursos Humanos.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSubsanacion(false);
                  setSelectedMemo(null);
                  setJustification('');
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitSubsanacion}
                disabled={submitting || !justification.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Justificación'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
