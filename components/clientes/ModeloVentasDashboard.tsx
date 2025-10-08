"use client";
import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Award } from 'lucide-react';
import type { DashboardResponse } from '@/lib/service-modelos-ventas/types';
import { MONTH_NAMES } from '@/lib/service-modelos-ventas/constants';

interface ModeloVentasDashboardProps {
  data: DashboardResponse;
}

export function ModeloVentasDashboard({ data }: ModeloVentasDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const stats = data.estadisticas.general;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                Total Ventas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(stats.totalVentas)}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              <ShoppingCart size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Total Monto */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--ot-blue-700)' }}>
                {formatCurrency(stats.totalMonto)}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Promedio Venta */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                Promedio por Venta
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(stats.promedioVenta)}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Modelos Activas */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                Modelos Activas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(data.estadisticas.totalModelosActivas)}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Users size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Modelos */}
      <div
        className="rounded-lg border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Award size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Top 10 Modelos por Ventas
          </h3>
        </div>
        
        <div className="p-4">
          {data.topModelos.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-3">
              {data.topModelos.map((modelo, idx) => (
                <div
                  key={modelo.modeloId}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--surface-muted)]"
                >
                  {/* Ranking Number */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{
                      background:
                        idx === 0
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : idx === 1
                          ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                          : idx === 2
                          ? 'linear-gradient(135deg, #fb923c, #ea580c)'
                          : 'var(--surface-muted)',
                      color: idx < 3 ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Foto */}
                  {modelo.fotoPerfil ? (
                    <img
                      src={modelo.fotoPerfil}
                      alt={modelo.nombreCompleto}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                      style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                    >
                      {modelo.nombreCompleto.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {modelo.nombreCompleto}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatNumber(modelo.count)} {modelo.count === 1 ? 'venta' : 'ventas'}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: 'var(--ot-blue-700)' }}>
                      {formatCurrency(modelo.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ventas por Mes */}
      <div
        className="rounded-lg border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <TrendingUp size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Tendencia Mensual
          </h3>
        </div>
        
        <div className="p-4">
          {data.ventasPorMes.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {data.ventasPorMes.map((mes) => (
                <div key={`${mes._id.anio}-${mes._id.mes}`} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {MONTH_NAMES[mes._id.mes - 1]} {mes._id.anio}
                  </div>
                  <div className="flex-1 h-8 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                    <div
                      className="h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                      style={{
                        width: `${(mes.total / Math.max(...data.ventasPorMes.map((m) => m.total))) * 100}%`,
                        background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))',
                        minWidth: '60px',
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {formatCurrency(mes.total)}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatNumber(mes.count)} ventas
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

