"use client";
import React from 'react';
import { User, Plus, Trash2, DollarSign, MapPin, Phone, Mail, Calendar, Building2, UserCheck, Upload, X, Camera } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Select, SelectField, type SelectOption } from '@/components/ui/Select';
import { useTheme } from '@/lib/theme';
import { createEmpleado, updateEmpleado, getAllEmpleados, uploadEmpleadoPhoto } from '@/lib/service-rrhh/empleados-api';
import { getAllAreas, getAllCargos } from '@/lib/service-rrhh/api';
import type { Empleado, Area, Cargo, CreateEmpleadoDto, UpdateEmpleadoDto, ContactoEmergencia } from '@/lib/service-rrhh/empleados-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEmpleado: Empleado | null;
  token: string;
}

const TIPOS_CONTRATO: SelectOption[] = [
  { value: 'PRESTACION_SERVICIOS', label: 'Prestación de Servicios' },
  { value: 'TERMINO_FIJO', label: 'Término Fijo' },
  { value: 'TERMINO_INDEFINIDO', label: 'Término Indefinido' },
  { value: 'OBRA_LABOR', label: 'Obra o Labor' },
  { value: 'APRENDIZAJE', label: 'Contrato de Aprendizaje' },
];

const TIPOS_CUENTA: SelectOption[] = [
  { value: 'AHORROS', label: 'Ahorros' },
  { value: 'CORRIENTE', label: 'Corriente' },
];

const MONEDAS: SelectOption[] = [
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
];

// Función para validar ObjectId de MongoDB
const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export default function EmpleadoModal({ isOpen, onClose, onSuccess, editingEmpleado, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [cargos, setCargos] = React.useState<Cargo[]>([]);
  const [empleados, setEmpleados] = React.useState<Empleado[]>([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    // Información personal
    nombre: '',
    apellido: '',
    correoElectronico: '',
    correoPersonal: '',
    correoCorporativo: '',
    telefono: '',
    numeroIdentificacion: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    fechaNacimiento: '',
    
    // Información laboral
    cargoId: '',
    areaId: '',
    jefeInmediatoId: '',
    fechaInicio: '',
    salario: {
      monto: 0,
      moneda: 'COP'
    },
    tipoContrato: 'PRESTACION_SERVICIOS',
    estado: 'ACTIVO',
    
    // Contacto de emergencia
    contactoEmergencia: {
      nombre: '',
      telefono: '',
      relacion: ''
    } as ContactoEmergencia,
    
    // Información bancaria
    informacionBancaria: {
      nombreBanco: '',
      numeroCuenta: '',
      tipoCuenta: 'AHORROS'
    },
    
    fotoPerfil: ''
  });

  // Load data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, token]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [areasData, cargosData, empleadosData] = await Promise.all([
        getAllAreas(token),
        getAllCargos(token),
        getAllEmpleados(token)
      ]);
      
      setAreas(areasData);
      setCargos(cargosData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        type: 'error',
        title: 'Error al cargar datos',
        description: 'No se pudieron cargar las áreas, cargos o empleados.',
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when modal opens/closes or editing empleado changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingEmpleado) {
        setFormData({
          nombre: editingEmpleado.nombre,
          apellido: editingEmpleado.apellido,
          correoElectronico: editingEmpleado.correoElectronico,
          correoPersonal: editingEmpleado.correoPersonal || '',
          correoCorporativo: editingEmpleado.correoCorporativo || '',
          telefono: editingEmpleado.telefono,
          numeroIdentificacion: editingEmpleado.numeroIdentificacion,
          direccion: editingEmpleado.direccion,
          ciudad: editingEmpleado.ciudad,
          pais: editingEmpleado.pais,
          fechaNacimiento: editingEmpleado.fechaNacimiento.split('T')[0],
          cargoId: typeof editingEmpleado.cargoId === 'string' ? editingEmpleado.cargoId : editingEmpleado.cargoId._id,
          areaId: typeof editingEmpleado.areaId === 'string' ? editingEmpleado.areaId : editingEmpleado.areaId._id,
          jefeInmediatoId: typeof editingEmpleado.jefeInmediatoId === 'string' ? editingEmpleado.jefeInmediatoId : editingEmpleado.jefeInmediatoId?._id || '',
          fechaInicio: editingEmpleado.fechaInicio.split('T')[0],
          salario: editingEmpleado.salario,
          tipoContrato: editingEmpleado.tipoContrato,
          estado: editingEmpleado.estado,
          contactoEmergencia: {
            nombre: editingEmpleado.contactoEmergencia.nombre,
            telefono: editingEmpleado.contactoEmergencia.telefono,
            relacion: editingEmpleado.contactoEmergencia.relacion || ''
          },
          informacionBancaria: {
            nombreBanco: editingEmpleado.informacionBancaria.nombreBanco,
            numeroCuenta: editingEmpleado.informacionBancaria.numeroCuenta,
            tipoCuenta: editingEmpleado.informacionBancaria.tipoCuenta
          },
          fotoPerfil: editingEmpleado.fotoPerfil || ''
        });
        
        // Establecer preview de foto si existe
        if (editingEmpleado.fotoPerfil) {
          setPhotoPreview(editingEmpleado.fotoPerfil);
        }
      } else {
        setFormData({
          nombre: '',
          apellido: '',
          correoElectronico: '',
          correoPersonal: '',
          correoCorporativo: '',
          telefono: '',
          numeroIdentificacion: '',
          direccion: '',
          ciudad: '',
          pais: 'Colombia',
          fechaNacimiento: '',
          cargoId: '',
          areaId: '',
          jefeInmediatoId: '',
          fechaInicio: new Date().toISOString().split('T')[0],
          salario: { monto: 0, moneda: 'COP' },
          tipoContrato: 'PRESTACION_SERVICIOS',
          estado: 'ACTIVO',
          contactoEmergencia: { nombre: '', telefono: '', relacion: '' },
          informacionBancaria: { nombreBanco: '', numeroCuenta: '', tipoCuenta: 'AHORROS' },
          fotoPerfil: ''
        });
        
        // Limpiar preview de foto
        setPhotoPreview(null);
      }
    }
  }, [isOpen, editingEmpleado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.correoElectronico.trim()) {
      toast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'El nombre, apellido y correo electrónico son obligatorios.',
      });
      return;
    }

    // Validar que se hayan seleccionado área y cargo
    if (!formData.areaId || !formData.cargoId) {
      toast({
        type: 'error',
        title: 'Selección requerida',
        description: 'Debe seleccionar un área y un cargo.',
      });
      return;
    }

    // Validar salario
    if (!formData.salario.monto || formData.salario.monto <= 0) {
      toast({
        type: 'error',
        title: 'Salario inválido',
        description: 'El salario debe ser un número positivo.',
      });
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        ...formData,
        correoPersonal: formData.correoPersonal || null,
        correoCorporativo: formData.correoCorporativo || null,
        jefeInmediatoId: formData.jefeInmediatoId || null,
        fotoPerfil: formData.fotoPerfil || null,
        // Asegurar que los IDs sean strings válidos y no estén vacíos
        areaId: formData.areaId || '',
        cargoId: formData.cargoId || '',
        salario: {
          monto: Number(formData.salario.monto),
          moneda: formData.salario.moneda
        },
        // Limpiar objetos anidados para evitar envío de _id
        contactoEmergencia: {
          nombre: formData.contactoEmergencia.nombre,
          telefono: formData.contactoEmergencia.telefono,
          relacion: formData.contactoEmergencia.relacion || null
        },
        informacionBancaria: {
          nombreBanco: formData.informacionBancaria.nombreBanco,
          numeroCuenta: formData.informacionBancaria.numeroCuenta,
          tipoCuenta: formData.informacionBancaria.tipoCuenta
        }
      };

      // Validación adicional de IDs
      if (!data.areaId || data.areaId === '') {
        throw new Error('Debe seleccionar un área');
      }
      
      if (!data.cargoId || data.cargoId === '') {
        throw new Error('Debe seleccionar un cargo');
      }

      // Verificar que los IDs tengan el formato correcto (24 caracteres hexadecimales)
      if (!isValidObjectId(data.areaId)) {
        throw new Error('El ID del área no es válido');
      }
      
      if (!isValidObjectId(data.cargoId)) {
        throw new Error('El ID del cargo no es válido');
      }

      // Debug: Log de los datos que se van a enviar
      console.log('Datos a enviar:', {
        areaId: data.areaId,
        cargoId: data.cargoId,
        areaIdLength: data.areaId.length,
        cargoIdLength: data.cargoId.length,
        areaIdValid: isValidObjectId(data.areaId),
        cargoIdValid: isValidObjectId(data.cargoId)
      });

      if (editingEmpleado) {
        await updateEmpleado(editingEmpleado._id, data as UpdateEmpleadoDto, token);
      } else {
        await createEmpleado(data as CreateEmpleadoDto, token);
      }
      
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving empleado:', error);
      
      // Manejar errores específicos del backend
      let errorMessage = 'No se pudo guardar el empleado.';
      let errorTitle = 'Error al guardar';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorData = error as any;
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
          
          // Mapear errores específicos a mensajes más amigables
          if (errorData.message.some((msg: string) => msg.includes('cargoId must be a mongodb id'))) {
            errorTitle = 'Error de validación';
            errorMessage = 'El cargo seleccionado no es válido. Por favor, selecciona un cargo diferente.';
          } else if (errorData.message.some((msg: string) => msg.includes('areaId must be a mongodb id'))) {
            errorTitle = 'Error de validación';
            errorMessage = 'El área seleccionada no es válida. Por favor, selecciona un área diferente.';
          }
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
      onClose();
    }
  };

  const activeAreas = areas.filter(area => area.isActive);
  const empleadosActivos = empleados.filter(empleado => empleado.estado === 'ACTIVO');

  // Filtrar cargos por área seleccionada
  const cargosFiltrados = React.useMemo(() => {
    if (!formData.areaId) {
      return cargos.filter(cargo => cargo.isActive);
    }
    return cargos.filter(cargo => 
      cargo.isActive && 
      (typeof cargo.areaId === 'string' ? cargo.areaId : cargo.areaId._id) === formData.areaId
    );
  }, [cargos, formData.areaId]);

  // Convertir a SelectOption format
  const areaOptions: SelectOption[] = activeAreas.map(area => ({
    value: area._id,
    label: area.name
  }));

  const cargoOptions: SelectOption[] = cargosFiltrados.map(cargo => ({
    value: cargo._id,
    label: cargo.name
  }));

  const jefeOptions: SelectOption[] = empleadosActivos.map(empleado => ({
    value: empleado._id,
    label: `${empleado.nombre} ${empleado.apellido}`
  }));

  // Manejar cambio de área y resetear cargo si es necesario
  const handleAreaChange = (areaId: string) => {
    setFormData(prev => {
      const newData = { ...prev, areaId };
      
      // Si el cargo actual no pertenece a la nueva área, resetearlo
      if (prev.cargoId) {
        const cargoActual = cargos.find(cargo => cargo._id === prev.cargoId);
        if (cargoActual) {
          const cargoAreaId = typeof cargoActual.areaId === 'string' 
            ? cargoActual.areaId 
            : cargoActual.areaId._id;
          
          if (cargoAreaId !== areaId) {
            newData.cargoId = '';
          }
        }
      }
      
      return newData;
    });
  };

  // Manejar subida de foto
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        type: 'error',
        title: 'Tipo de archivo no válido',
        description: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP).',
      });
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        type: 'error',
        title: 'Archivo muy grande',
        description: 'El archivo no puede ser mayor a 5MB.',
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'only-top/employee-photos');
      formData.append('public_id', `employee_${Date.now()}`);

      const result = await uploadEmpleadoPhoto(formData, token);
      
      if (result.success && result.data?.url) {
        setFormData(prev => ({ ...prev, fotoPerfil: result.data!.url }));
        toast({
          type: 'success',
          title: 'Foto subida exitosamente',
          description: 'La foto de perfil se ha subido correctamente.',
        });
      } else {
        throw new Error(result.message || 'Error al subir la foto');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        type: 'error',
        title: 'Error al subir foto',
        description: error.message || 'No se pudo subir la foto. Inténtalo de nuevo.',
      });
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  // Eliminar foto
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, fotoPerfil: '' }));
    setPhotoPreview(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
      icon={<User size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Loading indicator */}
        {loadingData && (
          <div className="flex items-center justify-center py-8">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
            }`}></div>
            <span className={`ml-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cargando datos...
            </span>
          </div>
        )}

        {/* Layout principal con dos columnas */}
        {!loadingData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Información Personal */}
            <div className={`rounded-lg p-3 sm:p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-sm sm:text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <User size={16} />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                    placeholder="Apellido"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.correoElectronico}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoElectronico: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Correo Personal
                  </label>
                  <input
                    type="email"
                    value={formData.correoPersonal}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoPersonal: e.target.value }))}
                    placeholder="correo.personal@ejemplo.com"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Correo Corporativo
                  </label>
                  <input
                    type="email"
                    value={formData.correoCorporativo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoCorporativo: e.target.value }))}
                    placeholder="correo@empresa.com"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Número de Identificación *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }))}
                    placeholder="12345678"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Building2 size={16} />
                Información Laboral
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Área"
                    value={formData.areaId}
                    onChange={handleAreaChange}
                    options={areaOptions}
                    placeholder="Seleccionar área"
                    disabled={loading}
                    required={true}
                  />

                  <div>
                    <SelectField
                      label="Cargo"
                      value={formData.cargoId}
                      onChange={(value) => setFormData(prev => ({ ...prev, cargoId: value }))}
                      options={cargoOptions}
                      placeholder={
                        formData.areaId && cargoOptions.length === 0 
                          ? "No hay cargos disponibles para esta área" 
                          : "Seleccionar cargo"
                      }
                      disabled={loading || (!!formData.areaId && cargoOptions.length === 0)}
                      required={true}
                      helpText={
                        formData.areaId && cargoOptions.length === 0 
                          ? "Esta área no tiene cargos disponibles" 
                          : formData.areaId 
                            ? `Cargos disponibles para ${activeAreas.find(a => a._id === formData.areaId)?.name || 'esta área'}` 
                            : "Selecciona el cargo que desempeñará el empleado"
                      }
                    />
                    {formData.areaId && cargoOptions.length > 0 && (
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        {cargoOptions.length} cargo{cargoOptions.length !== 1 ? 's' : ''} disponible{cargoOptions.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <SelectField
                  label="Jefe Inmediato"
                  value={formData.jefeInmediatoId}
                  onChange={(value) => setFormData(prev => ({ ...prev, jefeInmediatoId: value }))}
                  options={[
                    { value: '', label: 'Sin jefe inmediato' },
                    ...jefeOptions
                  ]}
                  placeholder="Seleccionar jefe inmediato"
                  disabled={loading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>

                  <SelectField
                    label="Tipo de Contrato"
                    value={formData.tipoContrato}
                    onChange={(value) => setFormData(prev => ({ ...prev, tipoContrato: value }))}
                    options={TIPOS_CONTRATO}
                    placeholder="Seleccionar tipo de contrato"
                    disabled={loading}
                    required={true}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Salario *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.salario.monto}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        salario: { ...prev.salario, monto: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="0"
                      min="0"
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={loading}
                      required
                    />
                    <Select
                      value={formData.salario.moneda}
                      onChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        salario: { ...prev.salario, moneda: value }
                      }))}
                      options={MONEDAS}
                      placeholder="Moneda"
                      disabled={loading}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Dirección */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <MapPin size={16} />
                Dirección
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Calle 123 #45-67"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                    placeholder="Bogotá"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Phone size={16} />
                Contacto de Emergencia
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.contactoEmergencia.nombre}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contactoEmergencia: { ...prev.contactoEmergencia, nombre: e.target.value }
                    }))}
                    placeholder="Nombre del contacto"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactoEmergencia.telefono}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactoEmergencia: { ...prev.contactoEmergencia, telefono: e.target.value }
                      }))}
                      placeholder="+57 300 123 4567"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Relación
                    </label>
                    <input
                      type="text"
                      value={formData.contactoEmergencia.relacion}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactoEmergencia: { ...prev.contactoEmergencia, relacion: e.target.value }
                      }))}
                      placeholder="Familiar, amigo, etc."
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Bancaria */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <DollarSign size={16} />
                Información Bancaria
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Banco *
                  </label>
                  <input
                    type="text"
                    value={formData.informacionBancaria.nombreBanco}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      informacionBancaria: { ...prev.informacionBancaria, nombreBanco: e.target.value }
                    }))}
                    placeholder="Banco de Bogotá"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Número de Cuenta *
                    </label>
                    <input
                      type="text"
                      value={formData.informacionBancaria.numeroCuenta}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        informacionBancaria: { ...prev.informacionBancaria, numeroCuenta: e.target.value }
                      }))}
                      placeholder="1234567890"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>

                  <SelectField
                    label="Tipo de Cuenta"
                    value={formData.informacionBancaria.tipoCuenta}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      informacionBancaria: { ...prev.informacionBancaria, tipoCuenta: value as 'AHORROS' | 'CORRIENTE' }
                    }))}
                    options={TIPOS_CUENTA}
                    placeholder="Seleccionar tipo de cuenta"
                    disabled={loading}
                    required={true}
                  />
                </div>
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
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
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Foto seleccionada
                      </p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {formData.fotoPerfil ? 'Subida exitosamente' : 'Preparando subida...'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className={`p-1 rounded-full transition-colors ${
                        theme === 'dark' 
                          ? 'hover:bg-red-900/20 text-red-400' 
                          : 'hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input de archivo */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Seleccionar Foto
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      disabled={loading || uploadingPhoto}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
                        : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                    }`}>
                      <Upload size={16} />
                      <span className="text-sm">
                        {uploadingPhoto ? 'Subiendo...' : 'Seleccionar archivo'}
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Actions */}
        <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading || loadingData}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50 ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={loading || loadingData || !formData.nombre.trim() || !formData.apellido.trim() || !formData.correoElectronico.trim()}
            variant="primary"
            className="flex items-center gap-2"
          >
            <User size={16} />
            {loading ? 'Guardando...' : editingEmpleado ? 'Actualizar' : 'Crear Empleado'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
