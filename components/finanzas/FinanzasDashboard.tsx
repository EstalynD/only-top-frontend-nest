/**
 * FinanzasDashboard Component
 * 
 * Dashboard con estadísticas generales de finanzas.
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calculator } from 'lucide-react';
import type { EstadisticasFinanzas } from '@/lib/service-finanzas';
import { formatearMoneda } from '@/lib/service-finanzas/helpers';

interface FinanzasDashboardProps {
  estadisticas: EstadisticasFinanzas;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  isMoney?: boolean;
}

function StatCard({ title, value, icon, color, subtitle, isMoney = false }: StatCardProps) {
  return (
    <div
      className="p-6 rounded-xl border transition-all hover:shadow-lg"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <div className="mt-2">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{
            background: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function FinanzasDashboard({ estadisticas, loading = false }: FinanzasDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl animate-pulse"
            style={{ background: 'var(--surface-muted)' }}
          />
        ))}
      </div>
    );
  }

  // Validación defensiva: verificar que estadisticas tenga la estructura completa
  if (!estadisticas || !estadisticas.totales || !estadisticas.promedios) {
    return (
      <div 
        className="p-8 rounded-xl border text-center"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No hay datos de estadísticas disponibles para este periodo
        </p>
      </div>
    );
  }

  const { totales, promedios, modelosActivas, totalVentas, topModelos, porEstado } = estadisticas;

  // Calcular modelos sin finanzas
  const modelosConFinanzas = Object.values(porEstado || {}).reduce((sum, count) => sum + count, 0);
  const modelosSinFinanzas = modelosActivas - modelosConFinanzas;

  // Formatear promedios si no vienen formateados del backend
  const promedioVentasFormateado = promedios.ventasPorModeloFormateado || formatearMoneda(promedios.ventasPorModelo);
  const promedioGananciaFormateado = promedios.gananciaOnlyTopPorModeloFormateado || formatearMoneda(promedios.gananciaOnlyTopPorModelo);

  return (
    <div className="space-y-8">
      {/* Totales Principales */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Totales del Periodo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ventas Netas Totales"
            value={totales.ventasNetasFormateado}
            icon={<TrendingUp size={24} />}
            color="var(--ot-blue-500)"
            isMoney
          />
          <StatCard
            title="Comisiones Banco"
            value={totales.comisionesBancoFormateado}
            icon={<Calculator size={24} />}
            color="#f59e0b"
            isMoney
          />
          <StatCard
            title="Ganancia Modelos"
            value={totales.gananciaModelosFormateado}
            icon={<DollarSign size={24} />}
            color="#10b981"
            isMoney
          />
          <StatCard
            title="Ganancia OnlyTop"
            value={totales.gananciaOnlyTopFormateado}
            icon={<DollarSign size={24} />}
            color="#8b5cf6"
            isMoney
          />
        </div>
      </div>

      {/* Promedios y Contadores */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Estadísticas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Promedio Ventas/Modelo"
            value={promedioVentasFormateado}
            icon={<TrendingUp size={24} />}
            color="var(--ot-blue-400)"
            isMoney
          />
          <StatCard
            title="Promedio Ganancia/Modelo"
            value={promedioGananciaFormateado}
            icon={<DollarSign size={24} />}
            color="#10b981"
            isMoney
          />
          <StatCard
            title="Total Modelos"
            value={modelosActivas}
            icon={<Users size={24} />}
            color="var(--ot-blue-500)"
            subtitle={`${modelosConFinanzas} con finanzas calculadas`}
          />
          <StatCard
            title="Modelos Sin Calcular"
            value={modelosSinFinanzas}
            icon={<Users size={24} />}
            color="#ef4444"
            subtitle="Requieren cálculo"
          />
        </div>
      </div>

      {/* Top 10 Modelos */}
      {topModelos && topModelos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top 10 Modelos por Ganancias
          </h3>
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
                  <tr style={{ background: 'var(--surface-muted)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Modelo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Ventas Netas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Ganancia OnlyTop
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topModelos.map((modelo, index) => (
                    <tr
                      key={modelo.modeloId}
                      className="border-t hover:bg-opacity-50 transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {modelo.nombreModelo}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                        {modelo.ventasNetasFormateado}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#8b5cf6' }}>
                        {modelo.gananciaOnlyTopFormateado}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
