"use client";
import React from 'react';
import { TrendingUp, DollarSign, Target, Activity, BarChart3 } from 'lucide-react';
import type { CampaignStatistics } from '@/lib/service-traffic/types';
import { PLATAFORMA_LABELS } from '@/lib/service-traffic/types';

type CampaignStatsProps = {
  stats: CampaignStatistics;
  loading?: boolean;
};

export function CampaignStats({ stats, loading }: CampaignStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl animate-pulse"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="h-4 w-20 rounded mb-2" style={{ background: 'var(--surface-muted)' }} />
            <div className="h-8 w-32 rounded" style={{ background: 'var(--surface-muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: <Target size={20} />,
      label: 'Total Campañas',
      value: stats.totalCampaigns.toString(),
      color: 'var(--ot-blue-500)',
      subtext: `${stats.activeCampaigns} activas, ${stats.pausedCampaigns} pausadas`,
    },
    {
      icon: <DollarSign size={20} />,
      label: 'Presupuesto Total',
      value: `$${stats.totalBudgetAssigned.toFixed(2)}`,
      color: '#10b981',
      subtext: `$${stats.totalBudgetSpent.toFixed(2)} gastado`,
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Promedio por Campaña',
      value: `$${stats.avgBudgetPerCampaign.toFixed(2)}`,
      color: '#8b5cf6',
      subtext: 'Presupuesto promedio',
    },
    {
      icon: <Activity size={20} />,
      label: 'Finalizadas',
      value: stats.finishedCampaigns.toString(),
      color: '#6b7280',
      subtext: `${((stats.finishedCampaigns / stats.totalCampaigns) * 100 || 0).toFixed(1)}% del total`,
    },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={cardStyle}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                {card.icon}
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </p>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {card.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Distribución por plataforma y países */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por plataforma */}
        <div style={cardStyle} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} style={{ color: 'var(--ot-blue-500)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Campañas por Plataforma
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.campaignsByPlatform).length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No hay datos disponibles
              </p>
            ) : (
              Object.entries(stats.campaignsByPlatform)
                .sort(([, a], [, b]) => b - a)
                .map(([platform, count]) => {
                  const percentage = (count / stats.totalCampaigns) * 100;
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {PLATAFORMA_LABELS[platform as keyof typeof PLATAFORMA_LABELS] || platform}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface-muted)' }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            background: 'var(--ot-blue-500)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Top países */}
        <div style={cardStyle} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} style={{ color: 'var(--ot-blue-500)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Top 5 Países Objetivo
            </h3>
          </div>
          <div className="space-y-3">
            {stats.topCountries.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No hay datos disponibles
              </p>
            ) : (
              stats.topCountries.map((country, idx) => (
                <div
                  key={country.pais}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: 'var(--ot-blue-500)',
                        color: '#ffffff',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {country.pais}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: 'var(--ot-blue-500)',
                      color: '#ffffff',
                    }}
                  >
                    {country.campañas} campañas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
