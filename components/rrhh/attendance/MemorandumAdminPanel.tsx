"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';
import { AlertCircle, FileText, Filter, RefreshCw, Loader2, User, Clock, Calendar, CheckCircle, XCircle, MessageSquare, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import {
  adminGetTodosMemorandos,
  adminRevisarMemorandum
} from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum, MemorandumStatus, MemorandumType } from '@/lib/service-rrhh/memorandum-types';
import { getMemorandumStatusLabel, getMemorandumStatusColor, getMemorandumTypeLabel } from '@/lib/service-rrhh/memorandum-types';

interface MemorandumAdminPanelProps {
  areas?: Array<{ _id: string; name: string; code: string }>;
  cargos?: Array<{ _id: string; name: string; code: string }>;
  empleados?: Array<{ _id: string; nombre: string; apellido: string; correoElectronico: string }>;
  onUpdate?: () => void;
}

export default function MemorandumAdminPanel({ areas = [], cargos = [], onUpdate }: MemorandumAdminPanelProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  const { toast } = useToast();

  const [data, setData] = React.useState<Memorandum[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [reviewing, setReviewing] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  // Modal de revisión
  const [reviewModal, setReviewModal] = React.useState<{
    isOpen: boolean;
    memorandum: Memorandum | null;
    action: 'approve' | 'reject' | null;
  }>({ isOpen: false, memorandum: null, action: null });

  // Modal de detalles
  const [detailsModal, setDetailsModal] = React.useState<{
    isOpen: boolean;
    memorandum: Memorandum | null;
  }>({ isOpen: false, memorandum: null });

  const [reviewComment, setReviewComment] = React.useState('');

  const [filters, setFilters] = React.useState<{
    areaId: string;
    cargoId: string;
    userId: string;
    status: '' | MemorandumStatus;
    type: '' | MemorandumType;
    startDate: string;
    endDate: string;
  }>(() => ({
    areaId: '',
    cargoId: '',
    userId: '',
    status: '',
    type: '',
    startDate: '', // Usuario selecciona fecha inicial
    endDate: '' // Usuario selecciona fecha final
  }));

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const clean: any = {};
      if (filters.areaId) clean.areaId = filters.areaId;
      if (filters.cargoId) clean.cargoId = filters.cargoId;
      if (filters.userId) clean.userId = filters.userId;
      if (filters.status) clean.status = filters.status;
      if (filters.type) clean.type = filters.type;
      if (filters.startDate) clean.startDate = filters.startDate;
      if (filters.endDate) clean.endDate = filters.endDate;

      const res = await adminGetTodosMemorandos(token, clean);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Error al cargar memorandos');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (memorandumId: string, approved: boolean, comment?: string) => {
    if (!token) return;
    try {
      setReviewing(memorandumId);
      await adminRevisarMemorandum(token, memorandumId, {
        approved,
        comments: comment || ''
      });
      await load();
      onUpdate?.();
      // Cerrar modal
      setReviewModal({ isOpen: false, memorandum: null, action: null });
      setReviewComment('');
    } catch (e: any) {
      setError(e.message || 'Error al revisar memorando');
    } finally {
      setReviewing(null);
    }
  };

  const openReviewModal = (memorandum: Memorandum, action: 'approve' | 'reject') => {
    setReviewModal({ isOpen: true, memorandum, action });
    setReviewComment('');
  };

  const openDetailsModal = (memorandum: Memorandum) => {
    setDetailsModal({ isOpen: true, memorandum });
  };

  const handleConfirmReview = () => {
    if (!reviewModal.memorandum) return;
    const approved = reviewModal.action === 'approve';
    handleReview(reviewModal.memorandum._id, approved, reviewComment);
  };

  const handleDownloadPDF = async (memorandum: Memorandum) => {
    if (!token) return;
    
    setDownloading(memorandum._id);
    try {
      // Extraer el ID del empleado correcto
      const empleadoId = typeof memorandum.empleadoId === 'object' 
        ? memorandum.empleadoId._id 
        : memorandum.empleadoId;
      
      // Construir URL para generar/descargar el PDF
      const params = new URLSearchParams({
        type: memorandum.type,
        userId: empleadoId,
        date: new Date(memorandum.incidentDate).toISOString().split('T')[0]
      });

      // Usar la URL base del backend
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
      const url = `${API_BASE}/api/rrhh/memorandum/generate?${params.toString()}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al generar PDF');
      }

      // Descargar el archivo
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(memorandum as any).code || 'memorandum'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        type: 'success',
        title: 'PDF Descargado',
        description: `El memorando ${(memorandum as any).code} ha sido descargado.`
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al descargar PDF',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setDownloading(null);
    }
  };

  const stats = React.useMemo(() => ({
    total: data.length,
    pendientes: data.filter(d => d.status === 'PENDIENTE').length,
    subsanados: data.filter(d => d.status === 'SUBSANADO').length,
    enRevision: data.filter(d => d.status === 'EN_REVISIÓN').length,
    expirados: data.filter(d => d.status === 'EXPIRADO').length
  }), [data]);

  const formatDate = (s: Date | string) => {
    const d = new Date(s);
    return d.toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const daysSince = (s: Date | string) => Math.floor((Date.now() - new Date(s).getTime()) / (1000 * 60 * 60 * 24));

  const statusChipClasses = (status: MemorandumStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'SUBSANADO':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'EN_REVISIÓN':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      case 'APROBADO':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'EXPIRADO':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-100'}`}>
              <FileText size={22} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Memorandos del Sistema</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Generados automáticamente por anomalías de asistencia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-1" /> Filtros
            </Button>
            <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</div>
          </div>
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="text-2xl font-bold text-red-600">{stats.pendientes}</div>
            <div className="text-xs text-red-600">Pendientes</div>
          </div>
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <div className="text-2xl font-bold text-blue-600">{stats.subsanados}</div>
            <div className="text-xs text-blue-600">Subsanados</div>
          </div>
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="text-2xl font-bold text-yellow-600">{stats.enRevision}</div>
            <div className="text-xs text-yellow-600">En Revisión</div>
          </div>
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
            <div className="text-2xl font-bold text-gray-600">{stats.expirados}</div>
            <div className="text-xs text-gray-600">Expirados</div>
          </div>
        </div>

        {showFilters && (
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-1 gap-4">
              {/* Primera fila: Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar size={12} className="inline mr-1" />
                    Fecha Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar size={12} className="inline mr-1" />
                    Fecha Final
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Segunda fila: Estado y Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })} className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="SUBSANADO">Subsanado</option>
                    <option value="EN_REVISIÓN">En Revisión</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                    <option value="CERRADO">Cerrado</option>
                    <option value="EXPIRADO">Expirado</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tipo</label>
                  <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value as any })} className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Todos</option>
                    <option value="AUSENCIA">Ausencia</option>
                    <option value="LLEGADA_TARDE">Llegada Tarde</option>
                    <option value="SALIDA_ANTICIPADA">Salida Anticipada</option>
                    <option value="SALIDA_OMITIDA">Salida Omitida</option>
                  </select>
                </div>
              </div>

              {/* Tercera fila: Área y Cargo */}
              <div className="grid grid-cols-2 gap-3">
                {areas.length > 0 && (
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Área</label>
                    <select value={filters.areaId} onChange={(e) => setFilters({ ...filters, areaId: e.target.value })} className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="">Todas</option>
                      {areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
                {cargos.length > 0 && (
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cargo</label>
                    <select value={filters.cargoId} onChange={(e) => setFilters({ ...filters, cargoId: e.target.value })} className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="">Todos</option>
                      {cargos.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Botón para limpiar filtros */}
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters({
                    areaId: '',
                    cargoId: '',
                    userId: '',
                    status: '',
                    type: '',
                    startDate: '',
                    endDate: ''
                  })}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Info: Seleccionar fechas */}
      {!filters.startDate && !filters.endDate && (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              💡 <strong>Tip:</strong> Selecciona un rango de fechas en los filtros para ver los memorandos del período que deseas consultar.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--ot-blue-600)' }} />
        </div>
      ) : data.length === 0 ? (
        <div className={`rounded-xl p-8 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <FileText size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {!filters.startDate && !filters.endDate 
              ? 'Selecciona un rango de fechas para consultar memorandos'
              : 'No hay memorandos en este período'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {!filters.startDate && !filters.endDate
              ? 'Usa el botón "Filtros" para seleccionar las fechas que deseas consultar'
              : 'Los memorandos se generan automáticamente cuando se detectan anomalías de asistencia'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((m) => {
            const d = daysSince(m.incidentDate);
            return (
              <div key={m._id} className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-bold" style={{ color: 'var(--ot-blue-600)' }}>{(m as any).memorandumCode || (m as any).code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusChipClasses(m.status)}`}>
                        {getMemorandumStatusLabel(m.status)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700" style={{ color: 'var(--text-muted)' }}>
                        {getMemorandumTypeLabel(m.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{(m as any).employeeName || (m as any).empleadoNombre}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-1"><Calendar size={14} /><span>{formatDate(m.incidentDate)}</span></div>
                      <div className="flex items-center gap-1"><Clock size={14} /><span>Hace {d} {d === 1 ? 'día' : 'días'}</span></div>
                    </div>
                    {m.employeeJustification && (
                      <div className={`mt-3 p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                        <p className="text-xs font-medium text-blue-600 mb-1">Justificación del empleado:</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.employeeJustification}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadPDF(m)}
                      disabled={downloading === m._id}
                      className="flex items-center gap-1"
                    >
                      {downloading === m._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                      Descargar PDF
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openDetailsModal(m)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} /> Ver Detalles
                    </Button>
                    
                    {(m.status === 'SUBSANADO' || m.status === 'EN_REVISIÓN') && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          disabled={reviewing === m._id}
                          onClick={() => openReviewModal(m, 'approve')}
                        >
                          <CheckCircle size={14} /> Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                          disabled={reviewing === m._id}
                          onClick={() => openReviewModal(m, 'reject')}
                        >
                          <XCircle size={14} /> Rechazar
                        </Button>
                      </>
                    )}
                    
                    {m.status === 'PENDIENTE' && (
                      <div className={`text-xs p-2 rounded ${theme === 'dark' ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
                        Esperando justificación del empleado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Revisión */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => {
          setReviewModal({ isOpen: false, memorandum: null, action: null });
          setReviewComment('');
        }}
        title={reviewModal.action === 'approve' ? 'Aprobar Memorando' : 'Rechazar Memorando'}
        icon={reviewModal.action === 'approve' 
          ? <CheckCircle size={20} className="text-green-600" /> 
          : <XCircle size={20} className="text-red-600" />
        }
      >
        {reviewModal.memorandum && (
          <div className="space-y-4 p-4">
            <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Código:</span>{' '}
                  <span className="font-mono text-blue-600">{(reviewModal.memorandum as any).code || (reviewModal.memorandum as any).memorandumCode}</span>
                </div>
                <div>
                  <span className="font-medium">Empleado:</span>{' '}
                  {(reviewModal.memorandum as any).empleadoNombre || (reviewModal.memorandum as any).employeeName}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span>{' '}
                  {getMemorandumTypeLabel(reviewModal.memorandum.type)}
                </div>
                {reviewModal.memorandum.employeeJustification && (
                  <div className="mt-3">
                    <span className="font-medium block mb-1">Justificación:</span>
                    <p className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      {reviewModal.memorandum.employeeJustification}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Comentarios {reviewModal.action === 'reject' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  reviewModal.action === 'approve'
                    ? 'Agrega comentarios opcionales sobre la aprobación...'
                    : 'Explica por qué se rechaza el memorando (requerido)...'
                }
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setReviewModal({ isOpen: false, memorandum: null, action: null });
                  setReviewComment('');
                }}
                disabled={reviewing !== null}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmReview}
                disabled={reviewing !== null || (reviewModal.action === 'reject' && !reviewComment.trim())}
                className={`flex-1 ${
                  reviewModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {reviewing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {reviewModal.action === 'approve' ? <CheckCircle size={16} className="mr-2" /> : <XCircle size={16} className="mr-2" />}
                    {reviewModal.action === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, memorandum: null })}
        title="Detalles del Memorando"
        icon={<FileText size={20} className="text-blue-600" />}
        maxWidth="3xl"
      >
        {detailsModal.memorandum && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Código</p>
                <p className="font-mono font-bold text-blue-600">
                  {(detailsModal.memorandum as any).code || (detailsModal.memorandum as any).memorandumCode}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusChipClasses(detailsModal.memorandum.status)}`}>
                  {getMemorandumStatusLabel(detailsModal.memorandum.status)}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Empleado</p>
              <p className="font-medium">{(detailsModal.memorandum as any).empleadoNombre || (detailsModal.memorandum as any).employeeName}</p>
              {(detailsModal.memorandum as any).empleadoCargo && (
                <p className="text-sm text-gray-500">{(detailsModal.memorandum as any).empleadoCargo}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Tipo de Anomalía</p>
                <p className="font-medium">{getMemorandumTypeLabel(detailsModal.memorandum.type)}</p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Fecha del Incidente</p>
                <p className="font-medium">{formatDate(detailsModal.memorandum.incidentDate)}</p>
              </div>
            </div>

            {detailsModal.memorandum.expectedTime && (
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Hora Esperada vs Hora Real</p>
                <p className="font-medium">
                  {new Date(detailsModal.memorandum.expectedTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  {detailsModal.memorandum.actualTime && (
                    <> → {new Date(detailsModal.memorandum.actualTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </p>
              </div>
            )}

            {detailsModal.memorandum.delayMinutes && detailsModal.memorandum.delayMinutes > 0 && (
              <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className="text-xs text-yellow-700 mb-1">Retraso</p>
                <p className="font-bold text-yellow-700">{detailsModal.memorandum.delayMinutes} minutos</p>
              </div>
            )}

            {detailsModal.memorandum.employeeJustification && (
              <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                <p className="text-xs text-blue-600 font-medium mb-2">Justificación del Empleado</p>
                <p className="text-sm">{detailsModal.memorandum.employeeJustification}</p>
                {(detailsModal.memorandum as any).subsanedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Subsanado el {new Date((detailsModal.memorandum as any).subsanedAt).toLocaleString('es-PE')}
                  </p>
                )}
              </div>
            )}

            {(detailsModal.memorandum as any).reviewedByUsername && (
              <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-xs text-gray-500 mb-2">Revisión Administrativa</p>
                <p className="text-sm">
                  <span className="font-medium">Revisado por:</span> {(detailsModal.memorandum as any).reviewedByUsername}
                </p>
                {detailsModal.memorandum.reviewComments && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Comentarios:</span> {detailsModal.memorandum.reviewComments}
                  </p>
                )}
                {detailsModal.memorandum.reviewDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(detailsModal.memorandum.reviewDate).toLocaleString('es-PE')}
                  </p>
                )}
              </div>
            )}

            <Button
              variant="secondary"
              onClick={() => setDetailsModal({ isOpen: false, memorandum: null })}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
