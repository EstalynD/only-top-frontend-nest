"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { solicitarOtp, firmarContrato } from '@/lib/service-clientes/api-contratos';
import type { ContratoModelo } from '@/lib/service-clientes/types-contratos';
import { X, Shield, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';

type FirmaDigitalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contrato: ContratoModelo;
  onSuccess: () => void;
};

export function FirmaDigitalModal({ isOpen, onClose, contrato, onSuccess }: FirmaDigitalModalProps) {
  const { token } = useAuth();
  const [step, setStep] = React.useState<'info' | 'otp' | 'firma'>('info');
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);

  // Form data
  const [formData, setFormData] = React.useState({
    nombreCompleto: '',
    numeroIdentificacion: '',
    codigoOtp: '',
  });

  const modelo = typeof contrato.modeloId === 'object' ? contrato.modeloId : null;

  if (!isOpen || !modelo) return null;

  const handleSolicitarOtp = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await solicitarOtp(token, contrato._id, modelo.correoElectronico);
      addToast({
        type: 'success',
        title: 'Código enviado',
        description: result.message,
      });
      setOtpSent(true);
      setStep('otp');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al enviar código',
        description: error?.message || 'No se pudo enviar el código de verificación',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirmar = async () => {
    if (!token) return;

    if (!formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp) {
      addToast({
        type: 'error',
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos requeridos',
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's IP and device info
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      const result = await firmarContrato(token, {
        contratoId: contrato._id,
        nombreCompleto: formData.nombreCompleto,
        numeroIdentificacion: formData.numeroIdentificacion,
        codigoOtp: formData.codigoOtp,
        ipAddress: ipData.ip || 'unknown',
        userAgent: navigator.userAgent,
        dispositivo: `${navigator.platform} - ${navigator.vendor}`,
      });

      addToast({
        type: 'success',
        title: '¡Contrato firmado!',
        description: 'El contrato ha sido firmado exitosamente',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al firmar',
        description: error?.message || 'No se pudo firmar el contrato',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-xl shadow-2xl transition-all duration-200"
          style={{ background: 'var(--surface)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--ot-blue-100)' }}
              >
                <Shield size={20} style={{ color: 'var(--ot-blue-600)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Firma Digital de Contrato
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {contrato.numeroContrato}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ border: '1px solid var(--border)' }}
              disabled={loading}
            >
              <X size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'info' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)', border: '1px solid var(--ot-blue-200)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--ot-blue-700)' }}>
                    📋 Información del Contrato
                  </p>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--ot-blue-600)' }}>
                    <p><strong>Modelo:</strong> {modelo.nombreCompleto}</p>
                    <p><strong>Email:</strong> {modelo.correoElectronico}</p>
                    <p><strong>Fecha de inicio:</strong> {new Date(contrato.fechaInicio).toLocaleDateString('es-ES')}</p>
                    <p><strong>Periodicidad:</strong> {contrato.periodicidadPago}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
                  <p className="text-xs flex items-start gap-2" style={{ color: '#78350f' }}>
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    Para firmar este contrato necesitarás verificar tu identidad mediante un código OTP que se enviará a tu correo electrónico.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Proceso de Firma Digital:
                  </h4>
                  <ol className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>1</span>
                      Recibirás un código de verificación (OTP) en tu correo
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>2</span>
                      Ingresarás tus datos personales para verificación
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>3</span>
                      El sistema validará toda la información
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>4</span>
                      El contrato quedará firmado digitalmente
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                {otpSent && (
                  <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                        Código OTP enviado
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#059669' }}>
                        Revisa tu correo <strong>{modelo.correoElectronico}</strong> y copia el código de 6 dígitos.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Como aparece en tu identificación"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Número de Identificación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroIdentificacion}
                    onChange={(e) => setFormData({ ...formData, numeroIdentificacion: e.target.value })}
                    placeholder="Tu número de documento"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Código OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.codigoOtp}
                    onChange={(e) => setFormData({ ...formData, codigoOtp: e.target.value.replace(/\D/g, '') })}
                    placeholder="Código de 6 dígitos"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200 text-center text-2xl tracking-[0.5em] font-mono"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <button
                  onClick={handleSolicitarOtp}
                  disabled={loading}
                  className="w-full text-sm py-2 rounded-lg transition-all duration-200"
                  style={{
                    border: '1px solid var(--ot-blue-500)',
                    color: 'var(--ot-blue-600)',
                    background: 'transparent',
                  }}
                >
                  {loading ? 'Enviando...' : 'Reenviar código OTP'}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancelar
            </button>
            {step === 'info' ? (
              <button
                onClick={handleSolicitarOtp}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
                  color: '#ffffff',
                }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Enviar código OTP
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleFirmar}
                disabled={loading || !formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  opacity: (!formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp) ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Firmando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Firmar Contrato
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

