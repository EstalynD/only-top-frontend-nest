"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Filter, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
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
  
  // Estados de loading para botones
  const [isCreating, setIsCreating] = useState(false);
  const [isApprovingBatch, setIsApprovingBatch] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // TODO: Implementar verificación de permisos cuando esté disponible
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;
  const canApprove = true;
  const canViewStats = true;

  // Configuración de columnas para DataTable
  const columns: Column<HorasExtrasRegistro>[] = [
    {
      key: 'periodo',
      title: 'Período',
      dataIndex: 'periodo',
      sortable: true,
      searchable: true,
      align: 'left',
      render: (value) => (
        <span className="text-sm font-medium">
          {formatPeriodo(value)}
        </span>
      ),
    },
    {
      key: 'empleado',
      title: 'Empleado',
      dataIndex: 'empleadoId',
      sortable: true,
      searchable: true,
      align: 'left',
      render: (value) => (
        <span className="text-sm">
          {typeof value === 'string' ? value : getNombreEmpleado(value)}
        </span>
      ),
    },
    {
      key: 'totalHoras',
      title: 'Total Horas',
      dataIndex: 'totalHoras',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-medium">
          {value.toFixed(2)} hrs
        </span>
      ),
    },
    {
      key: 'totalRecargo',
      title: 'Total COP',
      dataIndex: 'totalRecargo',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: 'estado',
      title: 'Estado',
      dataIndex: 'estado',
      sortable: true,
      align: 'left',
      render: (value) => <BadgeEstado estado={value} size="sm" />,
    },
    {
      key: 'fecha',
      title: 'Fecha',
      dataIndex: 'createdAt',
      sortable: true,
      align: 'left',
      render: (value) => (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(value)}
        </span>
      ),
    },
  ];

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

  const aplicarFiltros = async () => {
    setIsApplyingFilters(true);
    try {
      await cargarRegistros();
      setShowFilters(false);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setShowFilters(false);
  };

  // Handlers de modales
  const handleCrear = () => {
    setIsCreating(true);
    setModoEdicion(false);
    setRegistroSeleccionado(null);
    setShowModalCrear(true);
    // Simular loading para UX
    setTimeout(() => setIsCreating(false), 500);
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

  const handleAprobarLote = () => {
    setIsApprovingBatch(true);
    setShowModalAprobarLote(true);
    // Simular loading para UX
    setTimeout(() => setIsApprovingBatch(false), 500);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                <Button
                  variant="secondary"
                  size="md"
                  icon={<TrendingUp size={16} />}
                  onClick={() => {
                    window.location.href = '/rrhh/horas-extras/estadisticas';
                  }}
                  ariaLabel="Ver estadísticas de horas extras"
                >
                  Estadísticas
                </Button>
              )}

              <Button
                variant={showFilters ? "primary" : "secondary"}
                size="md"
                icon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                ariaLabel={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                ariaPressed={showFilters}
              >
                Filtros
              </Button>

              {canCreate && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus size={16} />}
                  loading={isCreating}
                  loadingText="Abriendo formulario..."
                  onClick={handleCrear}
                  ariaLabel="Registrar nuevas horas extras"
                  preventMultipleClicks={true}
                >
                  Registrar Horas Extras
                </Button>
              )}

              {canApprove && (
                <Button
                  variant="success"
                  size="md"
                  loading={isApprovingBatch}
                  loadingText="Abriendo aprobación..."
                  onClick={handleAprobarLote}
                  ariaLabel="Aprobar todas las horas extras del período"
                  preventMultipleClicks={true}
                >
                  Aceptar todos (periodo)
                </Button>
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
              <Button
                variant="primary"
                size="md"
                loading={isApplyingFilters}
                loadingText="Aplicando filtros..."
                onClick={aplicarFiltros}
                ariaLabel="Aplicar filtros seleccionados"
                preventMultipleClicks={true}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="neutral"
                size="md"
                onClick={limpiarFiltros}
                ariaLabel="Limpiar todos los filtros"
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Registros con DataTable */}
      <DataTable
        data={registros}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Buscar por período, empleado..."
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        onRowClick={(record) => handleVerDetalles(record._id)}
        emptyState={{
          icon: <Clock size={48} />,
          title: "No hay registros de horas extras",
          description: "Los registros aparecerán aquí cuando se creen"
        }}
        className="mt-6"
      />

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
          onClose={() => {
            setShowModalAprobarLote(false);
            setIsApprovingBatch(false);
          }}
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
