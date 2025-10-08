/**
 * GenerarFacturasModal Component
 * 
 * Modal para generar facturas automáticamente por periodo
 * Permite seleccionar periodo (año, mes, quincena) y modelos específicas
 */

'use client';

import React from 'react';
import {
  X,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { generarFacturasPorPeriodo, type GenerarFacturasPorPeriodoDto } from '@/lib/service-cartera';

interface GenerarFacturasModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess?: () => void;
}

interface ResultadoGeneracion {
  generadas: number;
  errores: number;
  facturas: any[];
  erroresDetalle: Array<{ modeloId: string; error: string }>;
}

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const ANIOS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return { value: year, label: year.toString() };
});

const QUINCENAS = [
  { value: null, label: 'Mes completo' },
  { value: 1, label: 'Primera quincena (1-15)' },
  { value: 2, label: 'Segunda quincena (16-fin)' },
];

export function GenerarFacturasModal({ isOpen, onClose, token, onSuccess }: GenerarFacturasModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [resultado, setResultado] = React.useState<ResultadoGeneracion | null>(null);
  const [mostrandoResultado, setMostrandoResultado] = React.useState(false);

  // Formulario
  const [anio, setAnio] = React.useState<number>(new Date().getFullYear());
  const [mes, setMes] = React.useState<number>(new Date().getMonth() + 1);
  const [quincena, setQuincena] = React.useState<number | null>(null);
  const [modelosIds, setModelosIds] = React.useState<string>(''); // IDs separados por coma o vacío para todas

  const handleGenerar = async () => {
    setLoading(true);
    setResultado(null);
    setMostrandoResultado(false);

    try {
      const dto: GenerarFacturasPorPeriodoDto = {
        anio,
        mes,
        quincena: quincena || undefined,
        modeloIds: modelosIds.trim() ? modelosIds.split(',').map(id => id.trim()) : undefined,
      };

      const response = await generarFacturasPorPeriodo(token, dto);
      setResultado(response);
      setMostrandoResultado(true);

      if (response.generadas > 0 && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error generando facturas:', error);
      setResultado({
        generadas: 0,
        errores: 1,
        facturas: [],
        erroresDetalle: [{ modeloId: 'general', error: error.message || 'Error desconocido' }],
      });
      setMostrandoResultado(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResultado(null);
      setMostrandoResultado(false);
      setModelosIds('');
      onClose();
    }
  };

  if (!isOpen) return null;

  // Estilos
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  };

  const modalStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
    color: 'var(--text-primary)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--background)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger' = 'primary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: '8px',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      opacity: loading ? 0.6 : 1,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        background: 'var(--background)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
      };
    }

    return baseStyle;
  };

  const infoBoxStyle: React.CSSProperties = {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  };

  const resultadoBoxStyle = (tipo: 'success' | 'error'): React.CSSProperties => ({
    background: tipo === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${tipo === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  });

  const statCardStyle: React.CSSProperties = {
    background: 'var(--background)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Generar Facturas Automáticas
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Genera facturas para modelos según sus ventas
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {!mostrandoResultado ? (
            <>
              {/* Info Box */}
              <div style={infoBoxStyle}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    Esta acción generará facturas automáticamente para todas las modelos activas con ventas en el periodo seleccionado.
                  </p>
                  <p style={{ margin: '8px 0 0 0' }}>
                    El sistema consultará las ventas en ChatterSales, calculará las comisiones según el contrato de cada modelo y creará las facturas correspondientes.
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Año
                </label>
                <select
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  disabled={loading}
                  style={inputStyle}
                >
                  {ANIOS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Mes
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  disabled={loading}
                  style={inputStyle}
                >
                  {MESES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Quincena (opcional)
                </label>
                <select
                  value={quincena === null ? '' : quincena}
                  onChange={(e) => setQuincena(e.target.value === '' ? null : Number(e.target.value))}
                  disabled={loading}
                  style={inputStyle}
                >
                  {QUINCENAS.map((q) => (
                    <option key={q.value === null ? 'null' : q.value} value={q.value === null ? '' : q.value}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <Users size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Modelos específicas (opcional)
                </label>
                <input
                  type="text"
                  value={modelosIds}
                  onChange={(e) => setModelosIds(e.target.value)}
                  disabled={loading}
                  placeholder="Dejar vacío para generar para todas las modelos activas"
                  style={inputStyle}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Opcional: IDs de modelos separados por coma (ej: 123,456,789). Si se deja vacío, se generarán facturas para todas las modelos activas con ventas.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Resultado de la generación */}
              {resultado && resultado.generadas > 0 && (
                <div style={resultadoBoxStyle('success')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <CheckCircle2 size={24} color="#22c55e" />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#22c55e' }}>
                        ¡Facturas Generadas Exitosamente!
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Se generaron {resultado.generadas} factura{resultado.generadas !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div style={statCardStyle}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp size={24} color="#22c55e" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        Facturas generadas
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#22c55e' }}>
                        {resultado.generadas}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resultado && resultado.errores > 0 && (
                <div style={resultadoBoxStyle('error')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <AlertCircle size={24} color="#ef4444" />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#ef4444' }}>
                        Errores en la Generación
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        {resultado.errores} error{resultado.errores !== 1 ? 'es' : ''} encontrado{resultado.errores !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {resultado.erroresDetalle.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Detalle de errores:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {resultado.erroresDetalle.map((err, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <strong>{err.modeloId === 'general' ? 'General' : `Modelo ${err.modeloId}`}:</strong> {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          {!mostrandoResultado ? (
            <>
              <button onClick={handleClose} disabled={loading} style={buttonStyle('secondary')}>
                Cancelar
              </button>
              <button onClick={handleGenerar} disabled={loading} style={buttonStyle('primary')}>
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generar Facturas
                  </>
                )}
              </button>
            </>
          ) : (
            <button onClick={handleClose} style={buttonStyle('primary')}>
              Cerrar
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
