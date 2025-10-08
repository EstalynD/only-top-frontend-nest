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
  AlertCircle 
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
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
  
  const [loading, setLoading] = useState(false);
  const [registro, setRegistro] = useState<HorasExtrasRegistro | null>(null);

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

  // ========== RENDER ==========
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Detalles de Horas Extras"
      icon={<Clock size={22} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader />
        </div>
      ) : registro ? (
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* ========== INFORMACIÓN GENERAL ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Empleado */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--ot-blue-500)' }}>
                  <User size={18} color="#ffffff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Empleado
                  </p>
                  <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {empleadoNombre}
                  </p>
                  {typeof registro.empleadoId !== 'string' && registro.empleadoId.numeroIdentificacion && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      CC: {registro.empleadoId.numeroIdentificacion}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Periodo */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--ot-purple-500)' }}>
                  <Calendar size={18} color="#ffffff" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Periodo
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatPeriodo(registro.periodo)}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Quincena {registro.quincena}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Estado */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--text-muted)' }}>
                  <FileText size={18} color="#ffffff" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Estado
                  </p>
                  <BadgeEstado estado={registro.estado} size="md" />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Registrado: {formatDate(registro.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Salario Base */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--ot-green-500)' }}>
                  <DollarSign size={18} color="#ffffff" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Salario Base
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${salarioBase.toLocaleString('es-CO')} {registro.salarioBase.moneda}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {registro.horasLaboralesMes} horas/mes
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* ========== RESUMEN DE CÁLCULOS ========== */}
          <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <ResumenCalculos
              salarioBase={salarioBase}
              horasLaboralesMes={registro.horasLaboralesMes}
              totalHoras={registro.totalHoras}
              totalRecargoCOP={totalRecargoFormateado}
              moneda={monedaSalario}
            />
          </div>
          
          {/* ========== DETALLES DE HORAS EXTRAS ========== */}
          <div>
            <h3 
              className="text-base font-semibold mb-3 flex items-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <Clock size={18} className="mr-2" style={{ color: 'var(--ot-blue-500)' }} />
              Detalles de Horas ({registro.detalles.length})
            </h3>
            
            <div className="space-y-3">
              {registro.detalles.map((detalle, index) => {
                // Backend devuelve valores ya formateados, usar directamente
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
          
          {/* ========== HISTORIAL DE APROBACIÓN ========== */}
          {registro.aprobacion && (
            <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
              <h3 
                className="text-base font-semibold mb-3 flex items-center"
                style={{ color: 'var(--text-primary)' }}
              >
                {registro.estado === 'APROBADO' ? (
                  <CheckCircle size={18} className="mr-2" style={{ color: 'var(--ot-green-500)' }} />
                ) : (
                  <XCircle size={18} className="mr-2" style={{ color: 'var(--ot-red-500)' }} />
                )}
                Historial de Aprobación
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Aprobado por:
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {typeof registro.aprobacion.aprobadoPor === 'string' 
                        ? registro.aprobacion.aprobadoPor 
                        : registro.aprobacion.aprobadoPor?.username || 'N/A'}
                    </p>
                  </div>
                  {registro.aprobacion.fechaAprobacion && (
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Fecha:
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(registro.aprobacion.fechaAprobacion)}
                      </p>
                    </div>
                  )}
                </div>
                
                {registro.aprobacion.comentarios && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                      Comentarios:
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {registro.aprobacion.comentarios}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Información de pago removida por cambio de negocio */}
          
          {/* ========== FOOTER CON ACCIONES ========== */}
          <div 
            className="flex flex-wrap gap-2 pt-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {mostrarEditar && onEdit && (
              <button
                onClick={() => { onEdit(registro._id); handleClose(); }}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: '#ffffff',
                }}
              >
                <Edit2 size={16} className="mr-2" />
                Editar
              </button>
            )}
            
            {mostrarAprobar && onAprobar && (
              <button
                onClick={() => { onAprobar(registro._id); handleClose(); }}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                style={{
                  background: 'var(--ot-green-500)',
                  color: '#ffffff',
                }}
              >
                <CheckCircle size={16} className="mr-2" />
                Aprobar/Rechazar
              </button>
            )}
            
            {/* Acción de pago removida */}
            
            {mostrarEliminar && onDelete && (
              <button
                onClick={() => { onDelete(registro._id); handleClose(); }}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                style={{
                  background: 'var(--ot-red-500)',
                  color: '#ffffff',
                }}
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="ml-auto px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
              }}
            >
              <X size={16} className="mr-2" />
              Cerrar
            </button>
          </div>
          
        </div>
      ) : (
        <div className="p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-primary)' }}>No se pudo cargar el registro</p>
        </div>
      )}
    </Modal>
  );
}
