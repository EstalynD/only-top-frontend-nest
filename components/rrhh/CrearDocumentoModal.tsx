"use client";
import React from 'react';
import Modal from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth";
import { createDocumento } from "@/lib/service-rrhh/documentos-api";
import { getContratosByEmpleado } from "@/lib/service-rrhh/contratos-api";
import type { Contrato, CreateDocumentoDto } from "@/lib/service-rrhh/contratos-types";
import { 
  FileText, 
  Upload, 
  Calendar, 
  Shield, 
  RefreshCw, 
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export type CrearDocumentoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  empleadoId: string;
  onCreated?: (docId?: string) => void;
};

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

export default function CrearDocumentoModal({ isOpen, onClose, empleadoId, onCreated }: CrearDocumentoModalProps) {
  const { token } = useAuth();

  const [contratos, setContratos] = React.useState<Contrato[]>([]);
  const [loadingContratos, setLoadingContratos] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Form state
  const [contratoId, setContratoId] = React.useState<string>("");
  const [tipoDocumento, setTipoDocumento] = React.useState<string>("");
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [fechaEmision, setFechaEmision] = React.useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = React.useState<string>("");
  const [esConfidencial, setEsConfidencial] = React.useState(false);
  const [requiereRenovacion, setRequiereRenovacion] = React.useState(false);
  const [diasAntesVencimiento, setDiasAntesVencimiento] = React.useState<number>(30);
  const [tags, setTags] = React.useState<string>("");
  const [archivo, setArchivo] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setError(null); setSuccess(null);
    // cargar contratos del empleado (opcional)
    if (!token) return;
    setLoadingContratos(true);
    getContratosByEmpleado(empleadoId, token)
      .then((res) => setContratos(res.data))
      .catch(() => setContratos([]))
      .finally(() => setLoadingContratos(false));
  }, [isOpen, empleadoId, token]);

  const resetForm = () => {
    setContratoId("");
    setTipoDocumento("");
    setNombre("");
    setDescripcion("");
    setFechaEmision("");
    setFechaVencimiento("");
    setEsConfidencial(false);
    setRequiereRenovacion(false);
    setDiasAntesVencimiento(30);
    setTags("");
    setArchivo(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const canSubmit = !!(empleadoId && tipoDocumento && nombre && descripcion && fechaEmision && archivo && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !archivo || !token) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateDocumentoDto = {
        empleadoId,
        contratoId: contratoId || undefined,
        nombre,
        nombreOriginal: archivo.name,
        tipoDocumento,
        descripcion,
        fechaEmision,
        fechaVencimiento: fechaVencimiento || undefined,
        esConfidencial,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        requiereRenovacion,
        diasAntesVencimiento: requiereRenovacion ? diasAntesVencimiento : undefined,
      };
      const res = await createDocumento(payload, archivo, token);
      setSuccess(res.message || 'Documento creado');
      onCreated?.(res.data?._id);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el documento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Nuevo Documento" 
      icon={<FileText size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
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
              <p className="font-medium" style={{ color: 'var(--danger-700)' }}>Error al crear documento</p>
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
              <p className="font-medium" style={{ color: 'var(--success-700)' }}>Documento creado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--success-600)' }}>{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
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
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <SelectField
                  value={tipoDocumento}
                  onChange={setTipoDocumento}
                  options={TIPO_DOCUMENTO_OPCIONES}
                  placeholder="Seleccione el tipo..."
                  fullWidth
                  required
                  label=""
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Vincular a contrato
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                </label>
                <SelectField
                  value={contratoId}
                  onChange={setContratoId}
                  options={[{ value: '', label: 'Sin contrato' }, ...contratos.map(c => ({ value: String((c as any)._id || c), label: `#${(c as any).numeroContrato || (c as any)._id}` }))]}
                  placeholder={loadingContratos ? 'Cargando contratos...' : 'Seleccionar contrato'}
                  fullWidth
                  label=""
                />
              </div>
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
                  <Upload size={16} />
                  Archivo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  {archivo && (
                    <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--surface-muted)' }}>
                      <FileText size={16} style={{ color: 'var(--ot-blue-500)' }} />
                      <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {archivo.name}
                      </span>
                    </div>
                  )}
                </div>
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
                    id="confidencial" 
                    type="checkbox" 
                    checked={esConfidencial} 
                    onChange={e => setEsConfidencial(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="confidencial" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      Documento confidencial
                    </label>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Restringe el acceso solo a usuarios autorizados
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <input 
                    id="renovacion" 
                    type="checkbox" 
                    checked={requiereRenovacion} 
                    onChange={e => setRequiereRenovacion(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="renovacion" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      Requiere renovación
                    </label>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Genera alertas antes del vencimiento
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {requiereRenovacion && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <RefreshCw size={16} />
                      Días antes de vencimiento
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      className="ot-input"
                      value={diasAntesVencimiento}
                      onChange={e => setDiasAntesVencimiento(Number(e.target.value) || 30)}
                      placeholder="30"
                    />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Se enviará una alerta {diasAntesVencimiento} días antes del vencimiento
                    </p>
                  </div>
                )}
                
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
            </div>
          </section>
        </div>

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
            disabled={!canSubmit || submitting} 
            className="px-6 py-2 rounded-lg font-medium transition-all text-white flex items-center gap-2"
            style={{ 
              background: canSubmit && !submitting 
                ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' 
                : 'var(--surface-muted)',
              color: canSubmit && !submitting ? 'white' : 'var(--text-muted)'
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creando documento...
              </>
            ) : (
              <>
                <FileText size={16} />
                Crear documento
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
