"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { UserPlus, Save } from 'lucide-react';

export type CreateUserForm = {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserForm) => Promise<void>;
  isSubmitting?: boolean;
}

export default function UserCreateModal({ isOpen, onClose, onSubmit, isSubmitting = false }: Props) {
  const [form, setForm] = React.useState<CreateUserForm>({ username: '', password: '', displayName: '', email: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    await onSubmit({
      username: form.username.trim(),
      password: form.password,
      displayName: form.displayName?.trim() || undefined,
      email: form.email?.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear usuario"
      icon={<UserPlus size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Usuario *
          </label>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="usuario"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Contraseña *
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="********"
            required
            minLength={6}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Mínimo 6 caracteres.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Nombre para mostrar
          </label>
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Creando…' : 'Crear'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
