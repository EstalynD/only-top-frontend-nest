/**
 * CalcularFinanzasMasivoModal Component
 * 
 * Modal para calcular o recalcular finanzas de TODOS los modelos de un período.
 * Acción masiva/global.
 */

'use client';

import React from 'react';
import { X, Calculator, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { recalcularFinanzas, getNombreMes, type RecalcularFinanzasDto, type RecalcularFinanzasRespuesta } from '@/lib/service-finanzas';
import { useAuth } from '@/lib/auth';

interface CalcularFinanzasMasivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesInicial?: number;
  anioInicial?: number;
  onSuccess: () => void;
}

export function CalcularFinanzasMasivoModal({
  isOpen,
  onClose,
  mesInicial,
  anioInicial,
  onSuccess,
}: CalcularFinanzasMasivoModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultado, setResultado] = React.useState<RecalcularFinanzasRespuesta | null>(null);

  const currentDate = new Date();
  const [mes, setMes] = React.useState(mesInicial || currentDate.getMonth() + 1);
  const [anio, setAnio] = React.useState(anioInicial || currentDate.getFullYear());
  const [porcentajeComisionBanco, setPorcentajeComisionBanco] = React.useState(2);
  const [notas, setNotas] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMes(mesInicial || currentDate.getMonth() + 1);
      setAnio(anioInicial || currentDate.getFullYear());
    }
  }, [isOpen, mesInicial, anioInicial]);

  React.useEffect(() => {
    if (!isOpen) {
      setError(null);
      setResultado(null);
      setLoading(false);
      setNotas('');
      setPorcentajeComisionBanco(2);
    }
  }, [isOpen]);

  const handleCalcularTodos = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const dto: RecalcularFinanzasDto = {
        mes,
        anio,
        porcentajeComisionBanco,
      };

      const result = await recalcularFinanzas(token, dto);
      setResultado(result);
      
      // Auto-cerrar después de 3 segundos si fue exitoso
      if (result.exitosas > 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al calcular finanzas masivamente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'var(--ot-blue-500)15' }}
            >
              <Calculator size={24} style={{ color: 'var(--ot-blue-500)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Calcular Finanzas Masivo
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Calcula todas las modelos del período
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {resultado ? (
            // Resultado exitoso
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border"
                style={{
                  background: resultado.exitosas > 0 ? '#10b98115' : '#f59e0b15',
                  borderColor: resultado.exitosas > 0 ? '#10b981' : '#f59e0b',
                }}
              >
                <div className="flex items-start gap-3">
                  {resultado.exitosas > 0 ? (
                    <CheckCircle size={24} style={{ color: '#10b981' }} className="shrink-0" />
                  ) : (
                    <AlertCircle size={24} style={{ color: '#f59e0b' }} className="shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: resultado.exitosas > 0 ? '#10b981' : '#f59e0b' }}
                    >
                      {resultado.exitosas > 0 ? 'Cálculo Completado' : 'Cálculo Completado con Errores'}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {resultado.exitosas} de {resultado.procesadas} modelos calculadas exitosamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas del resultado */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ background: 'var(--surface-muted)' }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Procesadas
                  </p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {resultado.procesadas}
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: '#10b98115' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#10b981' }}>
                    Exitosas
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    {resultado.exitosas}
                  </p>
                </div>
              </div>

              {/* Errores si los hay */}
              {resultado.errores && resultado.errores.length > 0 && (
                <div
                  className="p-4 rounded-lg border max-h-48 overflow-y-auto"
                  style={{ background: '#ef444415', borderColor: '#ef4444' }}
                >
                  <h4 className="text-sm font-semibold mb-2" style={{ color: '#ef4444' }}>
                    Errores ({resultado.errores.length}):
                  </h4>
                  <ul className="text-xs space-y-1" style={{ color: '#ef4444' }}>
                    {resultado.errores.map((error: string, idx: number) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Advertencia */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: '#f59e0b15', borderColor: '#f59e0b' }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#f59e0b' }}>
                      Acción Masiva
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Esta acción calculará las finanzas de <strong>TODAS las modelos activas</strong> del período seleccionado.
                      Si ya existen finanzas calculadas, se recalcularán automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Periodo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Mes
                  </label>
                  <select
                    value={mes}
                    onChange={(e) => setMes(parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                    style={{
                      background: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {getNombreMes(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Año
                  </label>
                  <select
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                    style={{
                      background: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comisión Bancaria */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Comisión Bancaria (%)
                </label>
                <input
                  type="number"
                  value={porcentajeComisionBanco}
                  onChange={(e) => setPorcentajeComisionBanco(parseFloat(e.target.value))}
                  disabled={loading}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Porcentaje de comisión bancaria aplicado a las ventas netas
                </p>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  disabled={loading}
                  rows={3}
                  placeholder="Notas internas sobre este cálculo..."
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] resize-none"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
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
        </div>

        {/* Footer */}
        {!resultado && (
          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCalcularTodos}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
                color: '#ffffff',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator size={16} />
                  Calcular Todas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
