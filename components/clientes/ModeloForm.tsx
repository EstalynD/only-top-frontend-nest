"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !e.target.files || !e.target.files[0]) return;

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

    setUploadingPhoto(true);
    try {
      const result = await uploadModeloPhoto(token, file);
      setFormData(prev => ({
        ...prev,
        fotoPerfil: result.data.url,
        fotoPerfilPublicId: result.data.publicId,
      }));
      addToast({
        type: 'success',
        title: 'Foto subida',
        description: 'La foto se ha subido correctamente',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al subir foto',
        description: error?.message || 'No se pudo subir la foto',
      });
    } finally {
      setUploadingPhoto(false);
    }
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
      if (isEdit && modelo) {
        await updateModelo(token, modelo._id, formData as UpdateModeloDto);
        addToast({
          type: 'success',
          title: 'Modelo actualizada',
          description: `${formData.nombreCompleto} ha sido actualizada correctamente`,
        });
      } else {
        await createModelo(token, formData);
        addToast({
          type: 'success',
          title: 'Modelo creada',
          description: `${formData.nombreCompleto} ha sido registrada correctamente`,
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Tipo de Documento *
            </label>
            <select
              required
              value={formData.tipoDocumento}
              onChange={(e) => setFormData(prev => ({ ...prev, tipoDocumento: e.target.value as any }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {TIPOS_DOCUMENTO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              País de Residencia *
            </label>
            <select
              required
              value={formData.paisResidencia}
              onChange={(e) => setFormData(prev => ({ ...prev, paisResidencia: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {PAISES_COMUNES.map(pais => (
                <option key={pais} value={pais}>{pais}</option>
              ))}
            </select>
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
          {formData.fotoPerfil && (
            <img 
              src={formData.fotoPerfil} 
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
              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG o GIF. Máximo 5MB.
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Sales Closer Asignado *
            </label>
            <select
              required
              value={formData.salesCloserAsignado}
              onChange={(e) => setFormData(prev => ({ ...prev, salesCloserAsignado: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Seleccionar Sales Closer</option>
              {salesClosers.map(sc => (
                <option key={sc._id} value={sc._id}>
                  {sc.nombre} {sc.apellido} - {sc.correoElectronico}
                </option>
              ))}
            </select>
          </div>

          {/* Trafficker */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Trafficker Asignado *
            </label>
            <select
              required
              value={formData.traffickerAsignado}
              onChange={(e) => setFormData(prev => ({ ...prev, traffickerAsignado: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Seleccionar Trafficker</option>
              {traffickers.map(tr => (
                <option key={tr._id} value={tr._id}>
                  {tr.nombre} {tr.apellido} - {tr.correoElectronico}
                </option>
              ))}
            </select>
          </div>

          {/* Equipo de Chatters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Chatter Turno AM *
              </label>
              <select
                required
                value={formData.equipoChatters.turnoAM}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoAM: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Seleccionar Chatter</option>
                {chatters.map(ch => (
                  <option key={ch._id} value={ch._id}>
                    {ch.nombre} {ch.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Chatter Turno PM *
              </label>
              <select
                required
                value={formData.equipoChatters.turnoPM}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoPM: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Seleccionar Chatter</option>
                {chatters.map(ch => (
                  <option key={ch._id} value={ch._id}>
                    {ch.nombre} {ch.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Chatter Turno Madrugada *
              </label>
              <select
                required
                value={formData.equipoChatters.turnoMadrugada}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, turnoMadrugada: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Seleccionar Chatter</option>
                {chatters.map(ch => (
                  <option key={ch._id} value={ch._id}>
                    {ch.nombre} {ch.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Chatter Supernumerario *
              </label>
              <select
                required
                value={formData.equipoChatters.supernumerario}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  equipoChatters: { ...prev.equipoChatters, supernumerario: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Seleccionar Supernumerario</option>
                {supernumerarios.map(su => (
                  <option key={su._id} value={su._id}>
                    {su.nombre} {su.apellido}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {ESTADOS_MODELO.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
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
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm"
          style={{
            background: loading ? 'var(--surface-muted)' : 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
            color: '#ffffff',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Save size={18} />
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Modelo' : 'Crear Modelo'}
        </button>
      </div>
    </form>
  );
}

