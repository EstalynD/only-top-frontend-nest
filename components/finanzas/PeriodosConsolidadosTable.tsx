/**
 * PeriodosConsolidadosTable Component
 * 
 * Tabla con listado de periodos consolidados (histórico).
 */

'use client';

import React from 'react';
import { Calendar, DollarSign, Users, TrendingUp, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import type { PeriodoConsolidado, EstadoPeriodoConsolidado } from '@/lib/service-finanzas';

interface PeriodosConsolidadosTableProps {
  periodos: PeriodoConsolidado[];
  loading?: boolean;
}

interface EstadoBadgeProps {
  estado: EstadoPeriodoConsolidado;
}

function EstadoBadge({ estado }: EstadoBadgeProps) {
  const configs: Record<EstadoPeriodoConsolidado, { color: string; icon: React.ReactNode; label: string }> = {
    ABIERTO: {
      color: '#3b82f6',
      icon: <AlertCircle size={14} />,
      label: 'Abierto',
    },
    EN_REVISION: {
      color: '#f59e0b',
      icon: <AlertCircle size={14} />,
      label: 'En Revisión',
    },
    CONSOLIDADO: {
      color: '#10b981',
      icon: <Lock size={14} />,
      label: 'Consolidado',
    },
    CERRADO: {
      color: '#6b7280',
      icon: <CheckCircle size={14} />,
      label: 'Cerrado',
    },
  };

  const config = configs[estado];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
      style={{
        background: `${config.color}15`,
        color: config.color,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export function PeriodosConsolidadosTable({ periodos, loading = false }: PeriodosConsolidadosTableProps) {
  const [ordenamiento, setOrdenamiento] = React.useState<'asc' | 'desc'>('desc');

  const periodosOrdenados = React.useMemo(() => {
    return [...periodos].sort((a, b) => {
      const dateA = new Date(a.anio, a.mes - 1);
      const dateB = new Date(b.anio, b.mes - 1);
      return ordenamiento === 'desc' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [periodos, ordenamiento]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--surface-muted)' }} />
        <div className="h-96 rounded-xl animate-pulse" style={{ background: 'var(--surface-muted)' }} />
      </div>
    );
  }

  if (periodos.length === 0) {
    return (
      <div
        className="p-12 rounded-xl border text-center"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          No hay periodos consolidados
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Los periodos aparecerán aquí una vez que se consoliden desde el dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con ordenamiento */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {periodos.length} periodo{periodos.length !== 1 ? 's' : ''} consolidado{periodos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setOrdenamiento(ordenamiento === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--text-primary)',
          }}
        >
          {ordenamiento === 'desc' ? '↓ Más reciente primero' : '↑ Más antiguo primero'}
        </button>
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Periodo
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Ventas Netas
                  </span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Ganancia OnlyTop
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Modelos
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Estado
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Fecha
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {periodosOrdenados.map((periodo, index) => (
                <tr
                  key={periodo._id}
                  className="transition-colors hover:bg-opacity-50"
                  style={{
                    borderBottom: index < periodosOrdenados.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Periodo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background: 'var(--ot-blue-500)15',
                          color: 'var(--ot-blue-500)',
                        }}
                      >
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {periodo.periodo}
                        </p>
                        {periodo.notasCierre && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {periodo.notasCierre.substring(0, 50)}{periodo.notasCierre.length > 50 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Ventas Netas */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold" style={{ color: 'var(--ot-blue-500)' }}>
                      {periodo.totalVentasNetasUSD}
                    </p>
                  </td>

                  {/* Ganancia OnlyTop */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold" style={{ color: '#10b981' }}>
                      {periodo.totalGananciaOnlyTopUSD}
                    </p>
                  </td>

                  {/* Modelos */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                      <Users size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {periodo.cantidadModelos}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <EstadoBadge estado={periodo.estado} />
                  </td>

                  {/* Fecha Consolidación */}
                  <td className="px-6 py-4">
                    {periodo.fechaConsolidacion ? (
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {new Date(periodo.fechaConsolidacion).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(periodo.fechaConsolidacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Modelos del último periodo */}
      {periodosOrdenados[0]?.topModelos && periodosOrdenados[0].topModelos.length > 0 && (
        <div
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ color: 'var(--ot-blue-500)' }} />
            Top Modelos - {periodosOrdenados[0].periodo}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {periodosOrdenados[0].topModelos.slice(0, 6).map((modelo, idx) => (
              <div
                key={modelo.modeloId}
                className="p-3 rounded-lg border"
                style={{
                  background: 'var(--surface-muted)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--ot-blue-500)15', color: 'var(--ot-blue-500)' }}>
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                    {modelo.gananciaOnlyTopUSD}
                  </span>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {modelo.nombreCompleto}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Ventas: {modelo.ventasNetasUSD}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
