"use client";

import React from 'react';
import { useAuth } from '@/lib/auth';
import { 
  obtenerCostosFijos,
  registrarGasto,
  actualizarGasto,
  crearCategoria,
  consolidarCostos,
  type CostosFijosMensuales,
  type RegistrarGastoRequest,
  type ActualizarGastoRequest,
  type CrearCategoriaRequest,
  MESES,
  COSTOS_FIJOS_MESSAGES,
  CATEGORIAS_BASE,
} from '@/lib/service-finanzas';
import { ChevronLeft, ChevronRight, Plus, Lock, Download, BarChart3 } from 'lucide-react';
import RegistrarGastoModal from './RegistrarGastoModal';
import CrearCategoriaModal from './CrearCategoriaModal';
import ConsolidarMesModal from './ConsolidarMesModal';

/**
 * CostosFijosView - Vista principal del módulo de costos fijos mensuales
 * 
 * Funcionalidades:
 * - Selector de mes/año
 * - Vista de categorías con gastos
 * - Estadísticas y totales
 * - Registro de gastos
 * - Consolidación de periodo
 */

export function CostosFijosView() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [costos, setCostos] = React.useState<CostosFijosMensuales | null>(null);
  
  // Selector de periodo
  const [mes, setMes] = React.useState(new Date().getMonth() + 1);
  const [anio, setAnio] = React.useState(new Date().getFullYear());

  // Estados de modales
  const [modalGastoAbierto, setModalGastoAbierto] = React.useState(false);
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = React.useState(false);
  const [modalConsolidarAbierto, setModalConsolidarAbierto] = React.useState(false);
  const [gastoEditando, setGastoEditando] = React.useState<{
    concepto: string;
    montoUSD: number;
    notas?: string;
    nombreCategoria: string;
    indiceGasto: number;
  } | null>(null);

  // Cargar costos del mes
  const cargarCostos = React.useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await obtenerCostosFijos(token, mes, anio);
      setCostos(data);
    } catch (error) {
      console.error('Error al cargar costos:', error);
      alert(COSTOS_FIJOS_MESSAGES.errorCargarCostos);
    } finally {
      setLoading(false);
    }
  }, [token, mes, anio]);

  React.useEffect(() => {
    cargarCostos();
  }, [cargarCostos]);

  const cambiarMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAnio++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAnio--;
    }

    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  // ========== HANDLERS DE MODALES ==========

  const handleAbrirModalGasto = () => {
    setGastoEditando(null);
    setModalGastoAbierto(true);
  };

  const handleAbrirModalCategoria = () => {
    setModalCategoriaAbierto(true);
  };

  const handleAbrirModalConsolidar = () => {
    setModalConsolidarAbierto(true);
  };

  const handleGuardarGasto = async (data: Omit<RegistrarGastoRequest, 'mes' | 'anio'> | Omit<ActualizarGastoRequest, 'mes' | 'anio'>) => {
    if (!token) return;

    try {
      if ('indiceGasto' in data) {
        // Actualizar gasto existente
        const payload: ActualizarGastoRequest = {
          mes,
          anio,
          ...data,
        };
        await actualizarGasto(token, payload);
        alert(COSTOS_FIJOS_MESSAGES.gastoActualizado);
      } else {
        // Registrar nuevo gasto
        const payload: RegistrarGastoRequest = {
          mes,
          anio,
          ...data,
        };
        await registrarGasto(token, payload);
        alert(COSTOS_FIJOS_MESSAGES.gastoRegistrado);
      }

      setModalGastoAbierto(false);
      setGastoEditando(null);
      await cargarCostos();
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert(COSTOS_FIJOS_MESSAGES.errorRegistrarGasto);
    }
  };

  const handleGuardarCategoria = async (data: Omit<CrearCategoriaRequest, 'mes' | 'anio'>) => {
    if (!token) return;

    try {
      const payload: CrearCategoriaRequest = {
        mes,
        anio,
        ...data,
      };
      await crearCategoria(token, payload);
      alert(COSTOS_FIJOS_MESSAGES.categoriaCreada);
      setModalCategoriaAbierto(false);
      await cargarCostos();
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert(COSTOS_FIJOS_MESSAGES.errorCrearCategoria);
    }
  };

  const handleConsolidar = async (notasCierre?: string) => {
    if (!token) return;

    try {
      await consolidarCostos(token, mes, anio, { notasCierre });
      alert(COSTOS_FIJOS_MESSAGES.costosConsolidados);
      setModalConsolidarAbierto(false);
      await cargarCostos();
    } catch (error) {
      console.error('Error al consolidar:', error);
      alert(COSTOS_FIJOS_MESSAGES.errorConsolidar);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando costos fijos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header con selector de periodo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            💰 Costos Fijos Mensuales
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona los gastos operativos mensuales de la empresa
          </p>
        </div>

        {/* Selector de mes/año */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center min-w-[180px]">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {MESES[mes - 1]} {anio}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {costos?.consolidado ? (
                <span className="flex items-center justify-center gap-1">
                  <Lock size={14} />
                  Consolidado
                </span>
              ) : (
                'Periodo Abierto'
              )}
            </div>
          </div>

          <button
            onClick={() => cambiarMes(1)}
            className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      {costos && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total de Gastos
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {costos.totalGastosFormateado}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Categorías
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {costos.categorias.length}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total de Gastos
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {costos.categorias.reduce((sum, cat) => sum + cat.cantidadGastos, 0)}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Promedio/Día
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {costos.meta.promedioGastoPorDiaFormateado}
            </div>
          </div>
        </div>
      )}

      {/* Acciones principales */}
      <div className="flex items-center gap-3">
        <button
          disabled={costos?.consolidado}
          onClick={handleAbrirModalGasto}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: costos?.consolidado ? 'var(--surface-muted)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
          }}
        >
          <Plus size={18} />
          Registrar Gasto
        </button>

        <button
          disabled={costos?.consolidado}
          onClick={handleAbrirModalCategoria}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <BarChart3 size={18} />
          Nueva Categoría
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <Download size={18} />
          Exportar CSV
        </button>

        {!costos?.consolidado && (
          <button
            onClick={handleAbrirModalConsolidar}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ml-auto"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#ffffff',
            }}
          >
            <Lock size={18} />
            Consolidar Mes
          </button>
        )}
      </div>

      {/* Lista de categorías */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Categorías de Gastos
        </h2>

        {costos?.categorias.map((categoria) => (
          <div
            key={categoria.nombre}
            className="p-6 rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header de categoría */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: `${categoria.color || '#6b7280'}20`,
                  }}
                >
                  {CATEGORIAS_BASE.find((c) => c.nombre === categoria.nombre)?.icon || '📦'}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {categoria.nombre}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {categoria.descripcion}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {categoria.totalCategoriaFormateado}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {categoria.porcentajeDelTotal.toFixed(1)}% del total
                </div>
              </div>
            </div>

            {/* Lista de gastos */}
            {categoria.gastos.length > 0 ? (
              <div className="space-y-2">
                {categoria.gastos.map((gasto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: 'var(--surface-muted)',
                    }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {gasto.concepto}
                      </div>
                      {gasto.notas && (
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {gasto.notas}
                        </div>
                      )}
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(gasto.fechaRegistro).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {gasto.montoFormateado}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {gasto.porcentajeCategoria.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8"
                style={{ color: 'var(--text-muted)' }}
              >
                No hay gastos registrados en esta categoría
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modales */}
      {modalGastoAbierto && costos && (
        <RegistrarGastoModal
          gasto={gastoEditando}
          categorias={costos.categorias}
          onSave={handleGuardarGasto}
          onClose={() => {
            setModalGastoAbierto(false);
            setGastoEditando(null);
          }}
        />
      )}

      {modalCategoriaAbierto && (
        <CrearCategoriaModal
          onSave={handleGuardarCategoria}
          onClose={() => setModalCategoriaAbierto(false)}
        />
      )}

      {modalConsolidarAbierto && costos && (
        <ConsolidarMesModal
          periodo={costos.periodo}
          totalGastos={costos.totalGastosFormateado}
          categorias={costos.categorias.length}
          gastos={costos.categorias.reduce((sum, cat) => sum + cat.cantidadGastos, 0)}
          onConfirm={handleConsolidar}
          onClose={() => setModalConsolidarAbierto(false)}
        />
      )}
    </div>
  );
}
