"use client";
import React from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Select, SelectField } from '@/components/ui/selectUI';
import {
  TipoHoraExtra,
  CreateDetalleHoraExtraDto,
  TIPO_HORA_OPTIONS,
  TIPO_HORA_LABELS,
  TIPO_HORA_DESCRIPTIONS,
  formatRecargoPorcentaje,
} from '@/lib/service-horas-extras';

interface FormularioDetalleHoraProps {
  detalles: CreateDetalleHoraExtraDto[];
  onChange: (detalles: CreateDetalleHoraExtraDto[]) => void;
  className?: string;
}

export default function FormularioDetalleHora({
  detalles,
  onChange,
  className = '',
}: FormularioDetalleHoraProps) {
  const agregarDetalle = () => {
    const nuevoDetalle: CreateDetalleHoraExtraDto = {
      tipo: TipoHoraExtra.DIURNA,
      cantidadHoras: 0,
      fechaRegistro: new Date().toISOString().split('T')[0] + 'T12:00:00Z',
      observaciones: '',
    };
    onChange([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (index: number) => {
    onChange(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index: number, campo: keyof CreateDetalleHoraExtraDto, valor: any) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor };
    onChange(nuevosDetalles);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.375rem',
    display: 'block',
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Clock size={16} style={{ color: 'var(--ot-blue-500)' }} />
          Detalles de Horas Extras
        </h3>
        <button
          type="button"
          onClick={agregarDetalle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
          <Plus size={16} />
          Agregar Hora Extra
        </button>
      </div>

      {detalles.length === 0 ? (
        <div
          className="p-8 rounded-lg text-center"
          style={{
            background: 'var(--surface-muted)',
            border: '2px dashed var(--border)',
          }}
        >
          <Clock
            size={48}
            className="mx-auto mb-3"
            style={{ color: 'var(--text-muted)' }}
          />
          <p
            className="text-sm font-medium mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            No hay horas extras registradas
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Haz clic en "Agregar Hora Extra" para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {detalles.map((detalle, index) => (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h4
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Hora Extra #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => eliminarDetalle(index)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--danger-muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Hora Extra */}
                <div>
                  <label style={labelStyle}>
                    Tipo de Hora Extra <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <Select
                    value={detalle.tipo}
                    onChange={(value) => actualizarDetalle(index, 'tipo', value as TipoHoraExtra)}
                    options={TIPO_HORA_OPTIONS}
                    fullWidth
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Recargo: {formatRecargoPorcentaje(detalle.tipo as TipoHoraExtra)}
                  </p>
                </div>

                {/* Cantidad de Horas */}
                <div>
                  <label style={labelStyle}>
                    Cantidad de Horas <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    max="24"
                    value={detalle.cantidadHoras || ''}
                    onChange={(e) => actualizarDetalle(index, 'cantidadHoras', parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                    placeholder="Ej: 5 o 7.5"
                    required
                  />
                </div>

                {/* Fecha de Registro */}
                <div>
                  <label style={labelStyle}>
                    Fecha del Trabajo <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={detalle.fechaRegistro.split('T')[0]}
                    onChange={(e) => {
                      const fecha = e.target.value + 'T12:00:00Z';
                      actualizarDetalle(index, 'fechaRegistro', fecha);
                    }}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Observaciones */}
                <div>
                  <label style={labelStyle}>Observaciones / Motivo</label>
                  <textarea
                    value={detalle.observaciones || ''}
                    onChange={(e) => actualizarDetalle(index, 'observaciones', e.target.value)}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Describe el motivo de la hora extra..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
