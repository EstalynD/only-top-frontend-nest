"use client";
import React from 'react';
import { ModeloForm } from '@/components/clientes/ModeloForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function NuevoModeloPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={20} />}
          ariaLabel="Volver atrás"
        />
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Nueva Modelo
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Completa el formulario para registrar una nueva modelo en el sistema
          </p>
        </div>
      </div>

      {/* Form */}
      <ModeloForm />
    </div>
  );
}

