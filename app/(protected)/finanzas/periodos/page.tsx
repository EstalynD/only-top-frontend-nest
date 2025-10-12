/**
 * Periodos Consolidados Page
 * 
 * Página con listado histórico de periodos consolidados.
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { 
  obtenerPeriodosConsolidados,
  type PeriodoConsolidado,
} from '@/lib/service-finanzas';
import { PeriodosConsolidadosTable } from '@/components/finanzas/PeriodosConsolidadosTable';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PeriodosConsolidadosPage() {
  const { token } = useAuth();
  const [periodos, setPeriodos] = React.useState<PeriodoConsolidado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const cargarPeriodos = React.useCallback(async () => {
    if (!token) return;

    try {
      const data = await obtenerPeriodosConsolidados(token);
      // Asegurar que data sea un array
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar periodos consolidados:', error);
      // En caso de error, establecer array vacío
      setPeriodos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  React.useEffect(() => {
    cargarPeriodos();
  }, [cargarPeriodos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarPeriodos();
  };

  // Calcular totales globales
  const totalesGlobales = React.useMemo(() => {
    // Validar que periodos exista y sea un array
    if (!periodos || !Array.isArray(periodos) || periodos.length === 0) {
      return null;
    }

    const totalVentasNetas = periodos.reduce((sum, p) => {
      const value = parseFloat(p.totalVentasNetasUSD?.replace(/[^0-9.-]/g, '') || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const totalGananciaOT = periodos.reduce((sum, p) => {
      const value = parseFloat(p.totalGananciaOnlyTopUSD?.replace(/[^0-9.-]/g, '') || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const totalModelos = periodos.reduce((sum, p) => sum + (p.cantidadModelos || 0), 0);

    return {
      ventasNetas: `$${totalVentasNetas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gananciaOT: `$${totalGananciaOT.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      modelos: totalModelos,
      periodos: periodos.length,
    };
  }, [periodos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Periodos Consolidados
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Histórico de periodos cerrados y consolidados
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="neutral"
          size="sm"
          icon={<RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />}
          loading={refreshing}
          ariaLabel="Actualizar lista"
        />
      </div>

      {/* Totales Globales */}
      {totalesGlobales && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="p-6 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Total Periodos
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {totalesGlobales.periodos}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  background: 'var(--ot-blue-500)15',
                  color: 'var(--ot-blue-500)',
                }}
              >
                <Calendar size={20} />
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Ventas Totales (Histórico)
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--ot-blue-500)' }}>
              {totalesGlobales.ventasNetas}
            </p>
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Ganancia Total (Histórico)
            </p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
              {totalesGlobales.gananciaOT}
            </p>
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Modelos Procesados
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalesGlobales.modelos}
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Periodos */}
      <PeriodosConsolidadosTable periodos={periodos} loading={loading} />
    </div>
  );
}
