"use client";
import React from 'react';
import { Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import Loader from '../ui/Loader';
import { TIPO_VENTA_LABELS, TURNO_COLORS } from '@/lib/service-chatter/constants';
import type { ChatterSale } from '@/lib/service-chatter/types';

interface SalesTableProps {
  sales: ChatterSale[];
  loading?: boolean;
  onView?: (sale: ChatterSale) => void;
  onEdit?: (sale: ChatterSale) => void;
  onDelete?: (sale: ChatterSale) => void;
}

export default function SalesTable({
  sales,
  loading,
  onView,
  onEdit,
  onDelete,
}: SalesTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-lg"
        style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
      >
        <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay ventas registradas</p>
        <p className="text-sm mt-2">Las ventas aparecerán aquí una vez registradas</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getChatterName = (sale: ChatterSale): string => {
    if (typeof sale.chatterId === 'string') return 'Chatter';
    return `${sale.chatterId.nombre} ${sale.chatterId.apellido}`;
  };

  const getModeloName = (sale: ChatterSale): string => {
    if (typeof sale.modeloId === 'string') return 'Modelo';
    return sale.modeloId.nombreCompleto;
  };

  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full">
        <thead style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Chatter
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Modelo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tipo
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Turno
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Monto
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const turnoColor = TURNO_COLORS[sale.turno];
            return (
              <tr
                key={sale._id}
                className="transition-colors"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                }}
              >
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(sale.fechaVenta)}
                </td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {getChatterName(sale)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {getModeloName(sale)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {TIPO_VENTA_LABELS[sale.tipoVenta]}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: turnoColor.bg,
                      color: turnoColor.text,
                      border: `1px solid ${turnoColor.border}`,
                    }}
                  >
                    {sale.turno}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: 'var(--ot-blue-500)' }}>
                  {formatCurrency(sale.monto, sale.moneda)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(sale)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Ver detalles"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--ot-blue-500)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(sale)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Editar"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f59e0b';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(sale)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Eliminar"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

