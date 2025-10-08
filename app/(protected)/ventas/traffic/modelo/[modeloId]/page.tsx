"use client";
import React from 'react';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { CampaignCard } from '@/components/traffic/CampaignCard';
import Loader from '@/components/ui/Loader';
import { getCampaignsByModelo } from '@/lib/service-traffic/api';
import { getModelo } from '@/lib/service-clientes/api';
import type { TrafficCampaign } from '@/lib/service-traffic/types';
import type { Modelo } from '@/lib/service-clientes/types';

export default function ModeloCampaignsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const modeloId = params?.modeloId as string;

  const [modelo, setModelo] = React.useState<Modelo | null>(null);
  const [campaigns, setCampaigns] = React.useState<TrafficCampaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token || !modeloId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [modeloData, campaignsData] = await Promise.all([
          getModelo(token, modeloId),
          getCampaignsByModelo(token, modeloId),
        ]);
        setModelo(modeloData);
        setCampaigns(campaignsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading modelo campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, modeloId]);

  const totalBudget = campaigns.reduce((sum, c) => sum + c.presupuesto.asignado, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.presupuesto.gastado, 0);
  const activeCampaigns = campaigns.filter(c => c.estado === 'ACTIVA').length;

  const containerStyle: React.CSSProperties = {
    background: 'var(--background)',
    minHeight: '100vh',
  };

  const headerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  if (loading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !modelo) {
    return (
      <div style={containerStyle} className="p-6">
        <div style={cardStyle} className="p-6 text-center">
          <p className="text-lg font-medium" style={{ color: 'var(--danger)' }}>
            {error || 'Modelo no encontrada'}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'var(--ot-blue-500)',
              color: '#ffffff',
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle} className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm mb-3 hover:underline"
            style={{ color: 'var(--ot-blue-500)' }}
          >
            <ArrowLeft size={16} />
            Volver a Campañas
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {modelo.nombreCompleto}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Histórico de campañas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={cardStyle} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'var(--ot-blue-500)20', color: 'var(--ot-blue-500)' }}
              >
                <Calendar size={20} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Total Campañas
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {campaigns.length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeCampaigns} activas
            </p>
          </div>

          <div style={cardStyle} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: '#10b98120', color: '#10b981' }}
              >
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Presupuesto Total
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ${totalBudget.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Asignado en todas las campañas
            </p>
          </div>

          <div style={cardStyle} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: '#f59e0b20', color: '#f59e0b' }}
              >
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Total Gastado
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% del presupuesto
            </p>
          </div>
        </div>

        {/* Lista de campañas */}
        {campaigns.length === 0 ? (
          <div style={cardStyle} className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              No hay campañas registradas para esta modelo
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Las campañas aparecerán aquí una vez creadas
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Campañas ({campaigns.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
