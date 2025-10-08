"use client";

import React, { useState, CSSProperties, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { 
  DollarSign, 
  FileText, 
  Save, 
  Tag,
  AlertCircle,
  Pencil,
  Plus,
} from 'lucide-react';
import type { RegistrarGastoRequest, ActualizarGastoRequest, CategoriaGasto } from '@/lib/service-finanzas';
import { CATEGORIAS_BASE } from '@/lib/service-finanzas';

interface RegistrarGastoModalProps {
  gasto?: {
    concepto: string;
    montoUSD: number;
    notas?: string;
    nombreCategoria: string;
    indiceGasto: number;
  } | null;
  categorias: CategoriaGasto[];
  onSave: (data: Omit<RegistrarGastoRequest, 'mes' | 'anio'> | Omit<ActualizarGastoRequest, 'mes' | 'anio'>) => void;
  onClose: () => void;
}

type GastoFormState = {
  nombreCategoria: string;
  concepto: string;
  montoUSD: number;
  notas: string;
};

export default function RegistrarGastoModal({ 
  gasto, 
  categorias, 
  onSave, 
  onClose 
}: RegistrarGastoModalProps) {
  const isEditing = Boolean(gasto);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<GastoFormState>({
    nombreCategoria: gasto?.nombreCategoria || '',
    concepto: gasto?.concepto || '',
    montoUSD: gasto?.montoUSD || 0,
    notas: gasto?.notas || '',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isEditing && gasto) {
      const dataToSend = {
        nombreCategoria: gasto.nombreCategoria,
        indiceGasto: gasto.indiceGasto,
        concepto: formData.concepto,
        montoUSD: formData.montoUSD,
        notas: formData.notas || undefined,
      };
      onSave(dataToSend);
    } else {
      const dataToSend = {
        nombreCategoria: formData.nombreCategoria,
        concepto: formData.concepto,
        montoUSD: formData.montoUSD,
        notas: formData.notas || undefined,
      };
      onSave(dataToSend);
    }
  };

  const sectionStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const titleColorStyle: CSSProperties = {
    color: isDark ? '#60a5fa' : 'var(--ot-blue-600)',
  };

  const highlightPalette = useMemo(
    () => ({
      purple: {
        background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'var(--ot-purple-50)',
        border: isDark ? 'rgba(168, 85, 247, 0.7)' : 'var(--ot-purple-500)',
        text: isDark ? '#ede9fe' : 'var(--ot-purple-700)',
        glow: isDark ? '0 0 0 1px rgba(139, 92, 246, 0.3)' : '0 0 0 1px rgba(139, 92, 246, 0.12)',
      },
      blue: {
        background: isDark ? 'rgba(59, 130, 246, 0.22)' : 'var(--ot-blue-50)',
        border: isDark ? 'rgba(59, 130, 246, 0.65)' : 'var(--ot-blue-500)',
        text: isDark ? '#e0f2fe' : 'var(--ot-blue-700)',
        glow: isDark ? '0 0 0 1px rgba(59, 130, 246, 0.28)' : '0 0 0 1px rgba(59, 130, 246, 0.12)',
      },
    }),
    [isDark],
  );

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-purple-100)', color: 'var(--ot-purple-600)' }}
      >
        {isEditing ? <Pencil size={20} /> : <Plus size={20} />}
      </div>
    ),
    [isEditing],
  );

  // Obtener ícono de categoría
  const getCategoriaIcon = (nombreCategoria: string) => {
    const categoria = CATEGORIAS_BASE.find(c => c.nombre === nombreCategoria);
    return categoria?.icon || '📦';
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
      icon={headerIcon}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información del Gasto */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={titleColorStyle}
          >
            <FileText size={20} />
            Información del Gasto
          </h3>

          <div className="space-y-4">
            {/* Categoría (solo al crear) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag size={16} />
                  Categoría *
                </label>
                <select
                  required
                  value={formData.nombreCategoria}
                  onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.nombre} value={cat.nombre}>
                      {getCategoriaIcon(cat.nombre)} {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={mutedTextStyle}>
                  Asigna este gasto a una categoría específica
                </p>
              </div>
            )}

            {/* Categoría (solo mostrar al editar) */}
            {isEditing && gasto && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag size={16} />
                  Categoría
                </label>
                <div
                  className="px-4 py-2.5 rounded-lg border flex items-center gap-2"
                  style={{
                    background: 'var(--surface-muted)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="text-xl">{getCategoriaIcon(gasto.nombreCategoria)}</span>
                  <span className="font-medium">{gasto.nombreCategoria}</span>
                </div>
                <p className="text-xs mt-1" style={mutedTextStyle}>
                  No se puede cambiar la categoría al editar
                </p>
              </div>
            )}

            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <FileText size={16} />
                Concepto del Gasto *
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                placeholder="Ej: Alquiler de oficina, Licencia de software, etc."
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={mutedTextStyle}>
                Mínimo 3 caracteres
              </p>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <DollarSign size={16} />
                Monto (USD) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.montoUSD}
                onChange={(e) => setFormData({ ...formData, montoUSD: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={mutedTextStyle}>
                Ingresa el monto en dólares estadounidenses
              </p>
            </div>

            {/* Notas Opcionales */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <AlertCircle size={16} />
                Notas (Opcional)
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales, comentarios o detalles del gasto..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Vista Previa */}
        <section className="rounded-xl border p-4" style={{
          ...sectionStyle,
          borderColor: highlightPalette.purple.border,
          background: highlightPalette.purple.background,
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: highlightPalette.purple.text }}>
                Vista Previa del Gasto
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: highlightPalette.purple.text }}>
                {formData.concepto || 'Sin concepto'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: highlightPalette.purple.text }}>
                Monto
              </p>
              <p className="text-2xl font-bold" style={{ color: highlightPalette.purple.text }}>
                ${formData.montoUSD.toFixed(2)}
              </p>
            </div>
          </div>
        </section>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-muted)',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))',
              color: 'white',
            }}
          >
            <Save size={18} />
            {isEditing ? 'Actualizar Gasto' : 'Registrar Gasto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
