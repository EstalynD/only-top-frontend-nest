/**
 * ConfiguracionCarteraForm
 * Formulario para editar la configuración del módulo de Cartera
 */
'use client';

import * as React from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CARTERA_MESSAGES } from '@/lib/service-cartera/constants';
import { getConfiguracion, updateConfiguracion } from '@/lib/service-cartera/api';
import type { ConfiguracionCartera, UpdateConfiguracionDto } from '@/lib/service-cartera/types';

type Props = {
  token: string;
};

export function ConfiguracionCarteraForm({ token }: Props) {
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<ConfiguracionCartera | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await getConfiguracion(token);
      setConfig(data);
    } catch (e: any) {
      setError(e?.message || CARTERA_MESSAGES.error.errorCargarConfiguracion);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const dto: UpdateConfiguracionDto = {
        diasVencimientoFactura: Number(config.diasVencimientoFactura) || 15,
        diasAntesAlerta1: Number(config.diasAntesAlerta1) || 5,
        diasAntesAlerta2: Number(config.diasAntesAlerta2) || 2,
        diasDespuesAlertaMora: Number(config.diasDespuesAlertaMora) || 3,
        diasDespuesAlertaMora2: Number(config.diasDespuesAlertaMora2) || 7,
        emailCC: config.emailCC || [],
        emailFrom: config.emailFrom || undefined,
        generacionAutomaticaActiva: !!config.generacionAutomaticaActiva,
        diaGeneracionFacturas: Number(config.diaGeneracionFacturas) || 1,
        recordatoriosAutomaticosActivos: !!config.recordatoriosAutomaticosActivos,
        horaEjecucionRecordatorios: config.horaEjecucionRecordatorios || '08:00',
        activo: !!config.activo,
      };
      const updated = await updateConfiguracion(token, dto);
      setConfig(updated);
      setSuccess(CARTERA_MESSAGES.success.configuracionActualizada);
    } catch (e: any) {
      setError(e?.message || CARTERA_MESSAGES.error.errorActualizarConfiguracion);
    } finally {
      setSaving(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  if (loading) {
    return (
      <div className="text-center py-12" style={cardStyle}>
        <RefreshCw className="mx-auto mb-3 animate-spin" />
        <p style={{ color: 'var(--text-muted)' }}>Cargando configuración…</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12" style={cardStyle}>
        <Settings className="mx-auto mb-3 opacity-30" />
        <p style={{ color: 'var(--text-muted)' }}>No se pudo cargar la configuración.</p>
        <button
          onClick={cargar}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded border" style={{ borderColor: 'rgba(239,68,68,0.5)', color: 'var(--text-primary)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded border" style={{ borderColor: 'rgba(34,197,94,0.5)', color: 'var(--text-primary)' }}>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={cardStyle} className="p-4 space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Facturación</h3>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Días de vencimiento</label>
            <input
              type="number"
              min={1}
              max={90}
              className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={config.diasVencimientoFactura}
              onChange={(e) => setConfig({ ...config, diasVencimientoFactura: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Alerta 1 (días antes)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={config.diasAntesAlerta1}
                onChange={(e) => setConfig({ ...config, diasAntesAlerta1: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Alerta 2 (días antes)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={config.diasAntesAlerta2}
                onChange={(e) => setConfig({ ...config, diasAntesAlerta2: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Mora (días después)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={config.diasDespuesAlertaMora}
                onChange={(e) => setConfig({ ...config, diasDespuesAlertaMora: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>2da Mora (días después)</label>
              <input
                type="number"
                min={1}
                max={90}
                className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={config.diasDespuesAlertaMora2}
                onChange={(e) => setConfig({ ...config, diasDespuesAlertaMora2: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div style={cardStyle} className="p-4 space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Automatizaciones</h3>
          <div className="flex items-center gap-3">
            <input
              id="genAuto"
              type="checkbox"
              checked={!!config.generacionAutomaticaActiva}
              onChange={(e) => setConfig({ ...config, generacionAutomaticaActiva: e.target.checked })}
            />
            <label htmlFor="genAuto" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Generación automática de facturas
            </label>
          </div>

          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Día de generación</label>
            <input
              type="number"
              min={1}
              max={28}
              className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={config.diaGeneracionFacturas}
              onChange={(e) => setConfig({ ...config, diaGeneracionFacturas: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="recAuto"
              type="checkbox"
              checked={!!config.recordatoriosAutomaticosActivos}
              onChange={(e) => setConfig({ ...config, recordatoriosAutomaticosActivos: e.target.checked })}
            />
            <label htmlFor="recAuto" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Recordatorios automáticos
            </label>
          </div>

          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Hora de ejecución (HH:mm)</label>
            <input
              type="text"
              placeholder="08:00"
              className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={config.horaEjecucionRecordatorios || ''}
              onChange={(e) => setConfig({ ...config, horaEjecucionRecordatorios: e.target.value })}
            />
          </div>
        </div>

        <div style={cardStyle} className="p-4 space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Emails</h3>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Remitente (From)</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={config.emailFrom || ''}
              onChange={(e) => setConfig({ ...config, emailFrom: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Emails CC (separados por coma)</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={(config.emailCC || []).join(', ')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  emailCC: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>

        <div style={cardStyle} className="p-4 space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Estado</h3>
          <div className="flex items-center gap-3">
            <input
              id="activo"
              type="checkbox"
              checked={!!config.activo}
              onChange={(e) => setConfig({ ...config, activo: e.target.checked })}
            />
            <label htmlFor="activo" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Módulo activo
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            border: 'none',
            opacity: saving ? 0.8 : 1,
          }}
        >
          <Save size={16} /> Guardar cambios
        </button>

        <button
          type="button"
          onClick={cargar}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <RefreshCw size={16} /> Recargar
        </button>
      </div>
    </form>
  );
}

export default ConfiguracionCarteraForm;
