"use client";
import React from 'react';
import { Users, Building2, Hash, FileText, Settings, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Select, SelectField } from '@/components/ui/selectUI';
import { useTheme } from '@/lib/theme';
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
  const [formData, setFormData] = React.useState({
    name: '',
    code: '',
    areaId: '',
    description: '',
    hierarchyLevel: 2,
    isActive: true,
    sortOrder: 0,
  });

  // Sincronizar el estado del modal con las props
  React.useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  // Reset form when modal opens/closes or editing cargo changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingCargo) {
        // Handle both string and object areaId
        let areaId = '';
        if (typeof editingCargo.areaId === 'string') {
          areaId = editingCargo.areaId;
        } else if (editingCargo.areaId && typeof editingCargo.areaId === 'object') {
          areaId = editingCargo.areaId._id || '';
        }
          
        setFormData({
          name: editingCargo.name || '',
          code: editingCargo.code || '',
          areaId: areaId,
          description: editingCargo.description || '',
          hierarchyLevel: editingCargo.hierarchyLevel || 2,
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      
      const data = {
        name: formData.name?.trim() || '',
        code: normalizeCargoCode(formData.code || ''),
        areaId: formData.areaId,
        description: formData.description?.trim() || null,
        hierarchyLevel: formData.hierarchyLevel,
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
      modal.closeModal();
      onClose();
    }
  };


  const activeAreas = areas.filter(area => area.isActive);

  // Convertir a SelectOption format
  const areaOptions = activeAreas.map(area => ({
    value: area._id,
    label: `${area.name} (${area.code})`
  }));

  const hierarchyOptions = HIERARCHY_LEVELS.map(level => ({
    value: level.value.toString(),
    label: level.label
  }));

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
        disabled={loading || loadingData || !formData.name?.trim() || !formData.code?.trim() || !formData.areaId}
        size="md"
      >
        <Users size={16} />
        {loading ? 'Guardando...' : editingCargo ? 'Actualizar' : 'Crear Cargo'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title={editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
      icon={<Users size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="5xl"
      description="Complete la información del cargo. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loadingData}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos del cargo...
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
                <Users size={16} />
                Información Básica
              </h3>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>
                    Nombre del Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Community Manager, Trafficker..."
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
                    onChange={(e) => setFormData(prev => ({ ...prev, code: normalizeCargoCode(e.target.value) }))}
                    placeholder="ej. MKT_CM, TRF_TRF..."
                    style={inputStyle}
                    disabled={loading}
                    maxLength={30}
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Se genera automáticamente basado en el nombre y área
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración Organizacional */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Building2 size={16} />
                Configuración Organizacional
              </h3>
              <div className="space-y-3">
                <SelectField
                  label="Área"
                  value={formData.areaId}
                  onChange={(value) => setFormData(prev => ({ ...prev, areaId: value }))}
                  options={areaOptions}
                  placeholder="Seleccionar área"
                  disabled={loading}
                  required={true}
                  clearable
                />

                <SelectField
                  label="Nivel Jerárquico"
                  value={formData.hierarchyLevel.toString()}
                  onChange={(value) => setFormData(prev => ({ ...prev, hierarchyLevel: parseInt(value) }))}
                  options={hierarchyOptions}
                  placeholder="Seleccionar nivel"
                  disabled={loading}
                  helpText="Define la jerarquía organizacional del cargo"
                />
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
                  Descripción del Cargo
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe las responsabilidades y funciones de este cargo..."
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
                    Define el orden de aparición en las listas (menor número = primero)
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
