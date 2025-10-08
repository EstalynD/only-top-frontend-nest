"use client";
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Select, SelectOption } from '@/components/ui/selectUI';
import type { FilterCampaignsDto } from '@/lib/service-traffic/types';
import { PlataformaCampana, EstadoCampana, PLATAFORMA_LABELS, ESTADO_LABELS } from '@/lib/service-traffic/types';

type CampaignFiltersProps = {
  filters: FilterCampaignsDto;
  onChange: (filters: FilterCampaignsDto) => void;
  onClear: () => void;
  modelos?: Array<{ _id: string; nombre: string; apellido: string }>;
};

export function CampaignFilters({ filters, onChange, onClear, modelos = [] }: CampaignFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const plataformaOptions: SelectOption[] = [
    { value: '', label: 'Todas las plataformas' },
    ...Object.values(PlataformaCampana).map(p => ({
      value: p,
      label: PLATAFORMA_LABELS[p],
    })),
  ];

  const estadoOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...Object.values(EstadoCampana).map(e => ({
      value: e,
      label: ESTADO_LABELS[e],
    })),
  ];

  const modeloOptions: SelectOption[] = [
    { value: '', label: 'Todas las modelos' },
    ...modelos.map(m => ({
      value: m._id,
      label: `${m.nombre} ${m.apellido}`,
    })),
  ];

  const containerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
  };

  return (
    <div style={containerStyle} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} style={{ color: 'var(--ot-blue-500)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Filtros
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--surface-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--danger)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-muted)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Modelo */}
        {modelos.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Modelo
            </label>
            <Select
              value={filters.modeloId || ''}
              onChange={(value) => onChange({ ...filters, modeloId: value || undefined })}
              options={modeloOptions}
              placeholder="Seleccionar modelo"
              fullWidth
            />
          </div>
        )}

        {/* Plataforma */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Plataforma
          </label>
          <Select
            value={filters.plataforma || ''}
            onChange={(value) => onChange({ ...filters, plataforma: value as PlataformaCampana || undefined })}
            options={plataformaOptions}
            placeholder="Seleccionar plataforma"
            fullWidth
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Estado
          </label>
          <Select
            value={filters.estado || ''}
            onChange={(value) => onChange({ ...filters, estado: value as EstadoCampana || undefined })}
            options={estadoOptions}
            placeholder="Seleccionar estado"
            fullWidth
          />
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Fecha inicio
          </label>
          <input
            type="date"
            value={filters.fechaInicio || ''}
            onChange={(e) => onChange({ ...filters, fechaInicio: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] focus:ring-offset-0"
            style={inputStyle}
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Fecha fin
          </label>
          <input
            type="date"
            value={filters.fechaFin || ''}
            onChange={(e) => onChange({ ...filters, fechaFin: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] focus:ring-offset-0"
            style={inputStyle}
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            País
          </label>
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={filters.pais || ''}
              onChange={(e) => onChange({ ...filters, pais: e.target.value || undefined })}
              placeholder="Ej: United States"
              className="w-full pl-9 pr-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] focus:ring-offset-0"
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
