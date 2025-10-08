/**
 * Bank OnlyTop Page
 * 
 * Página principal del banco OnlyTop con consolidación de periodos.
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { 
  obtenerBankOnlyTop, 
  consolidarPeriodo,
  obtenerEstadisticas,
  type BankOnlyTop,
  type EstadisticasFinanzas,
} from '@/lib/service-finanzas';
import { BankOnlyTopCard } from '@/components/finanzas/BankOnlyTopCard';
import { ConsolidarPeriodoModal } from '@/components/finanzas/ConsolidarPeriodoModal';
import TransaccionesTable from '@/components/finanzas/TransaccionesTable';
import ResumenTransacciones from '@/components/finanzas/ResumenTransacciones';
import { Lock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function BankPage() {
  const { token } = useAuth();
  const [bank, setBank] = React.useState<BankOnlyTop | null>(null);
  const [estadisticas, setEstadisticas] = React.useState<EstadisticasFinanzas | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [consolidandoOpen, setConsolidandoOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentDate = new Date();
  const mesActual = currentDate.getMonth() + 1;
  const anioActual = currentDate.getFullYear();

  const cargarDatos = React.useCallback(async () => {
    if (!token) return;

    setError(null);
    try {
      const [bankData, statsData] = await Promise.all([
        obtenerBankOnlyTop(token),
        obtenerEstadisticas(token, mesActual, anioActual),
      ]);
      setBank(bankData);
      setEstadisticas(statsData);
    } catch (error: any) {
      console.error('Error al cargar datos del bank:', error);
      setError(error.message || 'Error al cargar datos del banco');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, mesActual, anioActual]);

  React.useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
  };

  const handleConsolidar = async (notasCierre?: string) => {
    if (!token) return;

    await consolidarPeriodo(token, mesActual, anioActual, notasCierre);
    await cargarDatos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Bank OnlyTop
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Gestión de consolidación financiera y balance general
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
            }}
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Botón Consolidar Periodo */}
          <button
            onClick={() => setConsolidandoOpen(true)}
            disabled={loading}
            className="px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#f59e0b',
              color: '#ffffff',
            }}
          >
            <Lock size={18} />
            Consolidar Periodo Actual
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded-lg border flex items-start gap-3"
          style={{ background: '#ef444415', borderColor: '#ef4444' }}
        >
          <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#ef4444' }}>
              Error al cargar datos
            </p>
            <p className="text-sm" style={{ color: '#dc2626' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Advertencia - Periodo no consolidado */}
      {!loading && estadisticas && estadisticas.contadores && estadisticas.contadores.modelosConFinanzas > 0 && (
        <div
          className="p-4 rounded-lg border flex items-start gap-3"
          style={{ background: '#f59e0b15', borderColor: '#f59e0b' }}
        >
          <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#f59e0b' }}>
              Periodo Actual en Movimiento
            </p>
            <p className="text-sm" style={{ color: '#d97706' }}>
              Hay <strong>{estadisticas.contadores.modelosConFinanzas} modelo(s)</strong> con finanzas calculadas en el periodo actual.
              Las ganancias se están acumulando en "Dinero en Movimiento". 
              Cuando estés listo para cerrar el mes, usa el botón "Consolidar Periodo Actual" para transferir el dinero a "Dinero Consolidado".
            </p>
          </div>
        </div>
      )}

      {/* Bank Card */}
      <BankOnlyTopCard bank={bank} loading={loading} />

      {/* Resumen de Transacciones */}
      {!loading && (
        <ResumenTransacciones mes={mesActual} anio={anioActual} />
      )}

      {/* Información del Periodo Actual */}
      {estadisticas && estadisticas.totales && estadisticas.contadores && (
        <div
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 Resumen del Periodo Actual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Ventas Netas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--ot-blue-500)' }}>
                {estadisticas.totales.ventasNetas ?? estadisticas.totales.ventasNetasFormateado}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Ganancia OnlyTop
              </p>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                {estadisticas.totales.gananciaOnlyTop ?? estadisticas.totales.gananciaOnlyTopFormateado}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Modelos con Finanzas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {estadisticas.contadores.modelosConFinanzas}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Total Modelos
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {estadisticas.contadores.totalModelos}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guía de Uso */}
      <div
        className="p-6 rounded-xl border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📚 ¿Cómo funciona el Bank OnlyTop?
        </h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
          <div className="flex gap-3">
            <span className="font-bold" style={{ color: 'var(--ot-blue-500)' }}>1.</span>
            <p>
              <strong>Dinero en Movimiento:</strong> Se actualiza automáticamente cada vez que calculas finanzas de un modelo.
              Representa las ganancias del periodo actual (mes en curso).
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold" style={{ color: 'var(--ot-blue-500)' }}>2.</span>
            <p>
              <strong>Consolidar Periodo:</strong> Al finalizar el mes, usa el botón "Consolidar Periodo Actual".
              Esto transferirá todo el dinero en movimiento a dinero consolidado y marcará el periodo como cerrado.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold" style={{ color: 'var(--ot-blue-500)' }}>3.</span>
            <p>
              <strong>Dinero Consolidado:</strong> Capital histórico inmutable de todos los periodos cerrados.
              Representa el patrimonio total acumulado de la empresa.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold" style={{ color: '#ef4444' }}>⚠️</span>
            <p>
              <strong>Importante:</strong> La consolidación es <strong className="text-red-500">IRREVERSIBLE</strong>.
              Asegúrate de que todas las finanzas del mes estén correctas antes de consolidar.
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Transacciones */}
      <div
        className="p-6 rounded-xl border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              💸 Transacciones del Periodo Actual
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Historial completo de ingresos y egresos en movimiento
            </p>
          </div>
        </div>

        <TransaccionesTable
          mes={mesActual}
          anio={anioActual}
          onTransaccionRevertida={handleRefresh}
        />
      </div>

      {/* Modal de Consolidación */}
      <ConsolidarPeriodoModal
        isOpen={consolidandoOpen}
        onClose={() => setConsolidandoOpen(false)}
        mes={mesActual}
        anio={anioActual}
        totalesPeriodo={
          estadisticas && estadisticas.totales && estadisticas.contadores
            ? {
                ventasNetas: estadisticas.totales.ventasNetas ?? estadisticas.totales.ventasNetasFormateado,
                gananciaOnlyTop: estadisticas.totales.gananciaOnlyTop ?? estadisticas.totales.gananciaOnlyTopFormateado,
                cantidadModelos: estadisticas.contadores.modelosConFinanzas,
              }
            : undefined
        }
        onConfirm={handleConsolidar}
      />
    </div>
  );
}
