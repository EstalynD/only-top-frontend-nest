/**
 * Modal para visualizar detalles completos de un registro de Horas Extras
 * Muestra información completa, breakdown de cálculos, historial de aprobación
 * y botones de acción contextuales según estado y permisos
 */

"use client";
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  X, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  Building2,
  Hash,
  Settings
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import BadgeEstado from './BadgeEstado';
import ResumenCalculos from './ResumenCalculos';
import Loader from '@/components/ui/Loader';
import { getHorasExtrasById } from '@/lib/service-horas-extras/api';
import type { HorasExtrasRegistro } from '@/lib/service-horas-extras/types';
import { 
  formatDate, 
  formatDateTime,
  formatDateShort,
  formatPeriodo,
  getNombreEmpleado,
  getTipoHoraLabel,
  formatRecargoPorcentaje,
  calcularValorHoraConRecargo,
  puedeEditar,
  puedeEliminar,
  puedeAprobar,
  TIPO_HORA_COLORS,
} from '@/lib/service-horas-extras';

interface ModalDetallesHorasExtrasProps {
  isOpen: boolean;
  onClose: () => void;
  registroId: string | null;
  token: string;
  addToast: (message: string, type: 'success' | 'error') => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAprobar?: (id: string) => void;
  // onPagar?: (id: string) => void;
  // Permisos (TODO: integrar con RBAC context)
  canUpdate?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  // canPay?: boolean;
}

export default function ModalDetallesHorasExtras({
  isOpen,
  onClose,
  registroId,
  token,
  addToast,
  onEdit,
  onDelete,
  onAprobar,
  // onPagar,
  canUpdate = true,
  canDelete = true,
  canApprove = true,
  // canPay = true,
}: ModalDetallesHorasExtrasProps) {
  
  // ========== HOOKS Y ESTADO ==========
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: true // Permitir cerrar al hacer click en backdrop para modales de solo lectura
  });

  // Helper styles for consistent styling
  const cardStyle = {
    background: 'var(--surface-muted)',
    borderRadius: '0.5rem',
    padding: '1rem',
    border: '1px solid var(--border)'
  };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: 'var(--text-muted)'
  };

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [registro, setRegistro] = useState<HorasExtrasRegistro | null>(null);

  // Sincronizar el estado del modal con las props
  useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  useEffect(() => {
    if (isOpen && registroId) {
      cargarRegistro();
    }
  }, [isOpen, registroId]);

  async function cargarRegistro() {
    if (!registroId) return;
    
    setLoading(true);
    try {
      const data = await getHorasExtrasById(registroId, token);
      setRegistro(data);
    } catch (error) {
      console.error('Error al cargar registro:', error);
      addToast('Error al cargar el registro', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    modal.closeModal();
    onClose();
    setTimeout(() => setRegistro(null), 300);
  }

  if (!isOpen || !registroId) return null;

  // ========== HELPERS ==========
  
  const empleadoNombre = registro && typeof registro.empleadoId !== 'string' 
    ? getNombreEmpleado(registro.empleadoId)
    : 'Empleado';
  
  const salarioBase = registro?.salarioBase.monto || 0;
  const monedaSalario = registro?.salarioBase.moneda || 'USD';
  
  // Usar valores RAW para cálculos (números), valores formateados solo para display
  const valorHoraOrdinariaRaw = registro?._raw?.valorHoraOrdinaria || 0;
  const totalRecargoRaw = registro?._raw?.totalRecargo || 0;
  
  // Valores formateados para mostrar (strings)
  const totalRecargoFormateado = registro?.totalRecargo || '$ 0.00';
  
  const mostrarEditar = registro && canUpdate && puedeEditar(registro.estado);
  const mostrarEliminar = registro && canDelete && puedeEliminar(registro.estado);
  const mostrarAprobar = registro && canApprove && puedeAprobar(registro.estado);
  // const mostrarPagar = false; // flujo de pago removido

  // Footer del modal con acciones
  const modalFooter = (
    <div className="flex flex-wrap gap-2 justify-end">
      {mostrarEditar && onEdit && (
        <Button
          variant="primary"
          onClick={() => { onEdit(registro!._id); handleClose(); }}
          size="sm"
        >
          <Edit2 size={16} />
          Editar
        </Button>
      )}
      
      {mostrarAprobar && onAprobar && (
        <Button
          variant="success"
          onClick={() => { onAprobar(registro!._id); handleClose(); }}
          size="sm"
        >
          <CheckCircle size={16} />
          Aprobar/Rechazar
        </Button>
      )}
      
      {mostrarEliminar && onDelete && (
        <Button
          variant="danger"
          onClick={() => { onDelete(registro!._id); handleClose(); }}
          size="sm"
        >
          <Trash2 size={16} />
          Eliminar
        </Button>
      )}
      
      <Button
        variant="neutral"
        onClick={handleClose}
        size="sm"
      >
        <X size={16} />
        Cerrar
      </Button>
    </div>
  );

  // ========== RENDER ==========
  
  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title="Detalles de Horas Extras"
      icon={<Clock size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="6xl"
      description="Información completa del registro de horas extras y sus cálculos."
      footer={modalFooter}
      closeOnBackdropClick={true}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loading}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando detalles del registro...
          </p>
        </div>
      }
    >
      {registro ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Layout principal con dos columnas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Información del Empleado */}
              <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <User size={16} />
                  Información del Empleado
                </h3>
                <div className="space-y-2">
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {empleadoNombre}
                    </p>
                  </div>
                  {typeof registro.empleadoId !== 'string' && registro.empleadoId.numeroIdentificacion && (
                    <div>
                      <label style={labelStyle}>Identificación</label>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        CC: {registro.empleadoId.numeroIdentificacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Período */}
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Calendar size={16} />
                  Información del Período
                </h3>
                <div className="space-y-3">
                  <div>
                    <label style={labelStyle}>Período</label>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatPeriodo(registro.periodo)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Quincena {registro.quincena}
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de Registro</label>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(registro.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado y Salario */}
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Settings size={16} />
                  Estado y Configuración
                </h3>
                <div className="space-y-3">
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <div className="mt-1">
                      <BadgeEstado estado={registro.estado} size="md" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Salario Base</label>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${salarioBase.toLocaleString('es-CO')} {registro.salarioBase.moneda}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {registro.horasLaboralesMes} horas/mes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Resumen de Cálculos */}
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Hash size={16} />
                  Resumen de Cálculos
                </h3>
                <ResumenCalculos
                  salarioBase={salarioBase}
                  horasLaboralesMes={registro.horasLaboralesMes}
                  totalHoras={registro.totalHoras}
                  totalRecargoCOP={totalRecargoFormateado}
                  moneda={monedaSalario}
                />
              </div>

              {/* Historial de Aprobación */}
              {registro.aprobacion && (
                <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {registro.estado === 'APROBADO' ? (
                      <CheckCircle size={16} style={{ color: 'var(--ot-green-500)' }} />
                    ) : (
                      <XCircle size={16} style={{ color: 'var(--ot-red-500)' }} />
                    )}
                    Historial de Aprobación
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Aprobado por</label>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {typeof registro.aprobacion.aprobadoPor === 'string' 
                            ? registro.aprobacion.aprobadoPor 
                            : registro.aprobacion.aprobadoPor?.username || 'N/A'}
                        </p>
                      </div>
                      {registro.aprobacion.fechaAprobacion && (
                        <div>
                          <label style={labelStyle}>Fecha de Aprobación</label>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {formatDateTime(registro.aprobacion.fechaAprobacion)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {registro.aprobacion.comentarios && (
                      <div>
                        <label style={labelStyle}>Comentarios</label>
                        <div className="mt-1 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {registro.aprobacion.comentarios}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detalles de Horas Extras - Ancho completo */}
          <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock size={16} />
              Detalles de Horas Extras ({registro.detalles.length})
            </h3>
            
            <div className="space-y-3">
              {registro.detalles.map((detalle, index) => {
                const totalDetalleFormateado = detalle.total || '$ 0.00';
                
                return (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border)',
                      background: 'var(--surface)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      
                      {/* Tipo y horas */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ background: TIPO_HORA_COLORS[detalle.tipo] }}
                          />
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {getTipoHoraLabel(detalle.tipo)}
                          </span>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              background: 'var(--surface-muted)',
                              color: 'var(--text-muted)' 
                            }}
                          >
                            +{formatRecargoPorcentaje(detalle.tipo)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Cantidad</p>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {detalle.cantidadHoras.toFixed(2)} h
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Fecha</p>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {formatDateShort(detalle.fechaRegistro)}
                            </p>
                          </div>
                        </div>
                        
                        {detalle.observaciones && (
                          <div className="mt-2 p-2 rounded" style={{ background: 'var(--surface-muted)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Observaciones:
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {detalle.observaciones}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Total del detalle */}
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          Subtotal
                        </p>
                        <p className="text-lg font-bold" style={{ color: 'var(--ot-green-500)' }}>
                          {totalDetalleFormateado}
                        </p>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8">
          <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-primary)' }}>No se pudo cargar el registro</p>
        </div>
      )}
    </Modal>
  );
}
