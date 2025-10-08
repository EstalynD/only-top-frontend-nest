"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import { aprobarHorasExtrasLote, getPendientesPorPeriodo } from '@/lib/service-horas-extras/api';
import type { HorasExtrasRegistro } from '@/lib/service-horas-extras/types';
import { formatPeriodo, getNombreEmpleado } from '@/lib/service-horas-extras/helpers';

interface ModalAprobarLoteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  anio: number;
  mes: number;
  quincena?: 1 | 2;
  token: string;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export default function ModalAprobarLote({ isOpen, onClose, onSuccess, anio, mes, quincena, token, addToast }: ModalAprobarLoteProps) {
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState<HorasExtrasRegistro[]>([]);
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});
  const [estado, setEstado] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO');
  const [comentarios, setComentarios] = useState('');

  useEffect(() => {
    if (isOpen) cargarPendientes();
  }, [isOpen, anio, mes, quincena]);

  async function cargarPendientes() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getPendientesPorPeriodo(anio, mes, token, quincena);
      setRegistros(data);
      // preseleccionar todos
      const sel: Record<string, boolean> = {};
      data.forEach(r => sel[r._id] = true);
      setSeleccion(sel);
    } catch (e: any) {
      console.error('Error cargando pendientes:', e);
      addToast(e?.message || 'Error al cargar pendientes', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(id: string) {
    setSeleccion(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const todosSeleccionados = useMemo(() => registros.length > 0 && registros.every(r => seleccion[r._id]), [registros, seleccion]);
  function toggleTodos() {
    const value = !todosSeleccionados;
    const sel: Record<string, boolean> = {};
    registros.forEach(r => sel[r._id] = value);
    setSeleccion(sel);
  }

  const seleccionados = useMemo(() => registros.filter(r => seleccion[r._id]), [registros, seleccion]);
  const totalSeleccionados = seleccionados.length;
  const totalHoras = seleccionados.reduce((acc, r) => acc + (r.totalHoras || 0), 0);
  const totalMonto = seleccionados.reduce((acc, r) => acc + (r._raw?.totalRecargo || 0), 0);

  async function handleConfirm() {
    if (totalSeleccionados === 0) {
      addToast('Seleccione al menos un registro', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await aprobarHorasExtrasLote({
        ids: seleccionados.map(r => r._id),
        estado,
        comentarios: comentarios.trim() || undefined,
      }, token);
      addToast(`${estado === 'APROBADO' ? 'Aprobados' : 'Rechazados'} ${res.updated} registros`, 'success');
      onSuccess();
      handleClose();
    } catch (e: any) {
      console.error('Error aprobar lote:', e);
      addToast(e?.message || 'Error al aprobar en lote', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
    setTimeout(() => {
      setRegistros([]);
      setSeleccion({});
      setComentarios('');
      setEstado('APROBADO');
    }, 300);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={estado === 'APROBADO' ? 'Aprobar todos' : 'Rechazar en lote'}
      icon={estado === 'APROBADO' ? <CheckCircle size={22} style={{ color: 'var(--ot-green-500)' }} /> : <XCircle size={22} style={{ color: 'var(--ot-red-500)' }} />}
      maxWidth="max-w-3xl"
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pendientes en {formatPeriodo(`${anio}-${String(mes).padStart(2,'0')}-Q${quincena || 1}`)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEstado('APROBADO')}
              className="px-3 py-1 rounded text-sm"
              style={{ background: estado === 'APROBADO' ? '#d1fae5' : 'var(--surface-muted)', border: `1px solid ${estado === 'APROBADO' ? '#10b981' : 'var(--border)'}` }}
            >Aprobar</button>
            <button
              onClick={() => setEstado('RECHAZADO')}
              className="px-3 py-1 rounded text-sm"
              style={{ background: estado === 'RECHAZADO' ? '#fee2e2' : 'var(--surface-muted)', border: `1px solid ${estado === 'RECHAZADO' ? '#ef4444' : 'var(--border)'}` }}
            >Rechazar</button>
          </div>
        </div>

        {loading ? (
          <div className="py-6 flex justify-center"><Loader /></div>
        ) : registros.length === 0 ? (
          <div className="p-4 rounded border flex items-start gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <AlertCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay registros pendientes en este periodo.</div>
          </div>
        ) : (
          <div className="border rounded" style={{ borderColor: 'var(--border)' }}>
            <div className="p-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
              <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Seleccionar todos ({registros.length})</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                Seleccionados: {totalSeleccionados} · Horas: {totalHoras.toFixed(2)} · Total: ${totalMonto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="max-h-80 overflow-auto divide-y" style={{ borderColor: 'var(--border)' }}>
              {registros.map(r => (
                <label key={r._id} className="flex items-center gap-3 p-3 cursor-pointer">
                  <input type="checkbox" checked={!!seleccion[r._id]} onChange={() => handleToggle(r._id)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {typeof r.empleadoId === 'string' ? r.empleadoId : getNombreEmpleado(r.empleadoId)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Horas: {r.totalHoras.toFixed(2)} · Total: {r.totalRecargo}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Comentarios (opcional)</label>
          <textarea
            className="w-full px-3 py-2 rounded border resize-none"
            rows={3}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleClose} className="px-4 py-2 rounded" style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}>Cancelar</button>
          <button onClick={handleConfirm} disabled={loading || totalSeleccionados === 0} className="px-4 py-2 rounded text-white" style={{ background: estado === 'APROBADO' ? 'var(--ot-green-500)' : 'var(--ot-red-500)', opacity: (loading || totalSeleccionados === 0) ? 0.6 : 1 }}>
            {estado === 'APROBADO' ? 'Aprobar seleccionados' : 'Rechazar seleccionados'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
