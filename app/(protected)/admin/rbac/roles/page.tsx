"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { listRoles, createRole, deleteRole, updateRole, listPermissions } from '@/lib/service-rbac/api';
import type { Role, PermissionDef } from '@/lib/service-rbac/types';
import RoleModal, { RoleFormData, RoleModalMode } from '@/components/admin/RoleModal';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Shield, 
  Key
} from 'lucide-react';

export default function RolesPage() {
  const { token } = useAuth();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionDef[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<RoleModalMode>('create');
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [initialFormData, setInitialFormData] = React.useState<RoleFormData>({ key: '', name: '', permissions: [] });

  const fetchData = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        listRoles(token),
        listPermissions(token)
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando datos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingRole(null);
    setInitialFormData({ key: '', name: '', permissions: [] });
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setModalMode('edit');
    setEditingRole(role);
    setInitialFormData({ key: role.key, name: role.name, permissions: role.permissions || [] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    setInitialFormData({ key: '', name: '', permissions: [] });
  };

  const handleRoleSubmit = async (formData: RoleFormData) => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const newRole = await createRole(token, formData);
        setRoles((prev) => [newRole, ...prev]);
      } else if (editingRole) {
        const updatedRole = await updateRole(token, editingRole.key, {
          name: formData.name,
          permissions: formData.permissions
        });
        setRoles((prev) => prev.map(r => r.key === editingRole.key ? updatedRole : r));
      }
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el rol';
      alert(msg);
      throw err; // Re-throw para que RoleModal pueda manejarlo si es necesario
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (key: string) => {
    if (!token) return;
    if (!confirm(`¿Eliminar rol ${key}?`)) return;
    try {
      await deleteRole(token, key);
      setRoles((prev) => prev.filter((r) => r.key !== key));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      alert(msg);
    }
  };



  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between flex-col gap-3 sm:flex-row">
        <div className="flex items-center space-x-3">
          <Shield size={24} style={{ color: 'var(--ot-blue-500)' }} />
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Roles & Permisos
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Administra roles del sistema y sus permisos
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
        >
          <Plus size={18} />
          <span>Nuevo Rol</span>
        </button>
      </header>

      {/* Listado */}
      <section 
        className="rounded-xl border shadow-sm overflow-hidden" 
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            Cargando…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Desktop: Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--surface-muted)' }}>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    <th className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Key size={14} />
                        <span>Rol</span>
                      </div>
                    </th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Permisos</th>
                    <th className="px-6 py-4 w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr 
                      key={role.key} 
                      className="border-t transition-colors hover:bg-gray-50/50"
                      style={{ borderColor: 'var(--border)'}}
                    >
                      <td className="px-6 py-4">
                        <code 
                          className="px-2 py-1 rounded text-xs font-mono"
                          style={{ background: 'var(--surface-muted)', color: 'var(--ot-blue-600)' }}
                        >
                          {role.key}
                        </code>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {role.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 3).map(perm => (
                            <span 
                              key={perm}
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                background: 'var(--ot-green-100)', 
                                color: 'var(--ot-green-700)',
                                border: '1px solid var(--ot-green-200)'
                              }}
                            >
                              {perm}
                            </span>
                          ))}
                          {(role.permissions || []).length > 3 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              +{(role.permissions || []).length - 3} más
                            </span>
                          )}
                          {!(role.permissions || []).length && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Sin permisos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(role)}
                            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                            style={{ color: 'var(--ot-blue-500)' }}
                            title="Editar rol"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(role.key)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50"
                            style={{ color: '#ef4444' }}
                            title="Eliminar rol"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!roles.length && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                        <Shield size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No hay roles configurados</p>
                        <p className="text-sm mt-1">Crea el primer rol para comenzar</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: Cards */}
            <div className="block md:hidden">
              {roles.map((role) => (
                <div key={role.key} className="px-4 py-4 border-t first:border-t-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <code 
                        className="px-2 py-1 rounded text-xs font-mono"
                        style={{ background: 'var(--surface-muted)', color: 'var(--ot-blue-600)' }}
                      >
                        {role.key}
                      </code>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {role.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--ot-blue-500)', border: '1px solid var(--border)' }}
                        title="Editar rol"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(role.key)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#ef4444', border: '1px solid var(--border)' }}
                        title="Eliminar rol"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(role.permissions || []).slice(0, 4).map(perm => (
                      <span 
                        key={perm}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ 
                          background: 'var(--ot-green-100)', 
                          color: 'var(--ot-green-700)',
                          border: '1px solid var(--ot-green-200)'
                        }}
                      >
                        {perm}
                      </span>
                    ))}
                    {(role.permissions || []).length > 4 && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        +{(role.permissions || []).length - 4} más
                      </span>
                    )}
                    {!(role.permissions || []).length && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sin permisos
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!roles.length && (
                <div className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Shield size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No hay roles configurados</p>
                  <p className="text-sm mt-1">Crea el primer rol para comenzar</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Modal */}
      <RoleModal
        isOpen={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        initialData={initialFormData}
        permissions={permissions}
        onSubmit={handleRoleSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
}
