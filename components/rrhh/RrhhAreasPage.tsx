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
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import AreaModal from './AreaModal';
import CargoModal from './CargoModal';
import SeedDataButton from './SeedDataButton';
import { 
  getAreasWithCargos, 
  deleteArea, 
  deleteCargo 
} from '@/lib/service-rrhh/api';
import { 
  getAreaStats,
  sortAreasByOrder,
  searchAreas,
  getHierarchyLevelLabel,
  formatSalaryRange
} from '@/lib/service-rrhh/helpers';
import type { AreaWithCargos, Area, Cargo } from '@/lib/service-rrhh/types';

interface Props {
  token: string;
}

export default function RrhhAreasPage({ token }: Props) {
  const { toast } = useToast();
  const [areas, setAreas] = React.useState<AreaWithCargos[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showInactive, setShowInactive] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState<AreaWithCargos | null>(null);
  
  // Modales
  const [areaModalOpen, setAreaModalOpen] = React.useState(false);
  const [cargoModalOpen, setCargoModalOpen] = React.useState(false);
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

  const openEditCargo = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setCargoModalOpen(true);
  };

  const openDeleteConfirm = (type: 'area' | 'cargo', item: Area | Cargo) => {
    setDeleteConfirm({ type, item, open: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando áreas y cargos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Recursos Humanos
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Gestiona las áreas organizacionales y sus cargos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAreaModalOpen(true)}
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva Área</span>
          </Button>
          
          <Button
            onClick={() => setCargoModalOpen(true)}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Nuevo Cargo</span>
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar áreas y cargos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowInactive(!showInactive)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="hidden sm:inline">
              {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            </span>
          </Button>
          
          <Button
            onClick={loadAreas}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Areas Grid */}
      {filteredAreas.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {searchQuery ? 'No se encontraron resultados' : 'No hay áreas configuradas'}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera área organizacional'
            }
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAreaModalOpen(true)}
                variant="primary"
              >
                Crear Primera Área
              </Button>
              <span style={{ color: 'var(--text-muted)' }}>o</span>
              <SeedDataButton
                onSuccess={loadAreas}
                token={token}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAreas.map((area) => {
            const stats = getAreaStats(area);
            return (
              <div
                key={area._id}
                className="rounded-xl border p-6 transition-all hover:shadow-lg"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--surface)'
                }}
              >
                {/* Area Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: area.color }}
                    >
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {area.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {area.code}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!area.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        <AlertCircle size={12} />
                        Inactiva
                      </span>
                    )}
                    
                    <div className="relative">
                      <button
                        className="p-1 rounded-md transition-colors hover:bg-gray-100"
                        onClick={() => setSelectedArea(selectedArea?._id === area._id ? null : area)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {selectedArea?._id === area._id && (
                        <div 
                          className="absolute right-0 top-8 w-48 rounded-lg border shadow-lg z-10 py-1"
                          style={{ 
                            background: 'var(--surface)',
                            borderColor: 'var(--border)'
                          }}
                        >
                          <button
                            onClick={() => {
                              openEditArea(area);
                              setSelectedArea(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
                          >
                            <Edit2 size={14} />
                            Editar área
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm('area', area);
                              setSelectedArea(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 text-red-600"
                          >
                            <Trash2 size={14} />
                            Eliminar área
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Area Description */}
                {area.description && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {area.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: area.color }}>
                      {stats.activeCargos}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Cargos activos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
                      {stats.hierarchyLevels}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Niveles jerárquicos
                    </div>
                  </div>
                </div>

                {/* Cargos List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Cargos
                    </h4>
                    <Button
                      onClick={() => {
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
                  
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {area.cargos.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                        No hay cargos en esta área
                      </p>
                    ) : (
                      area.cargos
                        .filter(cargo => showInactive || cargo.isActive)
                        .map((cargo) => (
                          <div
                            key={cargo._id}
                            className="flex items-center justify-between p-2 rounded-md transition-colors hover:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {cargo.name}
                                </span>
                                {!cargo.isActive && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span>{getHierarchyLevelLabel(cargo.hierarchyLevel)}</span>
                                {cargo.salaryRange && (
                                  <>
                                    <span>•</span>
                                    <span>{formatSalaryRange(cargo.salaryRange.min, cargo.salaryRange.max, cargo.salaryRange.currency)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditCargo(cargo as Cargo)}
                                className="p-1 rounded-md transition-colors hover:bg-gray-100"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm('cargo', cargo as Cargo)}
                                className="p-1 rounded-md transition-colors hover:bg-gray-100 text-red-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
