"use client";
import React, { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Target, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Edit,
  Trash2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { 
  getGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  getGoalStats,
  updateGoalProgress,
  type RecruitmentGoal,
  type CreateGoalDto,
  type UpdateGoalDto,
  type GoalStats,
} from '@/lib/service-recruitment/goals-api';
import { getSalesClosers } from '@/lib/service-recruitment/api';
import type { SalesCloser } from '@/lib/service-recruitment/types';
import GoalModal from '@/components/recruitment/GoalModal';

const baseCardStyle: CSSProperties = {
  background: 'var(--surface)',
  borderColor: 'var(--border)',
  boxShadow: 'var(--shadow)',
};

const inputStyle: CSSProperties = {
  background: 'var(--input-bg)',
  borderColor: 'var(--input-border)',
  color: 'var(--text-primary)',
};

const PRIMARY_COLOR = '#7c3aed'; // purple-600
const SUCCESS_COLOR = '#10b981'; // green-500
const DANGER_COLOR = '#ef4444'; // red-500
const WARNING_COLOR = '#f59e0b'; // amber-500

export default function MetasRecruitmentPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [goals, setGoals] = useState<RecruitmentGoal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [salesClosers, setSalesClosers] = useState<SalesCloser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RecruitmentGoal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVA');
  const [filterSalesCloser, setFilterSalesCloser] = useState<string>('');

  // Cargar sales closers
  const loadSalesClosers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getSalesClosers(token);
      setSalesClosers(data);
    } catch (error) {
      toast({ type: 'error', title: 'Error al cargar Sales Closers' });
    }
  }, [token, toast]);

  // Cargar metas
  const loadGoals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus && filterStatus !== 'TODAS') {
        filters.estado = filterStatus;
      }
      if (filterSalesCloser) {
        filters.salesCloserId = filterSalesCloser;
      }

      const [goalsData, statsData] = await Promise.all([
        getGoals(token, filters),
        getGoalStats(token, filterSalesCloser || undefined),
      ]);

      setGoals(goalsData);
      setStats(statsData);
    } catch (error) {
      toast({ type: 'error', title: 'Error al cargar metas' });
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterSalesCloser, toast]);

  useEffect(() => {
    loadSalesClosers();
  }, [loadSalesClosers]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Crear/Actualizar meta
  const handleSaveGoal = async (data: CreateGoalDto | UpdateGoalDto) => {
    if (!token) return;

    try {
      if (editingGoal) {
        await updateGoal(token, editingGoal._id, data as UpdateGoalDto);
        toast({ type: 'success', title: 'Meta actualizada' });
      } else {
        await createGoal(token, data as CreateGoalDto);
        toast({ type: 'success', title: 'Meta creada exitosamente' });
      }
      setShowCreateModal(false);
      setEditingGoal(null);
      loadGoals();
    } catch (error: any) {
      toast({ 
        type: 'error', 
        title: editingGoal ? 'Error al actualizar meta' : 'Error al crear meta',
        description: error.message 
      });
    }
  };

  // Eliminar meta
  const handleDeleteGoal = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;
    if (!token) return;

    try {
      await deleteGoal(token, id);
      toast({ type: 'success', title: 'Meta eliminada' });
      loadGoals();
    } catch (error) {
      toast({ type: 'error', title: 'Error al eliminar meta' });
    }
  };

  // Actualizar progreso manualmente
  const handleUpdateProgress = async (id: string) => {
    if (!token) return;

    try {
      await updateGoalProgress(token, id);
      toast({ type: 'success', title: 'Progreso actualizado' });
      loadGoals();
    } catch (error) {
      toast({ type: 'error', title: 'Error al actualizar progreso' });
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'ACTIVA': return <Clock size={16} style={{ color: PRIMARY_COLOR }} />;
      case 'COMPLETADA': return <CheckCircle2 size={16} style={{ color: SUCCESS_COLOR }} />;
      case 'VENCIDA': return <XCircle size={16} style={{ color: DANGER_COLOR }} />;
      case 'CANCELADA': return <AlertCircle size={16} style={{ color: WARNING_COLOR }} />;
      default: return null;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVA': return PRIMARY_COLOR;
      case 'COMPLETADA': return SUCCESS_COLOR;
      case 'VENCIDA': return DANGER_COLOR;
      case 'CANCELADA': return WARNING_COLOR;
      default: return '#6b7280';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'ACTIVA': return 'Activa';
      case 'COMPLETADA': return 'Completada';
      case 'VENCIDA': return 'Vencida';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'MODELOS_CERRADAS' 
      ? <Users size={16} style={{ color: PRIMARY_COLOR }} />
      : <DollarSign size={16} style={{ color: SUCCESS_COLOR }} />;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Link 
            href="/ventas/recruitment" 
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>Metas de Recruitment</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Link 
            href="/ventas/recruitment" 
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>
            🎯 Metas de Recruitment
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginLeft: '3rem' }}>
          Gestiona las metas de los Sales Closers y realiza seguimiento de su progreso con notificaciones automáticas
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            ...baseCardStyle, 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            borderLeft: `4px solid ${PRIMARY_COLOR}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Target size={20} style={{ color: PRIMARY_COLOR }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Total Metas</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {stats.total}
            </p>
          </div>

          <div style={{ 
            ...baseCardStyle, 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            borderLeft: `4px solid ${SUCCESS_COLOR}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={20} style={{ color: SUCCESS_COLOR }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Completadas</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {stats.completadas}
            </p>
          </div>

          <div style={{ 
            ...baseCardStyle, 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            borderLeft: `4px solid ${PRIMARY_COLOR}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Clock size={20} style={{ color: PRIMARY_COLOR }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Activas</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {stats.activas}
            </p>
          </div>

          <div style={{ 
            ...baseCardStyle, 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            borderLeft: `4px solid ${WARNING_COLOR}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <BarChart3 size={20} style={{ color: WARNING_COLOR }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Promedio</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {stats.promedioCompletado}%
            </p>
          </div>

          <div style={{ 
            ...baseCardStyle, 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            borderLeft: `4px solid ${SUCCESS_COLOR}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: SUCCESS_COLOR }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Tasa de Éxito</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {stats.tasaExito}%
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div style={{ 
        ...baseCardStyle, 
        padding: '1.5rem', 
        borderRadius: '0.75rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flex: '1 1 auto', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                Sales Closer
              </label>
              <select
                value={filterSalesCloser}
                onChange={(e) => setFilterSalesCloser(e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: '1px solid',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Todos</option>
                {salesClosers.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.nombre} {sc.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: '1px solid',
                  fontSize: '0.875rem'
                }}
              >
                <option value="TODAS">Todas</option>
                <option value="ACTIVA">Activas</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="VENCIDA">Vencidas</option>
                <option value="CANCELADA">Canceladas</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setShowCreateModal(true);
            }}
            style={{
              background: PRIMARY_COLOR,
              color: '#ffffff',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            Nueva Meta
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {goals.length === 0 ? (
          <div style={{
            ...baseCardStyle,
            padding: '3rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <Target size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
              No hay metas registradas
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Crea una nueva meta para comenzar el seguimiento
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const salesCloser = typeof goal.salesCloserId === 'object' 
              ? goal.salesCloserId 
              : null;
            const salesCloserName = salesCloser 
              ? `${salesCloser.nombre} ${salesCloser.apellido}`
              : goal.nombreSalesCloser || 'N/A';

            const diasRestantes = Math.ceil(
              (new Date(goal.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={goal._id}
                style={{
                  ...baseCardStyle,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: `4px solid ${getStatusColor(goal.estado)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                        {goal.titulo}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: `${getStatusColor(goal.estado)}22`,
                        color: getStatusColor(goal.estado),
                      }}>
                        {getStatusIcon(goal.estado)}
                        {getStatusText(goal.estado)}
                      </span>
                    </div>
                    {goal.descripcion && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                        {goal.descripcion}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Users size={14} />
                        {salesCloserName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        {getTipoIcon(goal.tipo)}
                        {goal.tipo === 'MODELOS_CERRADAS' ? 'Modelos' : 'Facturación'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} />
                        {new Date(goal.fechaInicio).toLocaleDateString()} - {new Date(goal.fechaFin).toLocaleDateString()}
                      </span>
                      {goal.estado === 'ACTIVA' && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          color: diasRestantes < 7 ? DANGER_COLOR : 'var(--text-muted)',
                          fontWeight: diasRestantes < 7 ? '600' : '400'
                        }}>
                          <Clock size={14} />
                          {diasRestantes} días restantes
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setShowCreateModal(true);
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: DANGER_COLOR,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Progreso: {goal.valorActual} / {goal.valorObjetivo} {goal.tipo === 'MODELOS_CERRADAS' ? 'modelos' : goal.moneda}
                    </span>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: getStatusColor(goal.estado) }}>
                      {goal.porcentajeCompletado}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'var(--surface-muted)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${goal.porcentajeCompletado}%`,
                      height: '100%',
                      background: goal.porcentajeCompletado >= 100 
                        ? `linear-gradient(90deg, ${SUCCESS_COLOR}, #34d399)`
                        : goal.porcentajeCompletado >= 75
                        ? `linear-gradient(90deg, #3b82f6, ${PRIMARY_COLOR})`
                        : goal.porcentajeCompletado >= 50
                        ? `linear-gradient(90deg, ${WARNING_COLOR}, #fbbf24)`
                        : `linear-gradient(90deg, ${DANGER_COLOR}, #f87171)`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* Notifications */}
                {goal.notificacionesActivas && goal.notificacionesEnviadas.length > 0 && (
                  <div style={{
                    background: 'var(--surface-muted)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginTop: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                        Notificaciones enviadas ({goal.notificacionesEnviadas.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {goal.notificacionesEnviadas.map((notif, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            background: 'var(--surface)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {notif.porcentaje}% - {new Date(notif.fechaEnvio).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create/Edit */}
      {showCreateModal && (
        <GoalModal
          goal={editingGoal}
          salesClosers={salesClosers}
          onSave={handleSaveGoal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

