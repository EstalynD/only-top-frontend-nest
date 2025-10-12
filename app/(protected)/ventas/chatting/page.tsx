"use client";
import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Plus,
  Filter,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { 
  getSales, 
  getGeneralStats, 
  downloadGeneralStatsPdf,
  downloadExcelTemplate,
} from '@/lib/service-chatter/api';
import type { ChatterSale, GeneralStats, FilterSalesDto } from '@/lib/service-chatter/types';
import Loader from '@/components/ui/Loader';
import StatsCard from '@/components/chatter/StatsCard';
import SalesTable from '@/components/chatter/SalesTable';
import CreateSaleModal from '@/components/chatter/CreateSaleModal';
import ImportExcelModal from '@/components/chatter/ImportExcelModal';
import { addToast } from '@/components/ui/Toast';
import { TIPO_VENTA_LABELS, TURNO_LABELS } from '@/lib/service-chatter/constants';

export default function ChattingVentasPage() {
  const { token } = useAuth();
  const [sales, setSales] = React.useState<ChatterSale[]>([]);
  const [stats, setStats] = React.useState<GeneralStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false);
  
  const [filters, setFilters] = React.useState<FilterSalesDto>({
    fechaInicio: '',
    fechaFin: '',
  });

  const loadData = React.useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [salesData, statsData] = await Promise.all([
        getSales(token, filters),
        getGeneralStats(token, filters.fechaInicio, filters.fechaFin),
      ]);
      
      setSales(salesData);
      setStats(statsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar datos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportPdf = async () => {
    if (!token) return;
    
    try {
      setExportingPdf(true);
      const blob = await downloadGeneralStatsPdf(
        token,
        filters.fechaInicio,
        filters.fechaFin
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-general-chatters-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast({
        type: 'success',
        title: 'PDF generado',
        description: 'El reporte ha sido descargado exitosamente',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al exportar',
        description: error.message,
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!token) return;
    
    try {
      setDownloadingTemplate(true);
      const blob = await downloadExcelTemplate(token);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla-ventas-chatters-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast({
        type: 'success',
        title: 'Plantilla descargada',
        description: 'Ya puedes llenar la plantilla e importarla',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al descargar',
        description: error.message,
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const containerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  };

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Ventas de Chatters
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gestión y análisis de ventas diarias del equipo de chatters
        </p>
      </div>

      {/* Stats Cards */}
      {loading && !stats ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Ventas"
            value={stats.totalVentas.toLocaleString()}
            subtitle="Transacciones registradas"
            icon={DollarSign}
            iconColor="var(--ot-blue-500)"
          />
          <StatsCard
            title="Monto Total"
            value={formatCurrency(stats.totalMonto)}
            subtitle="Ingresos generados"
            icon={TrendingUp}
            iconColor="#10b981"
          />
          <StatsCard
            title="Promedio por Venta"
            value={formatCurrency(stats.promedioVenta)}
            subtitle="Ticket promedio"
            icon={Award}
            iconColor="#f59e0b"
          />
          <StatsCard
            title="Chatters Activos"
            value={stats.topChatters.length}
            subtitle="Con ventas registradas"
            icon={Users}
            iconColor="#8b5cf6"
          />
        </div>
      ) : null}

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          style={{ background: 'var(--ot-blue-500)', color: 'white' }}
        >
          Registrar Venta
        </Button>

        <Button
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          variant="primary"
          size="md"
          icon={<FileSpreadsheet size={16} />}
          loading={downloadingTemplate}
          loadingText="Descargando..."
          style={{
            background: '#8b5cf6',
            color: 'white',
          }}
        >
          Descargar Plantilla
        </Button>

        <Button
          onClick={() => setShowImportModal(true)}
          variant="primary"
          size="md"
          icon={<Upload size={16} />}
          style={{
            background: '#06b6d4',
            color: 'white',
          }}
        >
          Importar Excel
        </Button>
        
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? "primary" : "neutral"}
          size="md"
          icon={<Filter size={16} />}
          style={showFilters ? {
            background: 'var(--ot-blue-500)',
            color: 'white',
          } : undefined}
        >
          Filtros
        </Button>

        <Button
          onClick={loadData}
          disabled={loading}
          variant="neutral"
          size="md"
          icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
          loading={loading}
        >
          Actualizar
        </Button>

        <Button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          variant="success"
          size="md"
          icon={<Download size={16} />}
          loading={exportingPdf}
          loadingText="Exportando..."
          className="ml-auto"
        >
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={containerStyle}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Filtros de Búsqueda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio || ''}
                onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.fechaFin || ''}
                onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Tipo de Venta
              </label>
              <select
                value={filters.tipoVenta || ''}
                onChange={(e) => setFilters({ ...filters, tipoVenta: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Todos</option>
                {Object.entries(TIPO_VENTA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setFilters({ fechaInicio: '', fechaFin: '' })}
              variant="neutral"
              size="md"
            >
              Limpiar
            </Button>
            <Button
              onClick={loadData}
              variant="primary"
              size="md"
              style={{ background: 'var(--ot-blue-500)', color: 'white' }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Registro de Ventas
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {sales.length} ventas encontradas
          </p>
        </div>
        <SalesTable
          sales={sales}
          loading={loading}
          onView={(sale) => {
            addToast({
              type: 'info',
              title: 'Venta',
              description: `ID: ${sale._id}`,
            });
          }}
        />
      </div>

      {/* Top Performers */}
      {stats && stats.topChatters.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={containerStyle}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Top 10 Chatters
            </h3>
            <div className="space-y-3">
              {stats.topChatters.slice(0, 10).map((chatter, index) => (
                <div
                  key={chatter.chatterId}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: index < 3 ? '#f59e0b' : 'var(--border)',
                        color: index < 3 ? 'white' : 'var(--text-primary)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {chatter.nombre}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {chatter.count} ventas
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold" style={{ color: '#10b981' }}>
                    {formatCurrency(chatter.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={containerStyle}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Top 10 Modelos
            </h3>
            <div className="space-y-3">
              {stats.topModelos.slice(0, 10).map((modelo, index) => (
                <div
                  key={modelo.modeloId}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: index < 3 ? '#8b5cf6' : 'var(--border)',
                        color: index < 3 ? 'white' : 'var(--text-primary)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {modelo.nombreCompleto}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {modelo.count} ventas
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold" style={{ color: '#10b981' }}>
                    {formatCurrency(modelo.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSaleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
      
      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

