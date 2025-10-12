/**
 * Finanzas Page
 * 
 * Módulo de gestión financiera de modelos.
 */

'use client';

import React from 'react';
import { DollarSign, Calculator, RefreshCw, Download, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Select, SelectField } from '@/components/ui/selectUI';
import { 
  obtenerModelosConGanancias,
  obtenerEstadisticas,
  getNombreMes,
  actualizarComisionBancoPeriodo,
  type ModeloConGanancias,
  type EstadisticasFinanzas
} from '@/lib/service-finanzas';
import { FinanzasDashboard } from '@/components/finanzas/FinanzasDashboard';
import { ModelosGananciasTable } from '@/components/finanzas/ModelosGananciasTable';
import { CalcularFinanzasModal } from '@/components/finanzas/CalcularFinanzasModal';
import { CalcularFinanzasMasivoModal } from '@/components/finanzas/CalcularFinanzasMasivoModal';
import { FinanzasDetalleModal } from '@/components/finanzas/FinanzasDetalleModal';

export default function FinanzasPage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [modelos, setModelos] = React.useState<ModeloConGanancias[]>([]);
  const [estadisticas, setEstadisticas] = React.useState<EstadisticasFinanzas | null>(null);
  
  // Periodo actual
  const currentDate = new Date();
  const [mes, setMes] = React.useState(currentDate.getMonth() + 1);
  const [anio, setAnio] = React.useState(currentDate.getFullYear());

  // Modales
  const [calcularModalOpen, setCalcularModalOpen] = React.useState(false);
  const [calcularMasivoModalOpen, setCalcularMasivoModalOpen] = React.useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = React.useState(false);
  const [modeloSeleccionado, setModeloSeleccionado] = React.useState<ModeloConGanancias | null>(null);

  // Cargar datos
  const cargarDatos = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const [modelosData, statsData] = await Promise.all([
        obtenerModelosConGanancias(token, { mes, anio }),
        obtenerEstadisticas(token, mes, anio),
      ]);
      setModelos(modelosData);
      setEstadisticas(statsData);
    } catch (error: any) {
      console.error('Error al cargar finanzas:', error);
      setError(error?.message || 'Error al cargar los datos de finanzas');
      setModelos([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  }, [token, mes, anio]);

  React.useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCalcular = (modeloId: string) => {
    const modelo = modelos.find((m) => m.modeloId === modeloId);
    setModeloSeleccionado(modelo || null);
    setCalcularModalOpen(true);
  };

  const handleVerDetalle = (modelo: ModeloConGanancias) => {
    setModeloSeleccionado(modelo);
    setDetalleModalOpen(true);
  };

  const handleActualizarComisionBanco = async (porcentaje: number) => {
    if (!token) return;
    
    try {
      const resultado = await actualizarComisionBancoPeriodo(token, mes, anio, porcentaje);
      console.log(`Comisión actualizada: ${resultado.actualizadas} finanzas`);
      // Recargar datos para mostrar los nuevos cálculos
      await cargarDatos();
    } catch (error: any) {
      console.error('Error al actualizar comisión del banco:', error);
      alert(error?.message || 'Error al actualizar la comisión');
    }
  };

  const handleSuccess = () => {
    cargarDatos();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
              }}
            >
              <DollarSign size={28} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Finanzas
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Gestión financiera de modelos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Periodo */}
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              <Select
                value={mes.toString()}
                onChange={(value) => setMes(parseInt(value))}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: getNombreMes(i + 1)
                }))}
                placeholder="Seleccionar mes"
                size="sm"
                className="w-32"
              />
              <Select
                value={anio.toString()}
                onChange={(value) => setAnio(parseInt(value))}
                options={Array.from({ length: 11 }, (_, i) => {
                  const year = 2020 + i;
                  return {
                    value: year.toString(),
                    label: year.toString()
                  };
                })}
                placeholder="Año"
                size="sm"
                className="w-28"
              />
            </div>

            <Button
              onClick={cargarDatos}
              disabled={loading}
              variant="neutral"
              size="sm"
              icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
              loading={loading}
            >
              Actualizar
            </Button>

            <Button
              disabled
              variant="neutral"
              size="sm"
              icon={<Download size={16} />}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Dashboard de Estadísticas */}
        {estadisticas && (
          <div>
            <FinanzasDashboard estadisticas={estadisticas} loading={loading} />
          </div>
        )}

        {/* Tabla de Modelos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Modelos del Periodo
            </h2>
            <Button
              onClick={() => setCalcularMasivoModalOpen(true)}
              variant="primary"
              size="sm"
              icon={<Calculator size={16} />}
            >
              Calcular Todas
            </Button>
          </div>

          <ModelosGananciasTable
            modelos={modelos}
            loading={loading}
            periodo={{ mes, anio }}
            onCalcular={handleCalcular}
            onVerDetalle={handleVerDetalle}
            onActualizarComisionBanco={handleActualizarComisionBanco}
          />
        </div>
      </div>

      {/* Modales */}
      <CalcularFinanzasModal
        isOpen={calcularModalOpen}
        onClose={() => {
          setCalcularModalOpen(false);
          setModeloSeleccionado(null);
        }}
        modeloId={modeloSeleccionado?.modeloId}
        modeloNombre={modeloSeleccionado?.nombreCompleto}
        onSuccess={handleSuccess}
      />

      <CalcularFinanzasMasivoModal
        isOpen={calcularMasivoModalOpen}
        onClose={() => setCalcularMasivoModalOpen(false)}
        mesInicial={mes}
        anioInicial={anio}
        onSuccess={handleSuccess}
      />

      <FinanzasDetalleModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setModeloSeleccionado(null);
        }}
        modelo={modeloSeleccionado}
      />
    </div>
  );
}
