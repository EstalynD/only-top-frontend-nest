"use client";
import React, { useState, useMemo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RecruitmentActivity, SalesCloser } from '@/lib/service-recruitment/types';
import { EstadoModeloCerrada } from '@/lib/service-recruitment/types';
import { ESTADOS_MODELO_CERRADA } from '@/lib/service-recruitment/constants';

const baseCardStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)'
};

const flatCardStyle: CSSProperties = {
  ...baseCardStyle,
  boxShadow: 'none'
};

const inputStyle: CSSProperties = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)'
};

const createAccentCard = (hex: string): CSSProperties => ({
  background: `linear-gradient(135deg, ${hex}22, transparent)`,
  border: `1px solid ${hex}33`
});

const PINK_HEX = '#db2777';
const GREEN_HEX = '#059669';
const PURPLE_HEX = '#7c3aed';
const ORANGE_HEX = '#ea580c';
const BLUE_HEX = '#1d4ed8';
const RED_HEX = '#dc2626';

const PINK_ACCENT = createAccentCard(PINK_HEX);
const GREEN_ACCENT = createAccentCard(GREEN_HEX);
const PURPLE_ACCENT = createAccentCard(PURPLE_HEX);
const ORANGE_ACCENT = createAccentCard(ORANGE_HEX);

type MetricKey =
  | 'cuentasTexteadas'
  | 'likesRealizados'
  | 'comentariosRealizados'
  | 'contactosObtenidos'
  | 'reunionesAgendadas'
  | 'reunionesRealizadas'
  | 'modelosCerradas';

type MetricConfig = {
  key: MetricKey;
  label: string;
  icon: LucideIcon;
  color: string;
  accent: CSSProperties;
  getValue: (activity: RecruitmentActivity) => number;
};

const METRIC_CONFIG: MetricConfig[] = [
  {
    key: 'cuentasTexteadas',
    label: 'DMs',
    icon: MessageSquare,
    color: PINK_HEX,
    accent: PINK_ACCENT,
    getValue: (activity) => activity.cuentasTexteadas,
  },
  {
    key: 'likesRealizados',
    label: 'Likes',
    icon: ThumbsUp,
    color: PINK_HEX,
    accent: PINK_ACCENT,
    getValue: (activity) => activity.likesRealizados,
  },
  {
    key: 'comentariosRealizados',
    label: 'Comentarios',
    icon: MessageCircle,
    color: PINK_HEX,
    accent: PINK_ACCENT,
    getValue: (activity) => activity.comentariosRealizados,
  },
  {
    key: 'contactosObtenidos',
    label: 'Contactos',
    icon: Phone,
    color: GREEN_HEX,
    accent: GREEN_ACCENT,
    getValue: (activity) => activity.contactosObtenidos.length,
  },
  {
    key: 'reunionesAgendadas',
    label: 'Agendadas',
    icon: Calendar,
    color: PURPLE_HEX,
    accent: PURPLE_ACCENT,
    getValue: (activity) => activity.reunionesAgendadas,
  },
  {
    key: 'reunionesRealizadas',
    label: 'Realizadas',
    icon: Video,
    color: PURPLE_HEX,
    accent: PURPLE_ACCENT,
    getValue: (activity) => activity.reunionesRealizadas,
  },
  {
    key: 'modelosCerradas',
    label: 'Cierres',
    icon: Users,
    color: ORANGE_HEX,
    accent: ORANGE_ACCENT,
    getValue: (activity) => activity.modelosCerradas.length,
  },
];

interface ActivityListProps {
  activities: RecruitmentActivity[];
  salesClosers: SalesCloser[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function ActivityList({ activities, salesClosers, onDelete, loading = false }: ActivityListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterSalesCloser, setFilterSalesCloser] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoModeloCerrada | ''>('');

  const filteredActivities = useMemo(() => {
    const fromDate = filterFechaDesde ? new Date(filterFechaDesde) : null;
    const toDate = filterFechaHasta ? new Date(filterFechaHasta) : null;

    return activities.filter((activity) => {
      if (filterSalesCloser) {
        const salesCloserId = typeof activity.salesCloserId === 'string'
          ? activity.salesCloserId
          : activity.salesCloserId._id;
        if (salesCloserId !== filterSalesCloser) return false;
      }

      if (fromDate) {
        if (new Date(activity.fechaActividad) < fromDate) return false;
      }

      if (toDate) {
        if (new Date(activity.fechaActividad) > toDate) return false;
      }

      if (filterEstado) {
        const hasEstado = activity.modelosCerradas.some((modelo) => modelo.estado === filterEstado);
        if (!hasEstado) return false;
      }

      return true;
    });
  }, [activities, filterSalesCloser, filterFechaDesde, filterFechaHasta, filterEstado]);

  const clearFilters = useCallback(() => {
    setFilterSalesCloser('');
    setFilterFechaDesde('');
    setFilterFechaHasta('');
    setFilterEstado('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filterSalesCloser || filterFechaDesde || filterFechaHasta || filterEstado);
  }, [filterSalesCloser, filterFechaDesde, filterFechaHasta, filterEstado]);

  const getSalesCloserName = (activity: RecruitmentActivity) => {
    if (typeof activity.salesCloserId === 'string') {
      return 'Sales Closer';
    }
    return `${activity.salesCloserId.nombre} ${activity.salesCloserId.apellido}`;
  };

  const getEstadoBadge = (estado: EstadoModeloCerrada) => {
    const estadoInfo = ESTADOS_MODELO_CERRADA.find((e) => e.value === estado);
    if (!estadoInfo) return null;

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${estadoInfo.color}20`,
          color: estadoInfo.color,
          border: `1px solid ${estadoInfo.color}40`,
        }}
      >
        {estado === EstadoModeloCerrada.FIRMADA && <CheckCircle size={12} />}
        {estado === EstadoModeloCerrada.REGISTRADA && <Clock size={12} />}
        {estado === EstadoModeloCerrada.EN_ESPERA && <AlertCircle size={12} />}
        {estadoInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center rounded-xl px-8 py-6" style={baseCardStyle}>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-xl p-4" style={baseCardStyle}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border hover:opacity-90"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: BLUE_HEX, color: '#ffffff' }}>
                {[filterSalesCloser, filterFechaDesde, filterFechaHasta, filterEstado].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Sales Closer */}
            <div>
              <label className="block text-sm font-medium mb-1">Sales Closer</label>
              <select
                value={filterSalesCloser}
                onChange={(e) => setFilterSalesCloser(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                style={inputStyle}
              >
                <option value="">Todos</option>
                {salesClosers.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.nombre} {sc.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium mb-1">Desde</label>
              <input
                type="date"
                value={filterFechaDesde}
                onChange={(e) => setFilterFechaDesde(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                style={inputStyle}
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium mb-1">Hasta</label>
              <input
                type="date"
                value={filterFechaHasta}
                onChange={(e) => setFilterFechaHasta(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                style={inputStyle}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium mb-1">Estado Modelo</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as EstadoModeloCerrada | '')}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                style={inputStyle}
              >
                <option value="">Todos</option>
                {ESTADOS_MODELO_CERRADA.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="text-sm px-2" style={{ color: 'var(--text-secondary)' }}>
        Mostrando <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filteredActivities.length}</span> de{' '}
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{activities.length}</span> actividades
      </div>

      {/* Lista de actividades */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={baseCardStyle}>
          <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
          <h3 className="text-lg font-semibold mb-2">No hay actividades</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {hasActiveFilters 
              ? 'No se encontraron actividades con los filtros aplicados' 
              : 'Aún no se han registrado actividades'}
          </p>
          <Link
            href="/ventas/recruitment/nueva"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white"
            style={{ background: 'var(--ot-blue-500)' }}
          >
            Registrar Primera Actividad
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity._id}
              className="rounded-xl p-6 hover:shadow-lg transition-all"
              style={baseCardStyle}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
                  >
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(activity.fechaActividad).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={16} style={{ color: 'var(--text-secondary)' }} />
                      {getSalesCloserName(activity)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/ventas/recruitment/${activity._id}`}
                    className="p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)', background: 'var(--surface)', border: '1px solid var(--border)' }}
                    title="Ver detalles"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/ventas/recruitment/${activity._id}/editar`}
                    className="p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ color: BLUE_HEX, background: 'var(--surface)', border: `1px solid ${BLUE_HEX}33` }}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(activity._id)}
                      className="p-2 rounded-lg transition-colors hover:opacity-80"
                      style={{ color: RED_HEX, background: 'var(--surface)', border: `1px solid ${RED_HEX}33` }}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Métricas Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                {METRIC_CONFIG.map(({ key, label, icon: Icon, color, accent, getValue }) => (
                  <div
                    key={key}
                    className="text-center p-3 rounded-lg"
                    style={{ ...flatCardStyle, ...accent }}
                  >
                    <Icon size={20} className="mx-auto mb-1" style={{ color }} />
                    <p className="text-2xl font-bold" style={{ color }}>
                      {getValue(activity)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Modelos Cerradas */}
              {activity.modelosCerradas.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: ORANGE_HEX }}>
                    <TrendingUp size={16} style={{ color: ORANGE_HEX }} />
                    Modelos Cerradas ({activity.modelosCerradas.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activity.modelosCerradas.map((modelo, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg"
                        style={{ ...flatCardStyle, ...ORANGE_ACCENT }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold">{modelo.nombreModelo}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{modelo.perfilInstagram}</p>
                          </div>
                          {getEstadoBadge(modelo.estado)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span style={{ color: 'var(--text-secondary)' }}>Promedio:</span>
                          <span className="font-bold" style={{ color: ORANGE_HEX }}>
                            ${modelo.promedioFacturacion.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {activity.notasDia && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                    "{activity.notasDia}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

