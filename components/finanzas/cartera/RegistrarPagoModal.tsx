/**
 * RegistrarPagoModal Component
 * 
 * Modal para registrar un pago con comprobante
 */

'use client';

import React from 'react';
import { DollarSign, Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import type { Factura, CreatePagoDto, MetodoPago } from '@/lib/service-cartera';
import {
  METODO_PAGO_LABELS,
  METODOS_PAGO_OPTIONS,
  CARTERA_MESSAGES,
  FORMATOS_COMPROBANTE_PERMITIDOS,
  TAMANO_MAXIMO_COMPROBANTE,
  isFormatoComprobanteValido,
  isTamanoComprobanteValido,
} from '@/lib/service-cartera';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  factura: Factura | null;
  onSubmit: (dto: CreatePagoDto, file: File | null) => Promise<void>;
}

export function RegistrarPagoModal({ isOpen, onClose, factura, onSubmit }: RegistrarPagoModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState<Omit<CreatePagoDto, 'facturaId'>>({
    fechaPago: new Date().toISOString().split('T')[0],
    montoUSD: 0,
    metodoPago: 'TRANSFERENCIA' as MetodoPago,
    referencia: '',
    observaciones: '',
  });

  React.useEffect(() => {
    if (isOpen && factura) {
      // Pre-rellenar con saldo pendiente (parsear del formateado)
      const saldo = factura.saldoPendienteFormateado 
        ? parseFloat(factura.saldoPendienteFormateado.replace(/[^0-9.-]+/g,"")) || 0
        : 0;
      setFormData((prev) => ({
        ...prev,
        montoUSD: saldo,
      }));
      setFile(null);
      setErrors({});
    }
  }, [isOpen, factura]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const newErrors: Record<string, string> = {};

    // Validar formato
    if (!isFormatoComprobanteValido(selectedFile, FORMATOS_COMPROBANTE_PERMITIDOS)) {
      newErrors.file = CARTERA_MESSAGES.error.formatoComprobanteInvalido;
    }

    // Validar tamaño
    if (!isTamanoComprobanteValido(selectedFile, TAMANO_MAXIMO_COMPROBANTE)) {
      newErrors.file = CARTERA_MESSAGES.error.tamanoComprobanteExcedido;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFile(null);
    } else {
      setFile(selectedFile);
      setErrors({});
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrors((prev) => {
      const { file, ...rest } = prev;
      return rest;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.montoUSD || formData.montoUSD <= 0) {
      newErrors.montoUSD = CARTERA_MESSAGES.validation.montoInvalido;
    }

    // Validar que no exceda el saldo (parsear del formateado)
    if (factura) {
      const saldoMax = factura.saldoPendienteFormateado 
        ? parseFloat(factura.saldoPendienteFormateado.replace(/[^0-9.-]+/g,"")) || 0
        : 0;
      if (formData.montoUSD > saldoMax) {
        newErrors.montoUSD = CARTERA_MESSAGES.validation.montoExcedeSaldo;
      }
    }

    if (!formData.fechaPago) {
      newErrors.fechaPago = CARTERA_MESSAGES.validation.fechaPagoRequerida;
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = CARTERA_MESSAGES.validation.metodoPagoRequerido;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !factura) return;

    setLoading(true);
    try {
      await onSubmit(
        {
          ...formData,
          facturaId: factura._id,
        },
        file,
      );
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || CARTERA_MESSAGES.error.errorRegistrarPago });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    display: 'block',
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!factura) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago"
      icon={<DollarSign size={20} style={{ color: 'var(--text-primary)' }} />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Info de la factura */}
        <div
          className="p-4 rounded-lg"
          style={{
            background: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Factura</p>
              <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }} className="font-mono">
                {factura.numeroFactura}
              </p>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Saldo Pendiente</p>
              <p
                style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}
                className="font-mono text-yellow-600 dark:text-yellow-400"
              >
                {factura.saldoPendienteFormateado ?? '$0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de Pago */}
          <div>
            <label style={labelStyle}>
              Fecha de Pago <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.fechaPago}
              onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
              style={inputStyle}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.fechaPago && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.fechaPago}
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label style={labelStyle}>
              Monto (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.montoUSD}
              onChange={(e) => setFormData({ ...formData, montoUSD: parseFloat(e.target.value) })}
              style={inputStyle}
              placeholder="0.00"
            />
            {errors.montoUSD && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.montoUSD}
              </p>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label style={labelStyle}>
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.metodoPago}
              onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as MetodoPago })}
              style={inputStyle}
            >
              {METODOS_PAGO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.metodoPago && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.metodoPago}
              </p>
            )}
          </div>

          {/* Referencia */}
          <div>
            <label style={labelStyle}>Referencia / N° Transacción</label>
            <input
              type="text"
              value={formData.referencia}
              onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              style={inputStyle}
              placeholder="Ej: TRX-123456"
            />
          </div>
        </div>

        {/* Comprobante */}
        <div>
          <label style={labelStyle}>
            Comprobante de Pago
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
              (jpg, png, pdf - máx {formatFileSize(TAMANO_MAXIMO_COMPROBANTE)})
            </span>
          </label>

          {!file ? (
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <span style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>
                Click para subir comprobante
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Formatos: {FORMATOS_COMPROBANTE_PERMITIDOS.join(', ').toUpperCase()}
              </span>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </label>
          ) : (
            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>{file.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <X size={18} className="text-red-500" />
              </button>
            </div>
          )}

          {errors.file && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.file}
            </p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label style={labelStyle}>Observaciones</label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Notas adicionales sobre el pago..."
          />
        </div>

        {/* Error general */}
        {errors.submit && (
          <div
            className="p-3 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
            style={{
              background: loading ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <Check size={16} />
                Registrar Pago
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
