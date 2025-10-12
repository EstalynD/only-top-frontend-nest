"use client";
import React from 'react';
import Modal from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/selectUI";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/hooks/useModal";
import { useTheme } from "@/lib/theme";
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
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false // No cerrar al hacer click en backdrop para formularios
  });

  const [contratos, setContratos] = React.useState<Contrato[]>([]);
  const [loadingContratos, setLoadingContratos] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);

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

  // Sincronizar el estado del modal con las props
  React.useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  // Load contratos when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadContratos();
    }
  }, [isOpen]);

  const loadContratos = async () => {
    if (!token) return;
    try {
      setLoadingContratos(true);
      const res = await getContratosByEmpleado(empleadoId, token);
      setContratos(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error loading contratos:', error);
      setContratos([]);
    } finally {
      setLoadingContratos(false);
    }
  };

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
      modal.closeModal();
      resetForm();
      onClose();
    }
  };

  const canSubmit = !!(empleadoId && tipoDocumento && nombre && descripcion && fechaEmision && archivo && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !archivo || !token) return;
    
    try {
      setSubmitting(true);
      
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
      
      toast({
        type: 'success',
        title: 'Documento creado',
        description: 'El documento se ha creado exitosamente.',
      });
      
      onCreated?.(res._id);
      resetForm();
      handleClose();
    } catch (err: any) {
      console.error('Error creating documento:', err);
      toast({
        type: 'error',
        title: 'Error al crear documento',
        description: err?.message || 'No se pudo crear el documento.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Footer del modal
  const modalFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="neutral"
        onClick={handleClose}
        disabled={submitting || loadingData}
        size="md"
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        disabled={!canSubmit || submitting || loadingData}
        size="md"
      >
        <FileText size={16} />
        {submitting ? 'Creando documento...' : 'Crear Documento'}
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={modal.isOpen} 
      onClose={handleClose} 
      title="Nuevo Documento" 
      icon={<FileText size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="5xl"
      description="Complete la información del documento. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loadingData}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos del documento...
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Layout principal con dos columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Información Básica */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} />
                Información Básica
              </h3>
              <div className="space-y-3">
                <SelectField
                  label="Tipo de documento *"
                  value={tipoDocumento}
                  onChange={setTipoDocumento}
                  options={TIPO_DOCUMENTO_OPCIONES}
                  placeholder="Seleccione el tipo..."
                  fullWidth
                  required
                  clearable
                  disabled={submitting}
                />
                
                <SelectField
                  label="Vincular a contrato (opcional)"
                  value={contratoId}
                  onChange={setContratoId}
                  options={[{ value: '', label: 'Sin contrato' }, ...(Array.isArray(contratos) ? contratos : []).map(c => ({ value: String((c as any)._id || c), label: `#${(c as any).numeroContrato || (c as any)._id}` }))]}
                  placeholder={loadingContratos ? 'Cargando contratos...' : 'Seleccionar contrato'}
                  fullWidth
                  clearable
                  disabled={loadingContratos || submitting}
                />

                <div>
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Nombre del documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="ot-input"
                    placeholder="Ej: Cédula de identidad escaneada"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
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
                      disabled={submitting}
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
            </div>

            {/* Descripción */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} />
                Descripción
              </h3>
              <div>
                <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  Descripción del documento <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="ot-input"
                  rows={4}
                  placeholder="Breve descripción del contenido del documento..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Fechas y Vigencia */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={16} />
                Fechas y Vigencia
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Fecha de emisión <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="ot-input"
                    value={fechaEmision}
                    onChange={e => setFechaEmision(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Fecha de vencimiento
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                  </label>
                  <input
                    type="date"
                    className="ot-input"
                    value={fechaVencimiento}
                    onChange={e => setFechaVencimiento(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Configuración Avanzada */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Shield size={16} />
                Configuración Avanzada
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <input 
                    id="confidencial" 
                    type="checkbox" 
                    checked={esConfidencial} 
                    onChange={e => setEsConfidencial(e.target.checked)}
                    className="w-4 h-4"
                    disabled={submitting}
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
                    disabled={submitting}
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

                {requiereRenovacion && (
                  <div>
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
                      disabled={submitting}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Se enviará una alerta {diasAntesVencimiento} días antes del vencimiento
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags de clasificación */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Tag size={16} />
                Clasificación
              </h3>
              <div>
                <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  Tags de clasificación
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                </label>
                <input
                  className="ot-input"
                  placeholder="identidad, legal, personal, certificado"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Separa múltiples tags con comas para facilitar la búsqueda
                </p>
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}
