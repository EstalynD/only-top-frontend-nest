"use client";
import React from 'react';
import { Building2, FileText, Settings, FileCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SelectField } from '@/components/ui/selectUI';
import { Input } from '@/components/ui/Input';
import { TextareaField } from '@/components/ui/Textarea';
import { ColorPickerField } from '@/components/ui/ColorPicker';
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
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false // No cerrar al hacer click en backdrop para formularios
  });

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
        type="submit"
        disabled={loading || loadingData || !formData.name?.trim() || !formData.code?.trim()}
        size="md"
        loading={loading}
        loadingText="Guardando..."
      >
        <Building2 size={16} />
        {editingArea ? 'Actualizar' : 'Crear Área'}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Información Básica</h3>
              </div>
              <Input
                label="Nombre del Área"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej. Marketing, Traffic, Sales..."
                disabled={loading}
                required
                maxLength={100}
              />

              <Input
                label="Código"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: normalizeAreaCode(e.target.value) }))}
                placeholder="ej. MKT, TRF, SLS..."
                disabled={loading}
                maxLength={20}
                required
              />
            </div>

            {/* Color Identificativo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Color Identificativo</h3>
              </div>
              <ColorPickerField
                label="Color del Área"
                value={formData.color}
                onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                disabled={loading}
                showPreview={true}
                showPalette={true}
                showCustomInput={true}
                paletteColors={[...AREA_COLORS]}
                helpText="Selecciona un color que identifique visualmente esta área"
              />
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Descripción */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Descripción</h3>
              </div>
              <TextareaField
                label="Descripción del Área"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Describe las responsabilidades y funciones de esta área..."
                rows={4}
                disabled={loading}
                maxLength={500}
                autoResize={true}
              />
            </div>

            {/* Plantilla de Contrato */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck size={16} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Plantilla de Contrato</h3>
              </div>
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

            {/* Configuración Avanzada */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={16} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Configuración Avanzada</h3>
              </div>
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

                <Input
                  label="Orden de Visualización"
                  type="number"
                  value={formData.sortOrder.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  min={0}
                  disabled={loading}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}
