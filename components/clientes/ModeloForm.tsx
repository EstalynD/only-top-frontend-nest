"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { Select, SelectField } from '@/components/ui/selectUI';
import { Button } from '@/components/ui/Button';
import { 
  createModelo, 
  updateModelo, 
  uploadModeloPhoto,
  getSalesClosersDisponibles,
  getChattersDisponibles,
  getTraffickersDisponibles,
} from '@/lib/service-clientes/api';
import type { CreateModeloDto, UpdateModeloDto, Modelo, EmpleadoBasico, FuenteTrafico } from '@/lib/service-clientes/types';
import { 
  TIPOS_DOCUMENTO, 
  PLATAFORMAS_CONTENIDO, 
  REDES_SOCIALES, 
  TIPOS_TRAFICO, 
  PAISES_COMUNES, 
  MESES,
  ESTADOS_MODELO,
} from '@/lib/service-clientes/constants';
import { Upload, Plus, Trash2, Save } from 'lucide-react';

type ModeloFormProps = {
  modelo?: Modelo;
  isEdit?: boolean;
};

export function ModeloForm({ modelo, isEdit = false }: ModeloFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  // Empleados disponibles
  const [salesClosers, setSalesClosers] = React.useState<EmpleadoBasico[]>([]);
  const [chatters, setChatters] = React.useState<EmpleadoBasico[]>([]);
  const [supernumerarios, setSupernumerarios] = React.useState<EmpleadoBasico[]>([]);
  const [traffickers, setTraffickers] = React.useState<EmpleadoBasico[]>([]);

  // Form data
  const [formData, setFormData] = React.useState<CreateModeloDto>({
    nombreCompleto: modelo?.nombreCompleto || '',
    numeroIdentificacion: modelo?.numeroIdentificacion || '',
    tipoDocumento: modelo?.tipoDocumento || 'CEDULA_CIUDADANIA',
    telefono: modelo?.telefono || '',
    correoElectronico: modelo?.correoElectronico || '',
    fechaNacimiento: modelo?.fechaNacimiento ? new Date(modelo.fechaNacimiento).toISOString().split('T')[0] : '',
    paisResidencia: modelo?.paisResidencia || 'Colombia',
    ciudadResidencia: modelo?.ciudadResidencia || '',
    plataformas: modelo?.plataformas || [],
    redesSociales: modelo?.redesSociales || [],
    facturacionHistorica: modelo?.facturacionHistorica || [],
    fuentesTrafico: modelo?.fuentesTrafico || [],
    salesCloserAsignado: typeof modelo?.salesCloserAsignado === 'object' ? modelo.salesCloserAsignado._id : modelo?.salesCloserAsignado || '',
    equipoChatters: {
      turnoAM: typeof modelo?.equipoChatters === 'object' && 'turnoAM' in modelo.equipoChatters && typeof modelo.equipoChatters.turnoAM === 'object' ? modelo.equipoChatters.turnoAM._id : '',
      turnoPM: typeof modelo?.equipoChatters === 'object' && 'turnoPM' in modelo.equipoChatters && typeof modelo.equipoChatters.turnoPM === 'object' ? modelo.equipoChatters.turnoPM._id : '',
      turnoMadrugada: typeof modelo?.equipoChatters === 'object' && 'turnoMadrugada' in modelo.equipoChatters && typeof modelo.equipoChatters.turnoMadrugada === 'object' ? modelo.equipoChatters.turnoMadrugada._id : '',
      supernumerario: typeof modelo?.equipoChatters === 'object' && 'supernumerario' in modelo.equipoChatters && typeof modelo.equipoChatters.supernumerario === 'object' ? modelo.equipoChatters.supernumerario._id : '',
    },
    traffickerAsignado: typeof modelo?.traffickerAsignado === 'object' ? modelo.traffickerAsignado._id : modelo?.traffickerAsignado || '',
    linkFormularioRegistro: modelo?.linkFormularioRegistro || '',
    fotoPerfil: modelo?.fotoPerfil || '',
    fotoPerfilPublicId: modelo?.fotoPerfilPublicId || '',
    fechaInicio: modelo?.fechaInicio ? new Date(modelo.fechaInicio).toISOString().split('T')[0] : '',
    notasInternas: modelo?.notasInternas || '',
    estado: modelo?.estado || 'ACTIVA',
  });

  // Load empleados disponibles
  React.useEffect(() => {
    if (!token) return;
    
    const loadEmpleados = async () => {
      try {
        const [sc, ch, tr] = await Promise.all([
          getSalesClosersDisponibles(token),
          getChattersDisponibles(token),
          getTraffickersDisponibles(token),
        ]);
        setSalesClosers(sc);
        setChatters(ch.chatters);
        setSupernumerarios(ch.supernumerarios);
        setTraffickers(tr);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar empleados',
          description: error?.message || 'No se pudieron cargar los empleados disponibles',
        });
      }
    };

    loadEmpleados();
  }, [token]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Archivo muy grande',
        description: 'La foto no debe superar los 5MB',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Tipo de archivo inválido',
        description: 'Solo se permiten archivos de imagen',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadPhotoToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    if (!token) throw new Error('No token available');
    
    const result = await uploadModeloPhoto(token, file);
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate required fields
    if (!formData.nombreCompleto || !formData.numeroIdentificacion || !formData.correoElectronico || !formData.telefono) {
      addToast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    if (!formData.salesCloserAsignado || !formData.traffickerAsignado) {
      addToast({
        type: 'error',
        title: 'Asignaciones requeridas',
        description: 'Debes asignar un Sales Closer y un Trafficker',
      });
      return;
    }

    if (!formData.equipoChatters.turnoAM || !formData.equipoChatters.turnoPM || 
        !formData.equipoChatters.turnoMadrugada || !formData.equipoChatters.supernumerario) {
      addToast({
        type: 'error',
        title: 'Equipo de chatters incompleto',
        description: 'Debes asignar los 4 chatters (AM, PM, Madrugada, Supernumerario)',
      });
      return;
    }

    setLoading(true);
    try {
      let finalFormData = { ...formData };

      // Upload photo if a new one was selected
      if (selectedFile) {
        setUploadingPhoto(true);
        try {
          const photoResult = await uploadPhotoToCloudinary(selectedFile);
          finalFormData = {
            ...finalFormData,
            fotoPerfil: photoResult.url,
            fotoPerfilPublicId: photoResult.publicId,
          };
        } catch (photoError: any) {
          addToast({
            type: 'error',
            title: 'Error al subir foto',
            description: photoError?.message || 'No se pudo subir la foto',
          });
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      if (isEdit && modelo) {
        await updateModelo(token, modelo._id, finalFormData as UpdateModeloDto);
        addToast({
          type: 'success',
          title: 'Modelo actualizada',
          description: `${finalFormData.nombreCompleto} ha sido actualizada correctamente`,
        });
      } else {
        await createModelo(token, finalFormData);
        addToast({
          type: 'success',
          title: 'Modelo creada',
          description: `${finalFormData.nombreCompleto} ha sido registrada correctamente`,
        });
      }
      router.push('/clientes/modelos');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: isEdit ? 'Error al actualizar' : 'Error al crear',
        description: error?.message || `No se pudo ${isEdit ? 'actualizar' : 'crear'} la modelo`,
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlataforma = () => {
    setFormData(prev => ({
      ...prev,
      plataformas: [...prev.plataformas || [], { plataforma: 'ONLYFANS', links: [''] }],
    }));
  };

  const updatePlataforma = (index: number, field: 'plataforma' | 'links', value: any) => {
    setFormData(prev => ({
      ...prev,
      plataformas: prev.plataformas?.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ) || [],
    }));
  };

  const removePlataforma = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plataformas: prev.plataformas?.filter((_, i) => i !== index) || [],
    }));
  };

  const addRedSocial = () => {
    setFormData(prev => ({
      ...prev,
      redesSociales: [...prev.redesSociales || [], { plataforma: 'Instagram', link: '', username: '' }],
    }));
  };

  const updateRedSocial = (index: number, field: 'plataforma' | 'link' | 'username', value: string) => {
    setFormData(prev => ({
      ...prev,
      redesSociales: prev.redesSociales?.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      ) || [],
    }));
  };

  const removeRedSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      redesSociales: prev.redesSociales?.filter((_, i) => i !== index) || [],
    }));
  };

  const addFacturacion = () => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      facturacionHistorica: [...prev.facturacionHistorica || [], { 
        mes: now.getMonth() + 1, 
        anio: now.getFullYear(), 
        monto: 0, 
        moneda: 'USD' 
      }],
    }));
  };

  const updateFacturacion = (index: number, field: 'mes' | 'anio' | 'monto', value: number) => {
    setFormData(prev => ({
      ...prev,
      facturacionHistorica: prev.facturacionHistorica?.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      ) || [],
    }));
  };

  const removeFacturacion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facturacionHistorica: prev.facturacionHistorica?.filter((_, i) => i !== index) || [],
    }));
  };

  const addFuenteTrafico = () => {
    setFormData(prev => ({
      ...prev,
      fuentesTrafico: [...prev.fuentesTrafico || [], { 
        tipo: 'REDDIT_ORGANICO', 
        activo: true, 
        inversionUSD: 0, 
        porcentaje: 0 
      }],
    }));
  };

  const updateFuenteTrafico = (index: number, field: keyof FuenteTrafico, value: any) => {
    setFormData(prev => ({
      ...prev,
      fuentesTrafico: prev.fuentesTrafico?.map((f, i) => 
        i === index ? { ...f, [field]: value } as FuenteTrafico : f
      ) || [],
    }));
  };

  const removeFuenteTrafico = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fuentesTrafico: prev.fuentesTrafico?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombreCompleto}
              onChange={(e) => setFormData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <SelectField
              label="Tipo de Documento"
              value={formData.tipoDocumento}
              onChange={(value) => setFormData(prev => ({ ...prev, tipoDocumento: value as any }))}
              options={TIPOS_DOCUMENTO.map(tipo => ({
                value: tipo.value,
                label: tipo.label
              }))}
              placeholder="Seleccionar tipo de documento"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Número de Identificación *
            </label>
            <input
              type="text"
              required
              value={formData.numeroIdentificacion}
              onChange={(e) => setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              required
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={formData.correoElectronico}
              onChange={(e) => setFormData(prev => ({ ...prev, correoElectronico: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <SelectField
              label="País de Residencia"
              value={formData.paisResidencia}
              onChange={(value) => setFormData(prev => ({ ...prev, paisResidencia: value }))}
              options={PAISES_COMUNES.map(pais => ({
                value: pais,
                label: pais
              }))}
              placeholder="Seleccionar país"
              required
              clearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Ciudad de Residencia *
            </label>
            <input
              type="text"
              required
              value={formData.ciudadResidencia}
              onChange={(e) => setFormData(prev => ({ ...prev, ciudadResidencia: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Foto de Perfil */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Foto de Perfil
        </h3>
        
        <div className="flex items-center gap-6">
          {(previewUrl || formData.fotoPerfil) && (
            <img 
              src={previewUrl || formData.fotoPerfil} 
              alt="Foto de perfil" 
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Upload size={18} />
              {uploadingPhoto ? 'Subiendo...' : selectedFile ? 'Cambiar Foto' : 'Subir Foto'}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} disabled={uploadingPhoto || loading} />
            </label>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG o GIF. Máximo 5MB. {selectedFile && '(Se subirá al guardar)'}
            </p>
          </div>
        </div>
      </div>

      {/* Asignaciones de Equipo */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Asignaciones de Equipo *
        </h3>
        
        <div className="space-y-4">
          {/* Sales Closer */}
          <div>
            <SelectField
              label="Sales Closer Asignado"
              value={formData.salesCloserAsignado}
              onChange={(value) => setFormData(prev => ({ ...prev, salesCloserAsignado: value }))}
              options={salesClosers.map(sc => ({
                value: sc._id,
                label: `${sc.nombre} ${sc.apellido} - ${sc.correoElectronico}`
              }))}
              placeholder="Seleccionar Sales Closer"
              required
              clearable
            />
          </div>

          {/* Trafficker */}
          <div>
            <SelectField
              label="Trafficker Asignado"
              value={formData.traffickerAsignado}
              onChange={(value) => setFormData(prev => ({ ...prev, traffickerAsignado: value }))}
              options={traffickers.map(tr => ({
                value: tr._id,
                label: `${tr.nombre} ${tr.apellido} - ${tr.correoElectronico}`
              }))}
              placeholder="Seleccionar Trafficker"
              required
              clearable
            />
          </div>

          {/* Equipo de Chatters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SelectField
                label="Chatter Turno AM"
                value={formData.equipoChatters.turnoAM}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoAM: value }
                }))}
                options={chatters.map(ch => ({
                  value: ch._id,
                  label: `${ch.nombre} ${ch.apellido}`
                }))}
                placeholder="Seleccionar Chatter"
                required
                clearable
              />
            </div>

            <div>
              <SelectField
                label="Chatter Turno PM"
                value={formData.equipoChatters.turnoPM}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoPM: value }
                }))}
                options={chatters.map(ch => ({
                  value: ch._id,
                  label: `${ch.nombre} ${ch.apellido}`
                }))}
                placeholder="Seleccionar Chatter"
                required
                clearable
              />
            </div>

            <div>
              <SelectField
                label="Chatter Turno Madrugada"
                value={formData.equipoChatters.turnoMadrugada}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoMadrugada: value }
                }))}
                options={chatters.map(ch => ({
                  value: ch._id,
                  label: `${ch.nombre} ${ch.apellido}`
                }))}
                placeholder="Seleccionar Chatter"
                required
                clearable
              />
            </div>

            <div>
              <SelectField
                label="Chatter Supernumerario"
                value={formData.equipoChatters.supernumerario}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, supernumerario: value }
                }))}
                options={supernumerarios.map(su => ({
                  value: su._id,
                  label: `${su.nombre} ${su.apellido}`
                }))}
                placeholder="Seleccionar Supernumerario"
                required
                clearable
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Información Adicional
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Link del Formulario de Registro
            </label>
            <input
              type="url"
              value={formData.linkFormularioRegistro}
              onChange={(e) => setFormData(prev => ({ ...prev, linkFormularioRegistro: e.target.value }))}
              placeholder="https://forms.google.com/..."
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {isEdit && (
            <div>
              <SelectField
                label="Estado"
                value={formData.estado || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, estado: value as any }))}
                options={ESTADOS_MODELO.map(estado => ({
                  value: estado.value,
                  label: estado.label
                }))}
                placeholder="Seleccionar estado"
                clearable
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Notas Internas
            </label>
            <textarea
              value={formData.notasInternas}
              onChange={(e) => setFormData(prev => ({ ...prev, notasInternas: e.target.value }))}
              rows={4}
              placeholder="Cualquier información adicional relevante..."
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200 resize-none"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="neutral"
          size="lg"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="lg"
          className="flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Modelo' : 'Crear Modelo'}
        </Button>
      </div>
    </form>
  );
}

