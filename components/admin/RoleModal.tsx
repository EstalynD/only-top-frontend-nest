"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select, SelectField, type SelectOption } from '@/components/ui/selectUI';
import type { PermissionDef } from '@/lib/service-rbac/types';
import { Shield, Save, Check, CheckSquare, Square, Search, Filter, X, Key } from 'lucide-react';

export interface RoleFormData {
  key: string;
  name: string;
  permissions: string[];
}

export type RoleModalMode = 'create' | 'edit';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: RoleModalMode;
  initialData: RoleFormData;
  permissions: PermissionDef[];
  onSubmit: (data: RoleFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function RoleModal({
  isOpen,
  onClose,
  mode,
  initialData,
  permissions,
  onSubmit,
  isSubmitting
}: RoleModalProps) {
  const [form, setForm] = React.useState<RoleFormData>(initialData);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedModule, setSelectedModule] = React.useState<string>('');

  // Sincronizar form con initialData cuando cambie
  React.useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  // Reset search and filters when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedModule('');
    }
  }, [isOpen]);

  // Helpers de estado
  const isEdit = mode === 'edit';
  const isNameChanged = React.useMemo(() => {
    return form.name.trim() !== initialData.name.trim();
  }, [form.name, initialData.name]);
  const arePermissionsChanged = React.useMemo(() => {
    const a = new Set(form.permissions);
    const b = new Set(initialData.permissions);
    if (a.size !== b.size) return true;
    for (const p of a) if (!b.has(p)) return true;
    return false;
  }, [form.permissions, initialData.permissions]);
  const isDirty = isEdit ? (isNameChanged || arePermissionsChanged) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.name.trim()) return;
    if (isEdit && !isDirty) return; // Evitar submit si no hay cambios
    
    try {
      await onSubmit({
        key: form.key.trim().toUpperCase(),
        name: form.name.trim(),
        permissions: form.permissions
      });
    } catch (error) {
      // El manejo de errores se hace en el componente padre
      console.error('Error en RoleModal:', error);
    }
  };

  const togglePermission = (permissionKey: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
  };


  const getPermissionsByModule = () => {
    const grouped: Record<string, PermissionDef[]> = {};
    permissions.forEach(perm => {
      if (!grouped[perm.module]) grouped[perm.module] = [];
      grouped[perm.module].push(perm);
    });
    return grouped;
  };

  const permissionsByModule = getPermissionsByModule();

  // Funciones profesionales para manejo de permisos
  const selectAllPermissions = () => {
    const allPermissionKeys = permissions.map(p => p.key);
    setForm(prev => ({
      ...prev,
      permissions: allPermissionKeys
    }));
  };

  const deselectAllPermissions = () => {
    setForm(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const selectModulePermissions = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const modulePermissionKeys = modulePermissions.map(p => p.key);
    setForm(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...modulePermissionKeys])]
    }));
  };

  const deselectModulePermissions = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const modulePermissionKeys = modulePermissions.map(p => p.key);
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !modulePermissionKeys.includes(p))
    }));
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const modulePermissionKeys = modulePermissions.map(p => p.key);
    const allModuleSelected = modulePermissionKeys.every(key => form.permissions.includes(key));
    
    if (allModuleSelected) {
      deselectModulePermissions(module);
    } else {
      selectModulePermissions(module);
    }
  };

  // Filtros y búsqueda
  const filteredPermissions = React.useMemo(() => {
    let filtered = permissions;

    // Filtrar por módulo
    if (selectedModule) {
      filtered = filtered.filter(perm => perm.module === selectedModule);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(perm => 
        perm.name.toLowerCase().includes(query) ||
        perm.key.toLowerCase().includes(query) ||
        perm.module.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [permissions, selectedModule, searchQuery]);

  const filteredPermissionsByModule = React.useMemo(() => {
    const grouped: Record<string, PermissionDef[]> = {};
    filteredPermissions.forEach(perm => {
      if (!grouped[perm.module]) grouped[perm.module] = [];
      grouped[perm.module].push(perm);
    });
    return grouped;
  }, [filteredPermissions]);

  // Opciones para el select de módulos
  const moduleOptions: SelectOption[] = React.useMemo(() => {
    const options: SelectOption[] = [
      { value: '', label: 'Todos los módulos' }
    ];
    
    Object.keys(permissionsByModule).forEach(module => {
      options.push({
        value: module,
        label: module.charAt(0).toUpperCase() + module.slice(1)
      });
    });
    
    return options;
  }, [permissionsByModule]);

  // Estadísticas profesionales
  const permissionStats = React.useMemo(() => {
    const total = permissions.length;
    const selected = form.permissions.length;
    const percentage = total > 0 ? Math.round((selected / total) * 100) : 0;
    
    const moduleStats = Object.keys(permissionsByModule).map(module => {
      const modulePermissions = permissionsByModule[module] || [];
      const moduleSelected = modulePermissions.filter(p => form.permissions.includes(p.key)).length;
      const moduleTotal = modulePermissions.length;
      const modulePercentage = moduleTotal > 0 ? Math.round((moduleSelected / moduleTotal) * 100) : 0;
      
      return {
        module,
        selected: moduleSelected,
        total: moduleTotal,
        percentage: modulePercentage,
        isFullySelected: moduleSelected === moduleTotal && moduleTotal > 0,
        isPartiallySelected: moduleSelected > 0 && moduleSelected < moduleTotal
      };
    });

    return {
      total,
      selected,
      percentage,
      moduleStats
    };
  }, [form.permissions, permissions, permissionsByModule]);

  const modalFooter = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-4">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {permissionStats.selected}
          </span>
          {' / '}
          <span>{permissionStats.total}</span>
          {' permisos seleccionados ('}
          <span className="font-medium" style={{ color: 'var(--ot-blue-600)' }}>
            {permissionStats.percentage}%
          </span>
          {')'}
        </div>
      </div>
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          size="md"
          className="flex-1 sm:flex-none"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="role-form"
          disabled={isSubmitting || (isEdit && !isDirty)}
          variant="primary"
          size="md"
          className="flex-1 sm:flex-none"
        >
          <Save size={16} />
          <span>
            {isSubmitting
              ? (isEdit ? 'Actualizando…' : 'Guardando…')
              : (isEdit ? (isDirty ? 'Guardar cambios' : 'Sin cambios') : 'Crear rol')}
          </span>
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Rol' : 'Editar Rol'}
      icon={<Shield size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="6xl"
      footer={modalFooter}
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica del Rol */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <Shield size={16} style={{ color: 'var(--ot-blue-500)' }} />
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Información Básica
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clave del Rol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Clave del Rol *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={mode === 'edit'}
                  pattern="^[A-Z0-9_]+$"
                  title="Solo mayúsculas, números y guiones bajos"
                  className="w-full px-3 py-2.5 rounded-lg border font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: mode === 'edit' ? 'var(--surface-muted)' : 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text-primary)' 
                  }}
                  value={form.key}
                  onChange={(e) => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))}
                  placeholder="EJ: GESTOR_RRHH"
                />
                {mode === 'edit' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Shield size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ot-blue-500)' }}></div>
                <span>Solo mayúsculas, números y guiones bajos</span>
              </div>
            </div>

            {/* Nombre del Rol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Nombre del Rol *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  background: 'var(--surface)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-primary)' 
                }}
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Gestor de RRHH"
              />
              <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ot-green-500)' }}></div>
                <span>Nombre descriptivo para el rol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Permisos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center space-x-2">
              <Key size={16} style={{ color: 'var(--ot-blue-500)' }} />
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Permisos del Rol
              </h3>
              <div className="px-2 py-1 rounded-full text-xs font-medium" 
                   style={{ 
                     background: 'var(--ot-blue-100)', 
                     color: 'var(--ot-blue-700)' 
                   }}>
                {permissionStats.selected} / {permissionStats.total}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={selectAllPermissions}
                variant="secondary"
                size="sm"
              >
                <CheckSquare size={14} />
                <span>Seleccionar todo</span>
              </Button>
              <Button
                type="button"
                onClick={deselectAllPermissions}
                variant="secondary"
                size="sm"
              >
                <Square size={14} />
                <span>Deseleccionar todo</span>
              </Button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-gray-50 rounded-lg p-3" style={{ background: 'var(--surface-muted)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <Search size={14} style={{ color: 'var(--ot-blue-500)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                Filtros de Búsqueda
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Buscar permisos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, clave o módulo..."
                    className="w-full pl-8 pr-8 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      background: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)' 
                    }}
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  {searchQuery && (
                    <Button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Filtrar por módulo
                </label>
                <Select
                  value={selectedModule}
                  onChange={setSelectedModule}
                  options={moduleOptions}
                  placeholder="Todos los módulos"
                  fullWidth
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Lista de permisos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Lista de Permisos Disponibles
              </h4>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {filteredPermissions.length} permisos encontrados
              </div>
            </div>
            <div 
              className="border rounded-lg p-3 space-y-3 max-h-[500px] overflow-y-auto"
              style={{ 
                borderColor: 'var(--border)',
                background: 'var(--surface)'
              }}
            >
            {Object.keys(filteredPermissionsByModule).length ? (
              Object.entries(filteredPermissionsByModule).map(([module, modulePerms]) => {
                const moduleStat = permissionStats.moduleStats.find(stat => stat.module === module);
                return (
                  <div key={module} className="space-y-2">
                    {/* Header del módulo */}
                    <div className="flex items-center justify-between p-3 rounded-lg border" 
                         style={{ 
                           background: 'var(--surface-muted)',
                           borderColor: 'var(--border)'
                         }}>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => toggleModulePermissions(module)}
                          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                        >
                          <div 
                            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                            style={{ 
                              borderColor: moduleStat?.isFullySelected 
                                ? 'var(--ot-green-500)' 
                                : moduleStat?.isPartiallySelected 
                                  ? 'var(--ot-orange-500)' 
                                  : 'var(--border)',
                              background: moduleStat?.isFullySelected 
                                ? 'var(--ot-green-500)' 
                                : 'transparent'
                            }}
                          >
                            {moduleStat?.isFullySelected && (
                              <Check size={14} style={{ color: 'white' }} />
                            )}
                            {moduleStat?.isPartiallySelected && !moduleStat?.isFullySelected && (
                              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ot-orange-500)' }} />
                            )}
                          </div>
                          <div>
                            <h4 
                              className="text-sm font-semibold capitalize"
                              style={{ color: 'var(--ot-blue-600)' }}
                            >
                              {module}
                            </h4>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {moduleStat?.total || 0} permisos disponibles
                            </p>
                          </div>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {moduleStat?.selected || 0} / {moduleStat?.total || 0}
                        </div>
                        <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${moduleStat?.percentage || 0}%`,
                              background: moduleStat?.isFullySelected 
                                ? 'var(--ot-green-500)' 
                                : moduleStat?.isPartiallySelected 
                                  ? 'var(--ot-orange-500)' 
                                  : 'var(--ot-blue-500)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permisos del módulo */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 ml-4">
                      {modulePerms.map(perm => {
                        const isSelected = form.permissions.includes(perm.key);
                        return (
                          <label 
                            key={perm.key}
                            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border hover:shadow-sm"
                            style={{ 
                              background: isSelected 
                                ? 'rgba(34, 197, 94, 0.08)' 
                                : 'var(--surface)',
                              borderColor: isSelected 
                                ? 'rgba(34, 197, 94, 0.3)' 
                                : 'var(--border)',
                              borderWidth: '1px'
                            }}
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermission(perm.key)}
                                className="sr-only"
                              />
                              <div 
                                className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                                style={{ 
                                  borderColor: isSelected ? 'var(--ot-green-500)' : 'var(--border)',
                                  background: isSelected ? 'var(--ot-green-500)' : 'transparent'
                                }}
                              >
                                {isSelected && (
                                  <Check size={14} style={{ color: 'white' }} />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p 
                                  className="text-sm font-medium transition-colors duration-200" 
                                  style={{ 
                                    color: isSelected 
                                      ? 'var(--ot-green-800)' 
                                      : 'var(--text-primary)',
                                    fontWeight: isSelected ? '600' : '500'
                                  }}
                                >
                                  {perm.name}
                                </p>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ot-green-500)' }} />
                                )}
                              </div>
                              <p 
                                className="text-xs transition-colors duration-200 font-mono" 
                                style={{ 
                                  color: isSelected 
                                    ? 'var(--ot-green-700)' 
                                    : 'var(--text-muted)'
                                }}
                              >
                                {perm.key}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" 
                     style={{ background: 'var(--surface-muted)' }}>
                  <Search size={20} className="opacity-50" />
                </div>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No se encontraron permisos
                </h4>
                <p className="text-sm">
                  {searchQuery || selectedModule 
                    ? 'Intenta ajustar los filtros de búsqueda para encontrar más permisos' 
                    : 'No hay permisos disponibles en el sistema'}
                </p>
                {(searchQuery || selectedModule) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedModule('');
                    }}
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}