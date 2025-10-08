"use client";
import React from 'react';
import { Table2, TrendingUp, Calendar, User, DollarSign } from 'lucide-react';
import type { Venta } from '@/lib/service-modelos-ventas/types';
import { TIPO_VENTA_COLORS, TURNO_COLORS } from '@/lib/service-modelos-ventas/constants';

interface ModeloVentasTableProps {
  ventas: Venta[];
  loading?: boolean;
}

export function ModeloVentasTable({ ventas, loading }: ModeloVentasTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div
        className="rounded-lg border p-8"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--ot-blue-600)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando ventas...
          </p>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div
        className="rounded-lg border p-8"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <Table2 size={40} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            No hay ventas para mostrar
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ajusta los filtros para ver resultados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Table2 size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Ventas registradas
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
          >
            {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'var(--surface-muted)' }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={14} className="inline mr-1" />
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <User size={14} className="inline mr-1" />
                Chatter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Turno
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={14} className="inline mr-1" />
                Tipo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <DollarSign size={14} className="inline mr-1" />
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Plataforma
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {ventas.map((venta, idx) => (
              <tr
                key={venta._id}
                className="transition-colors hover:bg-[var(--surface-muted)]"
              >
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(venta.fechaVenta)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {venta.chatterId?.nombre} {venta.chatterId?.apellido}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${TURNO_COLORS[venta.turno]}15`,
                      color: TURNO_COLORS[venta.turno],
                    }}
                  >
                    {venta.turno}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${TIPO_VENTA_COLORS[venta.tipoVenta]}15`,
                      color: TIPO_VENTA_COLORS[venta.tipoVenta],
                    }}
                  >
                    {venta.tipoVenta}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: 'var(--ot-blue-700)' }}>
                  {formatCurrency(venta.monto)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {venta.plataforma || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Mostrando {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Total: {formatCurrency(ventas.reduce((sum, v) => sum + v.monto, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

