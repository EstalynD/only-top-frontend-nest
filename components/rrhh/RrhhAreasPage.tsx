"use client";
import React from 'react';
import { 
  Building2, 
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
  Grid3X3,
  List,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import AreaModal from './AreaModal';
import CargoModal from './CargoModal';
import SeedDataButton from './SeedDataButton';
import ContractTemplateModal from './ContractTemplateModal';
import { 
  getAreasWithCargos, 
  deleteArea, 
  deleteCargo 
} from '@/lib/service-rrhh/api';
import { 
  getAreaStats,
  sortAreasByOrder,
  searchAreas,
  getHierarchyLevelLabel
} from '@/lib/service-rrhh/helpers';
import type { AreaWithCargos, Area, Cargo } from '@/lib/service-rrhh/types';

interface Props {
  token: string;
}

export default function RrhhAreasPage({ token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const router = useRouter();
  const [areas, setAreas] = React.useState<AreaWithCargos[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showInactive, setShowInactive] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState<AreaWithCargos | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  // Vista
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');
  
  // Modales
  const [areaModalOpen, setAreaModalOpen] = React.useState(false);
  const [cargoModalOpen, setCargoModalOpen] = React.useState(false);
  const [contractTemplateModalOpen, setContractTemplateModalOpen] = React.useState(false);
  const [editingArea, setEditingArea] = React.useState<Area | null>(null);
  const [editingCargo, setEditingCargo] = React.useState<Cargo | null>(null);
  
  // Confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    type: 'area' | 'cargo';
    item: Area | Cargo;
    open: boolean;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadAreas = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAreasWithCargos(token, showInactive);
      setAreas(sortAreasByOrder(data));
    } catch (error) {
      console.error('Error loading areas:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las áreas. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  }, [token, showInactive, toast]);

  React.useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const filteredAreas = React.useMemo(() => {
    return searchAreas(areas, searchQuery);
  }, [areas, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAreas = filteredAreas.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showInactive]);

  const handleAreaSuccess = () => {
    setAreaModalOpen(false);
    setEditingArea(null);
    loadAreas();
    toast({
      type: 'success',
      title: editingArea ? 'Área actualizada' : 'Área creada',
      description: editingArea 
        ? 'El área se actualizó correctamente.'
        : 'La nueva área se creó correctamente.',
    });
  };

  const handleCargoSuccess = () => {
    setCargoModalOpen(false);
    setEditingCargo(null);
    loadAreas();
    toast({
      type: 'success',
      title: editingCargo ? 'Cargo actualizado' : 'Cargo creado',
      description: editingCargo 
        ? 'El cargo se actualizó correctamente.'
        : 'El nuevo cargo se creó correctamente.',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      
      if (deleteConfirm.type === 'area') {
        await deleteArea(deleteConfirm.item._id, token);
        toast({
          type: 'success',
          title: 'Área eliminada',
          description: 'El área se eliminó correctamente.',
        });
      } else {
        await deleteCargo(deleteConfirm.item._id, token);
        toast({
          type: 'success',
          title: 'Cargo eliminado',
          description: 'El cargo se eliminó correctamente.',
        });
      }
      
      setDeleteConfirm(null);
      loadAreas();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast({
        type: 'error',
        title: 'Error al eliminar',
        description: error.message || 'No se pudo eliminar el elemento.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditArea = (area: Area) => {
    setEditingArea(area);
    setAreaModalOpen(true);
  };

  const openEditCargo = (cargo: Cargo, areaId?: string) => {
    // Add areaId to cargo if it's missing (when coming from AreaWithCargos)
    const cargoWithAreaId = {
      ...cargo,
      areaId: cargo.areaId || areaId || ''
    };
    setEditingCargo(cargoWithAreaId);
    setCargoModalOpen(true);
  };

  const openDeleteConfirm = (type: 'area' | 'cargo', item: Area | Cargo) => {
    setDeleteConfirm({ type, item, open: true });
  };

  const viewAreaDetails = (area: AreaWithCargos) => {
    router.push(`/rrhh/areas/${area._id}`);
  };

  const handleRowClick = (area: AreaWithCargos) => {
    viewAreaDetails(area);
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
            Cargando áreas y cargos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Gestión de Áreas
          </h1>
          <p className={`text-sm sm:text-base mt-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Administra las áreas organizacionales y sus cargos
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setAreaModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            variant="primary"
          >
            <Plus size={16} />
            <span className="text-sm sm:text-base">Nueva Área</span>
          </Button>
          
          <Button
            onClick={() => setCargoModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            variant="secondary"
          >
            <Users size={16} />
            <span className="text-sm sm:text-base">Nuevo Cargo</span>
          </Button>

          <Button
            onClick={() => setContractTemplateModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            variant="neutral"
          >
            <FileText size={16} />
            <span className="text-sm sm:text-base">Plantillas</span>
          </Button>

          {areas.length === 0 && (
            <SeedDataButton
              onSuccess={loadAreas}
              token={token}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar áreas y cargos..."
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle de vista */}
          <div className={`flex items-center rounded-xl border ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-l-xl transition-colors duration-200 ${
                viewMode === 'table'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista de tabla"
            >
              <List size={16} />
              <span className="hidden sm:inline text-sm">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-r-xl transition-colors duration-200 ${
                viewMode === 'cards'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista de tarjetas"
            >
              <Grid3X3 size={16} />
              <span className="hidden sm:inline text-sm">Cards</span>
            </button>
          </div>
          
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
            onClick={loadAreas}
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

      {/* Areas Content */}
      {filteredAreas.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <Building2 size={32} className={`sm:w-10 sm:h-10 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
          </div>
          <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {searchQuery ? 'No se encontraron resultados' : 'No hay áreas configuradas'}
          </h3>
          <p className={`text-sm sm:text-base mb-6 max-w-md mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera área organizacional'
            }
          </p>
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={() => setAreaModalOpen(true)}
                variant="primary"
                className="px-6 py-3 rounded-xl font-medium"
              >
                Crear Primera Área
              </Button>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>o</span>
              <SeedDataButton
                onSuccess={loadAreas}
                token={token}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Contenido según el modo de vista */}
          {viewMode === 'table' ? (
            /* Tabla de áreas */
            <div className={`rounded-xl border overflow-hidden ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    theme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Área
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Código
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Cargos
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Niveles
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Estado
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Acciones
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {paginatedAreas.map((area) => {
                      const stats = getAreaStats(area);
                      return (
                        <tr
                          key={area._id}
                          className={`cursor-pointer transition-colors duration-150 hover:bg-opacity-50 ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700/50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleRowClick(area)}
                        >
                          {/* Área */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ background: area.color }}
                              >
                                <Building2 size={16} className="text-white" />
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {area.name}
                                </div>
                                {area.description && (
                                  <div className={`text-xs truncate max-w-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {area.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Código */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-mono ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {area.code}
                            </div>
                          </td>

                          {/* Cargos */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                              }`}>
                                {stats.activeCargos}
                              </div>
                              <div className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                activos
                              </div>
                            </div>
                          </td>

                          {/* Niveles */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {stats.hierarchyLevels}
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                area.isActive
                                  ? theme === 'dark'
                                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                  : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {area.isActive ? (
                                <CheckCircle2 size={12} />
                              ) : (
                                <AlertCircle size={12} />
                              )}
                              {area.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCargo({ areaId: area._id } as any);
                                  setCargoModalOpen(true);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Agregar cargo"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditArea(area);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Editar área"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirm('area', area);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                                    : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                                }`}
                                title="Eliminar área"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Vista de cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedAreas.map((area) => {
                const stats = getAreaStats(area);
                return (
                  <div
                    key={area._id}
                    className={`rounded-xl border p-4 sm:p-6 transition-all duration-200 hover:shadow-lg group cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleRowClick(area)}
                  >
                    {/* Area Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-sm"
                          style={{ background: area.color }}
                        >
                          <Building2 size={20} className="text-white sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {area.name}
                          </h3>
                          <p className={`text-xs sm:text-sm truncate ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {area.code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            area.isActive
                              ? theme === 'dark'
                                ? 'bg-green-900/30 text-green-400 border border-green-800'
                                : 'bg-green-100 text-green-800 border border-green-200'
                              : theme === 'dark'
                                ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {area.isActive ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          <span className="hidden sm:inline">{area.isActive ? 'Activa' : 'Inactiva'}</span>
                        </span>
                        
                        <div className="relative">
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArea(selectedArea?._id === area._id ? null : area);
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {selectedArea?._id === area._id && (
                            <div 
                              className={`absolute right-0 top-10 w-48 sm:w-52 rounded-xl border shadow-xl z-20 py-2 ${
                                theme === 'dark'
                                  ? 'border-gray-600 bg-gray-800'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCargo({ areaId: area._id } as any);
                                  setCargoModalOpen(true);
                                  setSelectedArea(null);
                                }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <Plus size={16} className="text-gray-500" />
                                Agregar cargo
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditArea(area);
                                  setSelectedArea(null);
                                }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <Edit2 size={16} className="text-gray-500" />
                                Editar área
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirm('area', area);
                                  setSelectedArea(null);
                                }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-150 ${
                                  theme === 'dark'
                                    ? 'hover:bg-red-900/30 text-red-400'
                                    : 'hover:bg-red-50 text-red-600'
                                }`}
                              >
                                <Trash2 size={16} className="text-red-500" />
                                Eliminar área
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Area Description */}
                    {area.description && (
                      <p className={`text-sm mb-4 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {area.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold" style={{ color: area.color }}>
                          {stats.activeCargos}
                        </div>
                        <div className={`text-xs sm:text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Cargos activos
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {stats.hierarchyLevels}
                        </div>
                        <div className={`text-xs sm:text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Niveles jerárquicos
                        </div>
                      </div>
                    </div>

                    {/* Cargos List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Cargos
                        </h4>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCargo({ areaId: area._id } as any);
                            setCargoModalOpen(true);
                          }}
                          variant="ghost"
                          className="text-xs px-2 py-1 h-auto"
                        >
                          <Plus size={12} className="mr-1" />
                          Agregar
                        </Button>
                      </div>
                      
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {area.cargos.length === 0 ? (
                          <p className={`text-xs text-center py-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            No hay cargos en esta área
                          </p>
                        ) : (
                          area.cargos
                            .filter(cargo => showInactive || cargo.isActive)
                            .slice(0, 3)
                            .map((cargo) => (
                              <div
                                key={cargo._id}
                                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium truncate ${
                                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {cargo.name}
                                    </span>
                                    {!cargo.isActive && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        Inactivo
                                      </span>
                                    )}
                                  </div>
                                  <div className={`flex items-center gap-2 text-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    <span>{getHierarchyLevelLabel(cargo.hierarchyLevel)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditCargo(cargo as Cargo, area._id);
                                    }}
                                    className={`p-1 rounded-md transition-colors ${
                                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteConfirm('cargo', cargo as Cargo);
                                    }}
                                    className={`p-1 rounded-md transition-colors ${
                                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                        {area.cargos.length > 3 && (
                          <p className={`text-xs text-center py-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            +{area.cargos.length - 3} cargos más
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginador */}
          {totalPages > 1 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-xl border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAreas.length)} de {filteredAreas.length} áreas
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <AreaModal
        isOpen={areaModalOpen}
        onClose={() => {
          setAreaModalOpen(false);
          setEditingArea(null);
        }}
        onSuccess={handleAreaSuccess}
        editingArea={editingArea}
        token={token}
      />

      <CargoModal
        isOpen={cargoModalOpen}
        onClose={() => {
          setCargoModalOpen(false);
          setEditingCargo(null);
        }}
        onSuccess={handleCargoSuccess}
        editingCargo={editingCargo}
        areas={areas}
        token={token}
      />

      {/* Modal de Plantillas de Contratos */}
      <ContractTemplateModal
        isOpen={contractTemplateModalOpen}
        onClose={() => setContractTemplateModalOpen(false)}
        onSuccess={loadAreas}
        token={token}
      />

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={deleteConfirm?.open || false}
        title={`Eliminar ${deleteConfirm?.type === 'area' ? 'Área' : 'Cargo'}`}
        description={
          <div>
            <p>
              ¿Estás seguro de que deseas eliminar{' '}
              <strong>{deleteConfirm?.item?.name}</strong>?
            </p>
            {deleteConfirm?.type === 'area' && (
              <p className="mt-2 text-sm text-red-600">
                Esta acción también eliminará todos los cargos asociados a esta área.
              </p>
            )}
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
