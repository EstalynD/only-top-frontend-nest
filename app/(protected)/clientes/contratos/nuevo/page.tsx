"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getModelos } from '@/lib/service-clientes/api';
import { ContratoForm } from '@/components/clientes/ContratoForm';
import type { Modelo } from '@/lib/service-clientes/types';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';

export default function NuevoContratoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, ready } = useAuth();
  
  const [modelos, setModelos] = React.useState<Modelo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedModelo, setSelectedModelo] = React.useState<Modelo | null>(null);

  // Check if modelo is pre-selected from URL
  const modeloIdFromUrl = searchParams?.get('modeloId');

  React.useEffect(() => {
    if (!ready || !token) return;

    const loadModelos = async () => {
      setLoading(true);
      try {
  // getModelos no acepta `estado`; por defecto trae activas o se controla con includeInactive
  const data = await getModelos(token);
        setModelos(data);

        // If modeloId is in URL, auto-select it
        if (modeloIdFromUrl) {
          const modelo = data.find(m => m._id === modeloIdFromUrl);
          if (modelo) {
            setSelectedModelo(modelo);
          }
        }
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar modelos',
          description: error?.message || 'No se pudieron cargar las modelos',
        });
      } finally {
        setLoading(false);
      }
    };

    loadModelos();
  }, [token, ready, modeloIdFromUrl]);

  const filteredModelos = React.useMemo(() => {
    return modelos.filter((modelo) =>
      modelo.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.numeroIdentificacion.includes(searchTerm)
    );
  }, [modelos, searchTerm]);

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
      </div>
    );
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
            Nuevo Contrato de Modelo
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {selectedModelo ? 'Complete los datos del contrato' : 'Selecciona una modelo para crear el contrato'}
          </p>
        </div>
      </div>

      {!selectedModelo ? (
        /* Selector de Modelo */
        <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Seleccionar Modelo
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Modelos List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredModelos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No se encontraron modelos con ese criterio' : 'No hay modelos activas disponibles'}
                </p>
              </div>
            ) : (
              filteredModelos.map((modelo) => (
                <button
                  key={modelo._id}
                  onClick={() => setSelectedModelo(modelo)}
                  className="w-full p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-md"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {modelo.fotoPerfil ? (
                      <img
                        src={modelo.fotoPerfil}
                        alt={modelo.nombreCompleto}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                        <span className="text-lg font-medium" style={{ color: 'var(--ot-blue-700)' }}>
                          {modelo.nombreCompleto.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {modelo.nombreCompleto}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {modelo.correoElectronico}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {modelo.numeroIdentificacion}
                      </p>
                      {modelo.promedioFacturacionMensual > 0 && (
                        <p className="text-xs font-medium mt-1" style={{ color: 'var(--ot-blue-600)' }}>
                          Prom: ${modelo.promedioFacturacionMensual.toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Formulario de Contrato */
        <>
          <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: 'var(--ot-green-50)', border: '1px solid var(--ot-green-200)' }}>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                  Modelo seleccionada: {selectedModelo.nombreCompleto}
                </p>
                <p className="text-xs" style={{ color: '#059669' }}>
                  {selectedModelo.correoElectronico}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedModelo(null)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                background: '#ffffff',
                border: '1px solid #10b981',
                color: '#10b981',
              }}
            >
              Cambiar
            </button>
          </div>

          <ContratoForm
            modeloId={selectedModelo._id}
            modeloNombre={selectedModelo.nombreCompleto}
          />
        </>
      )}
    </div>
  );
}

