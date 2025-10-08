"use client";
import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { createActivity } from '@/lib/service-recruitment/api';
import ActivityForm from '@/components/recruitment/ActivityForm';
import type { CreateRecruitmentActivityDto } from '@/lib/service-recruitment/types';
import { MESSAGES } from '@/lib/service-recruitment/constants';

export default function NewActivityPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (data: CreateRecruitmentActivityDto) => {
    try {
      setLoading(true);
      await createActivity(token!, data);
      toast({ type: 'success', title: MESSAGES.ACTIVITY_CREATED });
      router.push('/ventas/recruitment');
    } catch (error: any) {
      toast({ type: 'error', title: error?.message || MESSAGES.ERROR_SAVING });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/ventas/recruitment"
          className="inline-flex items-center gap-2 mb-4 transition-opacity hover:opacity-80"
          style={mutedTextStyle}
        >
          <ArrowLeft size={20} />
          Volver a Actividades
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
          >
            <Calendar size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={primaryTextStyle}>Registrar Nueva Actividad</h1>
            <p style={mutedTextStyle}>
              Registra tus métricas diarias de prospección y cierre
            </p>
          </div>
        </div>
      </div>

      {/* Tips rápidos */}
      <div className="rounded-xl border p-4" style={cardStyle}>
        <h3 className="font-semibold mb-2" style={primaryTextStyle}>💡 Tips para un mejor registro:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside" style={mutedTextStyle}>
          <li>Registra tus actividades al final de cada día para mayor precisión</li>
          <li>Incluye contactos con su perfil de Instagram para mejor seguimiento</li>
          <li>Agrega notas sobre las conversaciones más prometedoras</li>
          <li>Registra modelos cerradas inmediatamente para no olvidar detalles</li>
        </ul>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border p-4" style={cardStyle}>
        <ActivityForm
          onSubmit={handleSubmit}
          submitLabel="Registrar Actividad"
          loading={loading}
        />
      </div>
    </div>
  );
}

