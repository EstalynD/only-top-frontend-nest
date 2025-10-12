"use client";
import React from 'react';
import { FileText, CheckCircle, XCircle, Calendar, User, Building2, DollarSign, Clock, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Select, SelectField, type SelectOption } from '@/components/ui/selectUI';
import { aprobarContrato } from '@/lib/service-rrhh/empleados-api';
import type { Contrato } from '@/lib/service-rrhh/empleados-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contrato: Contrato | null;
  token: string;
}

export default function ContratoModal({ isOpen, onClose, onSuccess, contrato, token }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [showAprobarConfirm, setShowAprobarConfirm] = React.useState(false);
  const [showRechazarConfirm, setShowRechazarConfirm] = React.useState(false);
  const [comentarios, setComentarios] = React.useState('');
  const [nuevoEstado, setNuevoEstado] = React.useState('');

  const estadoOptions: SelectOption[] = [
    { value: 'EN_REVISION', label: 'En Revisión' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'TERMINADO', label: 'Terminado' }
  ];

  React.useEffect(() => {
    if (isOpen && contrato) {
      setComentarios(contrato.aprobacion?.comentarios || '');
      setNuevoEstado(contrato.estado);
    }
  }, [isOpen, contrato]);

  const handleAprobar = async () => {
    if (!contrato) return;

    try {
      setLoading(true);
      await aprobarContrato(contrato._id, 'APROBADO', comentarios || null, token);
      
      toast({
        type: 'success',
        title: 'Contrato aprobado',
        description: 'El contrato se aprobó correctamente.',
      });
      
      setShowAprobarConfirm(false);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error approving contract:', error);
      toast({
        type: 'error',
        title: 'Error al aprobar',
        description: (error as Error).message || 'No se pudo aprobar el contrato.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!contrato) return;

    try {
      setLoading(true);
      await aprobarContrato(contrato._id, 'RECHAZADO', comentarios || null, token);
      
      toast({
        type: 'success',
        title: 'Contrato rechazado',
        description: 'El contrato se rechazó correctamente.',
      });
      
      setShowRechazarConfirm(false);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error rejecting contract:', error);
      toast({
        type: 'error',
        title: 'Error al rechazar',
        description: (error as Error).message || 'No se pudo rechazar el contrato.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (nuevoEstadoValue: string) => {
    if (!contrato || nuevoEstadoValue === contrato.estado) return;

    try {
      setLoading(true);
      await aprobarContrato(contrato._id, nuevoEstadoValue as 'APROBADO' | 'RECHAZADO', comentarios || null, token);
      
      toast({
        type: 'success',
        title: 'Estado actualizado',
        description: `El contrato se marcó como ${estadoOptions.find(opt => opt.value === nuevoEstadoValue)?.label.toLowerCase()}.`,
      });
      
      onSuccess();
    } catch (error: unknown) {
      console.error('Error updating contract status:', error);
      toast({
        type: 'error',
        title: 'Error al actualizar',
        description: (error as Error).message || 'No se pudo actualizar el estado del contrato.',
      });
      // Revert the select value on error
      setNuevoEstado(contrato.estado);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EN_REVISION': return '#f59e0b';
      case 'APROBADO': return '#10b981';
      case 'RECHAZADO': return '#ef4444';
      case 'TERMINADO': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'EN_REVISION': return <Clock size={16} />;
      case 'APROBADO': return <CheckCircle size={16} />;
      case 'RECHAZADO': return <XCircle size={16} />;
      case 'TERMINADO': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'EN_REVISION': return 'En Revisión';
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      case 'TERMINADO': return 'Terminado';
      default: return estado;
    }
  };

  if (!contrato) return null;

  const empleado = typeof contrato.empleadoId === 'string' ? null : contrato.empleadoId;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles del Contrato"
        icon={<FileText size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="4xl"
      >
        <div className="p-6 space-y-6">
          {/* Header del Contrato */}
          <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Contrato #{contrato.numeroContrato}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {contrato.tipoContrato.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  background: `${getEstadoColor(contrato.estado)}20`,
                  color: getEstadoColor(contrato.estado)
                }}
              >
                {getEstadoIcon(contrato.estado)}
                {getEstadoLabel(contrato.estado)}
              </span>
            </div>
          </div>

          {/* Información del Empleado */}
          {empleado && (
            <div>
              <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Información del Empleado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center gap-3">
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {empleado.nombre} {empleado.apellido}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Empleado
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {typeof empleado.areaId === 'string' ? 'Sin área' : empleado.areaId.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Área
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {empleado.salario.monto.toLocaleString('es-CO')} {empleado.salario.moneda}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Salario
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {new Date(empleado.fechaInicio).toLocaleDateString('es-CO')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Fecha de inicio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información del Contrato */}
          <div>
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Información del Contrato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Número de Contrato
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {contrato.numeroContrato}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Fecha de Inicio
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(contrato.fechaInicio).toLocaleDateString('es-CO')}
                </p>
              </div>
              
              {contrato.fechaFin && (
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Fecha de Fin
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(contrato.fechaFin).toLocaleDateString('es-CO')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Aprobación */}
          {contrato.aprobacion && (
            <div>
              <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Historial de Aprobación
              </h4>
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} style={{ color: getEstadoColor(contrato.estado) }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getEstadoLabel(contrato.estado)}
                  </span>
                </div>
                {contrato.aprobacion.fechaAprobacion && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Fecha: {new Date(contrato.aprobacion.fechaAprobacion).toLocaleDateString('es-CO')}
                  </p>
                )}
                {contrato.aprobacion.comentarios && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {contrato.aprobacion.comentarios}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contenido del Contrato */}
          <div>
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Contenido del Contrato
            </h4>
            <div 
              className="p-4 rounded-lg border max-h-96 overflow-y-auto"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              dangerouslySetInnerHTML={{ __html: contrato.contenidoContrato }}
            />
          </div>

          {/* Cambiar Estado */}
          <div>
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Cambiar Estado del Contrato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Estado actual"
                value={contrato.estado}
                onChange={() => {}} // Read-only
                options={estadoOptions}
                disabled={true}
                helpText="Estado actual del contrato"
                size="md"
              />
              
              <SelectField
                label="Nuevo estado"
                value={nuevoEstado}
                onChange={(value) => {
                  setNuevoEstado(value);
                  handleEstadoChange(value);
                }}
                options={estadoOptions.filter(opt => opt.value !== contrato.estado)}
                placeholder="Seleccionar nuevo estado"
                disabled={loading}
                helpText="Selecciona el nuevo estado para el contrato"
                size="md"
                clearable={false}
              />
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Comentarios
            </h4>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Agregar comentarios sobre el contrato..."
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Creado: {new Date(contrato.createdAt).toLocaleDateString('es-CO')}
            </div>
            
            {contrato.estado === 'EN_REVISION' && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowRechazarConfirm(true)}
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Rechazar
                </Button>
                <Button
                  onClick={() => setShowAprobarConfirm(true)}
                  variant="success"
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Aprobar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmación de Aprobación */}
      <ConfirmDialog
        isOpen={showAprobarConfirm}
        title="Aprobar Contrato"
        description={
          <div>
            <p>¿Estás seguro de que deseas aprobar este contrato?</p>
            {comentarios && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Comentarios: {comentarios}
              </p>
            )}
          </div>
        }
        confirmLabel="Aprobar"
        severity="info"
        icon={<CheckCircle size={20} style={{ color: '#10b981' }} />}
        loading={loading}
        onCancel={() => setShowAprobarConfirm(false)}
        onConfirm={handleAprobar}
      />

      {/* Confirmación de Rechazo */}
      <ConfirmDialog
        isOpen={showRechazarConfirm}
        title="Rechazar Contrato"
        description={
          <div>
            <p>¿Estás seguro de que deseas rechazar este contrato?</p>
            {comentarios && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Comentarios: {comentarios}
              </p>
            )}
          </div>
        }
        confirmLabel="Rechazar"
        severity="danger"
        icon={<XCircle size={20} style={{ color: '#ef4444' }} />}
        loading={loading}
        onCancel={() => setShowRechazarConfirm(false)}
        onConfirm={handleRechazar}
      />
    </>
  );
}
