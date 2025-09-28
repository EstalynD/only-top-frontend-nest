"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import type { Role } from '@/lib/service-rbac/types';
import { Shield, Check, Search } from 'lucide-react';

export interface UserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rolesCatalog: Role[];
  currentRoles: string[];
  onSubmit: (nextRoles: string[]) => Promise<void>;
  isSubmitting?: boolean;
  username?: string;
}

export default function UserRolesModal({
  isOpen,
  onClose,
  rolesCatalog,
  currentRoles,
  onSubmit,
  isSubmitting = false,
  username,
}: UserRolesModalProps) {
  const [selected, setSelected] = React.useState<string[]>(currentRoles);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    setSelected(currentRoles);
  }, [currentRoles]);

  const toggle = (roleKey: string) => {
    setSelected((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const filtered = React.useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return rolesCatalog;
    return rolesCatalog.filter(
      (r) => r.key.toLowerCase().includes(v) || r.name.toLowerCase().includes(v)
    );
  }, [q, rolesCatalog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(selected);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar roles${username ? ` a ${username}` : ''}`}
      icon={<Shield size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar rol por clave o nombre"
            className="w-full px-3 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="border rounded-lg max-h-80 overflow-auto" style={{ borderColor: 'var(--border)' }}>
          {filtered.length ? (
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map((r) => {
                const active = selected.includes(r.key);
                return (
                  <li key={r.key}>
                    <label className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => toggle(r.key)}
                      />
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center"
                        style={{ borderColor: active ? 'var(--ot-green-500)' : 'var(--border)', background: active ? 'var(--ot-green-500)' : 'transparent' }}
                      >
                        {active && <Check size={12} style={{ color: '#fff' }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.key}</p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              No hay roles para mostrar
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Seleccionados: {selected.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}