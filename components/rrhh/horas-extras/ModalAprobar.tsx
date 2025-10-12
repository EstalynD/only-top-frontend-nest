/**
 * Modal para aprobar o rechazar un registro de Horas Extras
 * Permite seleccionar estado (APROBADO/RECHAZADO) y agregar comentarios
 */

"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import { aprobarHorasExtras } from '@/lib/service-horas-extras/api';
import { MESSAGES } from '@/lib/service-horas-extras/constants';

interface ModalAprobarHorasExtrasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  registroId: string | null;
  token: string;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export default function ModalAprobarHorasExtras({
  isOpen,
  onClose,
  onSuccess,
  registroId,
  token,
  addToast,
}: ModalAprobarHorasExtrasProps) {
  
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO');
  const [comentarios, setComentarios] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Preservar el ID del registro mientras el modal esté abierto
  const [registroIdInterno, setRegistroIdInterno] = useState<string | null>(null);
  const registroIdEfectivo = useMemo(() => registroId ?? registroIdInterno, [registroId, registroIdInterno]);

  useEffect(() => {
    if (isOpen && registroId) {
      setRegistroIdInterno(registroId);
    }
  }, [isOpen, registroId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!registroIdEfectivo) {
      addToast('ID de registro no válido', 'error');
      return;
    }
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Debug para diagnóstico en caso de que vuelva a fallar
      console.log('✉️ Enviando aprobación/rechazo', { registroIdProp: registroId, registroIdInterno, registroIdEfectivo, estado });
      await aprobarHorasExtras(registroIdEfectivo, {
        estado,
        comentarios: comentarios.trim() || undefined,
      }, token);
      
      const mensaje = estado === 'APROBADO' 
        ? MESSAGES.success.approved 
        : MESSAGES.success.rejected;
      addToast(mensaje, 'success');
      
      onSuccess();
      handleClose();
      
    } catch (error: any) {
      console.error('Error al aprobar/rechazar:', error);
      const message = error?.message || MESSAGES.error.approve;
      addToast(message, 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
    setTimeout(() => {
      setEstado('APROBADO');
      setComentarios('');
      setShowConfirmation(false);
      setRegistroIdInterno(null);
    }, 300);
  }

  const esAprobacion = estado === 'APROBADO';
  const titulo = esAprobacion ? 'Aprobar Registro' : 'Rechazar Registro';
  const iconColor = esAprobacion ? 'var(--ot-green-500)' : 'var(--ot-red-500)';
  const buttonColor = esAprobacion ? 'var(--ot-green-500)' : 'var(--ot-red-500)';
  const buttonText = esAprobacion ? 'Aprobar' : 'Rechazar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={titulo}
      icon={esAprobacion ? (
        <CheckCircle size={22} style={{ color: iconColor }} />
      ) : (
        <XCircle size={22} style={{ color: iconColor }} />
      )}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-4 sm:p-6 space-y-6">
          
          {!showConfirmation ? (
            <>
              {/* Selector de Estado */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Decisión *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEstado('APROBADO')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      estado === 'APROBADO' ? 'border-green-500' : ''
                    }`}
                    style={{
                      background: estado === 'APROBADO' ? '#d1fae5' : 'var(--surface)',
                      borderColor: estado === 'APROBADO' ? '#10b981' : 'var(--border)',
                    }}
                    disabled={loading}
                  >
                    <CheckCircle 
                      size={32} 
                      className="mx-auto mb-2"
                      style={{ color: estado === 'APROBADO' ? '#10b981' : 'var(--text-muted)' }}
                    />
                    <p 
                      className="font-semibold text-center"
                      style={{ 
                        color: estado === 'APROBADO' ? '#10b981' : 'var(--text-muted)' 
                      }}
                    >
                      Aprobar
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setEstado('RECHAZADO')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      estado === 'RECHAZADO' ? 'border-red-500' : ''
                    }`}
                    style={{
                      background: estado === 'RECHAZADO' ? '#fee2e2' : 'var(--surface)',
                      borderColor: estado === 'RECHAZADO' ? '#ef4444' : 'var(--border)',
                    }}
                    disabled={loading}
                  >
                    <XCircle 
                      size={32} 
                      className="mx-auto mb-2"
                      style={{ color: estado === 'RECHAZADO' ? '#ef4444' : 'var(--text-muted)' }}
                    />
                    <p 
                      className="font-semibold text-center"
                      style={{ 
                        color: estado === 'RECHAZADO' ? '#ef4444' : 'var(--text-muted)' 
                      }}
                    >
                      Rechazar
                    </p>
                  </button>
                </div>
              </div>
              
              {/* Comentarios */}
              <div>
                <label 
                  htmlFor="comentarios" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <MessageSquare size={16} className="inline mr-1" />
                  Comentarios {estado === 'RECHAZADO' && '(Recomendado)'}
                </label>
                <textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  rows={4}
                  placeholder={estado === 'APROBADO' 
                    ? 'Comentarios adicionales (opcional)...'
                    : 'Explique el motivo del rechazo...'
                  }
                  className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={loading}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {comentarios.length}/500 caracteres
                </p>
              </div>
              
              {/* Información adicional */}
              <div 
                className="p-3 rounded-lg flex items-start space-x-3"
                style={{ 
                  background: esAprobacion ? '#dbeafe' : '#fee2e2',
                  border: `1px solid ${esAprobacion ? '#3b82f6' : '#ef4444'}`,
                }}
              >
                <AlertCircle 
                  size={20} 
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: esAprobacion ? '#3b82f6' : '#ef4444' }}
                />
                <div>
                  <p 
                    className="text-sm font-medium mb-1"
                    style={{ color: esAprobacion ? '#1e40af' : '#991b1b' }}
                  >
                    {esAprobacion ? 'Antes de aprobar' : 'Antes de rechazar'}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: esAprobacion ? '#1e3a8a' : '#7f1d1d' }}
                  >
                    {esAprobacion 
                      ? 'Verifique que todas las horas registradas sean correctas. Una vez aprobado, el registro podrá ser procesado para pago.'
                      : 'El registro será marcado como rechazado. Se recomienda agregar comentarios explicando el motivo del rechazo.'
                    }
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Pantalla de confirmación */
            <div className="text-center py-8">
              {esAprobacion ? (
                <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={64} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
              )}
              
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {esAprobacion ? '¿Confirma la aprobación?' : '¿Confirma el rechazo?'}
              </h3>
              
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {esAprobacion 
                  ? 'Esta acción marcará el registro como aprobado y permitirá su procesamiento para pago.'
                  : 'Esta acción marcará el registro como rechazado. El empleado podrá ver esta decisión.'
                }
              </p>
              
              {comentarios && (
                <div 
                  className="p-3 rounded-lg text-left mb-4"
                  style={{ background: 'var(--surface-muted)' }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Sus comentarios:
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {comentarios}
                  </p>
                </div>
              )}
            </div>
          )}
          
        </div>
        
        {/* Footer con botones */}
        <div 
          className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {showConfirmation && (
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
              }}
            >
              Volver
            </button>
          )}
          
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
            }}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            style={{
              background: loading ? 'var(--surface-muted)' : buttonColor,
              color: loading ? 'var(--text-muted)' : '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Procesando...
              </>
            ) : showConfirmation ? (
              <>
                {esAprobacion ? <CheckCircle size={18} className="mr-2" /> : <XCircle size={18} className="mr-2" />}
                Confirmar {buttonText}
              </>
            ) : (
              <>
                {esAprobacion ? <CheckCircle size={18} className="mr-2" /> : <XCircle size={18} className="mr-2" />}
                {buttonText}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
