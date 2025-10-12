"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { listRoles, createRole, deleteRole, updateRole, listPermissions } from '@/lib/service-rbac/api';
import type { Role, PermissionDef } from '@/lib/service-rbac/types';
import RoleModal, { RoleFormData, RoleModalMode } from '@/components/admin/RoleModal';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Shield, 
  Key
} from 'lucide-react';

export default function RolesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
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
  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);

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
  toast({ type: 'success', title: 'Rol creado', description: `Se creó el rol ${newRole.key}.` });
      } else if (editingRole) {
        const updatedRole = await updateRole(token, editingRole.key, {
          name: formData.name,
          permissions: formData.permissions
        });
        setRoles((prev) => prev.map(r => r.key === editingRole.key ? updatedRole : r));
  toast({ type: 'success', title: 'Cambios guardados', description: `Rol ${updatedRole.key} actualizado.` });
      }
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el rol';
  toast({ type: 'error', title: 'Error', description: msg });
      throw err; // Re-throw para que RoleModal pueda manejarlo si es necesario
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (key: string) => {
    setConfirmTarget(key);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !confirmTarget) return;
    setConfirmLoading(true);
    try {
      await deleteRole(token, confirmTarget);
      setRoles((prev) => prev.filter((r) => r.key !== confirmTarget));
      toast({ type: 'success', title: 'Rol eliminado', description: `Se eliminó ${confirmTarget}.` });
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setConfirmLoading(false);
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
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="md"
        >
          <Plus size={18} />
          Nuevo Rol
        </Button>
      </header>

      {/* Listado */}
      <section 
        className="rounded-xl border shadow-sm overflow-hidden" 
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader size="lg" label="Cargando roles" />
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
                          <Button
                            onClick={() => openEditModal(role)}
                            variant="ghost"
                            size="sm"
                            title="Editar rol"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            onClick={() => requestDelete(role.key)}
                            variant="danger"
                            size="sm"
                            title="Eliminar rol"
                          >
                            <Trash2 size={16} />
                          </Button>
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
                      <Button
                        onClick={() => openEditModal(role)}
                        variant="ghost"
                        size="sm"
                        title="Editar rol"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => requestDelete(role.key)}
                        variant="danger"
                        size="sm"
                        title="Eliminar rol"
                      >
                        <Trash2 size={16} />
                      </Button>
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

      {/* Confirmación eliminar */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Eliminar rol"
        severity="danger"
        description={
          <div>
            <p>¿Seguro que deseas eliminar el rol <strong>{confirmTarget}</strong>?</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Esta acción no se puede deshacer y podría afectar permisos de usuarios asociados.
            </p>
          </div>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={confirmLoading}
        onCancel={() => { if (!confirmLoading) { setConfirmOpen(false); setConfirmTarget(null); } }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
