"use client";
import React from 'react';
import { Users, Plus, Trash2, DollarSign } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { createCargo, updateCargo } from '@/lib/service-rrhh/api';
import { normalizeCargoCode } from '@/lib/service-rrhh/helpers';
import { HIERARCHY_LEVELS } from '@/lib/service-rrhh/constants';
import type { Cargo, AreaWithCargos, CreateCargoDto, UpdateCargoDto } from '@/lib/service-rrhh/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCargo: Cargo | null;
  areas: AreaWithCargos[];
  token: string;
}

export default function CargoModal({ isOpen, onClose, onSuccess, editingCargo, areas, token }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    code: '',
    areaId: '',
    description: '',
    hierarchyLevel: 2,
    salaryRange: {
      enabled: false,
      min: 0,
      max: 0,
      currency: 'COP',
    },
    requirements: {
      education: [''],
      experience: '',
      skills: [''],
      languages: [''],
    },
    isActive: true,
    sortOrder: 0,
  });

  // Reset form when modal opens/closes or editing cargo changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingCargo) {
        const areaId = typeof editingCargo.areaId === 'string' 
          ? editingCargo.areaId 
          : editingCargo.areaId?._id || '';
          
        setFormData({
          name: editingCargo.name || '',
          code: editingCargo.code || '',
          areaId: areaId || '',
          description: editingCargo.description || '',
          hierarchyLevel: editingCargo.hierarchyLevel || 2,
          salaryRange: {
            enabled: !!editingCargo.salaryRange,
            min: editingCargo.salaryRange?.min || 0,
            max: editingCargo.salaryRange?.max || 0,
            currency: editingCargo.salaryRange?.currency || 'COP',
          },
          requirements: {
            education: editingCargo.requirements?.education || [''],
            experience: editingCargo.requirements?.experience || '',
            skills: editingCargo.requirements?.skills || [''],
            languages: editingCargo.requirements?.languages || [''],
          },
          isActive: editingCargo.isActive !== undefined ? editingCargo.isActive : true,
          sortOrder: editingCargo.sortOrder || 0,
        });
      } else {
        // Pre-select area if passed in areaId (for new cargo with preselected area)
        const preselectedAreaId = (editingCargo as any)?.areaId || '';
        
        setFormData({
          name: '',
          code: '',
          areaId: preselectedAreaId,
          description: '',
          hierarchyLevel: 2,
          salaryRange: {
            enabled: false,
            min: 1000000,
            max: 2000000,
            currency: 'COP',
          },
          requirements: {
            education: [''],
            experience: '',
            skills: [''],
            languages: [''],
          },
          isActive: true,
          sortOrder: 0,
        });
      }
    }
  }, [isOpen, editingCargo]);

  // Auto-generate code from name and area
  React.useEffect(() => {
    if (!editingCargo && formData.name && formData.areaId) {
      const selectedArea = areas.find(a => a._id === formData.areaId);
      if (selectedArea) {
        const nameCode = formData.name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase();
        const generatedCode = normalizeCargoCode(`${selectedArea.code}_${nameCode}`);
        setFormData(prev => ({ ...prev, code: generatedCode }));
      }
    }
  }, [formData.name, formData.areaId, areas, editingCargo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.code?.trim() || !formData.areaId) {
      toast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'El nombre, código y área son obligatorios.',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Clean up requirements
      const cleanRequirements = {
        education: (formData.requirements.education || []).filter(e => e?.trim()),
        experience: formData.requirements.experience?.trim() || '',
        skills: (formData.requirements.skills || []).filter(s => s?.trim()),
        languages: (formData.requirements.languages || []).filter(l => l?.trim()),
      };

      const hasRequirements = 
        cleanRequirements.education.length > 0 ||
        cleanRequirements.experience ||
        cleanRequirements.skills.length > 0 ||
        cleanRequirements.languages.length > 0;

      const data = {
        name: formData.name?.trim() || '',
        code: normalizeCargoCode(formData.code || ''),
        areaId: formData.areaId,
        description: formData.description?.trim() || null,
        hierarchyLevel: formData.hierarchyLevel,
        salaryRange: formData.salaryRange.enabled ? {
          min: formData.salaryRange.min,
          max: formData.salaryRange.max,
          currency: formData.salaryRange.currency,
        } : null,
        requirements: hasRequirements ? cleanRequirements : null,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (editingCargo) {
        await updateCargo(editingCargo._id, data as UpdateCargoDto, token);
      } else {
        await createCargo(data as CreateCargoDto, token);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving cargo:', error);
      toast({
        type: 'error',
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar el cargo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form data to default state
      setFormData({
        name: '',
        code: '',
        areaId: '',
        description: '',
        hierarchyLevel: 2,
        salaryRange: {
          enabled: false,
          min: 0,
          max: 0,
          currency: 'COP',
        },
        requirements: {
          education: [''],
          experience: '',
          skills: [''],
          languages: [''],
        },
        isActive: true,
        sortOrder: 0,
      });
      onClose();
    }
  };

  const addArrayItem = (field: 'education' | 'skills' | 'languages') => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: [...prev.requirements[field], ''],
      },
    }));
  };

  const removeArrayItem = (field: 'education' | 'skills' | 'languages', index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: prev.requirements[field].filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (field: 'education' | 'skills' | 'languages', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: prev.requirements[field].map((item, i) => i === index ? value : item),
      },
    }));
  };

  const activeAreas = areas.filter(area => area.isActive);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
      icon={<Users size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Nombre del Cargo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ej. Community Manager, Trafficker..."
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

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Código *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: normalizeCargoCode(e.target.value) }))}
              placeholder="ej. MKT_CM, TRF_TRF..."
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
              maxLength={30}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Área *
            </label>
            <select
              value={formData.areaId}
              onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
              required
            >
              <option value="">Seleccionar área</option>
              {activeAreas.map((area) => (
                <option key={area._id} value={area._id}>
                  {area.name} ({area.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Nivel Jerárquico
            </label>
            <select
              value={formData.hierarchyLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, hierarchyLevel: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
            >
              {HIERARCHY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe las responsabilidades y funciones de este cargo..."
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

        {/* Salary Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Rango Salarial
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.salaryRange.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, enabled: e.target.checked }
                }))}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.salaryRange.enabled && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Mínimo
                </label>
                <input
                  type="number"
                  value={formData.salaryRange.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: 'var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Máximo
                </label>
                <input
                  type="number"
                  value={formData.salaryRange.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, max: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: 'var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Moneda
                </label>
                <select
                  value={formData.salaryRange.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    salaryRange: { ...prev.salaryRange, currency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: 'var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  disabled={loading}
                >
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Requisitos del Cargo
          </h3>
          
          <div className="space-y-4">
            {/* Education */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Educación
                </label>
                <Button
                  type="button"
                  onClick={() => addArrayItem('education')}
                  variant="ghost"
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Plus size={12} className="mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.requirements.education.map((edu, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={edu}
                      onChange={(e) => updateArrayItem('education', index, e.target.value)}
                      placeholder="ej. Comunicación Social, Marketing Digital..."
                      className="flex-1 px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)'
                      }}
                      disabled={loading}
                    />
                    {formData.requirements.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('education', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Experiencia
              </label>
              <input
                type="text"
                value={formData.requirements.experience}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  requirements: { ...prev.requirements, experience: e.target.value }
                }))}
                placeholder="ej. 2-3 años en marketing digital..."
                className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
                disabled={loading}
              />
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Habilidades
                </label>
                <Button
                  type="button"
                  onClick={() => addArrayItem('skills')}
                  variant="ghost"
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Plus size={12} className="mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.requirements.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                      placeholder="ej. Creatividad, Google Ads, Photoshop..."
                      className="flex-1 px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)'
                      }}
                      disabled={loading}
                    />
                    {formData.requirements.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Idiomas
                </label>
                <Button
                  type="button"
                  onClick={() => addArrayItem('languages')}
                  variant="ghost"
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Plus size={12} className="mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.requirements.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lang}
                      onChange={(e) => updateArrayItem('languages', index, e.target.value)}
                      placeholder="ej. Español nativo, Inglés intermedio..."
                      className="flex-1 px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)'
                      }}
                      disabled={loading}
                    />
                    {formData.requirements.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('languages', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
                Los cargos inactivos no aparecen en las listas principales
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
            disabled={loading || !formData.name?.trim() || !formData.code?.trim() || !formData.areaId}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Users size={16} />
            {loading ? 'Guardando...' : editingCargo ? 'Actualizar' : 'Crear Cargo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
