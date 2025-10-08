"use client";
import React from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import EmpleadoModal from './EmpleadoModal';
import ContratoModal from './ContratoModal';
import { 
  getAllEmpleados, 
  deleteEmpleado,
  getEmpleadosStats,
  getContratosByEmpleado,
  aprobarContrato
} from '@/lib/service-rrhh/empleados-api';
import { 
  getAllAreas,
  getAllCargos
} from '@/lib/service-rrhh/api';
import { 
  formatSalaryRange,
  getHierarchyLevelLabel,
  searchEmpleados,
  filterActiveItems
} from '@/lib/service-rrhh/helpers';
import type { Empleado, Area, Cargo, Contrato, EmpleadosStats } from '@/lib/service-rrhh/empleados-types';

interface Props {
  token: string;
}

export default function RrhhEmpleadosPage({ token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const router = useRouter();
  const [empleados, setEmpleados] = React.useState<Empleado[]>([]);
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [cargos, setCargos] = React.useState<Cargo[]>([]);
  const [stats, setStats] = React.useState<EmpleadosStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showInactive, setShowInactive] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState<string>('');
  const [selectedCargo, setSelectedCargo] = React.useState<string>('');
  const [selectedEmpleado, setSelectedEmpleado] = React.useState<Empleado | null>(null);
  
  // Modales
  const [empleadoModalOpen, setEmpleadoModalOpen] = React.useState(false);
  const [contratoModalOpen, setContratoModalOpen] = React.useState(false);
  const [editingEmpleado, setEditingEmpleado] = React.useState<Empleado | null>(null);
  const [selectedContrato, setSelectedContrato] = React.useState<Contrato | null>(null);
  
  // Confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    item: Empleado;
    open: boolean;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [empleadosData, areasData, cargosData, statsData] = await Promise.all([
        getAllEmpleados(token, showInactive, selectedArea || undefined, selectedCargo || undefined),
        getAllAreas(token),
        getAllCargos(token),
        getEmpleadosStats(token)
      ]);
      
      setEmpleados(empleadosData);
      setAreas(areasData);
      setCargos(cargosData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: (error as Error).message || 'No se pudieron cargar los datos. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  }, [token, showInactive, selectedArea, selectedCargo, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEmpleados = React.useMemo(() => {
    return searchEmpleados(empleados, searchQuery);
  }, [empleados, searchQuery]);

  const handleEmpleadoSuccess = () => {
    setEmpleadoModalOpen(false);
    setEditingEmpleado(null);
    loadData();
    toast({
      type: 'success',
      title: editingEmpleado ? 'Empleado actualizado' : 'Empleado creado',
      description: editingEmpleado 
        ? 'El empleado se actualizó correctamente.'
        : 'El nuevo empleado se creó correctamente.',
    });
  };

  const handleContratoSuccess = () => {
    setContratoModalOpen(false);
    setSelectedContrato(null);
    loadData();
    toast({
      type: 'success',
      title: 'Contrato procesado',
      description: 'El contrato se procesó correctamente.',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      await deleteEmpleado(deleteConfirm.item._id, token);
      toast({
        type: 'success',
        title: 'Empleado eliminado',
        description: 'El empleado se eliminó correctamente.',
      });
      
      setDeleteConfirm(null);
      loadData();
    } catch (error: unknown) {
      console.error('Error deleting:', error);
      toast({
        type: 'error',
        title: 'Error al eliminar',
        description: (error as Error).message || 'No se pudo eliminar el empleado.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditEmpleado = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setEmpleadoModalOpen(true);
  };

  const viewEmpleadoDetails = (empleado: Empleado) => {
    router.push(`/rrhh/empleados/${empleado._id}`);
  };

  const openContratoModal = async (empleado: Empleado) => {
    try {
      const contratos = await getContratosByEmpleado(empleado._id, token);
      if (contratos.length > 0) {
        setSelectedContrato(contratos[0]);
        setContratoModalOpen(true);
      } else {
        toast({
          type: 'info',
          title: 'Sin contratos',
          description: 'Este empleado no tiene contratos asociados.',
        });
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar los contratos.',
      });
    }
  };

  const openDeleteConfirm = (empleado: Empleado) => {
    setDeleteConfirm({ item: empleado, open: true });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return '#10b981';
      case 'INACTIVO': return '#6b7280';
      case 'SUSPENDIDO': return '#f59e0b';
      case 'TERMINADO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return <CheckCircle size={16} />;
      case 'INACTIVO': return <EyeOff size={16} />;
      case 'SUSPENDIDO': return <AlertCircle size={16} />;
      case 'TERMINADO': return <XCircle size={16} />;
      default: return <EyeOff size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
        <div className="text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Loader size="lg" variant="primary" />
          </div>
          <p className={`text-sm sm:text-base font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cargando empleados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Gestión de Empleados
          </h1>
          <p className={`text-sm sm:text-base mt-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Administra la información de empleados y sus contratos
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setEmpleadoModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            variant="primary"
          >
            <Plus size={16} />
            <span className="text-sm sm:text-base">Nuevo Empleado</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <Users size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.empleadosActivos}
                </p>
                <p className={`text-xs sm:text-sm truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Empleados Activos
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-500 flex items-center justify-center shadow-sm">
                <User size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.empleadosInactivos}
                </p>
                <p className={`text-xs sm:text-sm truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Empleados Inactivos
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
                <FileText size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.contratosEnRevision}
                </p>
                <p className={`text-xs sm:text-sm truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Contratos en Revisión
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <Building2 size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.empleadosPorArea.length}
                </p>
                <p className={`text-xs sm:text-sm truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Áreas con Empleados
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar empleados por nombre, email o cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              <option value="">Todos los cargos</option>
              {cargos.map((cargo) => (
                <option key={cargo._id} value={cargo._id}>
                  {cargo.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setShowInactive(!showInactive)}
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="hidden sm:inline text-sm">
                {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
              </span>
            </Button>
            
            <Button
              onClick={loadData}
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline text-sm">Actualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Empleados List */}
      {filteredEmpleados.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <Users size={32} className={`sm:w-10 sm:h-10 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
          </div>
          <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {searchQuery ? 'No se encontraron resultados' : 'No hay empleados registrados'}
          </h3>
          <p className={`text-sm sm:text-base mb-6 max-w-md mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
              : 'Comienza registrando tu primer empleado en el sistema'
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setEmpleadoModalOpen(true)}
              variant="primary"
              className="px-6 py-3 rounded-xl font-medium"
            >
              Registrar Primer Empleado
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredEmpleados.map((empleado) => {
            const area = typeof empleado.areaId === 'string' ? null : empleado.areaId;
            const cargo = typeof empleado.cargoId === 'string' ? null : empleado.cargoId;
            
            return (
              <div
                key={empleado._id}
                className={`rounded-xl border p-4 sm:p-6 transition-all duration-200 hover:shadow-lg group ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {/* Empleado Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm" style={{ background: area?.color || '#6b7280' }}>
                      {empleado.fotoPerfil ? (
                        <img 
                          src={empleado.fotoPerfil} 
                          alt={`${empleado.nombre} ${empleado.apellido}`}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <User size={20} className="text-white sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {empleado.nombre} {empleado.apellido}
                      </h3>
                      <p className={`text-xs sm:text-sm truncate ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {cargo?.name || 'Sin cargo asignado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: `${getEstadoColor(empleado.estado)}15`,
                        color: getEstadoColor(empleado.estado),
                        border: `1px solid ${getEstadoColor(empleado.estado)}30`
                      }}
                    >
                      {getEstadoIcon(empleado.estado)}
                      <span className="hidden sm:inline">{empleado.estado}</span>
                    </span>
                    
                    <div className="relative">
                      <button
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100 group-hover:bg-gray-50"
                        onClick={() => setSelectedEmpleado(selectedEmpleado?._id === empleado._id ? null : empleado)}
                      >
                        <MoreHorizontal size={16} className="text-gray-500" />
                      </button>
                      
                      {selectedEmpleado?._id === empleado._id && (
                        <div 
                          className={`absolute right-0 top-10 w-48 sm:w-52 rounded-xl border shadow-xl z-20 py-2 ${
                            theme === 'dark'
                              ? 'border-gray-600 bg-gray-800'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <button
                            onClick={() => {
                              viewEmpleadoDetails(empleado);
                              setSelectedEmpleado(null);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Eye size={16} className="text-gray-500" />
                            Ver detalles
                          </button>
                          <button
                            onClick={() => {
                              openEditEmpleado(empleado);
                              setSelectedEmpleado(null);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Edit2 size={16} className="text-gray-500" />
                            Editar empleado
                          </button>
                          <button
                            onClick={() => {
                              openContratoModal(empleado);
                              setSelectedEmpleado(null);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <FileText size={16} className="text-gray-500" />
                            Ver contratos
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm(empleado);
                              setSelectedEmpleado(null);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                              theme === 'dark'
                                ? 'hover:bg-red-900/30 text-red-400'
                                : 'hover:bg-red-50 text-red-600'
                            }`}
                          >
                            <Trash2 size={16} className="text-red-500" />
                            Eliminar empleado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del empleado */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                    }`}>
                      <Mail size={14} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                    </div>
                    <span className={`truncate ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{empleado.correoElectronico}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                    }`}>
                      <Phone size={14} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{empleado.telefono}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
                    }`}>
                      <MapPin size={14} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{empleado.ciudad}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'
                    }`}>
                      <Building2 size={14} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
                    </div>
                    <span className={`truncate ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{area?.name || 'Sin área'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50'
                    }`}>
                      <DollarSign size={14} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />
                    </div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatSalaryRange(empleado.salario.monto, empleado.salario.monto, empleado.salario.moneda)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'
                    }`}>
                      <Calendar size={14} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Inició: {new Date(empleado.fechaInicio).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <EmpleadoModal
        isOpen={empleadoModalOpen}
        onClose={() => {
          setEmpleadoModalOpen(false);
          setEditingEmpleado(null);
        }}
        onSuccess={handleEmpleadoSuccess}
        editingEmpleado={editingEmpleado}
        token={token}
      />

      <ContratoModal
        isOpen={contratoModalOpen}
        onClose={() => {
          setContratoModalOpen(false);
          setSelectedContrato(null);
        }}
        onSuccess={handleContratoSuccess}
        contrato={selectedContrato}
        token={token}
      />

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={deleteConfirm?.open || false}
        title="Eliminar Empleado"
        description={
          <div className="space-y-3">
            <p className="text-sm sm:text-base text-gray-700">
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong className="text-gray-900">{deleteConfirm?.item?.nombre} {deleteConfirm?.item?.apellido}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-red-700">
                <strong>Importante:</strong> Esta acción marcará al empleado como TERMINADO. La información se mantendrá en el sistema pero el empleado no aparecerá en la lista de empleados activos.
              </p>
            </div>
          </div>
        }
        confirmLabel="Eliminar"
        severity="danger"
        loading={deleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
