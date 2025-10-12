"use client";
import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ColorPicker from '@/components/ui/ColorPicker';
import IconPicker from '@/components/ui/IconPicker';
import { Plus, Check, X } from 'lucide-react';
import type { EndowmentCategory } from '@/lib/service-rrhh/types';

interface CategoryFormProps {
  form: Partial<EndowmentCategory>;
  setForm: React.Dispatch<React.SetStateAction<Partial<EndowmentCategory>>>;
  onSubmit: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export default function CategoryForm({ form, setForm, onSubmit, loading = false, mode = 'create', onCancel }: CategoryFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid = form.name && form.description;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input 
          label="Nombre" 
          value={form.name || ''} 
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        
        <Input 
          label="Descripción" 
          value={form.description || ''} 
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ColorPicker
            label="Color"
            value={form.color || '#3B82F6'}
            onChange={(color) => setForm((f) => ({ ...f, color }))}
          />
          
          <IconPicker
            label="Ícono"
            value={form.icon || ''}
            onChange={(icon) => setForm((f) => ({ ...f, icon }))}
            placeholder="Seleccionar ícono"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="submit"
          variant="primary" 
          disabled={!isFormValid || loading}
          className="flex-1"
        >
          {mode === 'edit' ? <Check size={16} /> : <Plus size={16} />}
          {loading ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : (mode === 'edit' ? 'Guardar Cambios' : 'Crear Categoría')}
        </Button>
        {mode === 'edit' && (
          <Button 
            type="button"
            variant="ghost"
            className="flex-none"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={16} />
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
