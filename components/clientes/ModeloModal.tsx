"use client";
import React from 'react';
import { User, Plus, Trash2, DollarSign, MapPin, Phone, Mail, Calendar, Building2, UserCheck, Upload, X, Camera, Users, Globe, TrendingUp, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Select, SelectField, type SelectOption } from '@/components/ui/selectUI';
import { useTheme } from '@/lib/theme';
import { 
  createModelo, 
  updateModelo, 
  uploadModeloPhoto,
  getSalesClosersDisponibles,
  getChattersDisponibles,
  getTraffickersDisponibles,
} from '@/lib/service-clientes/api';
import type { 
  CreateModeloDto, 
  UpdateModeloDto, 
  Modelo, 
  EmpleadoBasico, 
  CuentaPlataforma, 
  RedSocial, 
  FacturacionMensual, 
  FuenteTrafico 
} from '@/lib/service-clientes/types';
import { 
  TIPOS_DOCUMENTO, 
  PLATAFORMAS_CONTENIDO, 
  REDES_SOCIALES, 
  TIPOS_TRAFICO, 
  PAISES_COMUNES, 
  MESES,
  ESTADOS_MODELO,
} from '@/lib/service-clientes/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingModelo: Modelo | null;
  token: string;
}

const MONEDAS: SelectOption[] = [
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'EUR', label: 'EUR - Euro' },
];

export default function ModeloModal({ isOpen, onClose, onSuccess, editingModelo, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false // No cerrar al hacer click en backdrop para formularios
  });

  // Helper styles for consistent styling
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s'
  };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)'
  };

  const [loading, setLoading] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [loadingData, setLoadingData] = React.useState(false);
  
  // Empleados disponibles
  const [salesClosers, setSalesClosers] = React.useState<EmpleadoBasico[]>([]);
  const [chatters, setChatters] = React.useState<EmpleadoBasico[]>([]);
  const [supernumerarios, setSupernumerarios] = React.useState<EmpleadoBasico[]>([]);
  const [traffickers, setTraffickers] = React.useState<EmpleadoBasico[]>([]);

  // Form data
  const [formData, setFormData] = React.useState<CreateModeloDto>({
    nombreCompleto: '',
    numeroIdentificacion: '',
    tipoDocumento: 'CEDULA_CIUDADANIA',
    telefono: '',
    correoElectronico: '',
    fechaNacimiento: '',
    paisResidencia: 'Colombia',
    ciudadResidencia: '',
    plataformas: [],
    redesSociales: [],
    facturacionHistorica: [],
    fuentesTrafico: [],
    salesCloserAsignado: '',
    equipoChatters: {
      turnoAM: '',
      turnoPM: '',
      turnoMadrugada: '',
      supernumerario: '',
    },
    traffickerAsignado: '',
    linkFormularioRegistro: '',
    fotoPerfil: '',
    fotoPerfilPublicId: '',
    fechaInicio: '',
    notasInternas: '',
    estado: 'ACTIVA',
  });

  // Sincronizar el estado del modal con las props
  React.useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);

  // Load data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, token]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [sc, ch, tr] = await Promise.all([
        getSalesClosersDisponibles(token),
        getChattersDisponibles(token),
        getTraffickersDisponibles(token),
      ]);
      
      setSalesClosers(sc);
      setChatters(ch.chatters);
      setSupernumerarios(ch.supernumerarios);
      setTraffickers(tr);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        type: 'error',
        title: 'Error al cargar datos',
        description: 'No se pudieron cargar los empleados disponibles.',
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when modal opens/closes or editing modelo changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingModelo) {
        setFormData({
          nombreCompleto: editingModelo.nombreCompleto,
          numeroIdentificacion: editingModelo.numeroIdentificacion,
          tipoDocumento: editingModelo.tipoDocumento,
          telefono: editingModelo.telefono,
          correoElectronico: editingModelo.correoElectronico,
          fechaNacimiento: editingModelo.fechaNacimiento ? new Date(editingModelo.fechaNacimiento).toISOString().split('T')[0] : '',
          paisResidencia: editingModelo.paisResidencia,
          ciudadResidencia: editingModelo.ciudadResidencia,
          plataformas: editingModelo.plataformas || [],
          redesSociales: editingModelo.redesSociales || [],
          facturacionHistorica: editingModelo.facturacionHistorica || [],
          fuentesTrafico: editingModelo.fuentesTrafico || [],
          salesCloserAsignado: typeof editingModelo.salesCloserAsignado === 'object' ? editingModelo.salesCloserAsignado._id : editingModelo.salesCloserAsignado || '',
          equipoChatters: {
            turnoAM: typeof editingModelo.equipoChatters === 'object' && 'turnoAM' in editingModelo.equipoChatters && typeof editingModelo.equipoChatters.turnoAM === 'object' ? editingModelo.equipoChatters.turnoAM._id : '',
            turnoPM: typeof editingModelo.equipoChatters === 'object' && 'turnoPM' in editingModelo.equipoChatters && typeof editingModelo.equipoChatters.turnoPM === 'object' ? editingModelo.equipoChatters.turnoPM._id : '',
            turnoMadrugada: typeof editingModelo.equipoChatters === 'object' && 'turnoMadrugada' in editingModelo.equipoChatters && typeof editingModelo.equipoChatters.turnoMadrugada === 'object' ? editingModelo.equipoChatters.turnoMadrugada._id : '',
            supernumerario: typeof editingModelo.equipoChatters === 'object' && 'supernumerario' in editingModelo.equipoChatters && typeof editingModelo.equipoChatters.supernumerario === 'object' ? editingModelo.equipoChatters.supernumerario._id : '',
          },
          traffickerAsignado: typeof editingModelo.traffickerAsignado === 'object' ? editingModelo.traffickerAsignado._id : editingModelo.traffickerAsignado || '',
          linkFormularioRegistro: editingModelo.linkFormularioRegistro || '',
          fotoPerfil: editingModelo.fotoPerfil || '',
          fotoPerfilPublicId: editingModelo.fotoPerfilPublicId || '',
          fechaInicio: editingModelo.fechaInicio ? new Date(editingModelo.fechaInicio).toISOString().split('T')[0] : '',
          notasInternas: editingModelo.notasInternas || '',
          estado: editingModelo.estado,
        });
        
        // Establecer preview de foto si existe
        if (editingModelo.fotoPerfil) {
          setPhotoPreview(editingModelo.fotoPerfil);
        }
      } else {
        setFormData({
          nombreCompleto: '',
          numeroIdentificacion: '',
          tipoDocumento: 'CEDULA_CIUDADANIA',
          telefono: '',
          correoElectronico: '',
          fechaNacimiento: '',
          paisResidencia: 'Colombia',
          ciudadResidencia: '',
          plataformas: [],
          redesSociales: [],
          facturacionHistorica: [],
          fuentesTrafico: [],
          salesCloserAsignado: '',
          equipoChatters: {
            turnoAM: '',
            turnoPM: '',
            turnoMadrugada: '',
            supernumerario: '',
          },
          traffickerAsignado: '',
          linkFormularioRegistro: '',
          fotoPerfil: '',
          fotoPerfilPublicId: '',
          fechaInicio: '',
          notasInternas: '',
          estado: 'ACTIVA',
        });
        
        // Limpiar preview de foto
        setPhotoPreview(null);
      }
    }
  }, [isOpen, editingModelo]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombreCompleto.trim() || !formData.numeroIdentificacion.trim() || !formData.correoElectronico.trim() || !formData.telefono.trim()) {
      toast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'El nombre completo, número de identificación, correo electrónico y teléfono son obligatorios.',
      });
      return;
    }

    if (!formData.salesCloserAsignado || !formData.traffickerAsignado) {
      toast({
        type: 'error',
        title: 'Asignaciones requeridas',
        description: 'Debes asignar un Sales Closer y un Trafficker.',
      });
      return;
    }

    if (!formData.equipoChatters.turnoAM || !formData.equipoChatters.turnoPM || 
        !formData.equipoChatters.turnoMadrugada || !formData.equipoChatters.supernumerario) {
      toast({
        type: 'error',
        title: 'Equipo de chatters incompleto',
        description: 'Debes asignar los 4 chatters (AM, PM, Madrugada, Supernumerario).',
      });
      return;
    }

    try {
      setLoading(true);
      
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
          toast({
            type: 'error',
            title: 'Error al subir foto',
            description: photoError?.message || 'No se pudo subir la foto',
          });
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      if (editingModelo) {
        await updateModelo(token, editingModelo._id, finalFormData as UpdateModeloDto);
      } else {
        await createModelo(token, finalFormData);
      }
      
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving modelo:', error);
      
      let errorMessage = 'No se pudo guardar la modelo.';
      let errorTitle = 'Error al guardar';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorData = error as any;
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        type: 'error',
        title: errorTitle,
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      modal.closeModal();
      onClose();
    }
  };

  // Función para subir foto a Cloudinary
  const uploadPhotoToCloudinary = async (file: File) => {
    const result = await uploadModeloPhoto(token, file);
    
    if (result.success && result.data?.url) {
      return result.data;
    } else {
      throw new Error('Error al subir la foto');
    }
  };

  // Manejar selección de foto
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'Archivo muy grande',
        description: 'La foto no debe superar los 5MB',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        type: 'error',
        title: 'Tipo de archivo inválido',
        description: 'Solo se permiten archivos de imagen',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  // Eliminar foto
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, fotoPerfil: '', fotoPerfilPublicId: '' }));
    setPhotoPreview(null);
    setSelectedFile(null);
  };

  // Funciones para manejar arrays dinámicos
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

  const updateFacturacion = (index: number, field: 'mes' | 'anio' | 'monto' | 'moneda', value: any) => {
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

  // Convertir a SelectOption format
  const tipoDocumentoOptions: SelectOption[] = TIPOS_DOCUMENTO.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  const plataformaOptions: SelectOption[] = PLATAFORMAS_CONTENIDO.map(plataforma => ({
    value: plataforma.value,
    label: plataforma.label
  }));

  const redSocialOptions: SelectOption[] = REDES_SOCIALES.map(red => ({
    value: red.value,
    label: red.label
  }));

  const tipoTraficoOptions: SelectOption[] = TIPOS_TRAFICO.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  const mesOptions: SelectOption[] = MESES.map(mes => ({
    value: mes.value.toString(),
    label: mes.label
  }));

  const paisOptions: SelectOption[] = PAISES_COMUNES.map(pais => ({
    value: pais,
    label: pais
  }));

  const estadoOptions: SelectOption[] = ESTADOS_MODELO.map(estado => ({
    value: estado.value,
    label: estado.label
  }));

  const salesCloserOptions: SelectOption[] = salesClosers.map(sc => ({
    value: sc._id,
    label: `${sc.nombre} ${sc.apellido} - ${sc.correoElectronico}`
  }));

  const traffickerOptions: SelectOption[] = traffickers.map(tr => ({
    value: tr._id,
    label: `${tr.nombre} ${tr.apellido} - ${tr.correoElectronico}`
  }));

  const chatterOptions: SelectOption[] = chatters.map(ch => ({
    value: ch._id,
    label: `${ch.nombre} ${ch.apellido}`
  }));

  const supernumerarioOptions: SelectOption[] = supernumerarios.map(su => ({
    value: su._id,
    label: `${su.nombre} ${su.apellido}`
  }));

  // Footer del modal
  const modalFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="neutral"
        onClick={handleClose}
        disabled={loading || loadingData}
        size="md"
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading || loadingData || !formData.nombreCompleto.trim() || !formData.correoElectronico.trim()}
        size="md"
      >
        <User size={16} />
        {loading ? 'Guardando...' : editingModelo ? 'Actualizar' : 'Crear Modelo'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title={editingModelo ? 'Editar Modelo' : 'Nueva Modelo'}
      icon={<User size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="7xl"
      description="Complete la información de la modelo. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loadingData}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos de la modelo...
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
                <User size={16} />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label style={labelStyle}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                    placeholder="Nombre completo"
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <SelectField
                    label="Tipo de Documento"
                    value={formData.tipoDocumento}
                    onChange={(value) => setFormData(prev => ({ ...prev, tipoDocumento: value as any }))}
                    options={tipoDocumentoOptions}
                    placeholder="Seleccionar tipo de documento"
                    disabled={loading}
                    required={true}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Número de Identificación *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }))}
                    placeholder="12345678"
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.correoElectronico}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoElectronico: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <SelectField
                    label="País de Residencia"
                    value={formData.paisResidencia}
                    onChange={(value) => setFormData(prev => ({ ...prev, paisResidencia: value }))}
                    options={paisOptions}
                    placeholder="Seleccionar país"
                    disabled={loading}
                    required={true}
                    clearable
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Ciudad de Residencia *
                  </label>
                  <input
                    type="text"
                    value={formData.ciudadResidencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciudadResidencia: e.target.value }))}
                    placeholder="Bogotá"
                    style={inputStyle}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Asignaciones de Equipo */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Users size={16} />
                Asignaciones de Equipo *
              </h3>
              <div className="space-y-3">
                <SelectField
                  label="Sales Closer Asignado"
                  value={formData.salesCloserAsignado}
                  onChange={(value) => setFormData(prev => ({ ...prev, salesCloserAsignado: value }))}
                  options={salesCloserOptions}
                  placeholder="Seleccionar Sales Closer"
                  disabled={loading}
                  required={true}
                  clearable
                />

                <SelectField
                  label="Trafficker Asignado"
                  value={formData.traffickerAsignado}
                  onChange={(value) => setFormData(prev => ({ ...prev, traffickerAsignado: value }))}
                  options={traffickerOptions}
                  placeholder="Seleccionar Trafficker"
                  disabled={loading}
                  required={true}
                  clearable
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Chatter Turno AM"
                    value={formData.equipoChatters.turnoAM}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      equipoChatters: { ...prev.equipoChatters, turnoAM: value }
                    }))}
                    options={chatterOptions}
                    placeholder="Seleccionar Chatter"
                    disabled={loading}
                    required={true}
                    clearable
                  />

                  <SelectField
                    label="Chatter Turno PM"
                    value={formData.equipoChatters.turnoPM}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      equipoChatters: { ...prev.equipoChatters, turnoPM: value }
                    }))}
                    options={chatterOptions}
                    placeholder="Seleccionar Chatter"
                    disabled={loading}
                    required={true}
                    clearable
                  />

                  <SelectField
                    label="Chatter Turno Madrugada"
                    value={formData.equipoChatters.turnoMadrugada}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      equipoChatters: { ...prev.equipoChatters, turnoMadrugada: value }
                    }))}
                    options={chatterOptions}
                    placeholder="Seleccionar Chatter"
                    disabled={loading}
                    required={true}
                    clearable
                  />

                  <SelectField
                    label="Chatter Supernumerario"
                    value={formData.equipoChatters.supernumerario}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      equipoChatters: { ...prev.equipoChatters, supernumerario: value }
                    }))}
                    options={supernumerarioOptions}
                    placeholder="Seleccionar Supernumerario"
                    disabled={loading}
                    required={true}
                    clearable
                  />
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} />
                Información Adicional
              </h3>
              <div className="space-y-3">
                <div>
                  <label style={labelStyle}>
                    Link del Formulario de Registro
                  </label>
                  <input
                    type="url"
                    value={formData.linkFormularioRegistro}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkFormularioRegistro: e.target.value }))}
                    placeholder="https://forms.google.com/..."
                    style={inputStyle}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    style={inputStyle}
                    disabled={loading}
                  />
                </div>

                {editingModelo && (
                  <SelectField
                    label="Estado"
                    value={formData.estado || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, estado: value as any }))}
                    options={estadoOptions}
                    placeholder="Seleccionar estado"
                    disabled={loading}
                    clearable
                  />
                )}

                <div>
                  <label style={labelStyle}>
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.notasInternas}
                    onChange={(e) => setFormData(prev => ({ ...prev, notasInternas: e.target.value }))}
                    rows={3}
                    placeholder="Cualquier información adicional relevante..."
                    style={{ ...inputStyle, resize: 'none' }}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Foto de Perfil */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Camera size={16} />
                Foto de Perfil
              </h3>
              <div className="space-y-3">
                {/* Preview de la foto */}
                {(photoPreview || formData.fotoPerfil) && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={photoPreview || formData.fotoPerfil || ''}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: 'var(--border)' }}
                      />
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {selectedFile ? 'Foto seleccionada' : 'Foto actual'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {selectedFile ? '(Se subirá al guardar)' : 'Foto guardada'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="p-1 rounded-full transition-colors"
                      style={{ 
                        color: 'var(--danger-500)',
                        background: 'transparent'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input de archivo */}
                <div>
                  <label style={labelStyle}>
                    Seleccionar Foto
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handlePhotoSelect}
                      disabled={loading || uploadingPhoto}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div 
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors"
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Upload size={16} />
                      <span className="text-sm">
                        {uploadingPhoto ? 'Subiendo...' : selectedFile ? 'Cambiar Foto' : 'Seleccionar archivo'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Formatos: JPG, PNG, GIF, WebP. Máximo 5MB. {selectedFile && '(Se subirá al guardar)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Plataformas de Contenido */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Globe size={16} />
                  Plataformas de Contenido
                </h3>
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={addPlataforma}
                  disabled={loading}
                >
                  <Plus size={14} />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.plataformas?.map((plataforma, index) => (
                  <div key={index} className="p-3 border rounded-lg" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Plataforma {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePlataforma(index)}
                        disabled={loading}
                        className="p-1 rounded-full transition-colors"
                        style={{ color: 'var(--danger-500)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <SelectField
                        label="Plataforma"
                        value={plataforma.plataforma}
                        onChange={(value) => updatePlataforma(index, 'plataforma', value)}
                        options={plataformaOptions}
                        placeholder="Seleccionar plataforma"
                        disabled={loading}
                        size="sm"
                      />
                      
                      <div>
                        <label style={labelStyle}>
                          Links (separados por comas)
                        </label>
                        <input
                          type="text"
                          value={plataforma.links.join(', ')}
                          onChange={(e) => updatePlataforma(index, 'links', e.target.value.split(',').map(link => link.trim()).filter(link => link))}
                          placeholder="https://onlyfans.com/..., https://fansly.com/..."
                          style={inputStyle}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!formData.plataformas || formData.plataformas.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No hay plataformas agregadas
                  </p>
                )}
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Globe size={16} />
                  Redes Sociales
                </h3>
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={addRedSocial}
                  disabled={loading}
                >
                  <Plus size={14} />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.redesSociales?.map((red, index) => (
                  <div key={index} className="p-3 border rounded-lg" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Red Social {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRedSocial(index)}
                        disabled={loading}
                        className="p-1 rounded-full transition-colors"
                        style={{ color: 'var(--danger-500)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <SelectField
                        label="Plataforma"
                        value={red.plataforma}
                        onChange={(value) => updateRedSocial(index, 'plataforma', value)}
                        options={redSocialOptions}
                        placeholder="Seleccionar red social"
                        disabled={loading}
                        size="sm"
                      />
                      
                      <div>
                        <label style={labelStyle}>
                          Link
                        </label>
                        <input
                          type="url"
                          value={red.link}
                          onChange={(e) => updateRedSocial(index, 'link', e.target.value)}
                          placeholder="https://instagram.com/..."
                          style={inputStyle}
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label style={labelStyle}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={red.username}
                          onChange={(e) => updateRedSocial(index, 'username', e.target.value)}
                          placeholder="@username"
                          style={inputStyle}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!formData.redesSociales || formData.redesSociales.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No hay redes sociales agregadas
                  </p>
                )}
              </div>
            </div>

            {/* Facturación Histórica */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <DollarSign size={16} />
                  Facturación Histórica
                </h3>
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={addFacturacion}
                  disabled={loading}
                >
                  <Plus size={14} />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.facturacionHistorica?.map((facturacion, index) => (
                  <div key={index} className="p-3 border rounded-lg" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Facturación {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFacturacion(index)}
                        disabled={loading}
                        className="p-1 rounded-full transition-colors"
                        style={{ color: 'var(--danger-500)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <SelectField
                        label="Mes"
                        value={facturacion.mes.toString()}
                        onChange={(value) => updateFacturacion(index, 'mes', parseInt(value))}
                        options={mesOptions}
                        placeholder="Mes"
                        disabled={loading}
                        size="sm"
                      />
                      
                      <div>
                        <label style={labelStyle}>
                          Año
                        </label>
                        <input
                          type="number"
                          value={facturacion.anio}
                          onChange={(e) => updateFacturacion(index, 'anio', parseInt(e.target.value) || new Date().getFullYear())}
                          placeholder="2024"
                          min="2020"
                          max="2030"
                          style={inputStyle}
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label style={labelStyle}>
                          Monto
                        </label>
                        <input
                          type="number"
                          value={facturacion.monto}
                          onChange={(e) => updateFacturacion(index, 'monto', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          style={inputStyle}
                          disabled={loading}
                        />
                      </div>
                      
                      <SelectField
                        label="Moneda"
                        value={facturacion.moneda}
                        onChange={(value) => updateFacturacion(index, 'moneda', value)}
                        options={MONEDAS}
                        placeholder="Moneda"
                        disabled={loading}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
                
                {(!formData.facturacionHistorica || formData.facturacionHistorica.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No hay facturación histórica agregada
                  </p>
                )}
              </div>
            </div>

            {/* Fuentes de Tráfico */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <TrendingUp size={16} />
                  Fuentes de Tráfico
                </h3>
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={addFuenteTrafico}
                  disabled={loading}
                >
                  <Plus size={14} />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.fuentesTrafico?.map((fuente, index) => (
                  <div key={index} className="p-3 border rounded-lg" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Fuente {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFuenteTrafico(index)}
                        disabled={loading}
                        className="p-1 rounded-full transition-colors"
                        style={{ color: 'var(--danger-500)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <SelectField
                        label="Tipo de Tráfico"
                        value={fuente.tipo}
                        onChange={(value) => updateFuenteTrafico(index, 'tipo', value)}
                        options={tipoTraficoOptions}
                        placeholder="Seleccionar tipo"
                        disabled={loading}
                        size="sm"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fuente.activo}
                          onChange={(e) => updateFuenteTrafico(index, 'activo', e.target.checked)}
                          disabled={loading}
                          className="rounded"
                        />
                        <label className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          Activo
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label style={labelStyle}>
                            Inversión USD
                          </label>
                          <input
                            type="number"
                            value={fuente.inversionUSD || 0}
                            onChange={(e) => updateFuenteTrafico(index, 'inversionUSD', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            style={inputStyle}
                            disabled={loading}
                          />
                        </div>
                        
                        <div>
                          <label style={labelStyle}>
                            Porcentaje
                          </label>
                          <input
                            type="number"
                            value={fuente.porcentaje || 0}
                            onChange={(e) => updateFuenteTrafico(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                            style={inputStyle}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!formData.fuentesTrafico || formData.fuentesTrafico.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No hay fuentes de tráfico agregadas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}
