"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { listUsers, createUser } from '@/lib/service-user/api';
import { listRoles, assignRoles, revokeRoles } from '@/lib/service-rbac/api';
import type { Role } from '@/lib/service-rbac/types';
import UserRolesModal from '@/components/admin/UserRolesModal';
import UserCreateModal from '@/components/admin/UserCreateModal';
import type { AdminUserListItem } from '@/lib/service-user/types';
import { Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [data, setData] = React.useState<{ items: AdminUserListItem[]; total: number; pages: number }>({ items: [], total: 0, pages: 1 });
  const [rolesCatalog, setRolesCatalog] = React.useState<Role[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUserListItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  

  const fetchData = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers(token, q, page, limit);
      setData({ items: res.items, total: res.total, pages: res.pages });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, q, page, limit]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const onSearchSubmit = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    await fetchData();
  }, [fetchData]);

  // Cargar catálogo de roles una sola vez
  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const roles = await listRoles(token);
        setRolesCatalog(roles);
      } catch {
        // silencioso en UI
      }
    })();
  }, [token]);

  const openAssignModal = (u: AdminUserListItem) => {
    setSelectedUser(u);
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const openCreateModal = () => setCreateOpen(true);
  const closeCreateModal = () => setCreateOpen(false);

  const submitCreateUser = async (form: { username: string; password: string; displayName?: string; email?: string }) => {
    if (!token) return;
    setCreating(true);
    try {
      const created = await createUser(token, form);
      // Prepend en la lista actual
      setData((prev) => ({ ...prev, items: [created, ...prev.items] }));
      closeCreateModal();
      toast({ type: 'success', title: 'Usuario creado', description: `Se creó ${created.username} correctamente.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el usuario';
      toast({ type: 'error', title: 'Error al crear usuario', description: msg });
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const submitUserRoles = async (nextRoles: string[]) => {
    if (!token || !selectedUser) return;
    setSubmitting(true);
    try {
      const current = selectedUser.roles || [];
      const toAdd = nextRoles.filter((r) => !current.includes(r));
      const toRemove = current.filter((r) => !nextRoles.includes(r));

      if (toAdd.length) await assignRoles(token, selectedUser._id || selectedUser.id!, toAdd);
      if (toRemove.length) await revokeRoles(token, selectedUser._id || selectedUser.id!, toRemove);

      // refrescar fila en memoria
      setData((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          (it._id || it.id) === (selectedUser._id || selectedUser.id)
            ? { ...it, roles: nextRoles }
            : it
        ),
      }));

      closeAssignModal();
      toast({ type: 'success', title: 'Roles actualizados', description: `Se actualizaron los roles de ${selectedUser.username}.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar los roles del usuario';
      toast({ type: 'error', title: 'Error al actualizar roles', description: msg });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Users size={24} style={{ color: 'var(--ot-blue-500)' }} />
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Administración de usuarios
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Busca usuarios y asigna roles
            </p>
          </div>
        </div>
        <form
          role="search"
          onSubmit={onSearchSubmit}
          className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2"
          aria-label="Buscar usuarios"
        >
          <div className="relative flex-1 sm:flex-none">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por usuario, nombre o email"
              aria-label="Buscar por usuario, nombre o email"
              className="w-full sm:w-80 pl-10 pr-3 py-2 rounded-lg border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </Button>
            <Button
              type="button"
              onClick={openCreateModal}
              variant="success"
            >
              Nuevo usuario
            </Button>
          </div>
        </form>
      </header>

      <section className="rounded-xl border shadow-sm overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader size="lg" label="Cargando usuarios" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--surface-muted)' }}>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Roles</th>
                    <th className="px-6 py-4 w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u._id || u.id || u.username} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.username[0]?.toUpperCase() || '?'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.permissions?.length || 0} permisos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>{u.displayName || '-'}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>{u.email || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles || []).slice(0, 3).map(r => (
                            <span key={r} className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{r}</span>
                          ))}
                          {(u.roles || []).length > 3 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{(u.roles || []).length - 3} más</span>
                          )}
                          {!(u.roles || []).length && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => openAssignModal(u)}
                          variant="primary"
                          size="sm"
                        >
                          Asignar roles
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!data.items.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No hay usuarios</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden">
              {data.items.map((u) => (
                <div key={u._id || u.id || u.username} className="px-4 py-4 border-t first:border-t-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.username[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.displayName || '-'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email || '-'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => openAssignModal(u)}
                      variant="primary"
                      size="sm"
                      className="shrink-0"
                    >
                      Roles
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(u.roles || []).slice(0, 4).map(r => (
                      <span key={r} className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{r}</span>
                    ))}
                    {(u.roles || []).length > 4 && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{(u.roles || []).length - 4} más</span>
                    )}
                    {!(u.roles || []).length && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sin roles
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!data.items.length && (
                <div className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Users size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No hay usuarios</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <UserRolesModal
        isOpen={modalOpen}
        onClose={closeAssignModal}
        rolesCatalog={rolesCatalog}
        currentRoles={selectedUser?.roles || []}
        onSubmit={submitUserRoles}
        isSubmitting={submitting}
        username={selectedUser?.username}
      />
      <UserCreateModal
        isOpen={createOpen}
        onClose={closeCreateModal}
        onSubmit={submitCreateUser}
        isSubmitting={creating}
      />
    </div>
  );
}
