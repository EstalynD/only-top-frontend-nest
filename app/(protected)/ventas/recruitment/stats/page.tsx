"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Calendar, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { getStatsBySalesCloser, getSalesClosers, getGeneralStats, exportToExcel, exportToPdf } from '@/lib/service-recruitment/api';
import StatsCards from '@/components/recruitment/StatsCards';
import type { RecruitmentStats, GeneralStats, SalesCloser } from '@/lib/service-recruitment/types';

type Filters = {
  salesCloser: string;
  fechaDesde: string;
  fechaHasta: string;
};

const baseCardStyle: CSSProperties = {
  background: 'var(--surface)',
  borderColor: 'var(--border)',
  boxShadow: 'var(--shadow)'
};

const inputStyle: CSSProperties = {
  background: 'var(--input-bg)',
  borderColor: 'var(--input-border)',
  color: 'var(--text-primary)'
};

const toggleActiveStyle: CSSProperties = {
  background: 'var(--ot-purple-500)',
  color: '#ffffff',
  border: '1px solid transparent'
};

const toggleInactiveStyle: CSSProperties = {
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)'
};

const flatCardStyle: CSSProperties = {
  ...baseCardStyle,
  boxShadow: 'none'
};

const createAccentCard = (hex: string): CSSProperties => ({
  background: `linear-gradient(135deg, ${hex}22, transparent)`,
  border: `1px solid ${hex}33`
});

const BLUE_ACCENT = createAccentCard('#1c41d9');
const GREEN_ACCENT = createAccentCard('#059669');
const PURPLE_ACCENT = createAccentCard('#7c3aed');
const ORANGE_ACCENT = createAccentCard('#ea580c');
const BLUE_TEXT = '#1c41d9';
const GREEN_TEXT = '#059669';
const PURPLE_TEXT = '#7c3aed';
const ORANGE_TEXT = '#ea580c';
const INITIAL_FILTERS: Filters = {
  salesCloser: '',
  fechaDesde: '',
  fechaHasta: ''
};

export default function StatsPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [salesClosers, setSalesClosers] = useState<SalesCloser[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'individual' | 'general'>('general');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadSalesClosers = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getSalesClosers(token);
      setSalesClosers(data);
    } catch (error: any) {
      toast({ type: 'error', title: 'Error al cargar Sales Closers' });
    }
  }, [token, toast]);

  useEffect(() => {
    loadSalesClosers();
  }, [loadSalesClosers]);

  useEffect(() => {
    if (!token) return;

    if (viewMode === 'individual' && !appliedFilters.salesCloser) {
      setStats(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchStats = async () => {
      try {
        if (viewMode === 'general') {
          const data = await getGeneralStats(
            token,
            appliedFilters.fechaDesde || undefined,
            appliedFilters.fechaHasta || undefined
          );
          if (isMounted) {
            setGeneralStats(data);
            setStats(null);
          }
        } else {
          const data = await getStatsBySalesCloser(
            token,
            appliedFilters.salesCloser,
            appliedFilters.fechaDesde || undefined,
            appliedFilters.fechaHasta || undefined
          );
          if (isMounted) {
            setStats(data);
          }
        }
      } catch (error: any) {
        toast({ type: 'error', title: 'Error al cargar estadísticas' });
        if (isMounted) {
          if (viewMode === 'general') {
            setGeneralStats(null);
          } else {
            setStats(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [token, viewMode, appliedFilters, toast]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (viewMode === 'individual' && !filters.salesCloser) {
      toast({ type: 'error', title: 'Selecciona un Sales Closer' });
      return;
    }
    setAppliedFilters(filters);
  }, [filters, viewMode, toast]);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setStats(null);
  }, []);

  const handleExportExcel = useCallback(async () => {
    if (!token) return;
    if (viewMode === 'individual' && !appliedFilters.salesCloser) {
      toast({ type: 'error', title: 'Selecciona un Sales Closer para exportar' });
      return;
    }

    try {
      setExporting(true);
      setShowExportMenu(false);
      await exportToExcel(token, {
        salesCloserId: viewMode === 'individual' ? appliedFilters.salesCloser || undefined : undefined,
        fechaDesde: appliedFilters.fechaDesde || undefined,
        fechaHasta: appliedFilters.fechaHasta || undefined,
      });
      toast({ type: 'success', title: 'Excel exportado exitosamente' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Error al exportar' });
    } finally {
      setExporting(false);
    }
  }, [token, viewMode, appliedFilters, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!token) return;
    if (viewMode === 'individual' && !appliedFilters.salesCloser) {
      toast({ type: 'error', title: 'Selecciona un Sales Closer para exportar' });
      return;
    }

    try {
      setExporting(true);
      setShowExportMenu(false);
      await exportToPdf(token, {
        salesCloserId: viewMode === 'individual' ? appliedFilters.salesCloser || undefined : undefined,
        fechaDesde: appliedFilters.fechaDesde || undefined,
        fechaHasta: appliedFilters.fechaHasta || undefined,
      });
      toast({ type: 'success', title: 'PDF exportado exitosamente' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Error al exportar' });
    } finally {
      setExporting(false);
    }
  }, [token, viewMode, appliedFilters, toast]);

  const switchToGeneral = useCallback(() => {
    setViewMode('general');
    setStats(null);
    setFilters((prev) => ({ ...prev, salesCloser: '' }));
    setAppliedFilters((prev) => ({ ...prev, salesCloser: '' }));
  }, []);

  const switchToIndividual = useCallback(() => {
    setViewMode('individual');
  }, []);

  const isApplyDisabled = useMemo(() => {
    return viewMode === 'individual' && !filters.salesCloser;
  }, [viewMode, filters.salesCloser]);

  const exportDisabled = useMemo(() => {
    return viewMode === 'individual' && !appliedFilters.salesCloser;
  }, [viewMode, appliedFilters.salesCloser]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/ventas/recruitment"
          className="inline-flex items-center gap-2 mb-4 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
          Volver a Actividades
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--ot-purple-500), var(--ot-pink-500))' }}
            >
              <TrendingUp size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Estadísticas de Recruitment</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Analiza el desempeño y las métricas de conversión
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportDisabled || exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Download size={18} />
              {exporting ? 'Exportando...' : 'Exportar'}
              <ChevronDown size={16} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2"
                >
                  <Download size={16} className="text-green-600" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <Download size={16} className="text-red-600" />
                  <span>PDF (.pdf)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={switchToGeneral}
          style={viewMode === 'general' ? toggleActiveStyle : toggleInactiveStyle}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
        >
          Vista General
        </button>
        <button
          onClick={switchToIndividual}
          style={viewMode === 'individual' ? toggleActiveStyle : toggleInactiveStyle}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
        >
          Por Sales Closer
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl p-6" style={baseCardStyle}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} style={{ color: 'var(--ot-purple-500)' }} />
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {viewMode === 'individual' && (
            <div>
              <label className="block text-sm font-medium mb-2">Sales Closer</label>
              <select
                value={filters.salesCloser}
                onChange={(e) => handleFilterChange('salesCloser', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                style={inputStyle}
              >
                <option value="">Selecciona un Sales Closer</option>
                {salesClosers.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.nombre} {sc.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Fecha Desde</label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              style={inputStyle}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              disabled={isApplyDisabled}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--ot-purple-500)' }}
            >
              Aplicar
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg font-medium transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {viewMode === 'general' && generalStats && !loading && (
        <div className="space-y-6">
          <div className="rounded-xl p-6" style={baseCardStyle}>
            <h3 className="text-xl font-bold mb-4">Resumen General del Equipo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg" style={{ ...flatCardStyle, ...BLUE_ACCENT }}>
                <p className="text-3xl font-bold" style={{ color: BLUE_TEXT }}>{generalStats.totalesGenerales.cuentasTexteadas}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cuentas Texteadas</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ ...flatCardStyle, ...GREEN_ACCENT }}>
                <p className="text-3xl font-bold" style={{ color: GREEN_TEXT }}>{generalStats.totalesGenerales.contactosObtenidos}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Contactos Obtenidos</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ ...flatCardStyle, ...PURPLE_ACCENT }}>
                <p className="text-3xl font-bold" style={{ color: PURPLE_TEXT }}>{generalStats.totalesGenerales.reunionesRealizadas}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reuniones Realizadas</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ ...flatCardStyle, ...ORANGE_ACCENT }}>
                <p className="text-3xl font-bold" style={{ color: ORANGE_TEXT }}>{generalStats.totalesGenerales.modelosCerradas}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Modelos Cerradas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={flatCardStyle}>
                <p className="text-lg font-semibold mb-2">Sales Closers Activos</p>
                <p className="text-4xl font-bold" style={{ color: PURPLE_TEXT }}>{generalStats.cantidadSalesClosers}</p>
              </div>
              <div className="p-4 rounded-lg" style={flatCardStyle}>
                <p className="text-lg font-semibold mb-2">Actividades Registradas</p>
                <p className="text-4xl font-bold" style={{ color: PURPLE_TEXT }}>{generalStats.cantidadActividades}</p>
              </div>
            </div>
          </div>

          {/* Top Sales Closers */}
          {generalStats.topSalesClosers.length > 0 && (
            <div className="rounded-xl p-6" style={baseCardStyle}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏆 Top Sales Closers
              </h3>
              <div className="space-y-3">
                {generalStats.topSalesClosers.map((sc, index) => (
                  <div
                    key={sc.salesCloserId}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ ...flatCardStyle, ...ORANGE_ACCENT }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-gray-500'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{sc.nombre}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sc.modelos} modelo{sc.modelos !== 1 ? 's' : ''} cerrada{sc.modelos !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        switchToIndividual();
                        setFilters((prev) => ({ ...prev, salesCloser: sc.salesCloserId }));
                        setAppliedFilters((prev) => ({ ...prev, salesCloser: sc.salesCloserId }));
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas Individuales */}
      {viewMode === 'individual' && stats && (
        <StatsCards stats={stats} loading={loading} />
      )}

      {/* Mensaje cuando no hay datos */}
      {viewMode === 'individual' && !stats && !loading && appliedFilters.salesCloser && (
        <div className="rounded-xl p-12 text-center" style={baseCardStyle}>
          <TrendingUp size={48} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
          <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            No se encontraron actividades para el Sales Closer seleccionado en el período especificado
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center rounded-xl px-8 py-6" style={baseCardStyle}>
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>Cargando estadísticas...</p>
          </div>
        </div>
      )}
    </div>
  );
}

