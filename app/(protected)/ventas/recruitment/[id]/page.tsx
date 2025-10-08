"use client";
import React from 'react';
import type { CSSProperties } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { getActivity, deleteActivity } from '@/lib/service-recruitment/api';
import type { RecruitmentActivity } from '@/lib/service-recruitment/types';
import { EstadoModeloCerrada } from '@/lib/service-recruitment/types';
import { ESTADOS_MODELO_CERRADA } from '@/lib/service-recruitment/constants';
import { MESSAGES } from '@/lib/service-recruitment/constants';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Phone,
  Video,
  Users,
  TrendingUp,
  Instagram,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

const baseCardStyle: CSSProperties = {
  background: 'var(--surface)',
  borderColor: 'var(--border)',
  boxShadow: 'var(--shadow)'
};

const mutedCardStyle: CSSProperties = {
  background: 'var(--surface-muted)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)'
};

const createAccentCard = (hex: string): CSSProperties => ({
  background: `linear-gradient(135deg, ${hex}22, transparent)`,
  border: `1px solid ${hex}33`
});

const PINK_ACCENT = createAccentCard('#db2777');
const PURPLE_ACCENT = createAccentCard('#7c3aed');
const ORANGE_ACCENT = createAccentCard('#ea580c');
const TILE_STYLE: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)'
};

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, ready } = useAuth();
  const { toast } = useToast();
  const [activity, setActivity] = React.useState<RecruitmentActivity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  const activityId = params?.id as string;

  const loadActivity = React.useCallback(async () => {
    if (!token || !activityId) return;

    setLoading(true);
    try {
      const data = await getActivity(token, activityId);
      setActivity(data);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al cargar actividad',
        description: error?.message || 'No se pudo cargar la actividad',
      });
      router.push('/ventas/recruitment');
    } finally {
      setLoading(false);
    }
  }, [token, activityId, router, toast]);

  React.useEffect(() => {
    if (!ready) return;
    loadActivity();
  }, [ready, loadActivity]);

  const formatDateTime = React.useCallback((value: string, options?: Intl.DateTimeFormatOptions) => {
    return new Date(value).toLocaleString('es-ES', options);
  }, []);

  const salesCloserName = React.useMemo(() => {
    if (!activity) return 'N/A';
    if (typeof activity.salesCloserId === 'string') return 'Sales Closer';
    return `${activity.salesCloserId.nombre} ${activity.salesCloserId.apellido}`;
  }, [activity]);

  const totalInteractions = React.useMemo(() => {
    if (!activity) return 0;
    return activity.cuentasTexteadas + activity.likesRealizados + activity.comentariosRealizados;
  }, [activity]);

  const contactToMeetingRate = React.useMemo(() => {
    if (!activity || activity.contactosObtenidos.length === 0) return 0;
    return (activity.reunionesAgendadas / activity.contactosObtenidos.length) * 100;
  }, [activity]);

  const meetingsToCloseRate = React.useMemo(() => {
    if (!activity || activity.reunionesRealizadas === 0) return 0;
    return (activity.modelosCerradas.length / activity.reunionesRealizadas) * 100;
  }, [activity]);

  const meetingEffectiveness = React.useMemo(() => {
    if (!activity || activity.reunionesAgendadas === 0) return 0;
    return (activity.reunionesRealizadas / activity.reunionesAgendadas) * 100;
  }, [activity]);

  const handleDelete = async () => {
    if (!token || !activity) return;

    if (!confirm(MESSAGES.CONFIRM_DELETE)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteActivity(token, activity._id);
      toast({
        type: 'success',
        title: 'Actividad eliminada',
        description: 'La actividad ha sido eliminada exitosamente',
      });
      router.push('/ventas/recruitment');
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar la actividad',
      });
      setDeleting(false);
    }
  };

  const getEstadoBadge = (estado: EstadoModeloCerrada) => {
    const estadoInfo = ESTADOS_MODELO_CERRADA.find((e) => e.value === estado);
    if (!estadoInfo) return null;

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: `linear-gradient(135deg, ${estadoInfo.color}22, transparent)`,
          color: estadoInfo.color,
          border: `1px solid ${estadoInfo.color}33`,
        }}
      >
        {estado === EstadoModeloCerrada.FIRMADA && <CheckCircle size={12} />}
        {estado === EstadoModeloCerrada.REGISTRADA && <Clock size={12} />}
        {estado === EstadoModeloCerrada.EN_ESPERA && <AlertCircle size={12} />}
        {estadoInfo.label}
      </span>
    );
  };

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando actividad...
          </p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ventas/recruitment"
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
            >
              <Calendar size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Actividad del {formatDateTime(activity.fechaActividad, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <User size={16} className="inline mr-1" />
                {salesCloserName}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/ventas/recruitment/${activity._id}/editar`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          >
            <Edit size={18} />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
            style={{
              border: '1px solid #ef4444',
              background: 'var(--surface)',
              color: '#ef4444',
            }}
          >
            <Trash2 size={18} />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Métricas de Instagram */}
          <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-pink-600)' }}>
              <Instagram size={20} />
              Métricas de Instagram
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border" style={{ ...PINK_ACCENT }}>
                <MessageSquare size={24} className="mx-auto mb-2" style={{ color: 'var(--ot-pink-600)' }} />
                <p className="text-3xl font-bold" style={{ color: 'var(--ot-pink-600)' }}>
                  {activity.cuentasTexteadas}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Cuentas Texteadas
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border" style={{ ...PINK_ACCENT }}>
                <ThumbsUp size={24} className="mx-auto mb-2" style={{ color: 'var(--ot-pink-600)' }} />
                <p className="text-3xl font-bold" style={{ color: 'var(--ot-pink-600)' }}>
                  {activity.likesRealizados}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Likes Realizados
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border" style={{ ...PINK_ACCENT }}>
                <MessageCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--ot-pink-600)' }} />
                <p className="text-3xl font-bold" style={{ color: 'var(--ot-pink-600)' }}>
                  {activity.comentariosRealizados}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Comentarios
                </p>
              </div>
            </div>
          </div>

          {/* Contactos Obtenidos */}
          {activity.contactosObtenidos.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-green-600)' }}>
                <Phone size={20} />
                Contactos Obtenidos ({activity.contactosObtenidos.length})
              </h3>
              <div className="space-y-3">
                {activity.contactosObtenidos.map((contacto, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{ ...mutedCardStyle }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {contacto.numero}
                    </p>
                    {(contacto.nombreProspecto || contacto.perfilInstagram) && (
                      <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {contacto.nombreProspecto && (
                          <span>
                            <User size={14} className="inline mr-1" />
                            {contacto.nombreProspecto}
                          </span>
                        )}
                        {contacto.nombreProspecto && contacto.perfilInstagram && <span>•</span>}
                        {contacto.perfilInstagram && (
                          <span>
                            <Instagram size={14} className="inline mr-1" />
                            {contacto.perfilInstagram}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {formatDateTime(contacto.fechaObtencion)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reuniones */}
          <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-purple-600)' }}>
              <Video size={20} />
              Reuniones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border" style={{ ...PURPLE_ACCENT }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Agendadas
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-purple-600)' }}>
                  {activity.reunionesAgendadas}
                </p>
              </div>
              <div className="p-4 rounded-lg border" style={{ ...PURPLE_ACCENT }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Realizadas
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-purple-600)' }}>
                  {activity.reunionesRealizadas}
                </p>
              </div>
            </div>
            {activity.reunionesAgendadas > 0 && (
              <div className="mt-4 p-3 rounded-lg border" style={{ ...PURPLE_ACCENT }}>
                <p className="text-sm">
                  <span className="font-medium">Tasa de Efectividad:</span>{' '}
                  <span className="font-bold" style={{ color: 'var(--ot-purple-600)' }}>
                    {meetingEffectiveness.toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Modelos Cerradas */}
          {activity.modelosCerradas.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-orange-600)' }}>
                <Users size={20} />
                Modelos Cerradas ({activity.modelosCerradas.length})
              </h3>
              <div className="space-y-4">
                {activity.modelosCerradas.map((modelo, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{ ...mutedCardStyle, ...ORANGE_ACCENT }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                          {modelo.nombreModelo}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          <Instagram size={14} className="inline mr-1" />
                          {modelo.perfilInstagram}
                        </p>
                      </div>
                      {getEstadoBadge(modelo.estado)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-2 rounded-lg border" style={{ ...TILE_STYLE }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Mes 1
                        </p>
                        <p className="font-bold" style={{ color: 'var(--ot-orange-600)' }}>
                          ${modelo.facturacionUltimosTresMeses[0]}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg border" style={{ ...TILE_STYLE }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Mes 2
                        </p>
                        <p className="font-bold" style={{ color: 'var(--ot-orange-600)' }}>
                          ${modelo.facturacionUltimosTresMeses[1]}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg border" style={{ ...TILE_STYLE }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Mes 3
                        </p>
                        <p className="font-bold" style={{ color: 'var(--ot-orange-600)' }}>
                          ${modelo.facturacionUltimosTresMeses[2]}
                        </p>
                      </div>
                      <div
                        className="text-center p-2 rounded-lg border"
                        style={{ ...TILE_STYLE, borderColor: 'var(--ot-orange-500)' }}
                      >
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Promedio
                        </p>
                        <p className="font-bold flex items-center justify-center gap-1" style={{ color: 'var(--ot-orange-600)' }}>
                          <TrendingUp size={14} />
                          ${modelo.promedioFacturacion.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Fecha de Cierre: {formatDateTime(modelo.fechaCierre, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {modelo.notas && (
                        <p className="text-sm mt-2 italic" style={{ color: 'var(--text-secondary)' }}>
                          "{modelo.notas}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas del Día */}
          {activity.notasDia && (
            <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={20} />
                Notas del Día
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {activity.notasDia}
              </p>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Resumen de Actividad */}
          <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={20} />
              Resumen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Total Interacciones
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-blue-600)' }}>
                  {totalInteractions}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Contactos → Reuniones
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-green-600)' }}>
                  {contactToMeetingRate.toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Reuniones → Cierres
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-orange-600)' }}>
                  {meetingsToCloseRate.toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 rounded-xl border" style={{ ...baseCardStyle }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock size={20} />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
                >
                  <Calendar size={16} style={{ color: 'var(--ot-blue-600)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Registrada
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>

              {activity.updatedAt && activity.updatedAt !== activity.createdAt && (
                <div className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
                  >
                    <Edit size={16} style={{ color: 'var(--ot-orange-600)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Última actualización
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                      {formatDateTime(activity.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

