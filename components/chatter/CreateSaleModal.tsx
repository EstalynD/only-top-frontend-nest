"use client";
import React from 'react';
import { DollarSign, User, Calendar, TrendingUp, FileText, Settings, CreditCard } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SelectField } from '@/components/ui/selectUI';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { createSale } from '@/lib/service-chatter/api';
import { getModelosActivas, getChattersDeModelo, type Modelo, type Empleado } from '@/lib/service-rrhh/modelos-api';
import { TIPO_VENTA_LABELS, TURNO_LABELS, PLATAFORMAS, MONEDAS } from '@/lib/service-chatter/constants';
import type { CreateSaleDto, TipoVenta, TurnoChatter } from '@/lib/service-chatter/types';

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modeloId?: string;
  chatterId?: string;
  turno?: TurnoChatter;
}

export default function CreateSaleModal({
  isOpen,
  onClose,
  onSuccess,
  modeloId: initialModeloId,
  chatterId: initialChatterId,
  turno: initialTurno,
}: CreateSaleModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false
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
  const [loadingModelos, setLoadingModelos] = React.useState(false);
  const [loadingChatters, setLoadingChatters] = React.useState(false);
  
  const [modelos, setModelos] = React.useState<Modelo[]>([]);
  const [chatters, setChatters] = React.useState<Empleado[]>([]);
  const [selectedModelo, setSelectedModelo] = React.useState<Modelo | null>(null);
  const [modeloSearchMode, setModeloSearchMode] = React.useState<'select' | 'manual'>(
    initialModeloId ? 'manual' : 'select'
  );
  
  const [formData, setFormData] = React.useState<CreateSaleDto>({
    modeloId: initialModeloId || '',
    chatterId: initialChatterId || '',
    monto: 0,
    moneda: 'USD',
    tipoVenta: 'TIP' as TipoVenta,
    turno: initialTurno || 'AM' as TurnoChatter,
    fechaVenta: new Date().toISOString().slice(0, 16),
    plataforma: 'OnlyFans',
  });

  // Sincronizar el estado del modal con las props
  React.useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  // Cargar modelos activas al abrir el modal
  React.useEffect(() => {
    if (isOpen && token && !initialModeloId) {
      loadModelos();
    }
  }, [isOpen, token]);

  // Cargar chatters cuando se selecciona una modelo
  React.useEffect(() => {
    if (formData.modeloId && token) {
      loadChattersForModelo(formData.modeloId);
    } else {
      setChatters([]);
    }
  }, [formData.modeloId, token]);

  const loadModelos = async () => {
    if (!token) return;
    
    try {
      setLoadingModelos(true);
      const data = await getModelosActivas(token);
      setModelos(data);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al cargar modelos',
        description: error.message,
      });
    } finally {
      setLoadingModelos(false);
    }
  };

  const loadChattersForModelo = async (modeloId: string) => {
    if (!token) return;
    
    try {
      setLoadingChatters(true);
      const data: any = await getChattersDeModelo(token, modeloId);
      
      // Extraer chatters del objeto de equipo con información de turno
      const chattersList: (Empleado & { turno?: string })[] = [];
      
      if (data.equipoChatters) {
        const equipoChatters = data.equipoChatters;
        
        const turnoLabels: Record<string, string> = {
          AM: 'Turno AM',
          PM: 'Turno PM',
          MADRUGADA: 'Turno Madrugada',
          SUPERNUMERARIO: 'Supernumerario',
        };
        
        ['AM', 'PM', 'MADRUGADA', 'SUPERNUMERARIO'].forEach((turno) => {
          const chatter = equipoChatters[turno];
          if (chatter && chatter._id) {
            chattersList.push({
              _id: chatter._id,
              nombre: chatter.nombre,
              apellido: chatter.apellido,
              correoElectronico: chatter.correoElectronico,
              telefono: chatter.telefono,
              turno: turnoLabels[turno],
            });
          }
        });
      }
      
      setChatters(chattersList);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al cargar chatters',
        description: error.message,
      });
    } finally {
      setLoadingChatters(false);
    }
  };

  const handleModeloSelect = (modeloId: string) => {
    if (!modeloId) {
      setSelectedModelo(null);
      setChatters([]);
      setFormData({ ...formData, modeloId: '', chatterId: '' });
      return;
    }

    const modelo = modelos.find((m) => m._id === modeloId);
    setSelectedModelo(modelo || null);
    setFormData({
      ...formData,
      modeloId,
      chatterId: '',
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.modeloId || !formData.chatterId) {
      toast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'Modelo y Chatter son obligatorios.',
      });
      return;
    }

    if (formData.monto <= 0) {
      toast({
        type: 'error',
        title: 'Monto inválido',
        description: 'El monto debe ser mayor a 0.',
      });
      return;
    }

    try {
      setLoading(true);
      await createSale(token!, {
        ...formData,
        fechaVenta: new Date(formData.fechaVenta).toISOString(),
      });
      
      toast({
        type: 'success',
        title: 'Venta registrada',
        description: 'La venta ha sido registrada exitosamente',
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al registrar',
        description: error.message || 'No se pudo registrar la venta',
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
        disabled={loading || loadingData}
        size="md"
      >
        <DollarSign size={16} />
        {loading ? 'Registrando...' : 'Registrar Venta'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title="Registrar Nueva Venta"
      icon={<DollarSign size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="5xl"
      description="Complete la información de la venta. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      disableFocusTrap={true}
      isLoading={loadingData}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos...
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Layout principal con dos columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Información de Modelo y Chatter */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={16} />
                Modelo y Chatter
              </h3>
              <div className="space-y-3">
                {/* Selección de Modelo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label style={labelStyle}>Modelo *</label>
                    {!initialModeloId && (
                      <button
                        type="button"
                        onClick={() => setModeloSearchMode(modeloSearchMode === 'select' ? 'manual' : 'select')}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ 
                          background: 'var(--surface)', 
                          color: 'var(--ot-blue-500)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {modeloSearchMode === 'select' ? 'ID Manual' : 'Seleccionar'}
                      </button>
                    )}
                  </div>

                  {modeloSearchMode === 'select' ? (
                    <SelectField
                      label=""
                      value={formData.modeloId}
                      onChange={handleModeloSelect}
                      options={modelos.map((m) => ({
                        value: m._id,
                        label: `${m.nombreCompleto} - ${m.correoElectronico}`
                      }))}
                      placeholder={loadingModelos ? 'Cargando modelos...' : 'Seleccionar modelo...'}
                      disabled={loadingModelos || !!initialModeloId}
                      clearable
                      helpText={loadingModelos ? 'Cargando lista de modelos activas...' : undefined}
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.modeloId}
                      onChange={(e) => {
                        setFormData({ ...formData, modeloId: e.target.value, chatterId: '' });
                        setSelectedModelo(null);
                      }}
                      disabled={!!initialModeloId}
                      style={inputStyle}
                      placeholder="ID de MongoDB (ej: 507f1f77bcf86cd799439011)"
                    />
                  )}

                  {selectedModelo && (
                    <div 
                      className="p-2 rounded text-xs mt-2"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Modelo:</strong> {selectedModelo.nombreCompleto}<br />
                      <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {selectedModelo.correoElectronico}
                    </div>
                  )}
                </div>

                {/* Selección de Chatter */}
                <div>
                  <label style={labelStyle}>Chatter *</label>
                  
                  {formData.modeloId && modeloSearchMode === 'select' ? (
                    <SelectField
                      label=""
                      value={formData.chatterId}
                      onChange={(val) => setFormData({ ...formData, chatterId: val })}
                      options={chatters.map((c: any) => ({
                        value: c._id,
                        label: `${c.nombre} ${c.apellido}${c.turno ? ` (${c.turno})` : ''} - ${c.correoElectronico}`
                      }))}
                      placeholder={loadingChatters ? 'Cargando chatters...' : 'Seleccionar chatter...'}
                      disabled={loadingChatters || !!initialChatterId || chatters.length === 0}
                      clearable
                      helpText={
                        loadingChatters 
                          ? 'Cargando chatters de la modelo...'
                          : !loadingChatters && chatters.length === 0 && formData.modeloId
                          ? 'No se encontraron chatters para esta modelo. Verifica que la modelo tenga chatters asignados.'
                          : undefined
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.chatterId}
                      onChange={(e) => setFormData({ ...formData, chatterId: e.target.value })}
                      disabled={!!initialChatterId}
                      style={inputStyle}
                      placeholder="ID del chatter (debe estar asignado a la modelo)"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Detalles de la Venta */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CreditCard size={16} />
                Detalles de la Venta
              </h3>
              <div className="space-y-3">
                {/* Monto y Moneda */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Monto *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <SelectField
                      label="Moneda *"
                      value={formData.moneda || ''}
                      onChange={(val) => setFormData({ ...formData, moneda: val })}
                      options={MONEDAS.map((m) => ({ value: m, label: m }))}
                    />
                  </div>
                </div>

                {/* Tipo de Venta */}
                <div>
                  <SelectField
                    label="Tipo de Venta *"
                    value={formData.tipoVenta}
                    onChange={(val) => setFormData({ ...formData, tipoVenta: val as TipoVenta })}
                    options={Object.entries(TIPO_VENTA_LABELS).map(([key, label]) => ({ 
                      value: key, 
                      label 
                    }))}
                  />
                </div>

                {/* Turno */}
                <div>
                  <SelectField
                    label="Turno *"
                    value={formData.turno}
                    onChange={(val) => setFormData({ ...formData, turno: val as TurnoChatter })}
                    options={Object.entries(TURNO_LABELS).map(([key, label]) => ({ 
                      value: key, 
                      label 
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Información Adicional */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Settings size={16} />
                Información Adicional
              </h3>
              <div className="space-y-3">
                {/* Plataforma */}
                <div>
                  <SelectField
                    label="Plataforma"
                    value={formData.plataforma || ''}
                    onChange={(val) => setFormData({ ...formData, plataforma: val })}
                    options={[
                      { value: '', label: 'Sin especificar' },
                      ...PLATAFORMAS.map((p) => ({ value: p, label: p })),
                    ]}
                    clearable
                    helpText="Plataforma donde se realizó la venta"
                  />
                </div>

                {/* Fecha y Hora */}
                <div>
                  <label style={labelStyle}>Fecha y Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fechaVenta}
                    onChange={(e) => setFormData({ ...formData, fechaVenta: e.target.value })}
                    style={inputStyle}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Fecha y hora cuando se realizó la venta
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción y Notas */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} />
                Descripción y Notas
              </h3>
              <div className="space-y-3">
                {/* Descripción */}
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    placeholder="Descripción opcional de la venta"
                    maxLength={500}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {(formData.descripcion || '').length}/500 caracteres
                  </p>
                </div>

                {/* Notas Internas */}
                <div>
                  <label style={labelStyle}>Notas Internas</label>
                  <textarea
                    rows={3}
                    value={formData.notasInternas || ''}
                    onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    placeholder="Notas internas (solo visibles para el equipo)"
                    maxLength={500}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {(formData.notasInternas || '').length}/500 caracteres
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
