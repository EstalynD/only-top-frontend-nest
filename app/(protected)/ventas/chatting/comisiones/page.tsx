"use client";
import React from 'react';
import {
  DollarSign,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  getCommissions,
  getCommissionStatistics,
  generateCommissions,
  approveCommission,
  rejectCommission,
  payCommission,
  bulkApproveCommissions,
  bulkPayCommissions,
} from '@/lib/service-chatter/commissions-api';
import type {
  ChatterCommission,
  FilterCommissionsDto,
  CommissionStatus,
  CommissionStatistics,
  GenerateCommissionsDto,
} from '@/lib/service-chatter/commissions-types';
import Loader from '@/components/ui/Loader';
import { addToast } from '@/components/ui/Toast';

// ========== HELPER COMPONENTS ==========

function StatsCard({ title, value, subtitle, icon: Icon, iconColor }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  iconColor: string;
}) {
  return (
    <div
      className="p-6 rounded-xl border transition-all hover:shadow-lg"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}20` }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function ChatterCommissionsPage() {
  const { token } = useAuth();
  const [commissions, setCommissions] = React.useState<ChatterCommission[]>([]);
  const [stats, setStats] = React.useState<CommissionStatistics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showGenerateModal, setShowGenerateModal] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedCommissions, setSelectedCommissions] = React.useState<Set<string>>(new Set());

  const [filters, setFilters] = React.useState<FilterCommissionsDto>({});

  const loadData = React.useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [commissionsData, statsData] = await Promise.all([
        getCommissions(token, filters),
        getCommissionStatistics(
          token,
          filters.chatterId,
          filters.modeloId,
          filters.fechaInicio,
          filters.fechaFin,
        ),
      ]);

      setCommissions(commissionsData);
      setStats(statsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al cargar datos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    if (!token) return;

    try {
      await approveCommission(token, id, {});
      addToast({
        type: 'success',
        title: 'Comisión aprobada',
        description: 'La comisión ha sido aprobada exitosamente',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason || !token) return;

    try {
      await rejectCommission(token, id, { observaciones: reason });
      addToast({
        type: 'success',
        title: 'Comisión rechazada',
        description: 'La comisión ha sido rechazada',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handlePay = async (id: string) => {
    const reference = prompt('Referencia de pago (opcional):');
    if (!token) return;

    try {
      await payCommission(token, id, { referenciaPago: reference || undefined });
      addToast({
        type: 'success',
        title: 'Comisión pagada',
        description: 'La comisión ha sido marcada como pagada',
      });
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCommissions.size === 0 || !token) return;
    if (!confirm(`¿Aprobar ${selectedCommissions.size} comisiones seleccionadas?`)) return;

    try {
      const result = await bulkApproveCommissions(token, {
        commissionIds: Array.from(selectedCommissions),
      });
      
      addToast({
        type: result.failed > 0 ? 'info' : 'success',
        color: result.failed > 0 ? 'warning' : undefined,
        title: 'Aprobación masiva completada',
        description: `${result.approved} aprobadas, ${result.failed} fallidas`,
      });
      
      setSelectedCommissions(new Set());
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleBulkPay = async () => {
    if (selectedCommissions.size === 0 || !token) return;
    const reference = prompt('Referencia de pago para el lote (opcional):');

    try {
      const result = await bulkPayCommissions(token, {
        commissionIds: Array.from(selectedCommissions),
        referenciaPago: reference || undefined,
      });
      
      addToast({
        type: result.failed > 0 ? 'info' : 'success',
        color: result.failed > 0 ? 'warning' : undefined,
        title: 'Pago masivo completado',
        description: `${result.paid} pagadas, ${result.failed} fallidas`,
      });
      
      setSelectedCommissions(new Set());
      loadData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedCommissions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCommissions(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedCommissions.size === commissions.length) {
      setSelectedCommissions(new Set());
    } else {
      setSelectedCommissions(new Set(commissions.map(c => c._id)));
    }
  };

  const getStatusBadge = (status: CommissionStatus) => {
    const config = {
      PENDIENTE: { bg: '#f59e0b', text: 'Pendiente' },
      APROBADA: { bg: 'var(--ot-blue-500)', text: 'Aprobada' },
      PAGADA: { bg: '#10b981', text: 'Pagada' },
      CANCELADA: { bg: '#ef4444', text: 'Cancelada' },
    };

    const { bg, text } = config[status];

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: bg, color: 'white' }}
      >
        {text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const containerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Comisiones de Chatters
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gestión de comisiones calculadas según cumplimiento de metas
        </p>
      </div>

      {/* Stats Cards */}
      {loading && !stats ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Comisiones"
            value={stats.totalCommissions}
            subtitle="Registradas"
            icon={DollarSign}
            iconColor="var(--ot-blue-500)"
          />
          <StatsCard
            title="Pendientes"
            value={stats.pendingCommissions}
            subtitle={formatCurrency(stats.pendingAmount)}
            icon={Clock}
            iconColor="#f59e0b"
          />
          <StatsCard
            title="Pagadas"
            value={stats.paidCommissions}
            subtitle={formatCurrency(stats.paidAmount)}
            icon={CheckCircle}
            iconColor="#10b981"
          />
          <StatsCard
            title="Promedio"
            value={formatCurrency(stats.avgCommission)}
            subtitle="Por comisión"
            icon={TrendingUp}
            iconColor="#8b5cf6"
          />
        </div>
      ) : null}

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{ background: 'var(--ot-blue-500)', color: 'white' }}
        >
          <Plus size={16} className="inline mr-2" />
          Generar Comisiones
        </button>

        {selectedCommissions.size > 0 && (
          <>
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: '#10b981', color: 'white' }}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Aprobar ({selectedCommissions.size})
            </button>
            <button
              onClick={handleBulkPay}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: '#8b5cf6', color: 'white' }}
            >
              <CreditCard size={16} className="inline mr-2" />
              Pagar ({selectedCommissions.size})
            </button>
          </>
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: showFilters ? 'var(--ot-blue-500)' : 'var(--surface-muted)',
            color: showFilters ? 'white' : 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <Filter size={16} className="inline mr-2" />
          Filtros
        </button>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={16} className="inline mr-2" />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={containerStyle}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Filtros de Búsqueda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADA">Aprobada</option>
                <option value="PAGADA">Pagada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio || ''}
                onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.fechaFin || ''}
                onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              Limpiar
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--ot-blue-500)', color: 'white' }}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Commissions Table */}
      <div style={containerStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Comisiones
          </h2>
          {commissions.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--ot-blue-500)' }}
            >
              {selectedCommissions.size === commissions.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No hay comisiones registradas
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Genera comisiones para comenzar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCommissions.size === commissions.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Chatter
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Modelo
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Periodo
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Ventas
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    % Comisión
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Monto
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Estado
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr
                    key={commission._id}
                    className="transition-colors hover:bg-[var(--surface-muted)]"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.has(commission._id)}
                        onChange={() => toggleSelection(commission._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {commission.chatterId.nombre} {commission.chatterId.apellido}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {commission.turno}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {commission.modeloId.nombreCompleto}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(commission.fechaInicio)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(commission.fechaFin)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(commission.montoVentas)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {commission.totalVentas} ventas
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--ot-blue-500)' }}>
                        {commission.porcentajeComision}%
                      </p>
                      {commission.porcentajeCumplimientoGrupo && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {commission.porcentajeCumplimientoGrupo.toFixed(0)}% meta
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-bold" style={{ color: '#10b981' }}>
                        {formatCurrency(commission.montoComision)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(commission.estado)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {commission.estado === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={() => handleApprove(commission._id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ background: '#10b981', color: 'white' }}
                              title="Aprobar"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(commission._id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ background: '#ef4444', color: 'white' }}
                              title="Rechazar"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {commission.estado === 'APROBADA' && (
                          <button
                            onClick={() => handlePay(commission._id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: '#8b5cf6', color: 'white' }}
                            title="Marcar como pagada"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateCommissionsModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

// ========== GENERATE MODAL ==========

function GenerateCommissionsModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const [formData, setFormData] = React.useState<GenerateCommissionsDto>({
    fechaInicio: '',
    fechaFin: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      const response = await generateCommissions(token, formData);
      setResult(response);
      
      addToast({
        type: 'success',
        title: 'Comisiones generadas',
        description: `${response.summary.totalComisiones} comisiones creadas exitosamente`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onSuccess();
    }
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Generar Comisiones
        </h2>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                ℹ️ Información
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>• Se generarán comisiones para todos los grupos activos</li>
                <li>• Supernumerarios recibirán 1% fijo de sus ventas</li>
                <li>• Chatters principales recibirán según cumplimiento de meta del grupo</li>
                <li>• Las comisiones creadas quedarán en estado PENDIENTE</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: 'var(--surface-muted)',
                  color: 'var(--text-primary)',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: 'white',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Generando...' : 'Generar Comisiones'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className="p-6 rounded-lg border text-center"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
            >
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                ¡Comisiones generadas exitosamente!
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    Total comisiones
                  </p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {result.summary.totalComisiones}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    Monto total
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    ${result.summary.montoTotalComisiones.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    Grupos procesados
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {result.summary.totalModelos}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    Chatters
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {result.summary.totalChatters}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--ot-blue-500)', color: 'white' }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

