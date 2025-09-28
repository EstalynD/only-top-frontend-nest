"use client";
import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { getProfile, updateProfile } from '@/lib/service-user/api';
import type { UpdateProfileRequest, UserProfile } from '@/lib/service-user/types';

export default function ProfilePage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<UserProfile | null>(null);
  const [form, setForm] = React.useState<UpdateProfileRequest>({});

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) return;
      try {
        const res = await getProfile(token);
        if (!mounted) return;
        setData(res.user);
        setForm({
          displayName: res.user.displayName ?? '',
          email: res.user.email ?? '',
          avatarUrl: res.user.avatarUrl ?? '',
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al cargar perfil';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const body: UpdateProfileRequest = {
        displayName: form.displayName?.trim() || undefined,
        email: form.email?.trim() || undefined,
        avatarUrl: form.avatarUrl?.trim() || undefined,
      };
      const res = await updateProfile(token, body);
      setData(res.user);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al guardar';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <main className="p-4">
      <section className="ot-card max-w-3xl w-full mx-auto p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Mi perfil</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Gestiona tu información personal.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
              {form.avatarUrl ? (
                <Image
                  src={form.avatarUrl}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin avatar</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>URL de avatar</label>
              <input
                type="url"
                name="avatarUrl"
                value={form.avatarUrl ?? ''}
                onChange={onChange}
                className="w-full px-3 py-2 rounded border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="https://…"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Nombre visible</label>
            <input
              type="text"
              name="displayName"
              value={form.displayName ?? ''}
              onChange={onChange}
              className="w-full px-3 py-2 rounded border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email ?? ''}
              onChange={onChange}
              className="w-full px-3 py-2 rounded border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              placeholder="tucorreo@onlytop.com"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => setForm({
              displayName: data.displayName ?? '',
              email: data.email ?? '',
              avatarUrl: data.avatarUrl ?? '',
            })} className="ot-button px-4 py-2" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Restablecer
            </button>
            <button disabled={saving} className="ot-button px-4 py-2" style={{ background: 'var(--ot-blue-600)', color: 'white' }}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
