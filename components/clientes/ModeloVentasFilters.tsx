"use client";
import React from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { SelectField } from '@/components/ui/selectUI';
import { Button } from '@/components/ui/Button';
import type { SalesFilters, TipoVenta, TurnoChatter } from '@/lib/service-modelos-ventas/types';
import { TIPO_VENTA_OPTIONS, TURNO_OPTIONS } from '@/lib/service-modelos-ventas/constants';

interface ModeloVentasFiltersProps {
  filters: SalesFilters;
  onFiltersChange: (filters: SalesFilters) => void;
  onApply: () => void;
  onClear: () => void;
  chatters?: Array<{ _id: string; nombre: string; apellido: string }>;
  plataformas?: string[];
}

export function ModeloVentasFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  chatters = [],
  plataformas = [],
}: ModeloVentasFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasActiveFilters = !!(
    filters.fechaInicio ||
    filters.fechaFin ||
    filters.chatterId ||
    filters.turno ||
    filters.tipoVenta ||
    filters.plataforma
  );

  const chatterOptions = chatters.map((c) => ({
    value: c._id,
    label: `${c.nombre} ${c.apellido}`,
  }));

  const plataformaOptions = plataformas.map((p) => ({
    value: p,
    label: p || 'Sin plataforma',
  }));

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Filter size={18} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Filtros
          </h3>
          {hasActiveFilters && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}
            >
              {Object.values(filters).filter(Boolean).length} activos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              type="button"
              onClick={onClear}
              variant="ghost"
              size="sm"
              icon={<X size={14} />}
              style={{
                fontSize: '0.75rem',
                padding: '0.375rem 0.75rem'
              }}
            >
              Limpiar
            </Button>
          )}
          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="primary"
            size="sm"
            style={{
              fontSize: '0.75rem',
              padding: '0.375rem 0.75rem',
              background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))',
              color: '#ffffff'
            }}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={14} className="inline mr-1" />
                Fecha inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio || ''}
                onChange={(e) => onFiltersChange({ ...filters, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={14} className="inline mr-1" />
                Fecha fin
              </label>
              <input
                type="date"
                value={filters.fechaFin || ''}
                onChange={(e) => onFiltersChange({ ...filters, fechaFin: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Chatter y Turno */}
          <div className="grid grid-cols-2 gap-3">
            {chatters.length > 0 && (
              <SelectField
                label="Chatter"
                value={filters.chatterId || ''}
                onChange={(value) => onFiltersChange({ ...filters, chatterId: value })}
                options={chatterOptions}
                placeholder="Todos los chatters"
                clearable
                size="sm"
              />
            )}
            <SelectField
              label="Turno"
              value={filters.turno || ''}
              onChange={(value) => onFiltersChange({ ...filters, turno: value as TurnoChatter })}
              options={TURNO_OPTIONS}
              placeholder="Todos los turnos"
              clearable
              size="sm"
            />
          </div>

          {/* Tipo de venta y Plataforma */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Tipo de venta"
              value={filters.tipoVenta || ''}
              onChange={(value) => onFiltersChange({ ...filters, tipoVenta: value as TipoVenta })}
              options={TIPO_VENTA_OPTIONS}
              placeholder="Todos los tipos"
              clearable
              size="sm"
            />
            {plataformas.length > 0 && (
              <SelectField
                label="Plataforma"
                value={filters.plataforma || ''}
                onChange={(value) => onFiltersChange({ ...filters, plataforma: value })}
                options={plataformaOptions}
                placeholder="Todas las plataformas"
                clearable
                size="sm"
              />
            )}
          </div>

          {/* Apply Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={onApply}
              variant="primary"
              size="md"
              full
              style={{
                background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))',
                color: '#ffffff',
              }}
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

