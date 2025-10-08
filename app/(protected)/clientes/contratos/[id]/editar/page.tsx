"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getContrato } from '@/lib/service-clientes/api-contratos';
import { ContratoForm } from '@/components/clientes/ContratoForm';
import type { ContratoModelo } from '@/lib/service-clientes/types-contratos';
import { ArrowLeft } from 'lucide-react';

export default function EditarContratoPage() {
  const router = useRouter();
  const params = useParams();
  const { token, ready } = useAuth();
  const [contrato, setContrato] = React.useState<ContratoModelo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const contratoId = params?.id as string;

  React.useEffect(() => {
    if (!ready || !token || !contratoId) return;

    const loadContrato = async () => {
      setLoading(true);
      try {
        const data = await getContrato(token, contratoId);
        
        // Solo se puede editar si está en borrador
        if (data.estado !== 'BORRADOR') {
          addToast({
            type: 'error',
            title: 'No se puede editar',
            description: 'Solo se pueden editar contratos en estado borrador',
          });
          router.push(`/clientes/contratos/${contratoId}`);
          return;
        }

        setContrato(data);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar contrato',
          description: error?.message || 'No se pudo cargar la información del contrato',
        });
        router.push('/clientes/contratos');
      } finally {
        setLoading(false);
      }
    };

    loadContrato();
  }, [token, ready, contratoId, router]);

  const modelo = contrato && typeof contrato.modeloId === 'object' ? contrato.modeloId : null;

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contrato) {
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
            Editar Contrato
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {contrato.numeroContrato} - {modelo?.nombreCompleto || 'N/A'}
          </p>
        </div>
      </div>

      {/* Form */}
      <ContratoForm
        modeloId={typeof contrato.modeloId === 'string' ? contrato.modeloId : contrato.modeloId._id}
        modeloNombre={modelo?.nombreCompleto}
        contrato={contrato}
        isEdit={true}
      />
    </div>
  );
}

