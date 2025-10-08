"use client";
import React from 'react';
import { Plus, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { CampaignCard } from '@/components/traffic/CampaignCard';
import { CampaignFilters } from '@/components/traffic/CampaignFilters';
import { CampaignStats } from '@/components/traffic/CampaignStats';
import { CampaignFormModal } from '@/components/traffic/CampaignFormModal';
import Loader from '@/components/ui/Loader';
import { getCampaigns, getCampaignStatistics, deleteCampaign, getTraffickers } from '@/lib/service-traffic/api';
import { getModelos } from '@/lib/service-clientes/api';
import type { TrafficCampaign, FilterCampaignsDto, CampaignStatistics, Trafficker } from '@/lib/service-traffic/types';
import { TRAFFIC_SUCCESS, TRAFFIC_ERRORS } from '@/lib/service-traffic/constants';

export default function TrafficCampaignsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = React.useState<TrafficCampaign[]>([]);
  const [stats, setStats] = React.useState<CampaignStatistics | null>(null);
  const [modelos, setModelos] = React.useState<Array<{ _id: string; nombre: string; apellido: string }>>([]);
  const [traffickers, setTraffickers] = React.useState<Trafficker[]>([]);
  const [filters, setFilters] = React.useState<FilterCampaignsDto>({});
  const [loading, setLoading] = React.useState(true);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<TrafficCampaign | undefined>();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadModelos = React.useCallback(async () => {
    if (!token) return;
    try {
      const data = await getModelos(token);
      setModelos(data.map(m => ({ 
        _id: m._id, 
        nombre: m.nombreCompleto.split(' ')[0] || m.nombreCompleto, 
        apellido: m.nombreCompleto.split(' ').slice(1).join(' ') || '' 
      })));
    } catch (err) {
      console.error('Error loading modelos:', err);
    }
  }, [token]);

  const loadTraffickers = React.useCallback(async () => {
    if (!token) return;
    try {
      const data = await getTraffickers(token);
      setTraffickers(data);
    } catch (err) {
      console.error('Error loading traffickers:', err);
    }
  }, [token]);

  const loadCampaigns = React.useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaigns(token, filters);
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : TRAFFIC_ERRORS.loadFailed);
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  const loadStats = React.useCallback(async () => {
    if (!token) return;
    
    try {
      setStatsLoading(true);
      const data = await getCampaignStatistics(token, filters);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token, filters]);

  React.useEffect(() => {
    loadModelos();
    loadTraffickers();
  }, [loadModelos, loadTraffickers]);

  React.useEffect(() => {
    loadCampaigns();
    loadStats();
  }, [loadCampaigns, loadStats]);

  const handleRefresh = () => {
    loadCampaigns();
    loadStats();
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(undefined);
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign: TrafficCampaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = async (campaign: TrafficCampaign) => {
    if (!token) return;
    if (!confirm(`¿Estás seguro de eliminar esta campaña de ${campaign.modeloId.nombre}?`)) return;

    setDeletingId(campaign._id);
    try {
      await deleteCampaign(token, campaign._id);
      loadCampaigns();
      loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : TRAFFIC_ERRORS.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    loadCampaigns();
    loadStats();
  };

  const handleViewModelo = (modeloId: string) => {
    router.push(`/ventas/traffic/modelo/${modeloId}`);
  };

  const containerStyle: React.CSSProperties = {
    background: 'var(--background)',
    minHeight: '100vh',
  };

  const headerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
  };

  const errorStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--danger)',
    borderRadius: '12px',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle} className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Traffic / Trafficker
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Gestión de campañas de marketing
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--surface-muted)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-muted)';
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--ot-blue-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--ot-blue-500)';
                }}
              >
                <Plus size={16} />
                Nueva Campaña
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Estadísticas */}
        {stats && <CampaignStats stats={stats} loading={statsLoading} />}

        {/* Filtros */}
        <CampaignFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          modelos={modelos}
        />

        {/* Error */}
        {error && (
          <div style={errorStyle} className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--danger)' }}>
                  Error al cargar campañas
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de campañas */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" />
          </div>
        ) : campaigns.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              No hay campañas registradas
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Crea tu primera campaña para comenzar
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Mostrando {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  onEdit={handleEditCampaign}
                  onDelete={handleDeleteCampaign}
                  onViewModelo={handleViewModelo}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de formulario */}
      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        campaign={editingCampaign}
        modelos={modelos}
        traffickers={traffickers}
      />
    </div>
  );
}
