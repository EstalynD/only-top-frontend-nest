"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getContratos, deleteContrato, getContratosStats } from '@/lib/service-clientes/api-contratos';
import type { ContratoModelo, ContratosStats } from '@/lib/service-clientes/types-contratos';
import { ESTADOS_CONTRATO } from '@/lib/service-clientes/constants-contratos';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, CheckCircle, Clock, FileSignature } from 'lucide-react';

export default function ContratosPage() {
  const router = useRouter();
  const { token, ready } = useAuth();
  const [contratos, setContratos] = React.useState<ContratoModelo[]>([]);
  const [stats, setStats] = React.useState<ContratosStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState<string>('all');

  const loadData = React.useCallback(async () => {
    if (!ready || !token) return;

    setLoading(true);
    try {
      const [contratosData, statsData] = await Promise.all([
        getContratos(token, { estado: filterEstado !== 'all' ? filterEstado : undefined, search: searchTerm }),
        getContratosStats(token),
      ]);
      setContratos(contratosData);
      setStats(statsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar contratos',
        description: error?.message || 'No se pudieron cargar los contratos',
      });
    } finally {
      setLoading(false);
    }
  }, [token, ready, filterEstado, searchTerm]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, numeroContrato: string) => {
    if (!token) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar el contrato ${numeroContrato}?`)) {
      return;
    }

    try {
      await deleteContrato(token, id);
      addToast({
        type: 'success',
        title: 'Contrato eliminado',
        description: `El contrato ${numeroContrato} ha sido eliminado`,
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar el contrato',
      });
    }
  };

  const getModeloNombre = (modelo: any): string => {
    if (typeof modelo === 'string') return 'N/A';
    return modelo.nombreCompleto || 'N/A';
  };

  if (!ready) {
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Contratos de Modelos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Gestiona los contratos digitales y procesos de firma
          </p>
        </div>
        <button
          onClick={() => router.push('/clientes/contratos/nuevo')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
            color: '#ffffff',
          }}
        >
          <Plus size={18} />
          Nuevo Contrato
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Contratos</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                <FileText size={20} style={{ color: 'var(--ot-blue-600)' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Firmados</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>{stats.firmados}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#d1fae5' }}>
                <CheckCircle size={20} style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Pendientes</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{stats.pendientes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <Clock size={20} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Borradores</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#6b7280' }}>{stats.borradores}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f3f4f6' }}>
                <FileSignature size={20} style={{ color: '#6b7280' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rechazados</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#ef4444' }}>{stats.rechazados}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <Trash2 size={20} style={{ color: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por número de contrato o nombre de modelo..."
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

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="all">Todos los estados</option>
          {ESTADOS_CONTRATO.map((estado) => (
            <option key={estado.value} value={estado.value}>{estado.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
              <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando contratos...</p>
            </div>
          </div>
        ) : contratos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No se encontraron contratos' : 'No hay contratos registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Contrato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Periodicidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Comisión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => {
                  const estadoInfo = ESTADOS_CONTRATO.find(e => e.value === contrato.estado);
                  return (
                    <tr key={contrato._id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-opacity-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contrato.numeroContrato}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(contrato.fechaInicio).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getModeloNombre(contrato.modeloId)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{contrato.periodicidadPago}</p>
                      </td>
                      <td className="px-6 py-4">
                        {contrato.tipoComision === 'FIJO' ? (
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {contrato.comisionFija?.porcentaje}% Fijo
                          </p>
                        ) : (
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {contrato.comisionEscalonada?.escalaNombre}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{
                          background: `${estadoInfo?.color}20`,
                          color: estadoInfo?.color,
                        }}>
                          {estadoInfo?.label || contrato.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/clientes/contratos/${contrato._id}`)}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ border: '1px solid var(--border)' }}
                            title="Ver detalle"
                          >
                            <Eye size={16} style={{ color: 'var(--text-secondary)' }} />
                          </button>
                          {contrato.estado === 'BORRADOR' && (
                            <>
                              <button
                                onClick={() => router.push(`/clientes/contratos/${contrato._id}/editar`)}
                                className="p-2 rounded-lg transition-all duration-200"
                                style={{ border: '1px solid var(--border)' }}
                                title="Editar"
                              >
                                <Edit size={16} style={{ color: 'var(--ot-blue-600)' }} />
                              </button>
                              <button
                                onClick={() => handleDelete(contrato._id, contrato.numeroContrato)}
                                className="p-2 rounded-lg transition-all duration-200"
                                style={{ border: '1px solid var(--border)' }}
                                title="Eliminar"
                              >
                                <Trash2 size={16} style={{ color: '#ef4444' }} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

