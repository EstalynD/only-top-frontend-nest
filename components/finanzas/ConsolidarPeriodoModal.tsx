/**
 * ConsolidarPeriodoModal Component
 * 
 * Modal para confirmar consolidación de un periodo (cierre de mes).
 * ADVERTENCIA: Acción irreversible.
 */

'use client';

import React, { useMemo, CSSProperties } from 'react';
import { AlertTriangle, DollarSign, Calendar, Lock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';

interface ConsolidarPeriodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mes: number;
  anio: number;
  totalesPeriodo?: {
    ventasNetas: string;
    gananciaOnlyTop: string;
    cantidadModelos: number;
  };
  onConfirm: (notasCierre?: string) => Promise<void>;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function ConsolidarPeriodoModal({
  isOpen,
  onClose,
  mes,
  anio,
  totalesPeriodo,
  onConfirm,
}: ConsolidarPeriodoModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notasCierre, setNotasCierre] = React.useState('');
  const [confirmacion, setConfirmacion] = React.useState('');

  const periodoString = `${MESES[mes - 1]} ${anio}`;
  const confirmacionTexto = 'CONSOLIDAR';

  React.useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
      setNotasCierre('');
      setConfirmacion('');
    }
  }, [isOpen]);

  const sectionStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
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

  const handleConfirmar = async () => {
    if (confirmacion !== confirmacionTexto) {
      setError(`Debes escribir "${confirmacionTexto}" para confirmar`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(notasCierre || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al consolidar periodo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Consolidar Periodo - ${periodoString}`}
      icon={headerIcon}
      maxWidth="max-w-2xl"
    >
      <div className="p-6 space-y-6">
          {/* Advertencia Principal */}
          <div
            className="p-4 rounded-lg border-2 flex gap-3"
            style={{ background: '#ef444415', borderColor: '#ef4444' }}
          >
            <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <p className="font-semibold mb-2" style={{ color: '#ef4444' }}>
                ⚠️ ACCIÓN IRREVERSIBLE
              </p>
              <ul className="text-sm space-y-1" style={{ color: '#dc2626' }}>
                <li>• Esta acción NO se puede deshacer</li>
                <li>• El dinero en movimiento se transferirá a dinero consolidado</li>
                <li>• Todas las finanzas del periodo quedarán marcadas con este periodoId</li>
                <li>• El periodo quedará cerrado y no podrá modificarse</li>
              </ul>
            </div>
          </div>

          {/* Totales del Periodo */}
          {totalesPeriodo && (
            <div
              className="p-4 rounded-lg border"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: isDark ? '#60a5fa' : 'var(--ot-blue-600)' }}>
                Resumen del Periodo
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Ventas Netas
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--ot-blue-500)' }}>
                    {totalesPeriodo.ventasNetas}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Ganancia OnlyTop
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                    {totalesPeriodo.gananciaOnlyTop}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Modelos
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {totalesPeriodo.cantidadModelos}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notas de Cierre (Opcional) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Notas de Cierre (Opcional)
            </label>
            <textarea
              value={notasCierre}
              onChange={(e) => setNotasCierre(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Observaciones o comentarios sobre el cierre del periodo..."
              className="w-full px-4 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={inputStyle}
            />
          </div>

          {/* Confirmación Explícita */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Para confirmar, escribe: <span className="font-mono font-bold">{confirmacionTexto}</span>
            </label>
            <input
              type="text"
              value={confirmacion}
              onChange={(e) => {
                setConfirmacion(e.target.value.toUpperCase());
                setError(null);
              }}
              disabled={loading}
              placeholder={confirmacionTexto}
              className="w-full px-4 py-2 rounded-lg border transition-all font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{
                ...inputStyle,
                borderColor: confirmacion === confirmacionTexto ? '#10b981' : 'var(--border)',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-lg border flex items-start gap-2"
              style={{ background: '#ef444415', borderColor: '#ef4444' }}
            >
              <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: '#ef4444' }}>
                {error}
              </p>
            </div>
          )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t px-6" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-muted)',
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmar}
            disabled={loading || confirmacion !== confirmacionTexto}
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: confirmacion === confirmacionTexto ? '#f59e0b' : '#6b7280',
              color: '#ffffff',
            }}
          >
            {loading ? 'Consolidando...' : '🔒 Consolidar Periodo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
