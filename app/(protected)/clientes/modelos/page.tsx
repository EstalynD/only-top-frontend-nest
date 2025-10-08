"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getModelos, deleteModelo, getModelosStats } from '@/lib/service-clientes/api';
import type { Modelo, ModelosStats, EmpleadoBasico } from '@/lib/service-clientes/types';
import { ESTADOS_MODELO } from '@/lib/service-clientes/constants';
import { Plus, Search, Filter, Eye, Edit, Trash2, UserCheck, TrendingUp, Users as UsersIcon } from 'lucide-react';

export default function ModelosPage() {
  const router = useRouter();
  const { token, ready } = useAuth();
  const [modelos, setModelos] = React.useState<Modelo[]>([]);
  const [stats, setStats] = React.useState<ModelosStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState<string>('all');
  const [showInactive, setShowInactive] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!ready || !token) return;
    
    setLoading(true);
    try {
      const [modelosData, statsData] = await Promise.all([
        getModelos(token, { includeInactive: showInactive }),
        getModelosStats(token),
      ]);
      setModelos(modelosData);
      setStats(statsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar modelos',
        description: error?.message || 'No se pudieron cargar los modelos',
      });
    } finally {
      setLoading(false);
    }
  }, [token, ready, showInactive]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, nombre: string) => {
    if (!token) return;
    
    if (!confirm(`¿Estás seguro de que deseas marcar como terminada a ${nombre}?`)) {
      return;
    }

    try {
      await deleteModelo(token, id);
      addToast({
        type: 'success',
        title: 'Modelo eliminada',
        description: `${nombre} ha sido marcada como terminada`,
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar la modelo',
      });
    }
  };

  const filteredModelos = React.useMemo(() => {
    return modelos.filter((modelo) => {
      const matchesSearch = modelo.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modelo.numeroIdentificacion.includes(searchTerm);
      
      const matchesEstado = filterEstado === 'all' || modelo.estado === filterEstado;
      
      return matchesSearch && matchesEstado;
    });
  }, [modelos, searchTerm, filterEstado]);

  const getSalesCloserName = (sc: string | EmpleadoBasico): string => {
    if (typeof sc === 'string') return 'N/A';
    return `${sc.nombre} ${sc.apellido}`;
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
            Modelos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Gestiona el registro y equipo asignado a cada modelo
          </p>
        </div>
        <button
          onClick={() => router.push('/clientes/modelos/nuevo')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
            color: '#ffffff',
          }}
        >
          <Plus size={18} />
          Nueva Modelo
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Modelos</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.totalModelos}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                <UsersIcon size={20} style={{ color: 'var(--ot-blue-600)' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Modelos Activas</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>{stats.modelosActivas}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#d1fae5' }}>
                <UserCheck size={20} style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Promedio Facturación</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  ${stats.promedioFacturacionMensual.toFixed(0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <TrendingUp size={20} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Modelos Inactivas</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#6b7280' }}>{stats.modelosInactivas}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f3f4f6' }}>
                <UsersIcon size={20} style={{ color: '#6b7280' }} />
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
        
        <div className="flex gap-2">
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
            {ESTADOS_MODELO.map((estado) => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowInactive(!showInactive)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200"
            style={{
              background: showInactive ? 'var(--ot-blue-50)' : 'var(--surface)',
              borderColor: showInactive ? 'var(--ot-blue-500)' : 'var(--border)',
              color: showInactive ? 'var(--ot-blue-700)' : 'var(--text-secondary)',
            }}
          >
            <Filter size={18} />
            {showInactive ? 'Todas' : 'Solo activas'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" 
                style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
              <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando modelos...</p>
            </div>
          </div>
        ) : filteredModelos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <UsersIcon size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No se encontraron modelos con ese criterio' : 'No hay modelos registradas'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Sales Closer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Facturación Promedio
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
                {filteredModelos.map((modelo) => {
                  const estadoInfo = ESTADOS_MODELO.find(e => e.value === modelo.estado);
                  return (
                    <tr key={modelo._id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-opacity-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {modelo.fotoPerfil ? (
                            <img src={modelo.fotoPerfil} alt={modelo.nombreCompleto} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                              <span className="text-sm font-medium" style={{ color: 'var(--ot-blue-700)' }}>
                                {modelo.nombreCompleto.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{modelo.nombreCompleto}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{modelo.numeroIdentificacion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{modelo.correoElectronico}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{modelo.telefono}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getSalesCloserName(modelo.salesCloserAsignado)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${modelo.promedioFacturacionMensual.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{
                          background: `${estadoInfo?.color}20`,
                          color: estadoInfo?.color,
                        }}>
                          {estadoInfo?.label || modelo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/clientes/modelos/${modelo._id}`)}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ border: '1px solid var(--border)' }}
                            title="Ver detalle"
                          >
                            <Eye size={16} style={{ color: 'var(--text-secondary)' }} />
                          </button>
                          <button
                            onClick={() => router.push(`/clientes/modelos/${modelo._id}/editar`)}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ border: '1px solid var(--border)' }}
                            title="Editar"
                          >
                            <Edit size={16} style={{ color: 'var(--ot-blue-600)' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(modelo._id, modelo.nombreCompleto)}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ border: '1px solid var(--border)' }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} style={{ color: '#ef4444' }} />
                          </button>
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

