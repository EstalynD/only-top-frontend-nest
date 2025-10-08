"use client";
import React from 'react';
import { Users, Download, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getGroupSales, downloadGroupSalesPdf } from '@/lib/service-chatter/api';
import type { GroupSalesData } from '@/lib/service-chatter/types';
import Loader from '@/components/ui/Loader';
import StatsCard from '@/components/chatter/StatsCard';
import { addToast } from '@/components/ui/Toast';
import { TURNO_COLORS, TURNO_LABELS } from '@/lib/service-chatter/constants';

export default function GruposChattingPage() {
  const { token } = useAuth();
  const [modeloId, setModeloId] = React.useState('');
  const [groupData, setGroupData] = React.useState<GroupSalesData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [fechaInicio, setFechaInicio] = React.useState('');
  const [fechaFin, setFechaFin] = React.useState('');

  const handleSearch = async () => {
    if (!token || !modeloId.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Debes ingresar un ID de modelo',
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getGroupSales(token, modeloId, fechaInicio, fechaFin);
      setGroupData(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar datos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!token || !modeloId) return;

    try {
      setExportingPdf(true);
      const blob = await downloadGroupSalesPdf(token, modeloId, fechaInicio, fechaFin);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-grupo-${modeloId}-${new Date().toISOString().slice(0, 10)}.pdf`;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Análisis por Grupos de Chatters
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Visualiza el rendimiento por modelo y su equipo de chatters asignado
        </p>
      </div>

      {/* Search Form */}
      <div style={containerStyle}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Buscar Grupo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              ID de Modelo *
            </label>
            <input
              type="text"
              value={modeloId}
              onChange={(e) => setModeloId(e.target.value)}
              placeholder="Ingresa el ID de la modelo"
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
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
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
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--ot-blue-500)',
                color: 'white',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? <Loader size="sm" /> : <><Search size={16} className="inline mr-2" />Buscar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      )}

      {groupData && !loading && (
        <>
          {/* Modelo Info */}
          <div style={containerStyle}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {groupData.modelo.nombreCompleto}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {groupData.modelo.correoElectronico}
                </p>
              </div>
              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: '#10b981',
                  color: 'white',
                  opacity: exportingPdf ? 0.6 : 1,
                }}
              >
                {exportingPdf ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Download size={16} className="inline mr-2" />
                    Exportar PDF
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Total del Grupo"
                value={formatCurrency(groupData.totalGrupo)}
                icon={TrendingUp}
                iconColor="#10b981"
              />
              <StatsCard
                title="Total de Ventas"
                value={groupData.totalVentas.toLocaleString()}
                icon={Users}
                iconColor="var(--ot-blue-500)"
              />
              <StatsCard
                title="Promedio por Venta"
                value={formatCurrency(groupData.totalGrupo / (groupData.totalVentas || 1))}
                icon={TrendingUp}
                iconColor="#f59e0b"
              />
            </div>
          </div>

          {/* Chatters Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(groupData.grupo).map(([turno, data]) => {
              const turnoColor = TURNO_COLORS[turno as keyof typeof TURNO_COLORS];
              const chatter = data.chatter as any;
              const chatterName = chatter ? `${chatter.nombre} ${chatter.apellido}` : 'No asignado';

              return (
                <div
                  key={turno}
                  style={containerStyle}
                  className="hover:shadow-lg transition-all"
                >
                  <div
                    className="px-3 py-1.5 rounded-lg inline-block mb-3"
                    style={{
                      background: turnoColor.bg,
                      color: turnoColor.text,
                      border: `1px solid ${turnoColor.border}`,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {TURNO_LABELS[turno as keyof typeof TURNO_LABELS]}
                  </div>

                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {chatterName}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Ventas
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {data.ventas.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Total
                      </span>
                      <span className="font-semibold" style={{ color: '#10b981' }}>
                        {formatCurrency(data.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Promedio
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(data.total / (data.ventas.length || 1))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

