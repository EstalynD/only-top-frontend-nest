/**
 * BankOnlyTopCard Component
 * 
 * Card que muestra el estado del banco OnlyTop con dinero consolidado y en movimiento.
 */

'use client';

import React from 'react';
import { DollarSign, TrendingUp, Building2, Calendar, Activity } from 'lucide-react';
import type { BankOnlyTop } from '@/lib/service-finanzas';

interface BankOnlyTopCardProps {
  bank: BankOnlyTop | null;
  loading?: boolean;
}

interface StatItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function StatItem({ label, value, icon, color, description }: StatItemProps) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: 'var(--surface-muted)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {description && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          )}
        </div>
        <div
          className="p-2 rounded-lg"
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

export function BankOnlyTopCard({ bank, loading = false }: BankOnlyTopCardProps) {
  if (loading) {
    return (
      <div
        className="p-6 rounded-xl border animate-pulse"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="h-8 w-48 rounded mb-6" style={{ background: 'var(--surface-muted)' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg"
              style={{ background: 'var(--surface-muted)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!bank) {
    return (
      <div
        className="p-8 rounded-xl border text-center"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No se pudo cargar la información del banco
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg"
            style={{
              background: 'var(--ot-blue-500)15',
              color: 'var(--ot-blue-500)',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Bank OnlyTop
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Balance general de la empresa
            </p>
          </div>
        </div>

        {/* Periodo Actual */}
        <div
          className="px-4 py-2 rounded-lg border flex items-center gap-2"
          style={{
            background: 'var(--surface-muted)',
            borderColor: 'var(--border)',
          }}
        >
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {bank.periodoActual}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatItem
          label="💰 Dinero Consolidado"
          value={bank.dineroConsolidadoFormateado}
          icon={<DollarSign size={20} />}
          color="#10b981"
          description="Capital histórico acumulado"
        />

        <StatItem
          label="📊 Dinero en Movimiento"
          value={bank.dineroMovimientoFormateado}
          icon={<Activity size={20} />}
          color="#f59e0b"
          description="Ganancias del periodo actual"
        />

        <StatItem
          label="💵 Total Disponible"
          value={bank.totalFormateado}
          icon={<TrendingUp size={20} />}
          color="var(--ot-blue-500)"
          description="Consolidado + Movimiento"
        />
      </div>

      {/* Información Adicional */}
      <div
        className="p-4 rounded-lg border"
        style={{
          background: 'var(--surface-muted)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Periodos Consolidados
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {bank.totalPeriodosConsolidados}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Modelos Histórico
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {bank.totalModelosHistorico}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Ventas Histórico
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {bank.totalVentasHistorico}
            </p>
          </div>

          {bank.ultimaConsolidacion && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Última Consolidación
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {new Date(bank.ultimaConsolidacion).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 <strong>Dinero Consolidado:</strong> Capital de periodos cerrados (inmutable). <br />
          💡 <strong>Dinero en Movimiento:</strong> Ganancias del periodo actual (se actualiza automáticamente). <br />
          💡 Al consolidar un periodo, el dinero en movimiento se transfiere a consolidado.
        </p>
      </div>
    </div>
  );
}
