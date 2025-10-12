"use client";
import React from 'react';
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/selectUI";
import { useAuth } from "@/lib/auth";
import { updateDocumento, validarDocumento } from "@/lib/service-rrhh/documentos-api";
import type { Documento, UpdateDocumentoDto, ValidarDocumentoDto } from "@/lib/service-rrhh/contratos-types";
import { 
  FileText, 
  Edit3, 
  Calendar, 
  Shield, 
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export type EditarDocumentoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documento: Documento | null;
  onUpdated?: () => void;
};

// Opciones válidas para cambio de estado vía ValidarDocumentoDto
const ESTADO_CAMBIO_OPCIONES = [
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
];

const TIPO_DOCUMENTO_OPCIONES = [
  { value: 'CEDULA_IDENTIDAD', label: 'Cédula de identidad' },
  { value: 'RUT', label: 'RUT' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICADO_ACADEMICO', label: 'Certificado académico' },
  { value: 'CERTIFICADO_LABORAL', label: 'Certificado laboral' },
  { value: 'CERTIFICADO_MEDICO', label: 'Certificado médico' },
  { value: 'CERTIFICADO_PENALES', label: 'Certificado de penales' },
  { value: 'CERTIFICADO_POLICIA', label: 'Certificado de policía' },
  { value: 'CONTRATO_LABORAL', label: 'Contrato laboral' },
  { value: 'HOJA_VIDA', label: 'Hoja de vida' },
  { value: 'FOTO_PERFIL', label: 'Foto de perfil' },
  { value: 'OTRO', label: 'Otro' },
];

export default function EditarDocumentoModal({ isOpen, onClose, documento, onUpdated }: EditarDocumentoModalProps) {
  const { token } = useAuth();

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'edit' | 'status'>('edit');

  // Form state para edición
  const [nombre, setNombre] = React.useState("");
  const [tipoDocumento, setTipoDocumento] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [fechaEmision, setFechaEmision] = React.useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = React.useState<string>("");
  const [esConfidencial, setEsConfidencial] = React.useState(false);
  const [tags, setTags] = React.useState<string>("");

  // Form state para cambio de estado
  // Solo se permite cambiar a APROBADO o RECHAZADO
  const [estado, setEstado] = React.useState<'APROBADO' | 'RECHAZADO' | ''>('');
  const [observaciones, setObservaciones] = React.useState("");
  const [esValido, setEsValido] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (documento && isOpen) {
      setError(null);
      setSuccess(null);
      setActiveTab('edit');
      
      // Cargar datos del documento
      setNombre(documento.nombre);
      setTipoDocumento(documento.tipoDocumento);
      setDescripcion(documento.descripcion);
      setFechaEmision(documento.fechaEmision ? new Date(documento.fechaEmision).toISOString().split('T')[0] : '');
      setFechaVencimiento(documento.fechaVencimiento ? new Date(documento.fechaVencimiento).toISOString().split('T')[0] : '');
      setEsConfidencial(documento.esConfidencial || false);
      setTags(documento.tags ? documento.tags.join(', ') : '');
      
      // Datos para cambio de estado
  // Inicializar estado solo si es un valor permitido por la API de validación
  setEstado(documento.estado === 'APROBADO' || documento.estado === 'RECHAZADO' ? documento.estado : '');
      setObservaciones(documento.validacion?.observaciones || '');
      setEsValido(documento.validacion?.esValido || null);
    }
  }, [documento, isOpen]);

  const resetForm = () => {
    setNombre("");
    setTipoDocumento("");
    setDescripcion("");
    setFechaEmision("");
    setFechaVencimiento("");
    setEsConfidencial(false);
    setTags("");
    setEstado("");
    setObservaciones("");
    setEsValido(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const canSubmitEdit = !!(nombre && tipoDocumento && descripcion && fechaEmision && token);
  const canSubmitStatus = !!(estado && token);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitEdit || !documento || !token) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const payload: UpdateDocumentoDto = {
        nombre,
        descripcion,
        fechaEmision,
        fechaVencimiento: fechaVencimiento || undefined,
        esConfidencial,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      };
      
      await updateDocumento(documento._id, payload, token);
      setSuccess('Documento actualizado correctamente');
      onUpdated?.();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar el documento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitStatus || !documento || !token) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const payload: ValidarDocumentoDto = {
        estado,
        observaciones: observaciones || undefined,
        esValido: esValido !== null ? esValido : undefined,
      };
      
      await validarDocumento(documento._id, payload, token);
      setSuccess(`Estado cambiado a ${estado.toLowerCase()}`);
      onUpdated?.();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cambiar el estado del documento');
    } finally {
      setSubmitting(false);
    }
  };

  if (!documento) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Editar Documento" 
      icon={<Edit3 size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="4xl"
    >
      <div className="p-4 sm:p-6">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3" 
               style={{ 
                 background: 'var(--danger-50)', 
                 borderColor: 'var(--danger-500)',
                 borderLeftColor: 'var(--danger-500)'
               }}>
            <AlertCircle size={20} style={{ color: 'var(--danger-500)' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium" style={{ color: 'var(--danger-700)' }}>Error al procesar</p>
              <p className="text-sm mt-1" style={{ color: 'var(--danger-600)' }}>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3" 
               style={{ 
                 background: 'var(--success-50)', 
                 borderColor: 'var(--success-500)',
                 borderLeftColor: 'var(--success-500)'
               }}>
            <CheckCircle size={20} style={{ color: 'var(--success-500)' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium" style={{ color: 'var(--success-700)' }}>Operación exitosa</p>
              <p className="text-sm mt-1" style={{ color: 'var(--success-600)' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Professional Tabs */}
        <div className="flex border-b mb-6" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'edit' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{
              borderBottomColor: activeTab === 'edit' ? 'var(--ot-blue-500)' : 'transparent',
              color: activeTab === 'edit' ? 'var(--ot-blue-600)' : 'var(--text-muted)'
            }}
          >
            <Edit3 size={16} />
            Editar Información
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'status' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{
              borderBottomColor: activeTab === 'status' ? 'var(--ot-blue-500)' : 'transparent',
              color: activeTab === 'status' ? 'var(--ot-blue-600)' : 'var(--text-muted)'
            }}
          >
            <Settings size={16} />
            Cambiar Estado
          </button>
        </div>

        {activeTab === 'edit' ? (
          <form onSubmit={handleEditSubmit} className="space-y-8">
            {/* Sección 1: Información Básica */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <FileText size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Información Básica
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Nombre del documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="ot-input"
                    placeholder="Ej: Cédula de identidad escaneada"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={tipoDocumento}
                    onChange={setTipoDocumento}
                    options={TIPO_DOCUMENTO_OPCIONES}
                    placeholder="Seleccione el tipo..."
                    fullWidth
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="ot-input"
                  rows={3}
                  placeholder="Breve descripción del contenido del documento..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  required
                />
              </div>
            </section>

            {/* Sección 2: Fechas y Vigencia */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <Calendar size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Fechas y Vigencia
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Fecha de emisión <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="ot-input"
                    value={fechaEmision}
                    onChange={e => setFechaEmision(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Fecha de vencimiento
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                  </label>
                  <input
                    type="date"
                    className="ot-input"
                    value={fechaVencimiento}
                    onChange={e => setFechaVencimiento(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Sección 3: Configuración Avanzada */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <Shield size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Configuración Avanzada
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <input 
                      id="confidencial-edit" 
                      type="checkbox" 
                      checked={esConfidencial} 
                      onChange={e => setEsConfidencial(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <label htmlFor="confidencial-edit" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                        Documento confidencial
                      </label>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Restringe el acceso solo a usuarios autorizados
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <Tag size={16} />
                    Tags de clasificación
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                  </label>
                  <input
                    className="ot-input"
                    placeholder="identidad, legal, personal, certificado"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Separa múltiples tags con comas para facilitar la búsqueda
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button 
                type="button" 
                onClick={handleClose} 
                disabled={submitting}
                className="px-4 py-2 rounded-lg font-medium transition-all border"
                style={{ 
                  background: 'var(--surface)', 
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)'
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!canSubmitEdit || submitting} 
                className="px-6 py-2 rounded-lg font-medium transition-all text-white flex items-center gap-2"
                style={{ 
                  background: canSubmitEdit && !submitting 
                    ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' 
                    : 'var(--surface-muted)',
                  color: canSubmitEdit && !submitting ? 'white' : 'var(--text-muted)'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Edit3 size={16} />
                    Actualizar documento
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStatusSubmit} className="space-y-8">
            {/* Sección 1: Estado del Documento */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <Settings size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Cambio de Estado
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <Clock size={16} />
                    Estado actual
                  </label>
                  <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {documento.estado}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Nuevo estado <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={estado}
                    onChange={(v) => setEstado(v as 'APROBADO' | 'RECHAZADO')}
                    options={ESTADO_CAMBIO_OPCIONES}
                    placeholder="Seleccione nuevo estado..."
                    fullWidth
                  />
                </div>
              </div>
            </section>

            {/* Sección 2: Validación del Documento */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Validación del Documento
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    ¿Es válido el documento?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-blue-50" 
                           style={{ 
                             borderColor: esValido === true ? 'var(--ot-blue-500)' : 'var(--border)',
                             background: esValido === true ? 'var(--ot-blue-50)' : 'var(--surface)'
                           }}>
                      <input
                        type="radio"
                        name="esValido"
                        checked={esValido === true}
                        onChange={() => setEsValido(true)}
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} style={{ color: 'var(--success-500)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sí</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-red-50" 
                           style={{ 
                             borderColor: esValido === false ? 'var(--danger-500)' : 'var(--border)',
                             background: esValido === false ? 'var(--danger-50)' : 'var(--surface)'
                           }}>
                      <input
                        type="radio"
                        name="esValido"
                        checked={esValido === false}
                        onChange={() => setEsValido(false)}
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <XCircle size={16} style={{ color: 'var(--danger-500)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50" 
                           style={{ 
                             borderColor: esValido === null ? 'var(--border)' : 'var(--border)',
                             background: esValido === null ? 'var(--surface-muted)' : 'var(--surface)'
                           }}>
                      <input
                        type="radio"
                        name="esValido"
                        checked={esValido === null}
                        onChange={() => setEsValido(null)}
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sin especificar</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 3: Observaciones */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <FileText size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Observaciones
                </h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Comentarios sobre el cambio de estado
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                </label>
                <textarea
                  className="ot-input"
                  rows={4}
                  placeholder="Describe el motivo del cambio de estado, observaciones sobre la validez del documento, o cualquier comentario relevante..."
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Estas observaciones quedarán registradas en el historial del documento
                </p>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button 
                type="button" 
                onClick={handleClose} 
                disabled={submitting}
                className="px-4 py-2 rounded-lg font-medium transition-all border"
                style={{ 
                  background: 'var(--surface)', 
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)'
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!canSubmitStatus || submitting} 
                className="px-6 py-2 rounded-lg font-medium transition-all text-white flex items-center gap-2"
                style={{ 
                  background: canSubmitStatus && !submitting 
                    ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' 
                    : 'var(--surface-muted)',
                  color: canSubmitStatus && !submitting ? 'white' : 'var(--text-muted)'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cambiando estado...
                  </>
                ) : (
                  <>
                    <Settings size={16} />
                    Cambiar estado
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
