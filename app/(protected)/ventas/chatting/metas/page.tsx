"use client";
import React from 'react';
import {
  Target,
  Plus,
  Filter,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Edit,
  X as CloseIcon,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  getGoals,
  getGoalStatistics,
  createGoal,
  updateGoal,
  closeGoal,
  cancelGoal,
  deleteGoal,
  updateGoalProgress,
} from '@/lib/service-chatter/goals-api';
import { getActiveChatters } from '@/lib/service-chatter/api';
import type {
  ChatterGoal,
  CreateChatterGoalDto,
  UpdateChatterGoalDto,
  FilterChatterGoalsDto,
  GoalStatus,
  GoalStatistics,
} from '@/lib/service-chatter/goals-types';
import Loader from '@/components/ui/Loader';
import { addToast } from '@/components/ui/Toast';
import { requestJSON } from '@/lib/utils/fetcher';

// ========== HELPER COMPONENTS ==========

function StatsCard({ title, value, subtitle, icon: Icon, iconColor }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  iconColor: string;
}) {
  return (
    <div
      className="p-6 rounded-xl border transition-all hover:shadow-lg"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}20` }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function ChatterGoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = React.useState<ChatterGoal[]>([]);
  const [stats, setStats] = React.useState<GoalStatistics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState<ChatterGoal | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const [filters, setFilters] = React.useState<FilterChatterGoalsDto>({});

  const loadData = React.useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [goalsData, statsData] = await Promise.all([
        getGoals(token, filters),
        getGoalStatistics(token, filters.modeloId, filters.fechaInicio, filters.fechaFin),
      ]);

      setGoals(goalsData);
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

  const handleUpdateProgress = async (id: string) => {
    if (!token) return;

    try {
      await updateGoalProgress(token, id);
      addToast({
        type: 'success',
        title: 'Progreso actualizado',
        description: 'El progreso de la meta ha sido actualizado',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleCloseGoal = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Estás seguro de cerrar esta meta?')) return;

    try {
      await closeGoal(token, id, {});
      addToast({
        type: 'success',
        title: 'Meta cerrada',
        description: 'La meta ha sido cerrada exitosamente',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleCancelGoal = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Estás seguro de cancelar esta meta?')) return;

    try {
      await cancelGoal(token, id, 'Cancelado por usuario');
      addToast({
        type: 'success',
        title: 'Meta cancelada',
        description: 'La meta ha sido cancelada',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: GoalStatus) => {
    const config = {
      ACTIVA: { bg: '#10b981', text: 'Activa' },
      COMPLETADA: { bg: 'var(--ot-blue-500)', text: 'Completada' },
      VENCIDA: { bg: '#f59e0b', text: 'Vencida' },
      CANCELADA: { bg: '#ef4444', text: 'Cancelada' },
    };

    const { bg, text } = config[status];

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: bg, color: 'white' }}
      >
        {text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (fechaFin: string) => {
    const end = new Date(fechaFin);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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
          Metas de Chatters
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gestión y seguimiento de metas de ventas por grupo de chatters
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
            title="Metas Activas"
            value={stats.activeGoals}
            subtitle="En progreso"
            icon={Target}
            iconColor="#10b981"
          />
          <StatsCard
            title="Completadas"
            value={stats.completedGoals}
            subtitle={`${stats.achievementRate.toFixed(1)}% logro`}
            icon={CheckCircle}
            iconColor="var(--ot-blue-500)"
          />
          <StatsCard
            title="Cumplimiento Promedio"
            value={`${stats.avgCompletion.toFixed(1)}%`}
            subtitle="De todas las metas"
            icon={BarChart3}
            iconColor="#f59e0b"
          />
          <StatsCard
            title="Total Metas"
            value={stats.totalGoals}
            subtitle="Histórico"
            icon={TrendingUp}
            iconColor="#8b5cf6"
          />
        </div>
      ) : null}

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{ background: 'var(--ot-blue-500)', color: 'white' }}
        >
          <Plus size={16} className="inline mr-2" />
          Nueva Meta
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: showFilters ? 'var(--ot-blue-500)' : 'var(--surface-muted)',
            color: showFilters ? 'white' : 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <Filter size={16} className="inline mr-2" />
          Filtros
        </button>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={16} className="inline mr-2" />
          Actualizar
        </button>
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
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Todos</option>
                <option value="ACTIVA">Activa</option>
                <option value="COMPLETADA">Completada</option>
                <option value="VENCIDA">Vencida</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
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
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              Limpiar
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--ot-blue-500)', color: 'white' }}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-12" style={containerStyle}>
            <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No hay metas registradas
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Crea tu primera meta para comenzar a monitorear el progreso del equipo
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const daysRemaining = getDaysRemaining(goal.fechaFin);
            const remaining = goal.montoObjetivo - goal.montoActual;
            const isActive = goal.estado === 'ACTIVA';

            return (
              <div
                key={goal._id}
                className="rounded-xl border p-6 transition-all hover:shadow-lg"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {goal.modeloId.nombreCompleto}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(goal.fechaInicio)} - {formatDate(goal.fechaFin)}
                    </p>
                  </div>
                  {getStatusBadge(goal.estado)}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Progreso
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--ot-blue-500)' }}>
                      {goal.porcentajeCumplimiento.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ background: 'var(--surface-muted)' }}
                  >
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(goal.porcentajeCumplimiento, 100)}%`,
                        background:
                          goal.porcentajeCumplimiento >= 100
                            ? '#10b981'
                            : goal.porcentajeCumplimiento >= 75
                            ? 'var(--ot-blue-500)'
                            : goal.porcentajeCumplimiento >= 50
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Meta
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(goal.montoObjetivo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Actual
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                      {formatCurrency(goal.montoActual)}
                    </p>
                  </div>
                  {isActive && (
                    <>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          Falta
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>
                          {formatCurrency(remaining > 0 ? remaining : 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          Días restantes
                        </p>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {daysRemaining > 0 ? daysRemaining : 0} días
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {isActive && (
                    <>
                      <button
                        onClick={() => handleUpdateProgress(goal._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                        style={{
                          background: 'var(--ot-blue-500)',
                          color: 'white',
                        }}
                      >
                        <RefreshCw size={12} className="inline mr-1" />
                        Actualizar
                      </button>
                      <button
                        onClick={() => handleCloseGoal(goal._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                        style={{
                          background: '#10b981',
                          color: 'white',
                        }}
                      >
                        <CheckCircle size={12} className="inline mr-1" />
                        Cerrar
                      </button>
                      <button
                        onClick={() => handleCancelGoal(goal._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: '#ef4444',
                          color: 'white',
                        }}
                      >
                        <XCircle size={12} className="inline mr-1" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>

                {/* Description */}
                {goal.descripcion && (
                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {goal.descripcion}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CreateEditGoalModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedGoal(null);
          }}
          onSuccess={loadData}
          goal={selectedGoal}
        />
      )}
    </div>
  );
}

// ========== CREATE/EDIT MODAL ==========

function CreateEditGoalModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: ChatterGoal | null;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [loadingModelos, setLoadingModelos] = React.useState(false);
  const [modelos, setModelos] = React.useState<any[]>([]);
  const [selectedModelo, setSelectedModelo] = React.useState<any | null>(null);

  const [formData, setFormData] = React.useState<CreateChatterGoalDto>({
    modeloId: goal?.modeloId._id || '',
    montoObjetivo: goal?.montoObjetivo || 50000,
    fechaInicio: goal?.fechaInicio?.slice(0, 10) || '',
    fechaFin: goal?.fechaFin?.slice(0, 10) || '',
    descripcion: goal?.descripcion || '',
    nivelesNotificacion: goal?.nivelesNotificacion || [25, 50, 75, 90, 100],
    notificacionesActivas: goal?.notificacionesActivas ?? true,
  });

  // Cargar modelos activas al abrir el modal
  React.useEffect(() => {
    if (!isOpen || !token) return;
    loadModelos();
  }, [isOpen, token]);

  // Cargar modelo seleccionada cuando hay goal en edición
  React.useEffect(() => {
    if (goal && modelos.length > 0) {
      const modelo = modelos.find((m) => m._id === goal.modeloId._id);
      setSelectedModelo(modelo || null);
    }
  }, [goal, modelos]);

  const loadModelos = async () => {
    try {
      setLoadingModelos(true);
      const response = await requestJSON<any[]>('/api/rrhh/modelos?includeInactive=false', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModelos(response);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar modelos',
        description: error.message,
      });
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleModeloSelect = (modeloId: string) => {
    const modelo = modelos.find((m) => m._id === modeloId);
    setSelectedModelo(modelo || null);
    setFormData({ ...formData, modeloId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);

      if (goal) {
        await updateGoal(token, goal._id, formData);
        addToast({
          type: 'success',
          title: 'Meta actualizada',
          description: 'La meta ha sido actualizada exitosamente',
        });
      } else {
        await createGoal(token, formData);
        addToast({
          type: 'success',
          title: 'Meta creada',
          description: 'La meta ha sido creada exitosamente',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {goal ? 'Editar Meta' : 'Nueva Meta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
          >
            <CloseIcon size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!goal && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Modelo (Grupo) *
                </label>
                <select
                  required
                  disabled={loadingModelos}
                  value={formData.modeloId}
                  onChange={(e) => handleModeloSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">
                    {loadingModelos ? 'Cargando modelos...' : 'Seleccionar modelo...'}
                  </option>
                  {modelos.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.nombreCompleto} - {m.correoElectronico}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar equipo de chatters cuando se selecciona una modelo */}
              {selectedModelo && selectedModelo.equipoChatters && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    📊 Esta meta aplicará para el siguiente equipo de chatters:
                  </p>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>
                      <strong>Turno AM:</strong> {selectedModelo.equipoChatters.turnoAM.nombre}{' '}
                      {selectedModelo.equipoChatters.turnoAM.apellido}
                    </li>
                    <li>
                      <strong>Turno PM:</strong> {selectedModelo.equipoChatters.turnoPM.nombre}{' '}
                      {selectedModelo.equipoChatters.turnoPM.apellido}
                    </li>
                    <li>
                      <strong>Turno Madrugada:</strong>{' '}
                      {selectedModelo.equipoChatters.turnoMadrugada.nombre}{' '}
                      {selectedModelo.equipoChatters.turnoMadrugada.apellido}
                    </li>
                    <li>
                      <strong>Supernumerario:</strong>{' '}
                      {selectedModelo.equipoChatters.supernumerario.nombre}{' '}
                      {selectedModelo.equipoChatters.supernumerario.apellido}
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Monto Objetivo (USD) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.montoObjetivo}
              onChange={(e) => setFormData({ ...formData, montoObjetivo: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha Inicio *
              </label>
              <input
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
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
                Fecha Fin *
              </label>
              <input
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Descripción
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifications"
              checked={formData.notificacionesActivas}
              onChange={(e) => setFormData({ ...formData, notificacionesActivas: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="notifications" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Enviar notificaciones motivacionales
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--ot-blue-500)',
                color: 'white',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Guardando...' : goal ? 'Actualizar' : 'Crear Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

