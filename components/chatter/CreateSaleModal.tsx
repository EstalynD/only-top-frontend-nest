"use client";
import React from 'react';
import { DollarSign, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import { useAuth } from '@/lib/auth';
import { createSale } from '@/lib/service-chatter/api';
import { getModelosActivas, getChattersDeModelo, type Modelo, type Empleado } from '@/lib/service-rrhh/modelos-api';
import { TIPO_VENTA_LABELS, TURNO_LABELS, PLATAFORMAS, MONEDAS } from '@/lib/service-chatter/constants';
import type { CreateSaleDto, TipoVenta, TurnoChatter } from '@/lib/service-chatter/types';
import { addToast } from '../ui/Toast';
import { Select, type SelectOption } from '@/components/ui/selectUI';

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
  const [loading, setLoading] = React.useState(false);
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

  // Opciones para selects (memoizadas)
  const modeloOptions: SelectOption[] = React.useMemo(() =>
    modelos.map((m) => ({ value: m._id, label: `${m.nombreCompleto} - ${m.correoElectronico}` })),
    [modelos]
  );

  const chatterOptions: SelectOption[] = React.useMemo(() =>
    (chatters as Array<Empleado & { turno?: string }>).map((c) => ({
      value: c._id,
      label: `${c.nombre} ${c.apellido}${c.turno ? ` (${c.turno})` : ''} - ${c.correoElectronico}`,
    })),
    [chatters]
  );

  // Opciones para selects de Moneda, Tipo de Venta, Turno, Plataforma
  const monedaOptions: SelectOption[] = React.useMemo(
    () => MONEDAS.map((m) => ({ value: m, label: m })),
    []
  );

  const tipoVentaOptions: SelectOption[] = React.useMemo(
    () => Object.entries(TIPO_VENTA_LABELS).map(([key, label]) => ({ value: key, label })),
    []
  );

  const turnoOptions: SelectOption[] = React.useMemo(
    () => Object.entries(TURNO_LABELS).map(([key, label]) => ({ value: key, label })),
    []
  );

  const plataformaOptions: SelectOption[] = React.useMemo(
    () => [
      { value: '', label: 'Sin especificar' },
      ...PLATAFORMAS.map((p) => ({ value: p, label: p })),
    ],
    []
  );

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
      addToast({
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
      
      // La estructura viene como: { equipoChatters: { AM: {...}, PM: {...}, ... } }
      if (data.equipoChatters) {
        const equipoChatters = data.equipoChatters;
        
        // Extraer cada chatter de los turnos
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
      addToast({
        type: 'error',
        title: 'Error al cargar chatters',
        description: error.message,
      });
    } finally {
      setLoadingChatters(false);
    }
  };

  const handleModeloSelect = (modeloId: string) => {
    // Si se limpia la selección
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
      chatterId: '', // Reset chatter selection
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      await createSale(token, {
        ...formData,
        fechaVenta: new Date(formData.fechaVenta).toISOString(),
      });
      
      addToast({
        type: 'success',
        title: 'Venta registrada',
        description: 'La venta ha sido registrada exitosamente',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message || 'No se pudo registrar la venta',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.75rem',
    width: '100%',
    fontSize: '0.875rem',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    display: 'block',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nueva Venta"
      icon={<DollarSign size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Selección de Modelo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label style={labelStyle}>Modelo *</label>
            <button
              type="button"
              onClick={() => setModeloSearchMode(modeloSearchMode === 'select' ? 'manual' : 'select')}
              className="text-xs px-2 py-1 rounded"
              style={{ 
                background: 'var(--surface-muted)', 
                color: 'var(--ot-blue-500)',
                border: '1px solid var(--border)',
              }}
            >
              {modeloSearchMode === 'select' ? 'Ingresar ID manualmente' : 'Seleccionar de lista'}
            </button>
          </div>

          {modeloSearchMode === 'select' ? (
            <div className="relative">
              <Select
                value={formData.modeloId}
                onChange={handleModeloSelect}
                options={modeloOptions}
                placeholder="Seleccionar modelo..."
                disabled={loadingModelos || !!initialModeloId}
                clearable
                fullWidth
                size="md"
              />
              {loadingModelos && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader size="sm" />
                </div>
              )}
            </div>
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
              className="p-2 rounded text-xs"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
            >
              <strong>Modelo:</strong> {selectedModelo.nombreCompleto}<br />
              <strong>Email:</strong> {selectedModelo.correoElectronico}
            </div>
          )}
        </div>

        {/* Selección de Chatter */}
        <div className="space-y-2">
          <label style={labelStyle}>Chatter *</label>
          
          {formData.modeloId && modeloSearchMode === 'select' ? (
            <div className="relative">
              <Select
                value={formData.chatterId}
                onChange={(val) => setFormData({ ...formData, chatterId: val })}
                options={chatterOptions}
                placeholder={loadingChatters ? 'Cargando chatters...' : 'Seleccionar chatter...'}
                disabled={loadingChatters || !!initialChatterId || chatters.length === 0}
                clearable
                fullWidth
                size="md"
              />
              {loadingChatters && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader size="sm" />
                </div>
              )}
              {!loadingChatters && chatters.length === 0 && formData.modeloId && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron chatters para esta modelo. Verifica que la modelo tenga chatters asignados.
                </p>
              )}
            </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monto */}
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

          {/* Moneda */}
          <div>
            <label style={labelStyle}>Moneda *</label>
            <Select
              value={formData.moneda || ''}
              onChange={(val) => setFormData({ ...formData, moneda: val })}
              options={monedaOptions}
              fullWidth
              size="md"
            />
          </div>

          {/* Tipo de Venta */}
          <div>
            <label style={labelStyle}>Tipo de Venta *</label>
            <Select
              value={formData.tipoVenta}
              onChange={(val) => setFormData({ ...formData, tipoVenta: val as TipoVenta })}
              options={tipoVentaOptions}
              fullWidth
              size="md"
            />
          </div>

          {/* Turno */}
          <div>
            <label style={labelStyle}>Turno *</label>
            <Select
              value={formData.turno}
              onChange={(val) => setFormData({ ...formData, turno: val as TurnoChatter })}
              options={turnoOptions}
              fullWidth
              size="md"
            />
          </div>

          {/* Plataforma */}
          <div>
            <label style={labelStyle}>Plataforma</label>
            <Select
              value={formData.plataforma || ''}
              onChange={(val) => setFormData({ ...formData, plataforma: val })}
              options={plataformaOptions}
              fullWidth
              size="md"
              clearable
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
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea
            rows={2}
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Descripción opcional de la venta"
          />
        </div>

        {/* Notas Internas */}
        <div>
          <label style={labelStyle}>Notas Internas</label>
          <textarea
            rows={2}
            value={formData.notasInternas || ''}
            onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Notas internas (solo visibles para el equipo)"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <X size={16} className="inline mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: 'var(--ot-blue-500)',
              color: 'white',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Loader size="sm" />
            ) : (
              <>
                <Save size={16} className="inline mr-2" />
                Registrar Venta
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

