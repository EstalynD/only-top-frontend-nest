"use client";
import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { getActivity, updateActivity } from '@/lib/service-recruitment/api';
import ActivityForm from '@/components/recruitment/ActivityForm';
import type { RecruitmentActivity, UpdateRecruitmentActivityDto } from '@/lib/service-recruitment/types';
import { MESSAGES } from '@/lib/service-recruitment/constants';

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { toast } = useToast();
  const [activity, setActivity] = useState<RecruitmentActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const activityId = params?.id as string;

  const cardStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)'
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)'
  };

  const primaryTextStyle: CSSProperties = {
    color: 'var(--text-primary)'
  };

  useEffect(() => {
    if (token && activityId) {
      loadActivity();
    }
  }, [token, activityId]);

  const loadActivity = async () => {
    try {
      setLoadingInitial(true);
      const data = await getActivity(token!, activityId);
      setActivity(data);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error al cargar actividad',
        description: error?.message || 'No se pudo cargar la actividad',
      });
      router.push('/ventas/recruitment');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSubmit = async (data: UpdateRecruitmentActivityDto) => {
    try {
      setLoading(true);
      await updateActivity(token!, activityId, data);
      toast({ type: 'success', title: MESSAGES.ACTIVITY_UPDATED });
      router.push(`/ventas/recruitment/${activityId}`);
    } catch (error: any) {
      toast({ type: 'error', title: error?.message || MESSAGES.ERROR_SAVING });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
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

  const initialData = {
    fechaActividad: activity.fechaActividad.split('T')[0],
    salesCloserId: typeof activity.salesCloserId === 'string' ? activity.salesCloserId : activity.salesCloserId._id,
    cuentasTexteadas: activity.cuentasTexteadas,
    likesRealizados: activity.likesRealizados,
    comentariosRealizados: activity.comentariosRealizados,
    contactosObtenidos: activity.contactosObtenidos,
    reunionesAgendadas: activity.reunionesAgendadas,
    reunionesRealizadas: activity.reunionesRealizadas,
    modelosCerradas: activity.modelosCerradas,
    notasDia: activity.notasDia || undefined,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/ventas/recruitment/${activityId}`}
          className="inline-flex items-center gap-2 mb-4 transition-opacity hover:opacity-80"
          style={mutedTextStyle}
        >
          <ArrowLeft size={20} />
          Volver a Detalle
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
          >
            <Calendar size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={primaryTextStyle}>Editar Actividad</h1>
            <p style={mutedTextStyle}>
              Modifica los datos de la actividad del {new Date(activity.fechaActividad).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border p-4" style={cardStyle}>
        <ActivityForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Guardar Cambios"
          loading={loading}
        />
      </div>
    </div>
  );
}

