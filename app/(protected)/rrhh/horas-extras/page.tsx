"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Filter, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import BadgeEstado from '@/components/rrhh/horas-extras/BadgeEstado';
import ModalCrearEditarHorasExtras from '@/components/rrhh/horas-extras/ModalCrearEditar';
import ModalDetallesHorasExtras from '@/components/rrhh/horas-extras/ModalDetalles';
import ModalAprobarHorasExtras from '@/components/rrhh/horas-extras/ModalAprobar';
import ModalAprobarLote from '@/components/rrhh/horas-extras/ModalAprobarLote';
// Modal de pago eliminado por cambio de negocio
import {
  getHorasExtras,
  deleteHorasExtras,
  HorasExtrasRegistro,
  FiltrosHorasExtrasDto,
  EstadoHoraExtra,
  formatPeriodo,
  getNombreEmpleado,
  formatDate,
  MESSAGES,
  PERMISSIONS,
} from '@/lib/service-horas-extras';

export default function HorasExtrasPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState<HorasExtrasRegistro[]>([]);
  const [filtros, setFiltros] = useState<FiltrosHorasExtrasDto>({});
  const [showFilters, setShowFilters] = useState(false);

  // Estado de modales
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [showModalAprobarLote, setShowModalAprobarLote] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // TODO: Implementar verificación de permisos cuando esté disponible
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;
  const canApprove = true;
  const canViewStats = true;

  useEffect(() => {
    cargarRegistros();
  }, [token]);

  const cargarRegistros = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await getHorasExtras(filtros, token);
      setRegistros(data);
    } catch (error: any) {
      console.error('Error al cargar registros:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message || MESSAGES.error.fetch,
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarRegistros();
    setShowFilters(false);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setShowFilters(false);
  };

  // Handlers de modales
  const handleCrear = () => {
    setModoEdicion(false);
    setRegistroSeleccionado(null);
    setShowModalCrear(true);
  };

  const handleEditar = (id: string) => {
    setModoEdicion(true);
    setRegistroSeleccionado(id);
    setShowModalCrear(true);
  };

  const handleVerDetalles = (id: string) => {
    setRegistroSeleccionado(id);
    setShowModalDetalles(true);
  };

  const handleAprobar = (id: string) => {
    setRegistroSeleccionado(id);
    setShowModalAprobar(true);
  };

  // Flujo de pago removido

  const handleEliminar = async (id: string) => {
    if (!token) return;
    
    if (!confirm(MESSAGES.confirmation.delete)) {
      return;
    }

    try {
      await deleteHorasExtras(id, token);
      addToast({
        type: 'success',
        title: 'Éxito',
        description: MESSAGES.success.deleted,
      });
      cargarRegistros();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message || MESSAGES.error.delete,
      });
    }
  };

  const handleModalSuccess = () => {
    cargarRegistros();
  };

  const toastHandler = (message: string, type: 'success' | 'error') => {
    addToast({
      type,
      title: type === 'success' ? 'Éxito' : 'Error',
      description: message,
    });
  };

  // Estilos compartidos
  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const headerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    background: 'var(--ot-blue-500)',
    color: '#ffffff',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div style={cardStyle}>
        <div className="p-4 sm:p-6" style={headerStyle}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--ot-blue-500) 0%, var(--ot-blue-600) 100%)',
                }}
              >
                <Clock size={24} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Horas Extras y Recargos
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Gestión de horas extras y recargos laborales
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canViewStats && (
                <button
                  onClick={() => {
                    window.location.href = '/rrhh/horas-extras/estadisticas';
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--surface-muted)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <TrendingUp size={16} />
                  Estadísticas
                </button>
              )}

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: showFilters ? 'var(--ot-blue-500)' : 'var(--surface-muted)',
                  color: showFilters ? '#ffffff' : 'var(--text-primary)',
                  border: `1px solid ${showFilters ? 'var(--ot-blue-500)' : 'var(--border)'}`,
                }}
              >
                <Filter size={16} />
                Filtros
              </button>

              {canCreate && (
                <button
                  onClick={handleCrear}
                  className="flex items-center gap-2 transition-colors"
                  style={buttonPrimaryStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--ot-blue-600)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--ot-blue-500)';
                  }}
                >
                  <Plus size={16} />
                  Registrar Horas Extras
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() => setShowModalAprobarLote(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--ot-green-500)',
                    color: '#ffffff',
                    border: '1px solid var(--ot-green-500)',
                  }}
                >
                  Aceptar todos (periodo)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* TODO: Implementar campos de filtros */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Estado
                </label>
                <select
                  value={filtros.estado || ''}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoHoraExtra })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Todos</option>
                  <option value={EstadoHoraExtra.PENDIENTE}>Pendiente</option>
                  <option value={EstadoHoraExtra.APROBADO}>Aprobado</option>
                  {/* Estado PAGADO removido */}
                  <option value={EstadoHoraExtra.RECHAZADO}>Rechazado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={buttonPrimaryStyle}
              >
                Aplicar Filtros
              </button>
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Registros */}
      <div style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Periodo
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Empleado
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total Horas
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total COP
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Estado
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Clock size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No hay registros de horas extras</p>
                    <p className="text-xs mt-1">Los registros aparecerán aquí</p>
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr
                    key={registro._id}
                    className="border-b transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => handleVerDetalles(registro._id)}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-sm font-medium">
                        {formatPeriodo(registro.periodo)}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-sm">
                        {typeof registro.empleadoId === 'string'
                          ? registro.empleadoId
                          : getNombreEmpleado(registro.empleadoId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-sm font-medium">
                        {registro.totalHoras.toFixed(2)} hrs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-sm font-semibold">
                        {registro.totalRecargo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={registro.estado} size="sm" />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      <span className="text-xs">{formatDate(registro.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODALES ========== */}
      
      {/* Modal Crear/Editar */}
      {token && (
        <ModalCrearEditarHorasExtras
          isOpen={showModalCrear}
          onClose={() => {
            setShowModalCrear(false);
            // Delay para limpiar el estado después de que el modal se cierre visualmente
            setTimeout(() => {
              setRegistroSeleccionado(null);
              setModoEdicion(false);
            }, 300);
          }}
          onSuccess={handleModalSuccess}
          token={token}
          addToast={toastHandler}
          registroId={modoEdicion && registroSeleccionado ? registroSeleccionado : undefined}
        />
      )}

      {/* Modal Detalles */}
      {token && (
        <ModalDetallesHorasExtras
          isOpen={showModalDetalles}
          onClose={() => {
            setShowModalDetalles(false);
            // Delay para limpiar el estado después de que el modal se cierre visualmente
            setTimeout(() => {
              setRegistroSeleccionado(null);
            }, 300);
          }}
          registroId={registroSeleccionado}
          token={token}
          addToast={toastHandler}
          onEdit={handleEditar}
          onDelete={handleEliminar}
          onAprobar={handleAprobar}
          // onPagar removido
          canUpdate={canUpdate}
          canDelete={canDelete}
          canApprove={canApprove}
        />
      )}

      {/* Modal Aprobar */}
      {token && (
        <ModalAprobarHorasExtras
          isOpen={showModalAprobar}
          onClose={() => {
            setShowModalAprobar(false);
            setRegistroSeleccionado(null);
          }}
          onSuccess={handleModalSuccess}
          registroId={registroSeleccionado}
          token={token}
          addToast={toastHandler}
        />
      )}

      {/* Modal Pagar eliminado */}

      {/* Modal Aprobar Lote */}
      {token && (
        <ModalAprobarLote
          isOpen={showModalAprobarLote}
          onClose={() => setShowModalAprobarLote(false)}
          onSuccess={handleModalSuccess}
          anio={filtros.anio || new Date().getFullYear()}
          mes={filtros.mes || (new Date().getMonth() + 1)}
          quincena={filtros.quincena}
          token={token}
          addToast={toastHandler}
        />
      )}
    </div>
  );
}
