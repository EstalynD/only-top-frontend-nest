"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/selectUI';
import Loader from '@/components/ui/Loader';
import { addToast } from '@/components/ui/Toast';
import { Package, ClipboardList, User as UserIcon, Building2 } from 'lucide-react';
import type { EndowmentTracking, EndowmentAction } from '@/lib/service-rrhh/types';
import { createEndowmentTracking, getEmpleadoEndowmentHistorial } from '@/lib/service-rrhh';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  tracking: EndowmentTracking | null;
  onCreated?: () => Promise<void> | void; // callback para refrescar lista principal
};

export default function TrackingDetailModal({ isOpen, onClose, token, tracking, onCreated }: Props) {
  const empleado = tracking?.empleadoId as any;
  const item = tracking?.itemId as any;
  const category = tracking?.categoryId as any;

  const empleadoId = (typeof tracking?.empleadoId === 'string') ? tracking?.empleadoId : empleado?._id;
  const itemId = (typeof tracking?.itemId === 'string') ? tracking?.itemId : item?._id;

  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<EndowmentTracking[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<{ action: EndowmentAction; actionDate: string; observations?: string }>(() => ({
    action: 'DEVOLUCION',
    actionDate: new Date().toISOString().slice(0, 16),
    observations: ''
  }));

  const loadHistory = React.useCallback(async () => {
    if (!isOpen || !token || !empleadoId) return;
    setLoading(true);
    try {
      const list = await getEmpleadoEndowmentHistorial(empleadoId, token);
      setHistory(list);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error al cargar historial', description: e?.message ?? 'Intenta nuevamente' });
    } finally {
      setLoading(false);
    }
  }, [isOpen, token, empleadoId]);

  React.useEffect(() => {
    // Reset y cargar al abrir
    if (isOpen) {
      setForm({ action: 'DEVOLUCION', actionDate: new Date().toISOString().slice(0, 16), observations: '' });
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [isOpen, loadHistory]);

  const handleCreate = async () => {
    if (!token || !empleadoId || !itemId) return;
    setSubmitting(true);
    try {
      await createEndowmentTracking({
        empleadoId,
        itemId,
        action: form.action,
        actionDate: new Date(form.actionDate).toISOString(),
        observations: form.observations?.trim() ? form.observations.trim() : undefined,
      }, token);
      addToast({ type: 'success', title: 'Acción registrada' });
      await loadHistory();
      if (onCreated) await onCreated();
    } catch (e: any) {
      addToast({ type: 'error', title: 'No se pudo registrar', description: e?.message ?? 'Intenta nuevamente' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de seguimiento"
      icon={<ClipboardList size={20} />}
      maxWidth="4xl"
    >
      {!tracking ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin información</p>
      ) : (
        <div className="space-y-6">
          {/* Resumen principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <UserIcon size={16} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Empleado</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {empleado ? `${empleado.nombre} ${empleado.apellido}` : empleadoId}
              </p>
              {empleado?.areaId && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <Building2 size={12} className="inline mr-1" />Área: {(empleado.areaId as any)?.name ?? ''}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Elemento</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {item?.name ?? itemId}
              </p>
              {category && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Categoría: {category?.name}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Fecha de {tracking.action.toLowerCase()}</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {new Date(tracking.actionDate).toLocaleString()}
              </p>
              {tracking.observations && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Observaciones: {tracking.observations}</p>
              )}
            </div>
          </div>

          {/* Formulario rápida acción */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Registrar nueva acción
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectField
                label="Acción"
                value={form.action}
                onChange={(v) => setForm((f) => ({ ...f, action: v as EndowmentAction }))}
                options={[
                  { value: 'ENTREGA', label: 'Entrega' },
                  { value: 'DEVOLUCION', label: 'Devolución' },
                  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
                  { value: 'REPARACION', label: 'Reparación' },
                  { value: 'REEMPLAZO', label: 'Reemplazo' },
                ]}
              />
              <Input
                label="Fecha"
                type="datetime-local"
                value={form.actionDate}
                onChange={(e) => setForm((f) => ({ ...f, actionDate: e.target.value }))}
              />
              <Input
                label="Observaciones"
                value={form.observations ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
              />
            </div>
            <div className="mt-3">
              <Button onClick={handleCreate} variant="primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Registrar'}
              </Button>
            </div>
          </div>

          {/* Historial del empleado */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Historial del empleado
            </p>
            {loading ? (
              <Loader />
            ) : history.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin registros</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {history.map((h) => (
                  <div key={h._id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {(h.itemId as any)?.name ?? h.itemId} · {h.action}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(h.actionDate).toLocaleString()} {h.observations ? `· ${h.observations}` : ''}
                      </p>
                    </div>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{h.referenceNumber ?? ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
