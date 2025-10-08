"use client";
import React from 'react';
import { Building2, Palette } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { createArea, updateArea } from '@/lib/service-rrhh/api';
import { normalizeAreaCode, getRandomAreaColor } from '@/lib/service-rrhh/helpers';
import { AREA_COLORS } from '@/lib/service-rrhh/constants';
import type { Area, CreateAreaDto, UpdateAreaDto } from '@/lib/service-rrhh/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingArea: Area | null;
  token: string;
}

export default function AreaModal({ isOpen, onClose, onSuccess, editingArea, token }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    code: '',
    description: '',
    color: '#6B7280',
    isActive: true,
    sortOrder: 0,
  });

  // Reset form when modal opens/closes or editing area changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingArea) {
        setFormData({
          name: editingArea.name,
          code: editingArea.code,
          description: editingArea.description || '',
          color: editingArea.color,
          isActive: editingArea.isActive,
          sortOrder: editingArea.sortOrder,
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          color: getRandomAreaColor(),
          isActive: true,
          sortOrder: 0,
        });
      }
    }
  }, [isOpen, editingArea]);

  // Auto-generate code from name
  React.useEffect(() => {
    if (!editingArea && formData.name) {
      const generatedCode = normalizeAreaCode(
        formData.name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
      );
      setFormData(prev => ({ ...prev, code: generatedCode }));
    }
  }, [formData.name, editingArea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'El nombre y código son obligatorios.',
      });
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        name: formData.name.trim(),
        code: normalizeAreaCode(formData.code),
        description: formData.description.trim() || null,
        color: formData.color,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (editingArea) {
        await updateArea(editingArea._id, data as UpdateAreaDto, token);
      } else {
        await createArea(data as CreateAreaDto, token);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving area:', error);
      toast({
        type: 'error',
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar el área.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingArea ? 'Editar Área' : 'Nueva Área'}
      icon={<Building2 size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Nombre del Área *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="ej. Marketing, Traffic, Sales..."
            className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
            disabled={loading}
            required
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Código *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: normalizeAreaCode(e.target.value) }))}
            placeholder="ej. MKT, TRF, SLS..."
            className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
            disabled={loading}
            maxLength={20}
            required
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Solo letras mayúsculas y guiones bajos. Se genera automáticamente.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe las responsabilidades y funciones de esta área..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
            disabled={loading}
            maxLength={500}
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Color Identificativo
          </label>
          <div className="space-y-3">
            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 flex items-center justify-center"
                style={{ 
                  backgroundColor: formData.color,
                  borderColor: 'var(--border)'
                }}
              >
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Vista previa
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formData.color}
                </p>
              </div>
            </div>

            {/* Color Palette */}
            <div className="grid grid-cols-5 gap-2">
              {AREA_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.color === color ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: color,
                    borderColor: formData.color === color ? 'var(--ot-blue-500)' : 'var(--border)'
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
                disabled={loading}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#6B7280"
                className="flex-1 px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
                disabled={loading}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Estado Activo
              </label>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Las áreas inactivas no aparecen en las listas principales
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Orden de Visualización
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              min="0"
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Número menor = aparece primero en las listas
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={loading || !formData.name.trim() || !formData.code.trim()}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Building2 size={16} />
            {loading ? 'Guardando...' : editingArea ? 'Actualizar' : 'Crear Área'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
