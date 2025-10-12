"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { addToast } from '@/components/ui/Toast';
import {
  obtenerContratoPorToken,
  solicitarOtpPorToken,
  firmarContratoPorToken,
} from '@/lib/service-clientes/api-contratos';
import type { ContratoModelo } from '@/lib/service-clientes/types-contratos';
import {
  Shield,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader,
  Calendar,
  DollarSign,
  CreditCard,
  User,
  FileText,
  ArrowLeft,
} from 'lucide-react';

export default function FirmaContratoPublicaPage() {
  const router = useRouter();
  const params = useParams();
  const [contrato, setContrato] = React.useState<ContratoModelo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState<'info' | 'otp' | 'firma' | 'exito'>('info');
  const [processing, setProcessing] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);

  // Form data
  const [formData, setFormData] = React.useState({
    nombreCompleto: '',
    numeroIdentificacion: '',
    codigoOtp: '',
  });

  const token = params?.token as string;

  React.useEffect(() => {
    if (!token) return;

    const loadContrato = async () => {
      setLoading(true);
      try {
        const data = await obtenerContratoPorToken(token);
        setContrato(data);
      } catch (error: any) {
        const msg = error?.message || 'El enlace es inválido o ha expirado';
        addToast({
          type: 'error',
          title: 'Error al cargar contrato',
          description: msg,
        });
      } finally {
        setLoading(false);
      }
    };

    loadContrato();
  }, [token]);

  const handleSolicitarOtp = async () => {
    if (!token) return;

    setProcessing(true);
    try {
      const result = await solicitarOtpPorToken(token);
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
      setProcessing(false);
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

    setProcessing(true);
    try {
      // Get user's IP and device info
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      const result = await firmarContratoPorToken(token, {
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
        description: 'Tu contrato ha sido firmado exitosamente',
      });
      setStep('exito');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al firmar',
        description: error?.message || 'No se pudo firmar el contrato',
      });
    } finally {
      setProcessing(false);
    }
  };

  const modelo = contrato && typeof contrato.modeloId === 'object' ? contrato.modeloId : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contrato || !modelo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-md p-8 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <AlertCircle size={64} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Enlace Inválido o Expirado
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            El enlace de firma que intentas acceder no es válido o ha expirado.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Si necesitas ayuda, contacta con tu Sales Closer asignado.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'exito') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-md p-8 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#10b981' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            ¡Contrato Firmado Exitosamente!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Tu contrato ha sido firmado y procesado correctamente. Recibirás un correo de confirmación con todos los detalles.
          </p>
          <div className="p-4 rounded-lg mb-6" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
            <p className="text-xs" style={{ color: '#059669' }}>
              <strong>Número de Contrato:</strong> {contrato.numeroContrato}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ¡Bienvenid@ a OnlyTop! Tu equipo de trabajo se pondrá en contacto contigo pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}>
            <Shield size={32} style={{ color: '#ffffff' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Firma Digital de Contrato
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            OnlyTop - Gestión de Contenido Digital
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Contrato (Sidebar) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Información del Contrato
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Número de Contrato</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{contrato.numeroContrato}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Modelo</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{modelo.nombreCompleto}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Email</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{modelo.correoElectronico}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Fecha de Inicio</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {new Date(contrato.fechaInicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Periodicidad de Pago</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{contrato.periodicidadPago}</p>
                </div>
              </div>
            </div>

            {contrato.tokenFirmaExpiracion && (
              <div className="p-4 rounded-lg" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
                <p className="text-xs flex items-start gap-2" style={{ color: '#78350f' }}>
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  Este enlace expira el {new Date(contrato.tokenFirmaExpiracion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Formulario de Firma */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {step === 'info' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Proceso de Firma Digital
                  </h3>

                  <div className="p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)' }}>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--ot-blue-700)' }}>
                      📋 Pasos para firmar tu contrato:
                    </p>
                    <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: 'var(--ot-blue-600)' }}>
                      <li>Recibirás un código de verificación (OTP) en tu correo</li>
                      <li>Ingresarás tus datos personales para verificación</li>
                      <li>El sistema validará toda la información</li>
                      <li>El contrato quedará firmado digitalmente</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-lg" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
                    <p className="text-xs flex items-start gap-2" style={{ color: '#78350f' }}>
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      Para firmar necesitarás tu nombre completo, número de identificación y un código OTP que te enviaremos a tu correo electrónico.
                    </p>
                  </div>

                  <button
                    onClick={handleSolicitarOtp}
                    disabled={processing}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
                    style={{
                      background: processing ? '#93c5fd' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                    }}
                  >
                    {processing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Solicitar Código OTP
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Verificación de Identidad
                  </h3>

                  {otpSent && (
                    <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                      <CheckCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                      <div className="text-xs">
                        <p className="font-medium" style={{ color: '#10b981' }}>
                          Código OTP enviado
                        </p>
                        <p className="mt-1" style={{ color: '#059669' }}>
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
                      className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200"
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
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200 text-center text-2xl tracking-[0.5em] font-mono"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('info')}
                      className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
                      style={{
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleSolicitarOtp}
                      disabled={processing}
                      className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
                      style={{
                        border: '1px solid var(--ot-blue-500)',
                        color: 'var(--ot-blue-600)',
                        background: 'transparent',
                      }}
                    >
                      {processing ? 'Enviando...' : 'Reenviar código OTP'}
                    </button>
                    <button
                      onClick={handleFirmar}
                      disabled={processing || !formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
                      style={{
                        background: processing || !formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp
                          ? '#93c5fd'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        opacity: (!formData.nombreCompleto || !formData.numeroIdentificacion || !formData.codigoOtp) ? 0.5 : 1,
                      }}
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Firmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Firmar Contrato
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} OnlyTop. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Este documento ha sido firmado digitalmente y tiene validez legal.
          </p>
        </div>
      </div>
    </div>
  );
}

