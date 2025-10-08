"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getContrato, deleteContrato, enviarParaFirma, enviarEnlaceFirma, getPdfViewUrl, getPdfDownloadUrl } from '@/lib/service-clientes/api-contratos';
import type { ContratoModelo } from '@/lib/service-clientes/types-contratos';
import { EstadoContrato } from '@/lib/service-clientes/types-contratos';
import { ESTADOS_CONTRATO, PERIODICIDADES_PAGO, TIPOS_COMISION } from '@/lib/service-clientes/constants-contratos';
import { FirmaDigitalModal } from '@/components/clientes/FirmaDigitalModal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  Send,
  Download,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
} from 'lucide-react';

// Tipos auxiliares y type guard para `escalaId`
type EscalaRule = { minUsd: number; maxUsd?: number | null; percentage: number };
type EscalaWithRules = { rules: EscalaRule[]; [key: string]: any };
function hasRules(obj: unknown): obj is EscalaWithRules {
  return !!obj && typeof obj === 'object' && Array.isArray((obj as any).rules);
}

export default function ContratoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, ready } = useAuth();
  const [contrato, setContrato] = React.useState<ContratoModelo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showFirmaModal, setShowFirmaModal] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sendingLink, setSendingLink] = React.useState(false);

  const contratoId = params?.id as string;

  React.useEffect(() => {
    if (!ready || !token || !contratoId) return;

    const loadContrato = async () => {
      setLoading(true);
      try {
        const data = await getContrato(token, contratoId);
        setContrato(data);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar contrato',
          description: error?.message || 'No se pudo cargar la información del contrato',
        });
        router.push('/clientes/contratos');
      } finally {
        setLoading(false);
      }
    };

    loadContrato();
  }, [token, ready, contratoId, router]);

  const handleDelete = async () => {
    if (!token || !contrato) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar el contrato ${contrato.numeroContrato}?`)) {
      return;
    }

    try {
      await deleteContrato(token, contrato._id);
      addToast({
        type: 'success',
        title: 'Contrato eliminado',
        description: `El contrato ${contrato.numeroContrato} ha sido eliminado`,
      });
      router.push('/clientes/contratos');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar el contrato',
      });
    }
  };

  const handleEnviarParaFirma = async () => {
    if (!token || !contrato) return;

    if (!confirm('¿Enviar el contrato para firma digital? La modelo recibirá un email con las instrucciones.')) {
      return;
    }

    setSending(true);
    try {
      const result = await enviarParaFirma(token, contrato._id);
      addToast({
        type: 'success',
        title: 'Contrato enviado',
        description: result.message,
      });
      // Reload contrato
      const updated = await getContrato(token, contrato._id);
      setContrato(updated);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al enviar',
        description: error?.message || 'No se pudo enviar el contrato',
      });
    } finally {
      setSending(false);
    }
  };

  const handleEnviarEnlaceFirma = async () => {
    if (!token || !contrato) return;

    if (!confirm('¿Enviar enlace único de firma? La modelo recibirá un email con un enlace seguro para firmar el contrato sin necesidad de iniciar sesión.')) {
      return;
    }

    setSendingLink(true);
    try {
      const result = await enviarEnlaceFirma(token, contrato._id);
      addToast({
        type: 'success',
        title: 'Enlace enviado',
        description: result.message,
      });
      // Reload contrato
      const updated = await getContrato(token, contrato._id);
      setContrato(updated);
      
      // Copiar enlace al portapapeles
      if (result.enlace && navigator.clipboard) {
        await navigator.clipboard.writeText(result.enlace);
        addToast({
          type: 'info',
          title: 'Enlace copiado',
          description: 'El enlace de firma ha sido copiado al portapapeles',
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al enviar enlace',
        description: error?.message || 'No se pudo enviar el enlace de firma',
      });
    } finally {
      setSendingLink(false);
    }
  };

  const handleFirmaSuccess = async () => {
    if (!token || !contratoId) return;
    // Reload contrato after signing
    const updated = await getContrato(token, contratoId);
    setContrato(updated);
  };

  const modelo = contrato && typeof contrato.modeloId === 'object' ? contrato.modeloId : null;
  const estadoInfo = ESTADOS_CONTRATO.find(e => e.value === contrato?.estado);
  const periodicidadLabel = PERIODICIDADES_PAGO.find(p => p.value === contrato?.periodicidadPago)?.label;
  const escalaId = contrato?.comisionEscalonada?.escalaId as unknown;
  const escalaWithRules = hasRules(escalaId) ? escalaId : null;

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {contrato.numeroContrato}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Contrato de {modelo?.nombreCompleto || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: `${estadoInfo?.color}20`,
              color: estadoInfo?.color,
            }}
          >
            {estadoInfo?.label || contrato.estado}
          </span>

          {contrato.estado === EstadoContrato.BORRADOR && (
            <>
              <button
                onClick={handleEnviarEnlaceFirma}
                disabled={sendingLink || sending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
                style={{
                  background: sendingLink ? '#93c5fd' : 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
                  color: '#ffffff',
                }}
              >
                <Send size={18} />
                {sendingLink ? 'Enviando...' : 'Enviar Enlace de Firma'}
              </button>
              <button
                onClick={handleEnviarParaFirma}
                disabled={sending || sendingLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  border: '1px solid var(--ot-blue-500)',
                  background: 'var(--surface)',
                  color: 'var(--ot-blue-600)',
                }}
              >
                <Shield size={18} />
                {sending ? 'Enviando...' : 'Método Antiguo'}
              </button>
              <button
                onClick={() => router.push(`/clientes/contratos/${contrato._id}/editar`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <Edit size={18} />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  border: '1px solid #ef4444',
                  background: 'var(--surface)',
                  color: '#ef4444',
                }}
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </>
          )}

          {contrato.estado === EstadoContrato.PENDIENTE_FIRMA && (
            <button
              onClick={() => setShowFirmaModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
              }}
            >
              <Shield size={18} />
              Firmar Contrato
            </button>
          )}

          {contrato.estado === EstadoContrato.FIRMADO && (
            <>
              <a
                href={getPdfViewUrl(contrato._id, contrato.numeroContrato)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  border: '1px solid var(--ot-blue-500)',
                  background: 'var(--surface)',
                  color: 'var(--ot-blue-600)',
                }}
              >
                <FileText size={18} />
                Ver PDF
              </a>
              <a
                href={getPdfDownloadUrl(contrato._id)}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  border: '1px solid var(--ot-green-500)',
                  background: 'var(--surface)',
                  color: 'var(--ot-green-600)',
                }}
              >
                <Download size={18} />
                Descargar PDF
              </a>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de la Modelo */}
          {modelo && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={20} />
                Información de la Modelo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Correo Electrónico</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{modelo.correoElectronico}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Identificación</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{modelo.numeroIdentificacion}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fechas del Contrato */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={20} />
              Fechas y Periodicidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fecha de Inicio</p>
                <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(contrato.fechaInicio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fecha Inicio de Cobro</p>
                <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(contrato.fechaInicioCobro).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--ot-blue-700)' }}>Periodicidad de Pago</p>
              <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--ot-blue-700)' }}>
                {periodicidadLabel}
              </p>
            </div>
          </div>

          {/* Comisión */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <DollarSign size={20} />
              Estructura de Comisión
            </h3>
            {contrato.tipoComision === 'FIJO' ? (
              <div className="p-4 rounded-lg" style={{ background: 'var(--ot-green-50)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Porcentaje Fijo</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#10b981' }}>
                  {contrato.comisionFija?.porcentaje}%
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--ot-blue-700)' }}>
                  Escala Escalonada: {contrato.comisionEscalonada?.escalaNombre}
                </p>
                {escalaWithRules && (
                  <div className="space-y-2">
                    {escalaWithRules.rules.map((rule: EscalaRule, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b" style={{ borderColor: 'var(--ot-blue-200)' }}>
                        <span style={{ color: 'var(--ot-blue-600)' }}>
                          ${rule.minUsd.toLocaleString()} {rule.maxUsd ? `- $${rule.maxUsd.toLocaleString()}` : 'en adelante'}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--ot-blue-700)' }}>
                          {rule.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Procesador de Pago */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CreditCard size={20} />
              Medio de Pago
            </h3>
            <div className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {contrato.procesadorPagoNombre}
              </p>
            </div>
          </div>

          {/* Notas Internas */}
          {contrato.notasInternas && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={20} />
                Notas Internas
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {contrato.notasInternas}
              </p>
            </div>
          )}

          {/* Firma Digital */}
          {contrato.firma && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Shield size={20} />
                Firma Digital
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                    <p className="font-semibold" style={{ color: '#10b981' }}>Contrato Firmado</p>
                  </div>
                  <div className="space-y-1 text-xs" style={{ color: '#059669' }}>
                    <p><strong>Firmado por:</strong> {contrato.firma.nombreCompleto}</p>
                    <p><strong>Identificación:</strong> {contrato.firma.numeroIdentificacion}</p>
                    <p><strong>Fecha:</strong> {new Date(contrato.firma.fechaFirma).toLocaleString('es-ES')}</p>
                    <p><strong>IP Address:</strong> {contrato.firma.ipAddress}</p>
                    <p><strong>Verificación OTP:</strong> {contrato.firma.otpVerificado ? '✓ Verificado' : '✗ No verificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock size={20} />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                  <FileText size={16} style={{ color: 'var(--ot-blue-600)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Creado</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(contrato.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              {contrato.fechaEnvioPendienteFirma && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fef3c7' }}>
                    <Send size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Enviado para firma</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                      {new Date(contrato.fechaEnvioPendienteFirma).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {contrato.fechaFirma && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#d1fae5' }}>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Firmado</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                      {new Date(contrato.fechaFirma).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Firma Digital Modal */}
      {showFirmaModal && (
        <FirmaDigitalModal
          isOpen={showFirmaModal}
          onClose={() => setShowFirmaModal(false)}
          contrato={contrato}
          onSuccess={handleFirmaSuccess}
        />
      )}
    </div>
  );
}

