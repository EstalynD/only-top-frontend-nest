"use client";
import React from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Select, SelectOption } from '@/components/ui/selectUI';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/lib/auth';
import { createCampaign, updateCampaign, getTraffickers } from '@/lib/service-traffic/api';
import { getCurrencies } from '@/lib/service-sistema/api';
import type { CurrencyFormatSpec } from '@/lib/service-sistema/types';
import type { TrafficCampaign, CreateCampaignDto, Trafficker } from '@/lib/service-traffic/types';
import { 
  PlataformaCampana, 
  EstadoCampana, 
  AcortadorURL,
  PLATAFORMA_LABELS,
  ESTADO_LABELS,
  ACORTADOR_LABELS 
} from '@/lib/service-traffic/types';
import { COMMON_COUNTRIES, AGE_RANGES, COMMON_INTERESTS, CAMPAIGN_LIMITS } from '@/lib/service-traffic/constants';

type CampaignFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign?: TrafficCampaign;
  modelos?: Array<{ _id: string; nombre: string; apellido: string }>;
  traffickers?: Trafficker[];
};

export function CampaignFormModal({ isOpen, onClose, onSuccess, campaign, modelos = [], traffickers = [] }: CampaignFormModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currencies, setCurrencies] = React.useState<CurrencyFormatSpec[]>([]);

  // Form state
  const [modeloId, setModeloId] = React.useState('');
  const [traffickerId, setTraffickerId] = React.useState('');
  const [plataforma, setPlataforma] = React.useState<PlataformaCampana>(PlataformaCampana.INSTAGRAM);
  const [descripcionSegmentacion, setDescripcionSegmentacion] = React.useState('');
  const [paises, setPaises] = React.useState<string[]>([]);
  const [regiones, setRegiones] = React.useState<string[]>([]);
  const [edadMin, setEdadMin] = React.useState('18');
  const [edadMax, setEdadMax] = React.useState('34');
  const [intereses, setIntereses] = React.useState<string[]>([]);
  const [fechaActivacion, setFechaActivacion] = React.useState('');
  const [fechaPublicacion, setFechaPublicacion] = React.useState('');
  const [fechaFinalizacion, setFechaFinalizacion] = React.useState('');
  const [presupuestoAsignado, setPresupuestoAsignado] = React.useState('0');
  const [presupuestoGastado, setPresupuestoGastado] = React.useState('0');
  const [moneda, setMoneda] = React.useState('USD');
  const [estado, setEstado] = React.useState<EstadoCampana>(EstadoCampana.ACTIVA);
  const [copyUtilizado, setCopyUtilizado] = React.useState('');
  const [linkPauta, setLinkPauta] = React.useState('');
  const [trackLinkOF, setTrackLinkOF] = React.useState('');
  const [acortadorUtilizado, setAcortadorUtilizado] = React.useState<AcortadorURL | undefined>();
  const [rendimiento, setRendimiento] = React.useState('');
  const [notas, setNotas] = React.useState('');

  // Temporary input states
  const [nuevoPais, setNuevoPais] = React.useState('');
  const [nuevaRegion, setNuevaRegion] = React.useState('');
  const [nuevoInteres, setNuevoInteres] = React.useState('');

  // Cargar monedas del sistema
  React.useEffect(() => {
    if (!token) return;
    const loadCurrencies = async () => {
      try {
        const data = await getCurrencies(token);
        setCurrencies(data);
      } catch (err) {
        console.error('Error loading currencies:', err);
        // Fallback a USD si falla
        setCurrencies([{
          code: 'USD',
          symbol: '$',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          displayFormat: 'SYMBOL_ONLY',
          isActive: true,
          sample: '$1,234.56'
        }]);
      }
    };
    loadCurrencies();
  }, [token]);

  // Populate form when editing
  React.useEffect(() => {
    if (campaign) {
      setModeloId(campaign.modeloId._id);
      setTraffickerId(typeof campaign.traffickerId === 'string' ? campaign.traffickerId : campaign.traffickerId._id);
      setPlataforma(campaign.plataforma);
      setDescripcionSegmentacion(campaign.segmentaciones?.descripcion || '');
      setPaises(campaign.segmentaciones?.paises || []);
      setRegiones(campaign.segmentaciones?.regiones || []);
      setEdadMin(campaign.segmentaciones?.edadObjetivo?.min?.toString() || '18');
      setEdadMax(campaign.segmentaciones?.edadObjetivo?.max?.toString() || '34');
      setIntereses(campaign.segmentaciones?.intereses || []);
      setFechaActivacion(campaign.fechaActivacion.split('T')[0]);
      setFechaPublicacion(campaign.fechaPublicacion ? campaign.fechaPublicacion.split('T')[0] : '');
      setFechaFinalizacion(campaign.fechaFinalizacion ? campaign.fechaFinalizacion.split('T')[0] : '');
      setPresupuestoAsignado(campaign.presupuesto.asignado.toString());
      setPresupuestoGastado(campaign.presupuesto.gastado.toString());
      setMoneda(campaign.presupuesto.moneda);
      setEstado(campaign.estado);
      setCopyUtilizado(campaign.copyUtilizado || '');
      setLinkPauta(campaign.linkPauta || '');
      setTrackLinkOF(campaign.trackLinkOF || '');
      setAcortadorUtilizado(campaign.acortadorUtilizado);
      setRendimiento(campaign.rendimiento || '');
      setNotas(campaign.notas || '');
    } else if (currencies.length > 0 && !campaign) {
      // Establecer primera moneda disponible al crear nueva campaña
      setMoneda(currencies[0].code);
    }
  }, [campaign, currencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !modeloId) return;

    setLoading(true);
    setError(null);

    const data: CreateCampaignDto = {
      modeloId,
      traffickerId: traffickerId || undefined,
      plataforma,
      descripcionSegmentacion: descripcionSegmentacion || undefined,
      segmentaciones: {
        paises: paises.length > 0 ? paises : undefined,
        regiones: regiones.length > 0 ? regiones : undefined,
        edadMin,
        edadMax,
        intereses: intereses.length > 0 ? intereses : undefined,
      },
      fechaActivacion,
      fechaPublicacion: fechaPublicacion || undefined,
      fechaFinalizacion: fechaFinalizacion || undefined,
      presupuestoAsignado: parseFloat(presupuestoAsignado),
      presupuestoGastado: parseFloat(presupuestoGastado),
      moneda,
      estado,
      copyUtilizado: copyUtilizado || undefined,
      linkPauta: linkPauta || undefined,
      trackLinkOF: trackLinkOF || undefined,
      acortadorUtilizado,
      rendimiento: rendimiento || undefined,
      notas: notas || undefined,
    };

    try {
      if (campaign) {
        await updateCampaign(token, campaign._id, data);
      } else {
        await createCampaign(token, data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const addPais = () => {
    if (nuevoPais && !paises.includes(nuevoPais) && paises.length < CAMPAIGN_LIMITS.maxCountries) {
      setPaises([...paises, nuevoPais]);
      setNuevoPais('');
    }
  };

  const removePais = (pais: string) => {
    setPaises(paises.filter(p => p !== pais));
  };

  const addRegion = () => {
    if (nuevaRegion && !regiones.includes(nuevaRegion)) {
      setRegiones([...regiones, nuevaRegion]);
      setNuevaRegion('');
    }
  };

  const removeRegion = (region: string) => {
    setRegiones(regiones.filter(r => r !== region));
  };

  const addInteres = () => {
    if (nuevoInteres && !intereses.includes(nuevoInteres) && intereses.length < CAMPAIGN_LIMITS.maxInterests) {
      setIntereses([...intereses, nuevoInteres]);
      setNuevoInteres('');
    }
  };

  const removeInteres = (interes: string) => {
    setIntereses(intereses.filter(i => i !== interes));
  };

  const plataformaOptions: SelectOption[] = Object.values(PlataformaCampana).map(p => ({
    value: p,
    label: PLATAFORMA_LABELS[p],
  }));

  const estadoOptions: SelectOption[] = Object.values(EstadoCampana).map(e => ({
    value: e,
    label: ESTADO_LABELS[e],
  }));

  const acortadorOptions: SelectOption[] = [
    { value: '', label: 'Sin acortador' },
    ...Object.values(AcortadorURL).map(a => ({
      value: a,
      label: ACORTADOR_LABELS[a],
    })),
  ];

  const modeloOptions: SelectOption[] = modelos.map(m => ({
    value: m._id,
    label: `${m.nombre} ${m.apellido}`,
  }));

  const traffickerOptions: SelectOption[] = traffickers.map(t => ({
    value: t._id,
    label: t.nombreCompleto,
  }));

  const monedaOptions: SelectOption[] = currencies.map(c => ({
    value: c.code,
    label: `${c.code} (${c.symbol})`,
  }));

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
  };

  const tagStyle: React.CSSProperties = {
    background: 'var(--ot-blue-500)',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Editar Campaña' : 'Nueva Campaña'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div
            className="p-4 rounded-lg flex items-center gap-3"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--danger)',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Modelo <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Select
                value={modeloId}
                onChange={setModeloId}
                options={modeloOptions}
                placeholder="Seleccionar modelo"
                disabled={!!campaign}
                fullWidth
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Trafficker <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Select
                value={traffickerId}
                onChange={setTraffickerId}
                options={traffickerOptions}
                placeholder="Seleccionar trafficker"
                fullWidth
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Plataforma <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Select
                value={plataforma}
                onChange={(v) => setPlataforma(v as PlataformaCampana)}
                options={plataformaOptions}
                fullWidth
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Estado <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Select
                value={estado}
                onChange={(v) => setEstado(v as EstadoCampana)}
                options={estadoOptions}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Fechas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Activación <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                value={fechaActivacion}
                onChange={(e) => setFechaActivacion(e.target.value)}
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Publicación
              </label>
              <input
                type="date"
                value={fechaPublicacion}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Finalización
              </label>
              <input
                type="date"
                value={fechaFinalizacion}
                onChange={(e) => setFechaFinalizacion(e.target.value)}
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Presupuesto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Asignado <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                value={presupuestoAsignado}
                onChange={(e) => setPresupuestoAsignado(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Gastado <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                value={presupuestoGastado}
                onChange={(e) => setPresupuestoGastado(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Moneda <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Select
                value={moneda}
                onChange={setMoneda}
                options={monedaOptions}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Segmentación */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Segmentación
          </h3>

          {/* Descripción */}
          <div>
            <label style={labelStyle} className="block mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              value={descripcionSegmentacion}
              onChange={(e) => setDescripcionSegmentacion(e.target.value)}
              placeholder="Ej: Público femenino joven interesado en fitness"
              className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
              style={inputStyle}
            />
          </div>

          {/* Países */}
          <div>
            <label style={labelStyle} className="block mb-1.5">
              Países
            </label>
            <div className="flex gap-2 mb-2">
              <Select
                value={nuevoPais}
                onChange={setNuevoPais}
                options={[
                  { value: '', label: 'Seleccionar país' },
                  ...COMMON_COUNTRIES.map(c => ({ value: c, label: c })),
                ]}
                placeholder="Agregar país"
                fullWidth
              />
              <button
                type="button"
                onClick={addPais}
                disabled={!nuevoPais || paises.length >= CAMPAIGN_LIMITS.maxCountries}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: '#ffffff',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {paises.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {paises.map((pais) => (
                  <div key={pais} style={tagStyle} className="flex items-center gap-2">
                    {pais}
                    <button
                      type="button"
                      onClick={() => removePais(pais)}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regiones */}
          <div>
            <label style={labelStyle} className="block mb-1.5">
              Regiones
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nuevaRegion}
                onChange={(e) => setNuevaRegion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRegion())}
                placeholder="Ej: California, New York"
                className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addRegion}
                disabled={!nuevaRegion}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: '#ffffff',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {regiones.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {regiones.map((region) => (
                  <div key={region} style={tagStyle} className="flex items-center gap-2">
                    {region}
                    <button
                      type="button"
                      onClick={() => removeRegion(region)}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Edad mínima
              </label>
              <input
                type="number"
                value={edadMin}
                onChange={(e) => setEdadMin(e.target.value)}
                min={CAMPAIGN_LIMITS.minAge}
                max={CAMPAIGN_LIMITS.maxAge}
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Edad máxima
              </label>
              <input
                type="number"
                value={edadMax}
                onChange={(e) => setEdadMax(e.target.value)}
                min={CAMPAIGN_LIMITS.minAge}
                max={CAMPAIGN_LIMITS.maxAge}
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Intereses */}
          <div>
            <label style={labelStyle} className="block mb-1.5">
              Intereses
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nuevoInteres}
                onChange={(e) => setNuevoInteres(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInteres())}
                placeholder="Ej: fitness, wellness, lifestyle"
                className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addInteres}
                disabled={!nuevoInteres || intereses.length >= CAMPAIGN_LIMITS.maxInterests}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--ot-blue-500)',
                  color: '#ffffff',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_INTERESTS.slice(0, 7).map((interes) => (
                <button
                  key={interes}
                  type="button"
                  onClick={() => {
                    if (!intereses.includes(interes) && intereses.length < CAMPAIGN_LIMITS.maxInterests) {
                      setIntereses([...intereses, interes]);
                    }
                  }}
                  disabled={intereses.includes(interes) || intereses.length >= CAMPAIGN_LIMITS.maxInterests}
                  className="text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                  style={{
                    background: 'var(--surface-muted)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {interes}
                </button>
              ))}
            </div>
            {intereses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {intereses.map((interes) => (
                  <div key={interes} style={tagStyle} className="flex items-center gap-2">
                    {interes}
                    <button
                      type="button"
                      onClick={() => removeInteres(interes)}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Links y contenido */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Links y Contenido
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle} className="block mb-1.5">
                Link de Pauta
              </label>
              <input
                type="url"
                value={linkPauta}
                onChange={(e) => setLinkPauta(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} className="block mb-1.5">
                Track Link OF
              </label>
              <input
                type="url"
                value={trackLinkOF}
                onChange={(e) => setTrackLinkOF(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)]"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle} className="block mb-1.5">
              Acortador Utilizado
            </label>
            <Select
              value={acortadorUtilizado || ''}
              onChange={(v) => setAcortadorUtilizado(v ? v as AcortadorURL : undefined)}
              options={acortadorOptions}
              fullWidth
            />
          </div>

          <div>
            <label style={labelStyle} className="block mb-1.5">
              Copy Utilizado
            </label>
            <textarea
              value={copyUtilizado}
              onChange={(e) => setCopyUtilizado(e.target.value)}
              placeholder="Texto de la campaña..."
              maxLength={CAMPAIGN_LIMITS.maxCopyLength}
              rows={3}
              className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] resize-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {copyUtilizado.length}/{CAMPAIGN_LIMITS.maxCopyLength} caracteres
            </p>
          </div>
        </div>

        {/* Rendimiento y notas */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Seguimiento
          </h3>

          <div>
            <label style={labelStyle} className="block mb-1.5">
              Rendimiento
            </label>
            <textarea
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
              placeholder="Métricas y rendimiento de la campaña..."
              rows={3}
              className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] resize-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle} className="block mb-1.5">
              Notas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales..."
              maxLength={CAMPAIGN_LIMITS.maxNotesLength}
              rows={3}
              className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ot-blue-500)] resize-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {notas.length}/{CAMPAIGN_LIMITS.maxNotesLength} caracteres
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !modeloId || !fechaActivacion}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: 'var(--ot-blue-500)',
              color: '#ffffff',
            }}
          >
            {loading ? <Loader size="sm" /> : campaign ? 'Actualizar' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
