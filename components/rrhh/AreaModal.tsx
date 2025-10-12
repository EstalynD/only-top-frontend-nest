"use client";
import React from 'react';
import { Building2, Palette, FileText, Settings, Hash, FileCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Select, SelectField } from '@/components/ui/selectUI';
import { useTheme } from '@/lib/theme';
import { createArea, updateArea, getAvailableContractTemplates } from '@/lib/service-rrhh/api';
import { normalizeAreaCode, getRandomAreaColor } from '@/lib/service-rrhh/helpers';
import { AREA_COLORS } from '@/lib/service-rrhh/constants';
import type { Area, CreateAreaDto, UpdateAreaDto, ContractTemplate } from '@/lib/service-rrhh/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingArea: Area | null;
  token: string;
}

export default function AreaModal({ isOpen, onClose, onSuccess, editingArea, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false // No cerrar al hacer click en backdrop para formularios
  });

  // Helper styles for consistent styling
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s'
  };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)'
  };

  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [templates, setTemplates] = React.useState<ContractTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    code: '',
    description: '',
    color: '#6B7280',
    isActive: true,
    sortOrder: 0,
    defaultContractTemplateId: '',
  });

  // Sincronizar el estado del modal con las props
  React.useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  // Load templates when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getAvailableContractTemplates(token);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las plantillas de contratos.',
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

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
          defaultContractTemplateId: editingArea.defaultContractTemplateId || '',
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          color: getRandomAreaColor(),
          isActive: true,
          sortOrder: 0,
          defaultContractTemplateId: '',
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
        defaultContractTemplateId: formData.defaultContractTemplateId || null,
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
      modal.closeModal();
      onClose();
    }
  };

  // Footer del modal
  const modalFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="neutral"
        onClick={handleClose}
        disabled={loading || loadingData}
        size="md"
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading || loadingData || !formData.name?.trim() || !formData.code?.trim()}
        size="md"
      >
        <Building2 size={16} />
        {loading ? 'Guardando...' : editingArea ? 'Actualizar' : 'Crear Área'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title={editingArea ? 'Editar Área' : 'Nueva Área'}
      icon={<Building2 size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="5xl"
      description="Complete la información del área. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loadingData}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos del área...
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Layout principal con dos columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Información Básica */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Building2 size={16} />
                Información Básica
              </h3>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>
                    Nombre del Área *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Marketing, Traffic, Sales..."
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: normalizeAreaCode(e.target.value) }))}
                    placeholder="ej. MKT, TRF, SLS..."
                    style={inputStyle}
                    disabled={loading}
                    maxLength={20}
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Solo letras mayúsculas y guiones bajos. Se genera automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Color Identificativo */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Palette size={16} />
                Color Identificativo
              </h3>
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
                <div>
                  <label style={labelStyle}>
                    Paleta de Colores
                  </label>
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
                </div>

                {/* Custom Color Input */}
                <div>
                  <label style={labelStyle}>
                    Color Personalizado
                  </label>
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
                      style={{
                        ...inputStyle,
                        flex: 1
                      }}
                      disabled={loading}
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Descripción */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} />
                Descripción
              </h3>
              <div>
                <label style={labelStyle}>
                  Descripción del Área
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe las responsabilidades y funciones de esta área..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'none',
                    minHeight: '100px'
                  }}
                  disabled={loading}
                  maxLength={500}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formData.description.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Plantilla de Contrato */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileCheck size={16} />
                Plantilla de Contrato
              </h3>
              <div>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
                    <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      Cargando plantillas...
                    </span>
                  </div>
                ) : (
                  <SelectField
                    label="Plantilla por Defecto"
                    value={formData.defaultContractTemplateId}
                    onChange={(value) => setFormData(prev => ({ ...prev, defaultContractTemplateId: value }))}
                    options={[
                      { value: '', label: 'Sin plantilla específica' },
                      ...templates.map((template) => ({
                        value: template.templateId,
                        label: `${template.name} (${template.areaCode})`
                      }))
                    ]}
                    placeholder="Selecciona una plantilla"
                    disabled={loading}
                    clearable
                    helpText="Selecciona una plantilla de contrato que se usará por defecto para esta área"
                  />
                )}
              </div>
            </div>

            {/* Configuración Avanzada */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Settings size={16} />
                Configuración Avanzada
              </h3>
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
                  <label style={labelStyle}>
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    min="0"
                    style={inputStyle}
                    disabled={loading}
                    placeholder="0"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Número menor = aparece primero en las listas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}
