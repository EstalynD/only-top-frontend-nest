/**
 * FacturasTable Component
 * 
 * Tabla con lista de facturas con filtros, estados y acciones.
 */

'use client';

import React from 'react';
import {
  Eye,
  Download,
  Send,
  FileText,
  Search,
  Filter,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { Factura, EstadoFactura, FiltrosFacturasDto } from '@/lib/service-cartera';
import {
  ESTADO_FACTURA_LABELS,
  ESTADO_FACTURA_COLORS,
  formatPeriodo,
  calcularDiasVencido,
  calcularPorcentajePago,
} from '@/lib/service-cartera';
import { useTheme } from '@/lib/theme';

interface FacturasTableProps {
  facturas: Factura[];
  loading?: boolean;
  onVerDetalle: (factura: Factura) => void;
  onEnviarRecordatorio?: (factura: Factura) => void;
  onDescargarPDF?: (factura: Factura) => void;
  filtros?: FiltrosFacturasDto;
  onFiltrosChange?: (filtros: FiltrosFacturasDto) => void;
}

export function FacturasTable({
  facturas,
  loading = false,
  onVerDetalle,
  onEnviarRecordatorio,
  onDescargarPDF,
  filtros = {},
  onFiltrosChange,
}: FacturasTableProps) {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState<string>('TODOS');

  const facturasFiltradas = React.useMemo(() => {
    if (!Array.isArray(facturas)) return [];

    return facturas.filter((factura) => {
      const matchBusqueda =
        busqueda === '' ||
        factura.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
        factura.periodo.mes.toString().includes(busqueda);

      const matchEstado = filtroEstado === 'TODOS' || factura.estado === filtroEstado;

      return matchBusqueda && matchEstado;
    });
  }, [facturas, busqueda, filtroEstado]);

  // Calcular totales
  const totales = React.useMemo(() => {
    if (!Array.isArray(facturas) || facturas.length === 0) {
      return {
        totalFacturado: '$ 0.00',
        totalPagado: '$ 0.00',
        saldoPendiente: '$ 0.00',
        cantidadPendientes: 0,
        cantidadVencidas: 0,
      };
    }

    let totalFacturado = 0;
    let totalPagado = 0;
    let saldoPendiente = 0;
    let cantidadPendientes = 0;
    let cantidadVencidas = 0;

    facturas.forEach((factura) => {
      // Usar valores ya parseados de los formateados (más simple y rápido)
      // O podríamos parsear desde los raw strings, pero los formateados ya vienen del backend
      // Por ahora extraer el número del formato para sumar
      const parseFormatted = (formatted: string | undefined): number => {
        if (!formatted) return 0;
        return parseFloat(formatted.replace(/[^0-9.-]+/g,"")) || 0;
      };
      
      const totalUsd = parseFormatted(factura.totalFormateado);
      const saldoUsd = parseFormatted(factura.saldoPendienteFormateado);
      const pagadoUsd = parseFormatted(factura.montoPagadoFormateado);
      
      totalFacturado += totalUsd;
      totalPagado += pagadoUsd;
      saldoPendiente += saldoUsd;

      if (factura.estado === 'PENDIENTE' || factura.estado === 'PARCIAL') {
        cantidadPendientes++;
      }
      if (factura.estado === 'VENCIDO') {
        cantidadVencidas++;
      }
    });

    const formatAmount = (amount: number): string => {
      return `$ ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    return {
      totalFacturado: formatAmount(totalFacturado),
      totalPagado: formatAmount(totalPagado),
      saldoPendiente: formatAmount(saldoPendiente),
      cantidadPendientes,
      cantidadVencidas,
    };
  }, [facturas]);

  // Estilos dinámicos
  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const headerStyle: React.CSSProperties = {
    background: theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)',
    borderBottom: '1px solid var(--border)',
  };

  const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s',
  };

  const getEstadoIcon = (estado: EstadoFactura) => {
    switch (estado) {
      case 'PAGADO':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'VENCIDO':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'PARCIAL':
        return <Clock size={16} className="text-blue-500" />;
      case 'CANCELADO':
        return <XCircle size={16} className="text-gray-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getEstadoBadgeStyle = (estado: EstadoFactura): React.CSSProperties => {
    const colorMap: Record<EstadoFactura, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      PAGADO: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      VENCIDO: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      CANCELADO: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 500,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div style={cardStyle} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Facturado</span>
          </div>
          <p
            style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600 }}
            className="font-mono"
          >
            {totales.totalFacturado}
          </p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Pagado</span>
          </div>
          <p
            style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600 }}
            className="font-mono text-green-600 dark:text-green-400"
          >
            {totales.totalPagado}
          </p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Saldo Pendiente</span>
          </div>
          <p
            style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600 }}
            className="font-mono text-yellow-600 dark:text-yellow-400"
          >
            {totales.saldoPendiente}
          </p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pendientes</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600 }}>
            {totales.cantidadPendientes}
          </p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Vencidas</span>
          </div>
          <p
            style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 600 }}
            className="text-red-600 dark:text-red-400"
          >
            {totales.cantidadVencidas}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={cardStyle} className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                size={18}
                style={{ color: 'var(--text-muted)' }}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Buscar por número de factura..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div className="min-w-[180px]">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PARCIAL">Pago Parcial</option>
              <option value="VENCIDO">Vencidas</option>
              <option value="PAGADO">Pagadas</option>
              <option value="CANCELADO">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={cardStyle} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={headerStyle}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  # Factura
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Periodo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  F. Emisión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  F. Vencimiento
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Monto Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Pagado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Saldo
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <FileText size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3 opacity-30" />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      {busqueda || filtroEstado !== 'TODOS'
                        ? 'No se encontraron facturas con los filtros aplicados'
                        : 'No hay facturas registradas'}
                    </p>
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((factura) => {
                  const diasVencido = calcularDiasVencido(factura.fechaVencimiento, factura.estado);
                  const porcentajePago = calcularPorcentajePago(factura);

                  return (
                    <tr
                      key={factura._id}
                      style={rowStyle}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3">
                        <span
                          style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}
                          className="font-mono"
                        >
                          {factura.numeroFactura.replace('FACT-', '#')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                          {formatPeriodo(factura.periodo)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(factura.fechaEmision).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            {new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}
                          </span>
                          {diasVencido > 0 && (
                            <span className="text-xs text-red-500">
                              Vencido hace {diasVencido} {diasVencido === 1 ? 'día' : 'días'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}
                          className="font-mono"
                        >
                          {factura.totalFormateado ?? '$0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            style={{ color: 'var(--text-primary)', fontSize: '13px' }}
                            className="font-mono text-green-600 dark:text-green-400"
                          >
                            {factura.montoPagadoFormateado ?? '$0.00'}
                          </span>
                          {factura.estado === 'PARCIAL' && (
                            <span className="text-xs text-gray-500">({porcentajePago}%)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          style={{ color: 'var(--text-primary)', fontSize: '13px' }}
                          className="font-mono text-yellow-600 dark:text-yellow-400"
                        >
                          {factura.saldoPendienteFormateado ?? '$0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          style={getEstadoBadgeStyle(factura.estado)}
                          className={
                            factura.estado === 'PAGADO'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : factura.estado === 'VENCIDO'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : factura.estado === 'PARCIAL'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : factura.estado === 'PENDIENTE'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }
                        >
                          {getEstadoIcon(factura.estado)}
                          {ESTADO_FACTURA_LABELS[factura.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onVerDetalle(factura)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                          </button>

                          {/* Ver PDF en navegador */}
                          <button
                            onClick={() => {
                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
                              const pdfUrl = `${apiUrl}/api/cartera/facturas/${factura._id}/pdf`;
                              window.open(pdfUrl, '_blank');
                            }}
                            className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Ver PDF"
                          >
                            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                          </button>

                          {/* Descargar PDF */}
                          {onDescargarPDF && (
                            <button
                              onClick={() => onDescargarPDF(factura)}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Descargar PDF"
                            >
                              <Download size={16} className="text-green-600 dark:text-green-400" />
                            </button>
                          )}

                          {onEnviarRecordatorio &&
                            factura.estado !== 'PAGADO' &&
                            factura.estado !== 'CANCELADO' && (
                              <button
                                onClick={() => onEnviarRecordatorio(factura)}
                                className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                title="Enviar recordatorio"
                              >
                                <Send size={16} className="text-purple-600 dark:text-purple-400" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
