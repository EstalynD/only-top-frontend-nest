"use client";

import { useState, CSSProperties, useMemo } from 'react';
import { CheckCircle, DollarSign, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { GastosFijos } from '@/lib/service-finanzas';
import {
  EstadoGasto,
  type GastoFijoFormateadoDto,
} from '@/lib/service-finanzas/service-gastos-fijos';
import { GASTOS_FIJOS_MESSAGES } from '@/lib/service-finanzas/service-gastos-fijos';

interface CambiarEstadoGastoModalProps {
  gasto: GastoFijoFormateadoDto;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CambiarEstadoGastoModal({
  gasto,
  onClose,
  onSuccess,
}: CambiarEstadoGastoModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoGasto | null>(null);
  const [notas, setNotas] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estadosDisponibles: { estado: EstadoGasto; label: string; color: string; icon: any }[] = [
    { estado: EstadoGasto.APROBADO, label: 'Aprobar Gasto', color: '#10b981', icon: CheckCircle },
    { estado: EstadoGasto.PAGADO, label: 'Marcar como Pagado', color: '#3b82f6', icon: DollarSign },
    { estado: EstadoGasto.RECHAZADO, label: 'Rechazar Gasto', color: '#ef4444', icon: XCircle },
  ];

  const handleCambiarEstado = async () => {
    if (!token || !estadoSeleccionado) return;
    
    setActualizando(true);
    setError(null);
    
    try {
      await GastosFijos.aprobarGasto(token, gasto.id, {
        estado: estadoSeleccionado as any,
        notas: notas || undefined,
      });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      setError(err.message || GASTOS_FIJOS_MESSAGES.errorActualizarGasto);
    } finally {
      setActualizando(false);
    }
  };

  // Estilos
  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-green-100)', color: 'var(--ot-green-600)' }}
      >
        <CheckCircle size={20} />
      </div>
    ),
    [],
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Cambiar Estado del Gasto"
      icon={headerIcon}
      maxWidth="md"
    >
      <div className="p-6 space-y-6">
          {/* Concepto del gasto */}
          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
            <p className="text-xs mb-1" style={mutedTextStyle}>Concepto del gasto</p>
            <p className="font-semibold" style={labelStyle}>{gasto.concepto}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Info del gasto */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Estado actual:</span>
                <span className="font-semibold px-2 py-1 rounded" style={{ 
                  background: gasto.estado === 'APROBADO' ? '#d1fae5' : 
                              gasto.estado === 'PAGADO' ? '#dbeafe' : 
                              gasto.estado === 'PENDIENTE' ? '#fef3c7' : '#fee2e2',
                  color: gasto.estado === 'APROBADO' ? '#065f46' : 
                         gasto.estado === 'PAGADO' ? '#1e3a8a' : 
                         gasto.estado === 'PENDIENTE' ? '#92400e' : '#991b1b'
                }}>
                  {gasto.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Monto:</span>
                <span className="font-semibold" style={labelStyle}>{gasto.montoFormateado}</span>
              </div>
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Categoría:</span>
                <span style={labelStyle}>{gasto.categoria}</span>
              </div>
            </div>
          </div>

          {/* Selección de estado */}
          <div>
            <label className="block text-sm font-medium mb-3" style={labelStyle}>
              Seleccione el nuevo estado:
            </label>
            <div className="space-y-2">
              {estadosDisponibles.map(({ estado, label, color, icon: Icon }) => (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setEstadoSeleccionado(estado)}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-md"
                  style={{
                    borderColor: estadoSeleccionado === estado ? color : 'var(--border)',
                    background: estadoSeleccionado === estado ? `${color}10` : 'transparent',
                  }}
                  disabled={gasto.estado === estado}
                >
                  <Icon size={20} style={{ color }} />
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={labelStyle}>{label}</p>
                    {gasto.estado === estado && (
                      <p className="text-xs mt-1" style={mutedTextStyle}>Estado actual</p>
                    )}
                  </div>
                  {estadoSeleccionado === estado && (
                    <CheckCircle size={20} style={{ color }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <label className="block text-sm font-medium mb-2" style={labelStyle}>
              Notas (opcional):
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agregue una nota sobre este cambio de estado..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={inputStyle}
            />
          </div>

          {/* Advertencia */}
          {estadoSeleccionado && (
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: '#fef3c7', color: '#92400e' }}>
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                {estadoSeleccionado === 'RECHAZADO' 
                  ? 'El gasto será marcado como rechazado y no se incluirá en los cálculos.'
                  : estadoSeleccionado === 'PAGADO'
                  ? 'El gasto será marcado como pagado y completado.'
                  : 'El gasto será marcado como aprobado y listo para pago.'}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-muted)',
              }}
              disabled={actualizando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCambiarEstado}
              className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={{
                background: estadoSeleccionado 
                  ? estadosDisponibles.find(e => e.estado === estadoSeleccionado)?.color 
                  : '#9ca3af',
                color: 'white',
              }}
              disabled={actualizando || !estadoSeleccionado || gasto.estado === estadoSeleccionado}
            >
              {actualizando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Confirmar Cambio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
  );
}
