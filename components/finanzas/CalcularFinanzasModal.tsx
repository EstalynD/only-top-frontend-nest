/**
 * CalcularFinanzasModal Component
 * 
 * Modal para calcular o recalcular finanzas de un modelo.
 */

'use client';

import React, { useMemo, CSSProperties } from 'react';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { calcularFinanzas, getNombreMes, type CalcularFinanzasDto } from '@/lib/service-finanzas';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { FinanzasStatusBadge } from '@/components/ui/FinanzasStatusBadge';
import { CurrencyCode } from '@/lib/utils/money';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { Select, type SelectOption } from '@/components/ui/selectUI';

interface CalcularFinanzasModalProps {
  isOpen: boolean;
  onClose: () => void;
  modeloId?: string;
  modeloNombre?: string;
  onSuccess: () => void;
}

export function CalcularFinanzasModal({
  isOpen,
  onClose,
  modeloId,
  modeloNombre,
  onSuccess,
}: CalcularFinanzasModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultado, setResultado] = React.useState<any>(null);

  const currentDate = new Date();
  const [mes, setMes] = React.useState(currentDate.getMonth() + 1);
  const [anio, setAnio] = React.useState(currentDate.getFullYear());
  const [recalcular, setRecalcular] = React.useState(false);
  const [notas, setNotas] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setError(null);
      setResultado(null);
      setLoading(false);
      setNotas('');
      setRecalcular(false);
    }
  }, [isOpen]);

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-600)' }}
      >
        <Calculator size={20} />
      </div>
    ),
    [],
  );

  const mesOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getNombreMes(i + 1),
  }));

  const handleCalcular = async () => {
    if (!token || !modeloId) return;

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const dto: CalcularFinanzasDto = {
        modeloId,
        mes,
        anio,
      };

      const result = await calcularFinanzas(token, dto);
      setResultado(result);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al calcular finanzas');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={modeloNombre ? `Calcular Finanzas - ${modeloNombre}` : 'Calcular Finanzas'}
      icon={headerIcon}
      maxWidth="max-w-lg"
    >
      <div className="p-6 space-y-4">
          {resultado ? (
            <div
              className="p-4 rounded-lg border"
              style={{ background: '#10b98115', borderColor: '#10b981' }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle size={20} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                    ¡Finanzas calculadas exitosamente!
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Ventas Netas:</span>
                      <MoneyDisplay
                        amount={parseFloat(resultado.ventasNetas)}
                        currency={CurrencyCode.USD}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Comisión Agencia:</span>
                      <MoneyDisplay
                        amount={parseFloat(resultado.comisionAgencia)}
                        currency={CurrencyCode.USD}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Ganancia Modelo:</span>
                      <MoneyDisplay
                        amount={parseFloat(resultado.gananciaModelo)}
                        currency={CurrencyCode.USD}
                        color="#10b981"
                      />
                    </div>
                    <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--text-muted)' }}>Estado:</span>
                        <FinanzasStatusBadge estado={resultado.estado} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Periodo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Mes
                  </label>
                  <Select
                    value={String(mes)}
                    onChange={(value) => setMes(parseInt(value))}
                    options={mesOptions}
                    size="md"
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Año
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value))}
                    min={2020}
                    max={2030}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Recalcular */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="recalcular"
                  checked={recalcular}
                  onChange={(e) => setRecalcular(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="recalcular" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  Recalcular si ya existe
                  <span className="block text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Si está marcado, reemplazará las finanzas existentes para este periodo
                  </span>
                </label>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Agregar notas sobre este cálculo..."
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="p-4 rounded-lg border"
                  style={{ background: '#ef444415', borderColor: '#ef4444' }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: '#ef4444' }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        {/* Footer */}
        {!resultado && (
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
              onClick={handleCalcular}
              disabled={loading || !modeloId}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--ot-blue-500)',
                color: '#ffffff',
              }}
            >
              {loading ? 'Calculando...' : 'Calcular'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
