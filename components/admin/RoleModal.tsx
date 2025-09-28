"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import type { Role, PermissionDef } from '@/lib/service-rbac/types';
import { Shield, Save, Check } from 'lucide-react';

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

  // Sincronizar form con initialData cuando cambie
  React.useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.name.trim()) return;
    
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Rol' : 'Editar Rol'}
      icon={<Shield size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Clave del Rol *
            </label>
            <input
              type="text"
              required
              disabled={mode === 'edit'}
              className="w-full px-3 py-2 rounded-lg border font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: mode === 'edit' ? 'var(--surface-muted)' : 'var(--surface)', 
                borderColor: 'var(--border)', 
                color: 'var(--text-primary)' 
              }}
              value={form.key}
              onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))}
              placeholder="EJ: GESTOR_RRHH"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Solo mayúsculas, números y guiones bajos
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Nombre del Rol *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 rounded-lg border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Gestor de RRHH"
            />
          </div>
        </div>

        {/* Permisos */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Permisos del Rol
          </label>
          <div 
            className="border rounded-lg p-4 space-y-4"
            style={{ borderColor: 'var(--border)' }}
          >
            {Object.keys(permissionsByModule).length ? (
              Object.entries(permissionsByModule).map(([module, modulePerms]) => (
                <div key={module}>
                  <h4 
                    className="text-sm font-medium mb-2 capitalize"
                    style={{ color: 'var(--ot-blue-600)' }}
                  >
                    {module}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {modulePerms.map(perm => (
                      <label 
                        key={perm.key}
                        className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-50"
                        style={{ background: form.permissions.includes(perm.key) ? 'var(--ot-green-50)' : 'var(--surface-muted)' }}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="sr-only"
                          />
                          <div 
                            className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                            style={{ 
                              borderColor: form.permissions.includes(perm.key) ? 'var(--ot-green-500)' : 'var(--border)',
                              background: form.permissions.includes(perm.key) ? 'var(--ot-green-500)' : 'transparent'
                            }}
                          >
                            {form.permissions.includes(perm.key) && (
                              <Check size={12} style={{ color: 'white' }} />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {perm.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {perm.key}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No hay permisos disponibles
              </p>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Seleccionados: {form.permissions.length} permiso{form.permissions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Guardando…' : 'Guardar'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}