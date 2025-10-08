"use client";
import React from 'react';
import { ModeloForm } from '@/components/clientes/ModeloForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NuevoModeloPage() {
  const router = useRouter();

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

