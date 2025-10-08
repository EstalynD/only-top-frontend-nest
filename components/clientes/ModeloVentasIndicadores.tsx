"use client";
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  Award, 
  Percent,
  Calendar,
  BarChart3
} from 'lucide-react';
import type { IndicadoresResponse } from '@/lib/service-modelos-ventas/types';
import { MONTH_NAMES } from '@/lib/service-modelos-ventas/constants';

interface ModeloVentasIndicadoresProps {
  data: IndicadoresResponse;
}

export function ModeloVentasIndicadores({ data }: ModeloVentasIndicadoresProps) {
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

  const formatPercent = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Modelos por Estado */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users size={18} style={{ color: 'var(--ot-blue-600)' }} />
          Modelos por Estado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Activas
            </p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
              {formatNumber(data.modelosPorEstado.activas)}
            </p>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Inactivas
            </p>
            <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
              {formatNumber(data.modelosPorEstado.inactivas)}
            </p>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Suspendidas
            </p>
            <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
              {formatNumber(data.modelosPorEstado.suspendidas)}
            </p>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Terminadas
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
              {formatNumber(data.modelosPorEstado.terminadas)}
            </p>
          </div>
        </div>
      </div>

      {/* Tasa de Retención + Modelos Nuevas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasa de Retención */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Percent size={18} style={{ color: 'var(--ot-blue-600)' }} />
                Tasa de Retención (3 meses)
              </h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Modelos que se mantienen activas después de 3 meses
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Registradas hace 3+ meses
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(data.tasaRetencion.modelosRegistradasHace3Meses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Activas después de 3 meses
              </span>
              <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                {formatNumber(data.tasaRetencion.modelosActivasDepues3Meses)}
              </span>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Tasa de Retención
                </span>
                <span 
                  className="text-3xl font-bold"
                  style={{ 
                    color: data.tasaRetencion.tasaRetencion >= 80 
                      ? '#10b981' 
                      : data.tasaRetencion.tasaRetencion >= 60 
                      ? '#f59e0b' 
                      : '#ef4444' 
                  }}
                >
                  {data.tasaRetencion.porcentajeFormateado}
                </span>
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                {data.tasaRetencion.tasaRetencion >= 80 ? '✓ Excelente' : data.tasaRetencion.tasaRetencion >= 60 ? '⚠ Aceptable' : '✗ Necesita mejora'}
              </p>
            </div>
          </div>
        </div>

        {/* Modelos Nuevas */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <UserPlus size={18} style={{ color: 'var(--ot-blue-600)' }} />
              Modelos Nuevas (Últimos 3 Meses)
            </h4>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Total: {formatNumber(data.modelosNuevasPorPeriodo.totalUltimos3Meses)} modelos
            </p>
          </div>
          
          <div className="space-y-2">
            {data.modelosNuevasPorPeriodo.ultimos3Meses.map((periodo) => (
              <div
                key={`${periodo._id.anio}-${periodo._id.mes}`}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: 'var(--surface-muted)' }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {MONTH_NAMES[periodo._id.mes - 1]} {periodo._id.anio}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--ot-blue-700)' }}>
                  {formatNumber(periodo.count)} modelos
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crecimiento Mensual */}
      <div
        className="rounded-lg border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <BarChart3 size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Comparativo de Crecimiento Mensual (Últimos 12 meses)
          </h3>
        </div>
        
        <div className="p-4">
          {data.crecimientoMensual.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
              No hay datos disponibles
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--surface-muted)' }}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Periodo
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Ventas
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Crecimiento
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Monto Total
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Crecimiento $
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {data.crecimientoMensual.map((mes) => (
                    <tr key={`${mes.anio}-${mes.mes}`}>
                      <td className="px-3 py-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {MONTH_NAMES[mes.mes - 1]} {mes.anio}
                      </td>
                      <td className="px-3 py-2 text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                        {formatNumber(mes.totalVentas)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-semibold">
                        {mes.crecimientoVentas !== 0 && (
                          <span
                            className="inline-flex items-center gap-1"
                            style={{
                              color: mes.crecimientoVentas > 0 ? '#10b981' : '#ef4444',
                            }}
                          >
                            {mes.crecimientoVentas > 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {formatPercent(mes.crecimientoVentas)}
                          </span>
                        )}
                        {mes.crecimientoVentas === 0 && (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-semibold" style={{ color: 'var(--ot-blue-700)' }}>
                        {formatCurrency(mes.totalMonto)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-semibold">
                        {mes.crecimientoMonto !== 0 && (
                          <span
                            className="inline-flex items-center gap-1"
                            style={{
                              color: mes.crecimientoMonto > 0 ? '#10b981' : '#ef4444',
                            }}
                          >
                            {mes.crecimientoMonto > 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {formatPercent(mes.crecimientoMonto)}
                          </span>
                        )}
                        {mes.crecimientoMonto === 0 && (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ranking de Rentabilidad */}
      <div
        className="rounded-lg border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Award size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Ranking de Rentabilidad (Top 20 Modelos)
          </h3>
        </div>
        
        <div className="p-4">
          {data.rankingRentabilidad.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {data.rankingRentabilidad.map((modelo) => (
                <div
                  key={modelo.modeloId}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--surface-muted)]"
                >
                  {/* Ranking */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background:
                        modelo.ranking === 1
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : modelo.ranking === 2
                          ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                          : modelo.ranking === 3
                          ? 'linear-gradient(135deg, #fb923c, #ea580c)'
                          : 'var(--surface-muted)',
                      color: modelo.ranking <= 3 ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    #{modelo.ranking}
                  </div>

                  {/* Foto */}
                  {modelo.fotoPerfil ? (
                    <img
                      src={modelo.fotoPerfil}
                      alt={modelo.nombreCompleto}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0"
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
                      {formatNumber(modelo.totalVentas)} ventas • Promedio: {formatCurrency(modelo.promedioVenta)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--ot-blue-700)' }}>
                      {formatCurrency(modelo.totalMonto)}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: modelo.estado === 'ACTIVA' ? '#dcfce715' : '#fef2f215',
                        color: modelo.estado === 'ACTIVA' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {modelo.estado}
                    </span>
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

