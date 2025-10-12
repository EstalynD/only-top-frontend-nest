"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import { RRHH_ROUTES } from '@/lib/service-rrhh/routes';
import {
  getEndowmentCategories,
  createEndowmentCategory,
  updateEndowmentCategory,
  deleteEndowmentCategory,
  getEndowmentItems,
  createEndowmentItem,
  updateEndowmentItem,
  deleteEndowmentItem,
  getEndowmentTracking,
  createEndowmentTracking,
  deleteEndowmentTracking,
  getEndowmentStats,
} from '@/lib/service-rrhh';
import type { EndowmentCategory, EndowmentItem, EndowmentTracking } from '@/lib/service-rrhh/types';
import { ENDOWMENT_CONSTANTS } from '@/lib/service-rrhh/constants';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card, CardSection } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/selectUI';
import { Input } from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { addToast } from '@/components/ui/Toast';
import { 
  Package, ClipboardList, Settings2, Plus, Trash2,
  Laptop, Smartphone, Headphones, Monitor, Keyboard, Mouse, Printer, Camera, Watch,
  Shield, Briefcase, FileText, Wrench, Hammer, Zap, Star, Heart, Book, Home, Building,
  Phone, Users, User, Cloud, Database, Server, Globe, Lock, Key, Bell, Calendar, Clock, MapPin
} from 'lucide-react';
import TrackingDetailModal from '@/components/rrhh/endowment/TrackingDetailModal';
import CategoryForm from '@/components/rrhh/endowment/CategoryForm';
import CategoryList from '@/components/rrhh/endowment/CategoryList';

export default function EndowmentAdminPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'resumen' | 'tracking' | 'items' | 'categories'>('resumen');

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: <Package size={16} /> },
    { id: 'tracking', label: 'Seguimiento', icon: <ClipboardList size={16} /> },
    { id: 'items', label: 'Elementos', icon: <Settings2 size={16} /> },
    { id: 'categories', label: 'Categorías', icon: <Settings2 size={16} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{ENDOWMENT_CONSTANTS.labels.endowment}</h1>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as any)} />

      <TabPanel>
        {activeTab === 'resumen' && <ResumenSection token={token} />}
        {activeTab === 'tracking' && <TrackingSection token={token} />}
        {activeTab === 'items' && <ItemsSection token={token} />}
        {activeTab === 'categories' && <CategoriesSection token={token} />}
      </TabPanel>
    </div>
  );
}

// Helper de íconos por nombre (coincide con IconPicker)
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Package, Laptop, Smartphone, Headphones, Monitor, Keyboard, Mouse, Printer, Camera, Watch,
  Shield, Briefcase, FileText, Wrench, Hammer, Zap, Star, Heart, Book, Home, Building,
  Phone, Users, User, Cloud, Database, Server, Globe, Lock, Key, Bell, Calendar, Clock, MapPin,
};

// Alias para soportar nombres almacenados previamente
ICON_MAP['Tool'] = Wrench;

function renderCategoryIcon(name?: string | null, color?: string | null, size = 16) {
  const IconComp = (name && ICON_MAP[name]) ? ICON_MAP[name] : Package;
  return <IconComp size={size} style={{ color: color || 'var(--ot-blue-500)' }} />;
}

function ResumenSection({ token }: { token: string | null }) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<{ totalItems: number; totalCategories: number; totalDeliveries: number; totalReturns: number; pendingReturns: number; itemsByCategory: { category: string; count: number; totalValue: number }[] } | null>(null);

  React.useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await getEndowmentStats(token);
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) return <p style={{ color: 'var(--text-muted)' }}>No autorizado</p>;
  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardSection title="Totales" description="Resumen general de dotación">
        <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
          <div>
            <p className="font-medium">Elementos</p>
            <p className="text-lg">{stats?.totalItems ?? 0}</p>
          </div>
          <div>
            <p className="font-medium">Categorías</p>
            <p className="text-lg">{stats?.totalCategories ?? 0}</p>
          </div>
          <div>
            <p className="font-medium">Entregas</p>
            <p className="text-lg">{stats?.totalDeliveries ?? 0}</p>
          </div>
          <div>
            <p className="font-medium">Devoluciones</p>
            <p className="text-lg">{stats?.totalReturns ?? 0}</p>
          </div>
          <div className="col-span-2">
            <p className="font-medium">Pendientes de devolución</p>
            <p className="text-lg">{stats?.pendingReturns ?? 0}</p>
          </div>
        </div>
      </CardSection>

      <CardSection title="Por categoría" description="Entregas y valor estimado">
        <div className="space-y-3">
          {(stats?.itemsByCategory ?? []).map((c) => (
            <div key={c.category} className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-primary)' }}>{c.category}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.count} · ${c.totalValue.toLocaleString('es-CO')}</span>
            </div>
          ))}
          {(!stats || stats.itemsByCategory.length === 0) && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin datos</p>
          )}
        </div>
      </CardSection>
    </div>
  );
}

function CategoriesSection({ token }: { token: string | null }) {
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<EndowmentCategory[]>([]);
  const [form, setForm] = React.useState<Partial<EndowmentCategory>>({ name: '', description: '' });
  const [editing, setEditing] = React.useState<EndowmentCategory | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await getEndowmentCategories(token);
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!token || !form.name || !form.description) return;
    setLoading(true);
    try {
      if (editing) {
        await updateEndowmentCategory(editing._id, {
          name: form.name,
          description: form.description,
          icon: form.icon ?? undefined,
          color: form.color ?? undefined,
          isActive: editing.isActive,
        }, token);
        addToast({ type: 'success', title: 'Categoría actualizada' });
      } else {
        await createEndowmentCategory({ 
          name: form.name, 
          description: form.description, 
          icon: form.icon ?? undefined, 
          color: form.color ?? undefined 
        }, token);
        addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.categoryCreated });
      }
      setForm({ name: '', description: '' });
      setEditing(null);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: EndowmentCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon ?? undefined,
      color: cat.color ?? undefined,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteEndowmentCategory(id, token);
    addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.categoryDeleted });
    await load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CardSection title={editing ? 'Editar categoría' : 'Nueva categoría'} description={editing ? 'Modifica la categoría seleccionada' : 'Crea una categoría de dotación'}>
        <CategoryForm 
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
          mode={editing ? 'edit' : 'create'}
          onCancel={editing ? cancelEdit : undefined}
        />
      </CardSection>

      <CardSection className="lg:col-span-2" title="Categorías" description="Listado de categorías">
        <CategoryList 
          categories={categories}
          onDelete={handleDelete}
          loading={loading}
          onEdit={startEdit}
        />
      </CardSection>
    </div>
  );
}

function ItemsSection({ token }: { token: string | null }) {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<EndowmentItem[]>([]);
  const [categories, setCategories] = React.useState<EndowmentCategory[]>([]);
  const [form, setForm] = React.useState<Partial<EndowmentItem>>({ name: '', description: '' });

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cats, list] = await Promise.all([
        getEndowmentCategories(token),
        getEndowmentItems(token),
      ]);
      setCategories(cats);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!token || !form.name || !form.description) return;
    const payload = {
      name: form.name as string,
      description: form.description as string,
      categoryId: typeof form.categoryId === 'string' ? form.categoryId : (form.categoryId as any)?._id,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      estimatedValue: form.estimatedValue as any,
      condition: form.condition,
    };
    await createEndowmentItem(payload as any, token);
    addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.itemCreated });
    setForm({ name: '', description: '' });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteEndowmentItem(id, token);
    addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.itemDeleted });
    await load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CardSection title="Nuevo elemento" description="Crea un elemento de dotación">
        <div className="space-y-3">
          <Input label="Nombre" value={form.name as string} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Descripción" value={form.description as string} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <SelectField
            label="Categoría"
            value={(typeof form.categoryId === 'string' ? form.categoryId : (form.categoryId as any)?._id) || ''}
            onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Marca (opcional)" value={form.brand ?? ''} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            <Input placeholder="Modelo (opcional)" value={form.model ?? ''} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
          </div>
          <Input placeholder="Serie (opcional)" value={form.serialNumber ?? ''} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))} />
          <Button onClick={handleCreate} variant="primary"><Plus size={16} />Crear</Button>
        </div>
      </CardSection>

      <CardSection className="lg:col-span-2" title="Elementos" description="Listado de elementos">
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it._id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {renderCategoryIcon((it.categoryId as any)?.icon, (it.categoryId as any)?.color, 18)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{it.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{it.description}</p>
                    {(it.categoryId as any)?.name && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: (it.categoryId as any)?.color || 'var(--ot-blue-500)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {(it.categoryId as any)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => handleDelete(it._id)}><Trash2 size={16} /></Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin elementos</p>
            )}
          </div>
        )}
      </CardSection>
    </div>
  );
}

function TrackingSection({ token }: { token: string | null }) {
  const [loading, setLoading] = React.useState(false);
  const [tracking, setTracking] = React.useState<EndowmentTracking[]>([]);
  const [categories, setCategories] = React.useState<EndowmentCategory[]>([]);
  const [items, setItems] = React.useState<EndowmentItem[]>([]);
  const [form, setForm] = React.useState<{ empleadoId: string; itemId: string; action: string; actionDate: string; observations?: string } | null>({ empleadoId: '', itemId: '', action: 'ENTREGA', actionDate: new Date().toISOString().slice(0, 16) });
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<EndowmentTracking | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cats, listItems, listTracking] = await Promise.all([
        getEndowmentCategories(token),
        getEndowmentItems(token),
        getEndowmentTracking(token),
      ]);
      setCategories(cats);
      setItems(listItems);
      setTracking(listTracking);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!token || !form) return;
    await createEndowmentTracking({
      empleadoId: form.empleadoId,
      itemId: form.itemId,
      action: form.action as any,
      actionDate: new Date(form.actionDate).toISOString(),
      observations: form.observations,
    }, token);
    addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.trackingCreated });
    setForm({ empleadoId: '', itemId: '', action: 'ENTREGA', actionDate: new Date().toISOString().slice(0, 16) });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteEndowmentTracking(id, token);
    addToast({ type: 'success', title: ENDOWMENT_CONSTANTS.messages.trackingDeleted });
    await load();
  };

  const openDetail = (t: EndowmentTracking) => {
    setSelected(t);
    setDetailOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CardSection title="Registrar acción" description="Entrega/Devolución/Mantenimiento/Reemplazo">
        <div className="space-y-3">
          <Input label="Empleado ID" value={form?.empleadoId || ''} onChange={(e) => setForm((f) => ({ ...(f as any), empleadoId: e.target.value }))} />
          <SelectField
            label="Elemento"
            value={form?.itemId || ''}
            onChange={(v) => setForm((f) => ({ ...(f as any), itemId: v }))}
            options={items.map((it) => ({ value: it._id, label: it.name }))}
          />
          <SelectField
            label="Acción"
            value={form?.action || 'ENTREGA'}
            onChange={(v) => setForm((f) => ({ ...(f as any), action: v }))}
            options={[
              { value: 'ENTREGA', label: 'Entrega' },
              { value: 'DEVOLUCION', label: 'Devolución' },
              { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
              { value: 'REPARACION', label: 'Reparación' },
              { value: 'REEMPLAZO', label: 'Reemplazo' },
            ]}
          />
          <Input label="Fecha" type="datetime-local" value={form?.actionDate || ''} onChange={(e) => setForm((f) => ({ ...(f as any), actionDate: e.target.value }))} />
          <Input label="Observaciones" value={form?.observations || ''} onChange={(e) => setForm((f) => ({ ...(f as any), observations: e.target.value }))} />
          <Button onClick={handleCreate} variant="primary"><Plus size={16} />Registrar</Button>
        </div>
      </CardSection>

      <CardSection className="lg:col-span-2" title="Historial" description="Últimas acciones de dotación">
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-2">
            {tracking.map((t) => (
              <div
                key={t._id}
                role="button"
                tabIndex={0}
                onClick={() => openDetail(t)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(t); } }}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
              >
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      {renderCategoryIcon((t.categoryId as any)?.icon, (t.categoryId as any)?.color, 16)}
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{(t.itemId as any)?.name ?? t.itemId}</p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.action} · {new Date(t.actionDate).toLocaleString()}</p>
                    {(t.categoryId as any)?.name && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: (t.categoryId as any)?.color || 'var(--ot-blue-500)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {(t.categoryId as any)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </div>
            ))}
            {tracking.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin registros</p>
            )}
          </div>
        )}
      </CardSection>

      <TrackingDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        token={token}
        tracking={selected}
        onCreated={load}
      />
    </div>
  );
}


