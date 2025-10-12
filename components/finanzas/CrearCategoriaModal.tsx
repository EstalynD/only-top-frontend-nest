"use client";

import React, { useState, CSSProperties, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { 
  Tag, 
  Save, 
  FileText,
  Palette,
  Layers,
} from 'lucide-react';
import type { CrearCategoriaRequest } from '@/lib/service-finanzas';

interface CrearCategoriaModalProps {
  onSave: (data: Omit<CrearCategoriaRequest, 'mes' | 'anio'>) => void;
  onClose: () => void;
}

type CategoriaFormState = {
  nombre: string;
  descripcion: string;
  color: string;
};

const COLORES_PREDEFINIDOS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Morado' },
  { value: '#f59e0b', label: 'Naranja' },
  { value: '#10b981', label: 'Verde' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#6b7280', label: 'Gris' },
];

export default function CrearCategoriaModal({ onSave, onClose }: CrearCategoriaModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<CategoriaFormState>({
    nombre: '',
    descripcion: '',
    color: '#3b82f6',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const dataToSend = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      color: formData.color,
    };

    onSave(dataToSend);
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
    color: isDark ? '#c084fc' : 'var(--ot-purple-600)',
  };

  const highlightPalette = useMemo(
    () => ({
      purple: {
        background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'var(--ot-purple-50)',
        border: isDark ? 'rgba(168, 85, 247, 0.7)' : 'var(--ot-purple-500)',
        text: isDark ? '#ede9fe' : 'var(--ot-purple-700)',
        glow: isDark ? '0 0 0 1px rgba(139, 92, 246, 0.3)' : '0 0 0 1px rgba(139, 92, 246, 0.12)',
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
        <Layers size={20} />
      </div>
    ),
    [],
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Nueva Categoría"
      icon={headerIcon}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información de la Categoría */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={titleColorStyle}
          >
            <Tag size={20} />
            Información de la Categoría
          </h3>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Tag size={16} />
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Tecnología, Legal, Transporte, etc."
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={mutedTextStyle}>
                Mínimo 3 caracteres, debe ser único
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <FileText size={16} />
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe los tipos de gastos que incluye esta categoría..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                style={inputStyle}
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Palette size={16} />
                Color de la Categoría
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLORES_PREDEFINIDOS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className="flex items-center gap-2 p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: formData.color === color.value ? color.value : 'var(--border)',
                      background: formData.color === color.value ? `${color.value}20` : 'var(--surface)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm font-medium">{color.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={mutedTextStyle}>
                Selecciona un color para identificar visualmente esta categoría
              </p>
            </div>
          </div>
        </section>

        {/* Vista Previa */}
        <section className="rounded-xl border p-4" style={{
          ...sectionStyle,
          borderColor: formData.color,
          background: `${formData.color}20`,
        }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${formData.color}30`,
              }}
            >
              📦
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Vista Previa
              </p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {formData.nombre || 'Nombre de categoría'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formData.descripcion || 'Sin descripción'}
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
              background: 'linear-gradient(135deg, var(--ot-purple-500), var(--ot-pink-500))',
              color: 'white',
            }}
          >
            <Save size={18} />
            Crear Categoría
          </button>
        </div>
      </form>
    </Modal>
  );
}
