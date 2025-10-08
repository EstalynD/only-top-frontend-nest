"use client";
import React from 'react';
import { Calendar, DollarSign, Target, ExternalLink, TrendingUp, Edit, Trash2 } from 'lucide-react';
import type { TrafficCampaign } from '@/lib/service-traffic/types';
import { PLATAFORMA_LABELS, ESTADO_LABELS, ESTADO_COLORS, ACORTADOR_LABELS } from '@/lib/service-traffic/types';

type CampaignCardProps = {
  campaign: TrafficCampaign;
  onEdit?: (campaign: TrafficCampaign) => void;
  onDelete?: (campaign: TrafficCampaign) => void;
  onViewModelo?: (modeloId: string) => void;
};

export function CampaignCard({ campaign, onEdit, onDelete, onViewModelo }: CampaignCardProps) {
  const budgetPercentage = campaign.presupuesto.asignado > 0
    ? (campaign.presupuesto.gastado / campaign.presupuesto.asignado) * 100
    : 0;

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border)',
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: ESTADO_COLORS[campaign.estado],
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
  };

  const progressBgStyle: React.CSSProperties = {
    background: 'var(--surface-muted)',
    borderRadius: '9999px',
    overflow: 'hidden',
  };

  const progressBarStyle: React.CSSProperties = {
    backgroundColor: budgetPercentage > 90 ? '#ef4444' : budgetPercentage > 70 ? '#f59e0b' : '#10b981',
    height: '100%',
    width: `${Math.min(budgetPercentage, 100)}%`,
    transition: 'width 0.3s ease',
  };

  return (
    <div style={cardStyle} className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div style={headerStyle} className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} style={{ color: 'var(--ot-blue-500)' }} />
            <h3 
              className="font-semibold text-base truncate cursor-pointer hover:underline"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => onViewModelo?.(campaign.modeloId._id)}
            >
              {campaign.modeloId.nombre} {campaign.modeloId.apellido}
            </h3>
          </div>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
            {PLATAFORMA_LABELS[campaign.plataforma]}
          </p>
        </div>
        <div style={badgeStyle}>
          {ESTADO_LABELS[campaign.estado]}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Trafficker */}
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Trafficker:</span>
          <span style={{ color: 'var(--text-primary)' }} className="font-medium">
            {campaign.traffickerId.nombre} {campaign.traffickerId.apellido}
          </span>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Activación:</span>
          </div>
          <span style={{ color: 'var(--text-primary)' }}>
            {new Date(campaign.fechaActivacion).toLocaleDateString()}
          </span>

          {campaign.fechaFinalizacion && (
            <>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Finalización:</span>
              </div>
              <span style={{ color: 'var(--text-primary)' }}>
                {new Date(campaign.fechaFinalizacion).toLocaleDateString()}
              </span>
            </>
          )}
        </div>

        {/* Presupuesto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Presupuesto:</span>
            </div>
            <span style={{ color: 'var(--text-primary)' }} className="font-medium">
              {campaign.presupuesto.gastado.toFixed(2)} / {campaign.presupuesto.asignado.toFixed(2)} {campaign.presupuesto.moneda}
            </span>
          </div>
          <div style={progressBgStyle} className="h-2">
            <div style={progressBarStyle} />
          </div>
          <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
            {budgetPercentage.toFixed(1)}% utilizado
          </p>
        </div>

        {/* Segmentación */}
        {campaign.segmentaciones && (
          <div className="text-xs space-y-1">
            {campaign.segmentaciones.paises && campaign.segmentaciones.paises.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span style={{ color: 'var(--text-muted)' }}>Países:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {campaign.segmentaciones.paises.slice(0, 3).join(', ')}
                  {campaign.segmentaciones.paises.length > 3 && ` +${campaign.segmentaciones.paises.length - 3}`}
                </span>
              </div>
            )}
            {campaign.segmentaciones.edadObjetivo && (
              <div className="flex gap-1">
                <span style={{ color: 'var(--text-muted)' }}>Edad:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {campaign.segmentaciones.edadObjetivo.min}-{campaign.segmentaciones.edadObjetivo.max} años
                </span>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {campaign.linkPauta && (
            <a
              href={campaign.linkPauta}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:underline"
              style={{ 
                color: 'var(--ot-blue-500)',
                background: 'var(--surface-muted)'
              }}
            >
              <ExternalLink size={12} />
              Ver Pauta
            </a>
          )}
          {campaign.trackLinkOF && (
            <a
              href={campaign.trackLinkOF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:underline"
              style={{ 
                color: 'var(--ot-blue-500)',
                background: 'var(--surface-muted)'
              }}
            >
              <ExternalLink size={12} />
              Track Link
            </a>
          )}
        </div>

        {/* Rendimiento */}
        {campaign.rendimiento && (
          <div className="flex items-start gap-2 text-xs p-2 rounded" style={{ background: 'var(--surface-muted)' }}>
            <TrendingUp size={14} style={{ color: 'var(--ot-blue-500)', flexShrink: 0, marginTop: '2px' }} />
            <div className="flex-1">
              <p style={{ color: 'var(--text-muted)' }} className="mb-1">Rendimiento:</p>
              <p style={{ color: 'var(--text-primary)' }}>{campaign.rendimiento}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      {(onEdit || onDelete) && (
        <div className="px-4 pb-4 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(campaign)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'var(--ot-blue-500)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--ot-blue-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--ot-blue-500)';
              }}
            >
              <Edit size={16} />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(campaign)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--danger)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-muted)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
