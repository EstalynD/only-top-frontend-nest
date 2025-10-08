"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { TrendingUp, User, Filter, BarChart3, RefreshCw, TrendingDown, FileSpreadsheet, FileText, Download } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { SelectField } from '@/components/ui/selectUI';
import { addToast } from '@/components/ui/Toast';
import { ModeloVentasDashboard } from '@/components/clientes/ModeloVentasDashboard';
import { ModeloVentasFilters } from '@/components/clientes/ModeloVentasFilters';
import { ModeloVentasTable } from '@/components/clientes/ModeloVentasTable';
import { ModeloVentasIndicadores } from '@/components/clientes/ModeloVentasIndicadores';
import {
  getVentasDashboard,
  getModeloSales,
  getIndicadores,
  exportVentasExcel,
  exportVentasPdf,
} from '@/lib/service-modelos-ventas/api';
import type {
  DashboardResponse,
  ModeloSalesResponse,
  SalesFilters,
  IndicadoresResponse,
} from '@/lib/service-modelos-ventas/types';

type ViewMode = 'dashboard' | 'modelo' | 'indicadores';

export default function ModelosVentasPage() {
  const { token, ready } = useAuth();

  // Estados
  const [viewMode, setViewMode] = React.useState<ViewMode>('dashboard');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  // Dashboard data
  const [dashboardData, setDashboardData] = React.useState<DashboardResponse | null>(null);
  const [fechaInicioDashboard, setFechaInicioDashboard] = React.useState('');
  const [fechaFinDashboard, setFechaFinDashboard] = React.useState('');

  // Indicadores data
  const [indicadoresData, setIndicadoresData] = React.useState<IndicadoresResponse | null>(null);
  const [fechaInicioIndicadores, setFechaInicioIndicadores] = React.useState('');
  const [fechaFinIndicadores, setFechaFinIndicadores] = React.useState('');

  // Modelo individual data
  const [selectedModeloId, setSelectedModeloId] = React.useState('');
  const [modeloData, setModeloData] = React.useState<ModeloSalesResponse | null>(null);
  const [filters, setFilters] = React.useState<SalesFilters>({});

  // Modelos disponibles (desde el dashboard)
  const modelosOptions = React.useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.topModelos.map((m) => ({
      value: m.modeloId,
      label: m.nombreCompleto,
    }));
  }, [dashboardData]);

  // Chatters disponibles (desde modelo data)
  const chattersDisponibles = React.useMemo(() => {
    if (!modeloData?.modelo.equipoChatters) return [];
    const equipo = modeloData.modelo.equipoChatters;
    return [equipo.turnoAM, equipo.turnoPM, equipo.turnoMadrugada, equipo.supernumerario].filter(Boolean);
  }, [modeloData]);

  // Plataformas disponibles
  const plataformasDisponibles = React.useMemo(() => {
    if (!modeloData?.ventas) return [];
    const plataformas = new Set(modeloData.ventas.map((v) => v.plataforma).filter(Boolean));
    return Array.from(plataformas) as string[];
  }, [modeloData]);

  // Cargar dashboard inicial
  const loadDashboard = React.useCallback(
    async (showLoader = true) => {
      if (!ready || !token) return;

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const data = await getVentasDashboard(
          token,
          fechaInicioDashboard || undefined,
          fechaFinDashboard || undefined
        );

        setDashboardData(data);
      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        setError(err.message || 'Error al cargar el dashboard');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, ready, fechaInicioDashboard, fechaFinDashboard]
  );

  // Cargar ventas de modelo
  const loadModeloSales = React.useCallback(
    async (showLoader = true) => {
      if (!ready || !token || !selectedModeloId) return;

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const data = await getModeloSales(token, selectedModeloId, filters);
        setModeloData(data);
      } catch (err: any) {
        console.error('Error loading modelo sales:', err);
        setError(err.message || 'Error al cargar las ventas de la modelo');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, ready, selectedModeloId, filters]
  );

  // Cargar indicadores
  const loadIndicadores = React.useCallback(
    async (showLoader = true) => {
      if (!ready || !token) return;

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const data = await getIndicadores(
          token,
          fechaInicioIndicadores || undefined,
          fechaFinIndicadores || undefined
        );

        setIndicadoresData(data);
      } catch (err: any) {
        console.error('Error loading indicadores:', err);
        setError(err.message || 'Error al cargar los indicadores');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, ready, fechaInicioIndicadores, fechaFinIndicadores]
  );

  // Efecto inicial
  React.useEffect(() => {
    if (viewMode === 'dashboard') {
      loadDashboard();
    } else if (viewMode === 'modelo' && selectedModeloId) {
      loadModeloSales();
    } else if (viewMode === 'indicadores') {
      loadIndicadores();
    }
  }, [viewMode, loadDashboard, loadModeloSales, loadIndicadores, selectedModeloId]);

  const handleRefresh = () => {
    if (viewMode === 'dashboard') {
      loadDashboard(false);
    } else if (viewMode === 'indicadores') {
      loadIndicadores(false);
    } else {
      loadModeloSales(false);
    }
  };

  // Funciones de exportación
  const handleExportExcel = async () => {
    if (!token) return;
    
    setExporting(true);
    try {
      const blob = await exportVentasExcel(token, {
        ...filters,
        modeloId: selectedModeloId || undefined,
      });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas_modelos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addToast({
        type: 'success',
        title: 'Exportación exitosa',
        description: 'El archivo Excel se ha descargado correctamente',
      });
    } catch (err: any) {
      console.error('Error exporting to Excel:', err);
      addToast({
        type: 'error',
        title: 'Error al exportar',
        description: err.message || 'No se pudo exportar el archivo Excel',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!token) return;
    
    setExporting(true);
    try {
      const blob = await exportVentasPdf(token, {
        ...filters,
        modeloId: selectedModeloId || undefined,
      });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas_modelos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addToast({
        type: 'success',
        title: 'Exportación exitosa',
        description: 'El archivo PDF se ha descargado correctamente',
      });
    } catch (err: any) {
      console.error('Error exporting to PDF:', err);
      addToast({
        type: 'error',
        title: 'Error al exportar',
        description: err.message || 'No se pudo exportar el archivo PDF',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    loadModeloSales(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setTimeout(() => loadModeloSales(false), 100);
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ventas de Modelos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Análisis y seguimiento de ventas por modelo
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>

          {/* View Mode Selector */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                background: viewMode === 'dashboard' ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' : 'var(--surface)',
                color: viewMode === 'dashboard' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <BarChart3 size={16} />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('indicadores')}
              className="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-l"
              style={{
                borderColor: 'var(--border)',
                background: viewMode === 'indicadores' ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' : 'var(--surface)',
                color: viewMode === 'indicadores' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <TrendingDown size={16} />
              Indicadores
            </button>
            <button
              type="button"
              onClick={() => setViewMode('modelo')}
              className="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-l"
              style={{
                borderColor: 'var(--border)',
                background: viewMode === 'modelo' ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' : 'var(--surface)',
                color: viewMode === 'modelo' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <User size={16} />
              Por Modelo
            </button>
          </div>
        </div>
      </div>

      {/* Botones de Exportación (visible solo en vista de modelo con datos) */}
      {viewMode === 'modelo' && selectedModeloId && modeloData && (
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: exporting ? 'var(--text-muted)' : '#10b981',
            }}
          >
            <FileSpreadsheet size={16} />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: exporting ? 'var(--text-muted)' : '#ef4444',
            }}
          >
            <FileText size={16} />
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="rounded-lg border p-4 flex items-start gap-3"
          style={{ borderColor: '#ef4444', background: '#fef2f2' }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#ef4444' }}>
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#991b1b' }}>
              Error
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#dc2626' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && !dashboardData && !modeloData ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Cargando datos...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard View */}
          {viewMode === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              {/* Filtros de Dashboard */}
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicioDashboard}
                      onChange={(e) => setFechaInicioDashboard(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={fechaFinDashboard}
                      onChange={(e) => setFechaFinDashboard(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => loadDashboard(false)}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))',
                        color: '#ffffff',
                      }}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              </div>

              <ModeloVentasDashboard data={dashboardData} />
            </div>
          )}

          {/* Indicadores View */}
          {viewMode === 'indicadores' && (
            <div className="space-y-6">
              {/* Filtros de Indicadores */}
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicioIndicadores}
                      onChange={(e) => setFechaInicioIndicadores(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={fechaFinIndicadores}
                      onChange={(e) => setFechaFinIndicadores(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => loadIndicadores(false)}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))',
                        color: '#ffffff',
                      }}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              </div>

              {indicadoresData && <ModeloVentasIndicadores data={indicadoresData} />}

              {!indicadoresData && !loading && (
                <div
                  className="rounded-lg border p-8 text-center"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <TrendingDown size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                  <p className="mt-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                    No hay indicadores disponibles
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Ajusta los filtros para ver los indicadores
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modelo View */}
          {viewMode === 'modelo' && (
            <div className="space-y-6">
              {/* Selector de Modelo */}
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <SelectField
                  label="Seleccionar Modelo"
                  value={selectedModeloId}
                  onChange={(value) => {
                    setSelectedModeloId(value);
                    setFilters({});
                  }}
                  options={modelosOptions}
                  placeholder="Selecciona una modelo para ver sus ventas"
                  size="md"
                />
              </div>

              {selectedModeloId && modeloData && (
                <>
                  {/* Información de la Modelo */}
                  <div
                    className="rounded-lg border p-5"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    <div className="flex items-start gap-4">
                      {modeloData.modelo.fotoPerfil ? (
                        <img
                          src={modeloData.modelo.fotoPerfil}
                          alt={modeloData.modelo.nombreCompleto}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl"
                          style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                        >
                          {modeloData.modelo.nombreCompleto.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {modeloData.modelo.nombreCompleto}
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {modeloData.modelo.correoElectronico}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {modeloData.modelo.salesCloser && (
                            <div className="text-xs">
                              <span style={{ color: 'var(--text-muted)' }}>Sales Closer:</span>{' '}
                              <span style={{ color: 'var(--text-primary)' }}>
                                {modeloData.modelo.salesCloser.nombre} {modeloData.modelo.salesCloser.apellido}
                              </span>
                            </div>
                          )}
                          {modeloData.modelo.trafficker && (
                            <div className="text-xs">
                              <span style={{ color: 'var(--text-muted)' }}>Trafficker:</span>{' '}
                              <span style={{ color: 'var(--text-primary)' }}>
                                {modeloData.modelo.trafficker.nombre} {modeloData.modelo.trafficker.apellido}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                        Total Ventas
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {modeloData.resumen.totalVentas}
                      </p>
                    </div>
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                        Total Monto
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--ot-blue-700)' }}>
                        ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0 }).format(modeloData.resumen.totalMonto)}
                      </p>
                    </div>
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                        Promedio
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0 }).format(modeloData.resumen.promedioVenta)}
                      </p>
                    </div>
                  </div>

                  {/* Filtros */}
                  <ModeloVentasFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                    chatters={chattersDisponibles}
                    plataformas={plataformasDisponibles}
                  />

                  {/* Tabla */}
                  <ModeloVentasTable ventas={modeloData.ventas} loading={refreshing} />
                </>
              )}

              {selectedModeloId && !modeloData && !loading && (
                <div
                  className="rounded-lg border p-8 text-center"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <p style={{ color: 'var(--text-muted)' }}>Selecciona una modelo para ver sus ventas</p>
                </div>
              )}

              {!selectedModeloId && (
                <div
                  className="rounded-lg border p-8 text-center"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <User size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                  <p className="mt-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Selecciona una modelo
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Elige una modelo del selector para ver sus ventas detalladas
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

