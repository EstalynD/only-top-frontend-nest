"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getModelo } from '@/lib/service-clientes/api';
import { ModeloForm } from '@/components/clientes/ModeloForm';
import type { Modelo } from '@/lib/service-clientes/types';
import { ArrowLeft } from 'lucide-react';

export default function EditarModeloPage() {
  const router = useRouter();
  const params = useParams();
  const { token, ready } = useAuth();
  const [modelo, setModelo] = React.useState<Modelo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const modeloId = params?.id as string;

  React.useEffect(() => {
    if (!ready || !token || !modeloId) return;

    const loadModelo = async () => {
      setLoading(true);
      try {
        const data = await getModelo(token, modeloId);
        setModelo(data);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar modelo',
          description: error?.message || 'No se pudo cargar la información de la modelo',
        });
        router.push('/clientes/modelos');
      } finally {
        setLoading(false);
      }
    };

    loadModelo();
  }, [token, ready, modeloId, router]);

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando modelo...</p>
        </div>
      </div>
    );
  }

  if (!modelo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Editar Modelo
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Actualiza la información de {modelo.nombreCompleto}
          </p>
        </div>
      </div>

      {/* Form */}
      <ModeloForm modelo={modelo} isEdit={true} />
    </div>
  );
}

