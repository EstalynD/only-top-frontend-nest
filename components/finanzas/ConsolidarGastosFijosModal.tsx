"use client";

import { useState, CSSProperties, useMemo } from 'react';
import { Lock, AlertTriangle, CheckCircle, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { GastosFijos } from '@/lib/service-finanzas';

interface ConsolidarGastosFijosModalProps {
  mes: number;
  anio: number;
  totalGastos: number;
  gastosPendientes: number;
  gastosAprobados: number;
  gastosPagados: number;
  montoTotal: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConsolidarGastosFijosModal({
  mes,
  anio,
  totalGastos,
  gastosPendientes,
  gastosAprobados,
  gastosPagados,
  montoTotal,
  onClose,
  onSuccess,
}: ConsolidarGastosFijosModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [consolidando, setConsolidando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacionTexto, setConfirmacionTexto] = useState('');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const TEXTO_CONFIRMACION = 'CONSOLIDAR';

  const puedeConsolidar = gastosPendientes === 0 && (gastosAprobados > 0 || gastosPagados > 0);
  const motivoNoConsolidar = gastosPendientes > 0 
    ? `Hay ${gastosPendientes} gasto(s) pendiente(s) de aprobación`
    : gastosAprobados === 0 && gastosPagados === 0
    ? 'No hay gastos aprobados ni pagados para consolidar'
    : '';

  const handleConsolidar = async () => {
    if (!token || !puedeConsolidar) return;
    
    if (confirmacionTexto !== TEXTO_CONFIRMACION) {
      setError(`Debe escribir "${TEXTO_CONFIRMACION}" para confirmar`);
      return;
    }
    
    setConsolidando(true);
    setError(null);
    
    try {
      await GastosFijos.consolidarResumenMensual(token, { mes, anio });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error al consolidar:', err);
      setError(err.message || 'Error al consolidar el periodo');
    } finally {
      setConsolidando(false);
    }
  };

  // Estilos
  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const titleColorStyle: CSSProperties = {
    color: isDark ? '#60a5fa' : 'var(--ot-blue-600)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: '#f59e0b15', color: '#f59e0b' }}
      >
        <Lock size={20} />
      </div>
    ),
    [],
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Consolidar Gastos Fijos - ${meses[mes - 1]} ${anio}`}
      icon={headerIcon}
      maxWidth="2xl"
    >
      <div className="p-6 space-y-6">
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

          {/* Información del periodo */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={titleColorStyle}>
              <FileText size={18} />
              Resumen del Periodo
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Total de gastos:</span>
                <span className="font-semibold" style={labelStyle}>{totalGastos}</span>
              </div>
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Pendientes:</span>
                <span className="font-semibold" style={{ color: gastosPendientes > 0 ? '#f59e0b' : '#10b981' }}>
                  {gastosPendientes}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Aprobados:</span>
                <span className="font-semibold" style={{ color: '#10b981' }}>{gastosAprobados}</span>
              </div>
              <div className="flex justify-between">
                <span style={mutedTextStyle}>Pagados:</span>
                <span className="font-semibold" style={{ color: '#3b82f6' }}>{gastosPagados}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={mutedTextStyle} className="font-semibold">Monto Total:</span>
                <span className="font-bold text-lg" style={{ color: '#8b5cf6' }}>
                  {montoTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Explicación de consolidación */}
          <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#e0e7ff', color: '#3730a3' }}>
            <DollarSign size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">💰 Impacto en el Banco OnlyTop</p>
              <p className="text-xs mt-1">
                Al consolidar, el monto simulado de gastos fijos ({montoTotal}) se transferirá 
                desde la <strong>proyección</strong> al <strong>dinero en movimiento real</strong> del banco.
              </p>
              <p className="text-xs mt-2">
                • <strong>Antes</strong>: Simulación = {montoTotal}, Movimiento sin afectar<br/>
                • <strong>Después</strong>: Simulación = $0.00, Movimiento afectado con -{montoTotal}
              </p>
            </div>
          </div>

          {/* Advertencia o confirmación */}
          {!puedeConsolidar ? (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">No se puede consolidar</p>
                <p className="text-sm mt-1">{motivoNoConsolidar}</p>
                <p className="text-xs mt-2" style={{ color: '#7c2d12' }}>
                  ✓ Todos los gastos deben estar <strong>APROBADOS</strong> o <strong>PAGADOS</strong><br/>
                  ✗ No puede haber gastos <strong>PENDIENTES</strong>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">✓ Listo para consolidar</p>
                  <p className="text-sm mt-1">
                    El periodo cumple con los requisitos. Todos los gastos están aprobados o pagados.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fef3c7', color: '#92400e' }}>
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">⚠️ Acción Irreversible</p>
                  <p className="text-xs mt-1">
                    Al consolidar el periodo:
                  </p>
                  <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>Los gastos del mes {meses[mes - 1]} quedarán bloqueados</li>
                    <li>NO podrá editar ni eliminar gastos consolidados</li>
                    <li>El dinero será transferido desde simulación a movimiento real</li>
                    <li>Esta acción cierra definitivamente el periodo contable</li>
                  </ul>
                </div>
              </div>

              {/* Campo de confirmación */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={labelStyle}>
                  Escriba "{TEXTO_CONFIRMACION}" para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmacionTexto}
                  onChange={(e) => {
                    setConfirmacionTexto(e.target.value);
                    setError(null);
                  }}
                  placeholder={TEXTO_CONFIRMACION}
                  className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{
                    ...inputStyle,
                    borderColor: confirmacionTexto === TEXTO_CONFIRMACION ? '#10b981' : 'var(--border)',
                  }}
                  disabled={consolidando}
                />
                {confirmacionTexto && confirmacionTexto !== TEXTO_CONFIRMACION && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>
                    El texto no coincide. Debe escribir exactamente: {TEXTO_CONFIRMACION}
                  </p>
                )}
              </div>
            </>
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
              disabled={consolidando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConsolidar}
              className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={{
                background: puedeConsolidar && confirmacionTexto === TEXTO_CONFIRMACION 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                  : '#9ca3af',
                color: 'white',
              }}
              disabled={consolidando || !puedeConsolidar || confirmacionTexto !== TEXTO_CONFIRMACION}
            >
              {consolidando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Consolidando...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Consolidar Periodo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
  );
}
