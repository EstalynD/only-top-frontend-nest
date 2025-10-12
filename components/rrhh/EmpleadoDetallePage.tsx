"use client";
import React from 'react';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Building2, 
  DollarSign, 
  UserCheck, 
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  FolderOpen,
  UserPlus,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { useTheme } from '@/lib/theme';
import { getEmpleadoById } from '@/lib/service-rrhh/empleados-api';
import type { Empleado } from '@/lib/service-rrhh/empleados-types';
import { getProfile } from '@/lib/service-user/api';
import type { UserProfile } from '@/lib/service-user/types';
import ContratosTab from './ContratosTab';
import DocumentosTab from './DocumentosTab';
import DotacionTab from './DotacionTab';
import CuentaTab from './CuentaTab';
import CrearCuentaModal from './CrearCuentaModal';
import ResetPasswordModal from './ResetPasswordModal';
import EditarCuentaModal from './EditarCuentaModal';
import EmpleadoModal from './EmpleadoModal';

interface Props {
  empleadoId: string;
  token: string;
  onBack: () => void;
}

export default function EmpleadoDetallePage({ empleadoId, token, onBack }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [empleado, setEmpleado] = React.useState<Empleado | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'contratos' | 'documentos' | 'dotacion' | 'cuenta'>('info');
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [showCrearCuentaModal, setShowCrearCuentaModal] = React.useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = React.useState(false);
  const [showEditarCuentaModal, setShowEditarCuentaModal] = React.useState(false);
  const [showEditarEmpleadoModal, setShowEditarEmpleadoModal] = React.useState(false);

  React.useEffect(() => {
    loadEmpleado();
    loadUserProfile();
  }, [empleadoId, token]);

  const loadUserProfile = async () => {
    try {
      const response = await getProfile(token);
      setUserProfile(response.user);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const loadEmpleado = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmpleadoById(empleadoId, token);
      setEmpleado(data);
    } catch (err: any) {
      console.error('Error loading empleado:', err);
      setError(err.message || 'No se pudo cargar la información del empleado');
      toast({
        type: 'error',
        title: 'Error al cargar empleado',
        description: 'No se pudo obtener la información del empleado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    return userProfile.permissions.includes(permission);
  };

  const handleOpenCrearCuenta = () => {
    if (empleado?.hasUserAccount) {
      toast({
        type: 'info',
        title: 'Cuenta existente',
        description: 'Este empleado ya tiene una cuenta vinculada. No es posible crear otra.',
      });
      return;
    }
    setShowCrearCuentaModal(true);
  };

  const handleAccountCreated = () => {
    // Recargar la información del empleado para actualizar el estado de la cuenta
    loadEmpleado();
  };

  const handleOpenEditarEmpleado = () => {
    setShowEditarEmpleadoModal(true);
  };

  const handleEmpleadoUpdated = () => {
    // Cerrar el modal
    setShowEditarEmpleadoModal(false);
    
    // Mostrar toast de éxito
    toast({
      type: 'success',
      title: 'Empleado actualizado',
      description: 'La información del empleado se ha actualizado correctamente.',
    });
    
    // Recargar la información del empleado después de la edición
    loadEmpleado();
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'INACTIVO':
        return <XCircle size={16} className="text-gray-500" />;
      case 'SUSPENDIDO':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'TERMINADO':
        return <Clock size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INACTIVO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'SUSPENDIDO':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'TERMINADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (monto: number, moneda: string) => {
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda === 'COP' ? 'COP' : moneda === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(monto);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Loader size="lg" variant="primary" />
          </div>
          <p className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cargando información del empleado...
          </p>
        </div>
      </div>
    );
  }

  if (error || !empleado) {
    return (
      <div className="text-center py-12">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <AlertTriangle size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-500'} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Error al cargar empleado
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {error || 'No se pudo cargar la información del empleado'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Volver
          </Button>
          <Button variant="primary" onClick={loadEmpleado}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button variant="secondary" onClick={onBack} className="w-fit">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div className="min-w-0">
            <h1 className={`text-xl sm:text-2xl font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {empleado.nombre} {empleado.apellido}
            </h1>
            <p className={`text-sm truncate ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {typeof empleado.cargoId === 'string' ? 'Cargo' : empleado.cargoId.name} • 
              {typeof empleado.areaId === 'string' ? 'Área' : empleado.areaId.name}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getEstadoColor(empleado.estado)}`}>
            {getEstadoIcon(empleado.estado)}
            {empleado.estado}
          </span>
          {empleado.hasUserAccount ? (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${
              theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <UserCheck size={16} />
              Ya tiene una cuenta
              {empleado.userAccount?.username && (
                <span className={theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}>
                  • {empleado.userAccount.username}
                </span>
              )}
            </span>
          ) : (
            hasPermission('sistema.empleados.crear_cuenta') && (
              <Button 
                variant="secondary" 
                className="w-fit"
                onClick={handleOpenCrearCuenta}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Crear Cuenta</span>
              </Button>
            )
          )}
          <Button variant="primary" className="w-fit" onClick={handleOpenEditarEmpleado}>
            <Edit size={16} />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'info'
                ? theme === 'dark'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="hidden sm:inline">Información Personal</span>
              <span className="sm:hidden">Info</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'contratos'
                ? theme === 'dark'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Contratos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'documentos'
                ? theme === 'dark'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={16} />
              Documentos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('dotacion')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'dotacion'
                ? theme === 'dark'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={16} />
              Dotación
            </div>
          </button>
          {hasPermission('rrhh:empleados:manage_account') && (
            <button
              onClick={() => setActiveTab('cuenta')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'cuenta'
                  ? theme === 'dark'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck size={16} />
                <span className="hidden sm:inline">Cuenta</span>
                <span className="sm:hidden">Cuenta</span>
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Profile & Personal Info */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <div className="relative inline-block">
                {empleado.fotoPerfil ? (
                  <img
                    src={empleado.fotoPerfil}
                    alt={`${empleado.nombre} ${empleado.apellido}`}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 mx-auto ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto border-4 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-200 border-gray-300'
                  }`}>
                    <Camera size={24} className={`sm:w-8 sm:h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                )}
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mt-3 sm:mt-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {empleado.nombre} {empleado.apellido}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {typeof empleado.cargoId === 'string' ? 'Cargo' : empleado.cargoId.name}
              </p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: {empleado.numeroIdentificacion}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Phone size={16} className="sm:w-5 sm:h-5" />
              Información de Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {empleado.correoElectronico}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Correo principal
                  </p>
                </div>
              </div>
              
              {empleado.correoPersonal && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {empleado.correoPersonal}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Correo personal
                    </p>
                  </div>
                </div>
              )}

              {empleado.correoCorporativo && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {empleado.correoCorporativo}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Correo corporativo
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {empleado.telefono}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Teléfono
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <MapPin size={16} className="sm:w-5 sm:h-5" />
              Dirección
            </h4>
            <div className="space-y-2">
              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {empleado.direccion}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {empleado.ciudad}, {empleado.pais}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Professional Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Professional Information */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Building2 size={16} className="sm:w-5 sm:h-5" />
              Información Laboral
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Área
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {typeof empleado.areaId === 'string' ? 'Área' : empleado.areaId.name}
                </p>
              </div>
              
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cargo
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {typeof empleado.cargoId === 'string' ? 'Cargo' : empleado.cargoId.name}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Jefe Inmediato
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.jefeInmediatoId 
                    ? (typeof empleado.jefeInmediatoId === 'string' 
                        ? 'Jefe' 
                        : `${empleado.jefeInmediatoId.nombre} ${empleado.jefeInmediatoId.apellido}`)
                    : 'Sin jefe inmediato'
                  }
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tipo de Contrato
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.tipoContrato.replace('_', ' ')}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fecha de Inicio
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(empleado.fechaInicio)}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Salario
                </label>
                <p className={`text-sm mt-1 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(empleado.salario.monto, empleado.salario.moneda)}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <User size={16} className="sm:w-5 sm:h-5" />
              Información Personal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fecha de Nacimiento
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(empleado.fechaNacimiento)}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Número de Identificación
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.numeroIdentificacion}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <AlertTriangle size={16} className="sm:w-5 sm:h-5" />
              Contacto de Emergencia
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nombre
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.contactoEmergencia.nombre}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Teléfono
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.contactoEmergencia.telefono}
                </p>
              </div>

              {empleado.contactoEmergencia.relacion && (
                <div className="sm:col-span-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Relación
                  </label>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {empleado.contactoEmergencia.relacion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Banking Information */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <DollarSign size={16} className="sm:w-5 sm:h-5" />
              Información Bancaria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Banco
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.informacionBancaria.nombreBanco}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Número de Cuenta
                </label>
                <p className={`text-sm mt-1 font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.informacionBancaria.numeroCuenta}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tipo de Cuenta
                </label>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {empleado.informacionBancaria.tipoCuenta}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'contratos' && (
        <ContratosTab empleadoId={empleadoId} token={token} />
      )}

      {activeTab === 'documentos' && (
        <DocumentosTab empleadoId={empleadoId} token={token} />
      )}

      {activeTab === 'dotacion' && (
        <DotacionTab empleadoId={empleadoId} token={token} />
      )}

      {activeTab === 'cuenta' && hasPermission('rrhh:empleados:manage_account') && (
        <CuentaTab 
          empleadoId={empleadoId} 
          token={token} 
          empleadoNombre={empleado ? `${empleado.nombre} ${empleado.apellido}` : ''}
          hasUserAccount={empleado?.hasUserAccount || false}
          userAccount={empleado?.userAccount}
          userProfile={userProfile}
          onAccountCreated={handleAccountCreated}
          onOpenCreateModal={() => setShowCrearCuentaModal(true)}
          onOpenResetModal={() => setShowResetPasswordModal(true)}
          onOpenEditModal={() => setShowEditarCuentaModal(true)}
        />
      )}

      {/* Modal Crear Cuenta */}
      <CrearCuentaModal
        isOpen={showCrearCuentaModal}
        onClose={() => setShowCrearCuentaModal(false)}
        empleadoId={empleadoId}
        empleadoNombre={empleado ? `${empleado.nombre} ${empleado.apellido}` : ''}
        token={token}
        onSuccess={handleAccountCreated}
      />

      {/* Modal Reset Password */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        empleadoId={empleadoId}
        empleadoNombre={empleado ? `${empleado.nombre} ${empleado.apellido}` : ''}
        token={token}
        onSuccess={handleAccountCreated}
      />

      {/* Modal Editar Cuenta */}
      {empleado?.userAccount && (
        <EditarCuentaModal
          isOpen={showEditarCuentaModal}
          onClose={() => setShowEditarCuentaModal(false)}
          empleadoId={empleadoId}
          empleadoNombre={empleado ? `${empleado.nombre} ${empleado.apellido}` : ''}
          token={token}
          currentAccount={empleado.userAccount}
          onSuccess={handleAccountCreated}
        />
      )}

      {/* Modal Editar Empleado */}
      <EmpleadoModal
        isOpen={showEditarEmpleadoModal}
        onClose={() => setShowEditarEmpleadoModal(false)}
        onSuccess={handleEmpleadoUpdated}
        editingEmpleado={empleado}
        token={token}
      />
    </div>
  );
}
