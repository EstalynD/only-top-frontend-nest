/**
 * FacturaDetalleModal Component
 * 
 * Modal con información detallada de una factura
 */

'use client';

import React from 'react';
import { FileText, Calendar, DollarSign, Clock, AlertCircle, Download, Send, X, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import type { Factura, Pago } from '@/lib/service-cartera';
import {
  ESTADO_FACTURA_LABELS,
  METODO_PAGO_LABELS,
  formatPeriodo,
  calcularDiasVencido,
  calcularPorcentajePago,
  openFacturaPdf,
} from '@/lib/service-cartera';

interface FacturaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  factura: Factura | null;
  pagos: Pago[];
  onRegistrarPago?: () => void;
  onEnviarRecordatorio?: () => void;
  onDescargarPDF?: () => void;
}

export function FacturaDetalleModal({
  isOpen,
  onClose,
  factura,
  pagos,
  onRegistrarPago,
  onEnviarRecordatorio,
  onDescargarPDF,
}: FacturaDetalleModalProps) {
  const { theme } = useTheme();
  // Ya no necesitamos token para PDFs - ahora es público

  if (!factura) return null;

  const diasVencido = calcularDiasVencido(factura.fechaVencimiento, factura.estado);
  const porcentajePago = calcularPorcentajePago(factura);

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface-muted)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  };

  const getEstadoColor = () => {
    switch (factura.estado) {
      case 'SEGUIMIENTO':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'PAGADO':
        return 'text-green-600 dark:text-green-400';
      case 'VENCIDO':
        return 'text-red-600 dark:text-red-400';
      case 'PARCIAL':
        return 'text-blue-600 dark:text-blue-400';
      case 'CANCELADO':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Factura ${factura.numeroFactura}`}
      icon={<FileText size={20} style={{ color: 'var(--text-primary)' }} />}
      maxWidth="4xl"
    >
      <div className="p-6 space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700 }} className="font-mono">
              {factura.numeroFactura}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {formatPeriodo(factura.periodo)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Ver PDF en navegador */}
            <button
              onClick={() => {
                try {
                  openFacturaPdf(factura._id, `${factura.numeroFactura}.pdf`);
                } catch (error: any) {
                  console.error('Error al abrir PDF:', error);
                  alert(error.message || 'Error al abrir el PDF');
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
              style={{ background: '#6366f1' }}
              title="Ver PDF en navegador"
            >
              <Eye size={16} />
              Ver PDF
            </button>

            {/* Descargar PDF */}
            {onDescargarPDF && (
              <button
                onClick={onDescargarPDF}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                style={{ background: '#10b981' }}
                title="Descargar PDF"
              >
                <Download size={16} />
                Descargar PDF
              </button>
            )}

            {onEnviarRecordatorio && factura.estado !== 'PAGADO' && factura.estado !== 'CANCELADO' && factura.estado !== 'SEGUIMIENTO' && (
              <button
                onClick={onEnviarRecordatorio}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                style={{ background: '#8b5cf6' }}
              >
                <Send size={16} />
                Enviar Recordatorio
              </button>
            )}

            {onRegistrarPago && factura.estado !== 'PAGADO' && factura.estado !== 'CANCELADO' && factura.estado !== 'SEGUIMIENTO' && (
              <button
                onClick={onRegistrarPago}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                style={{ background: '#3b82f6' }}
              >
                <DollarSign size={16} />
                Registrar Pago
              </button>
            )}
          </div>
        </div>

        {/* Alertas */}
        {diasVencido > 0 && (
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Factura Vencida</p>
              <p className="text-red-500 text-sm mt-1">
                Esta factura está vencida hace {diasVencido} {diasVencido === 1 ? 'día' : 'días'}
              </p>
            </div>
          </div>
        )}

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado */}
          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Estado</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }} className={getEstadoColor()}>
              {ESTADO_FACTURA_LABELS[factura.estado]}
            </p>
          </div>

          {/* Fecha Emisión */}
          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Fecha de Emisión</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500 }}>
              {new Date(factura.fechaEmision).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Fecha Vencimiento */}
          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Fecha de Vencimiento</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500 }}>
              {new Date(factura.fechaVencimiento).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Monto Total</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700 }} className="font-mono">
              {factura.totalFormateado ?? '$0.00'}
            </p>
          </div>

          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
              Pagado {factura.estado === 'PARCIAL' && `(${porcentajePago}%)`}
            </p>
            <p
              style={{ fontSize: '24px', fontWeight: 700 }}
              className="font-mono text-green-600 dark:text-green-400"
            >
              {factura.montoPagadoFormateado ?? '$0.00'}
            </p>
          </div>

          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Saldo Pendiente</p>
            <p
              style={{ fontSize: '24px', fontWeight: 700 }}
              className="font-mono text-yellow-600 dark:text-yellow-400"
            >
              {factura.saldoPendienteFormateado ?? '$0.00'}
            </p>
          </div>
        </div>

        {/* Items de Factura */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Detalle de Items
          </h4>
          <div style={cardStyle} className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Concepto
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cantidad
                  </th>
                  <th
                    className="px-3 py-2 text-right text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Valor Unitario
                  </th>
                  <th
                    className="px-3 py-2 text-right text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {factura.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3 py-3">
                      <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                        {item.concepto}
                      </p>
                      {item.notas && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{item.notas}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{item.cantidad}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px' }} className="font-mono">
                        {item.valorUnitarioFormateado ?? '$0.00'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}
                        className="font-mono"
                      >
                        {item.subtotalFormateado ?? '$0.00'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagos Registrados */}
        {pagos.length > 0 && (
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              Pagos Registrados ({pagos.length})
            </h4>
            <div className="space-y-3">
              {pagos.map((pago) => (
                <div key={pago._id} style={cardStyle}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p
                          style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}
                          className="font-mono"
                        >
                          {pago.numeroRecibo}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                          {METODO_PAGO_LABELS[pago.metodoPago]}
                          {pago.referencia && ` - ${pago.referencia}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        style={{ fontSize: '18px', fontWeight: 600 }}
                        className="font-mono text-green-600 dark:text-green-400"
                      >
                        {pago.montoFormateado ?? '$0.00'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                        {new Date(pago.fechaPago).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  {pago.comprobante && (
                    <a
                      href={pago.comprobante.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver comprobante
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {factura.observaciones && (
          <div style={cardStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Observaciones</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{factura.observaciones}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
