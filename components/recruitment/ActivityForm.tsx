"use client";
import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Plus, Trash2, Calendar, MessageSquare, ThumbsUp, MessageCircle, Phone, Video, Users, TrendingUp, HelpCircle, Instagram } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getSalesClosers } from '@/lib/service-recruitment/api';
import { getModelos } from '@/lib/service-clientes/api';
import type { 
  CreateRecruitmentActivityDto, 
  ContactoObtenido, 
  ModeloCerrada, 
  SalesCloser 
} from '@/lib/service-recruitment/types';
import { EstadoModeloCerrada } from '@/lib/service-recruitment/types';
import { LABELS, PLACEHOLDERS, TOOLTIPS, VALIDATION_LIMITS } from '@/lib/service-recruitment/constants';
import type { Modelo } from '@/lib/service-clientes/types';

type ModeloOption = {
  id: string;
  nombre: string;
  instagram?: string | null;
};

interface ActivityFormProps {
  initialData?: Partial<CreateRecruitmentActivityDto>;
  onSubmit: (data: CreateRecruitmentActivityDto) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function ActivityForm({ initialData, onSubmit, submitLabel = 'Registrar Actividad', loading = false }: ActivityFormProps) {
  const { token } = useAuth();
  const [salesClosers, setSalesClosers] = useState<SalesCloser[]>([]);
  const [loadingSalesClosers, setLoadingSalesClosers] = useState(true);
  const [modelosRegistradas, setModelosRegistradas] = useState<ModeloOption[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(true);

  // Form state
  const [fechaActividad, setFechaActividad] = useState(
    initialData?.fechaActividad || new Date().toISOString().split('T')[0]
  );
  const [salesCloserId, setSalesCloserId] = useState(initialData?.salesCloserId || '');
  const [cuentasTexteadas, setCuentasTexteadas] = useState(initialData?.cuentasTexteadas || 0);
  const [likesRealizados, setLikesRealizados] = useState(initialData?.likesRealizados || 0);
  const [comentariosRealizados, setComentariosRealizados] = useState(initialData?.comentariosRealizados || 0);
  const [reunionesAgendadas, setReunionesAgendadas] = useState(initialData?.reunionesAgendadas || 0);
  const [reunionesRealizadas, setReunionesRealizadas] = useState(initialData?.reunionesRealizadas || 0);
  const [notasDia, setNotasDia] = useState(initialData?.notasDia || '');

  // Contactos obtenidos
  const [contactos, setContactos] = useState<ContactoObtenido[]>(initialData?.contactosObtenidos || []);
  const [showContactoForm, setShowContactoForm] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState<Partial<ContactoObtenido>>({
    numero: '',
    perfilInstagram: '',
    nombreProspecto: '',
  });

  // Modelos cerradas
  const [modelos, setModelos] = useState<ModeloCerrada[]>(initialData?.modelosCerradas || []);
  const [showModeloForm, setShowModeloForm] = useState(false);
  const [nuevoModelo, setNuevoModelo] = useState<Partial<ModeloCerrada>>({
    nombreModelo: '',
    perfilInstagram: '',
    facturacionUltimosTresMeses: [0, 0, 0],
    fechaCierre: new Date().toISOString().split('T')[0],
    estado: EstadoModeloCerrada.EN_ESPERA,
    notas: '',
    modeloId: null,
  });

  useEffect(() => {
    if (!token) return;
    loadSalesClosers();
    loadModelosRegistradas();
  }, [token]);

  const loadSalesClosers = async () => {
    if (!token) return;
    try {
      setLoadingSalesClosers(true);
      const data = await getSalesClosers(token);
      setSalesClosers(data);
    } catch (error) {
      console.error('Error loading sales closers:', error);
    } finally {
      setLoadingSalesClosers(false);
    }
  };

  const extractInstagramHandle = (modelo: Modelo): string | null => {
    const instagram = modelo.redesSociales?.find((red) => red.plataforma?.toLowerCase() === 'instagram');
    if (!instagram) return null;
    return instagram.username || instagram.link || null;
  };

  const loadModelosRegistradas = async () => {
    if (!token) return;
    try {
      setLoadingModelos(true);
      const data = await getModelos(token, { includeInactive: false });
      const opciones = data.map((modelo) => ({
        id: modelo._id,
        nombre: modelo.nombreCompleto,
        instagram: extractInstagramHandle(modelo),
      }));
      setModelosRegistradas(opciones);
    } catch (error) {
      console.error('Error loading registered models:', error);
      setModelosRegistradas([]);
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleAddContacto = () => {
    if (!nuevoContacto.numero) return;
    
    setContactos([...contactos, {
      numero: nuevoContacto.numero,
      perfilInstagram: nuevoContacto.perfilInstagram || null,
      nombreProspecto: nuevoContacto.nombreProspecto || null,
      fechaObtencion: new Date().toISOString(),
    }]);

    setNuevoContacto({ numero: '', perfilInstagram: '', nombreProspecto: '' });
    setShowContactoForm(false);
  };

  const handleRemoveContacto = (index: number) => {
    setContactos(contactos.filter((_, i) => i !== index));
  };

  const calcularPromedioFacturacion = (facturacion: [number, number, number]) => {
    return (facturacion[0] + facturacion[1] + facturacion[2]) / 3;
  };

  const handleAddModelo = () => {
    if (!nuevoModelo.nombreModelo || !nuevoModelo.perfilInstagram) return;
    
    const modelo: ModeloCerrada = {
      nombreModelo: nuevoModelo.nombreModelo,
      perfilInstagram: nuevoModelo.perfilInstagram,
      facturacionUltimosTresMeses: nuevoModelo.facturacionUltimosTresMeses as [number, number, number],
      promedioFacturacion: calcularPromedioFacturacion(nuevoModelo.facturacionUltimosTresMeses as [number, number, number]),
      fechaCierre: nuevoModelo.fechaCierre!,
      estado: nuevoModelo.estado || EstadoModeloCerrada.EN_ESPERA,
      notas: nuevoModelo.notas || null,
      modeloId: nuevoModelo.modeloId || null,
    };

    setModelos([...modelos, modelo]);
    setNuevoModelo({
      nombreModelo: '',
      perfilInstagram: '',
      facturacionUltimosTresMeses: [0, 0, 0],
      fechaCierre: new Date().toISOString().split('T')[0],
      estado: EstadoModeloCerrada.EN_ESPERA,
      notas: '',
      modeloId: null,
    });
    setShowModeloForm(false);
  };

  const handleRemoveModelo = (index: number) => {
    setModelos(modelos.filter((_, i) => i !== index));
  };

  const handleSelectModeloRegistrada = (modeloId: string) => {
    if (!modeloId) {
      setNuevoModelo((prev) => ({
        ...prev,
        modeloId: null,
      }));
      return;
    }

    const modelo = modelosRegistradas.find((item) => item.id === modeloId);
    if (!modelo) return;

    setNuevoModelo((prev) => ({
      ...prev,
      modeloId,
      nombreModelo: modelo.nombre,
      perfilInstagram: modelo.instagram ?? (prev.perfilInstagram ?? ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateRecruitmentActivityDto = {
      fechaActividad,
      salesCloserId: salesCloserId || undefined,
      cuentasTexteadas,
      likesRealizados,
      comentariosRealizados,
      contactosObtenidos: contactos,
      reunionesAgendadas,
      reunionesRealizadas,
      modelosCerradas: modelos,
      notasDia: notasDia || undefined,
    };

    await onSubmit(data);
  };

  const sectionStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)'
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)'
  };

  const mutedSurfaceStyle: CSSProperties = {
    background: 'var(--surface-muted)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)'
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)'
  };

  const tileSurfaceStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Básica */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-blue-600)' }}>
          <Calendar size={20} />
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {LABELS.FECHA_ACTIVIDAD} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaActividad}
              onChange={(e) => setFechaActividad(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={inputStyle}
            />
          </div>

          {/* Sales Closer */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {LABELS.SALES_CLOSER}
            </label>
            <select
              value={salesCloserId}
              onChange={(e) => setSalesCloserId(e.target.value)}
              disabled={loadingSalesClosers}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={inputStyle}
            >
              <option value="">Auto-detectar (usuario actual)</option>
              {salesClosers.map((sc) => (
                <option key={sc._id} value={sc._id}>
                  {sc.nombre} {sc.apellido}
                </option>
              ))}
            </select>
            <p className="text-xs mt-1" style={mutedTextStyle}>
              Si no seleccionas, se usará tu usuario actual
            </p>
          </div>
        </div>
      </section>

      {/* Métricas de Instagram */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-pink-600)' }}>
          <Instagram size={20} />
          {LABELS.METRICAS_IG}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cuentas Texteadas */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <MessageSquare size={16} />
              {LABELS.CUENTAS_TEXTEADAS}
              <button
                type="button"
                title={TOOLTIPS.CUENTAS_TEXTEADAS}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle size={14} />
              </button>
            </label>
            <input
              type="number"
              min="0"
              value={cuentasTexteadas}
              onChange={(e) => setCuentasTexteadas(Number(e.target.value))}
              placeholder={PLACEHOLDERS.CUENTAS_TEXTEADAS}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={inputStyle}
            />
          </div>

          {/* Likes */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <ThumbsUp size={16} />
              {LABELS.LIKES_REALIZADOS}
              <button
                type="button"
                title={TOOLTIPS.LIKES_REALIZADOS}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle size={14} />
              </button>
            </label>
            <input
              type="number"
              min="0"
              value={likesRealizados}
              onChange={(e) => setLikesRealizados(Number(e.target.value))}
              placeholder={PLACEHOLDERS.LIKES}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={inputStyle}
            />
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <MessageCircle size={16} />
              {LABELS.COMENTARIOS_REALIZADOS}
              <button
                type="button"
                title={TOOLTIPS.COMENTARIOS_REALIZADOS}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle size={14} />
              </button>
            </label>
            <input
              type="number"
              min="0"
              value={comentariosRealizados}
              onChange={(e) => setComentariosRealizados(Number(e.target.value))}
              placeholder={PLACEHOLDERS.COMENTARIOS}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Contactos Obtenidos */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ot-green-600)' }}>
            <Phone size={20} />
            {LABELS.CONTACTOS_OBTENIDOS}
            <span className="text-sm font-normal" style={mutedTextStyle}>({contactos.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowContactoForm(!showContactoForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'var(--ot-green-500)',
              color: 'white',
            }}
          >
            <Plus size={16} />
            Agregar Contacto
          </button>
        </div>

        {/* Formulario nuevo contacto */}
        {showContactoForm && (
          <div className="mb-4 p-4 rounded-lg border" style={mutedSurfaceStyle}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="tel"
                placeholder={PLACEHOLDERS.CONTACTOS}
                value={nuevoContacto.numero ?? ''}
                onChange={(e) => setNuevoContacto({ ...nuevoContacto, numero: e.target.value })}
                className="px-3 py-2 rounded-lg border transition-colors"
                style={inputStyle}
              />
              <input
                type="text"
                placeholder={PLACEHOLDERS.PERFIL_IG}
                value={nuevoContacto.perfilInstagram ?? ''}
                onChange={(e) => setNuevoContacto({ ...nuevoContacto, perfilInstagram: e.target.value })}
                className="px-3 py-2 rounded-lg border transition-colors"
                style={inputStyle}
              />
              <input
                type="text"
                placeholder={PLACEHOLDERS.NOMBRE_PROSPECTO}
                value={nuevoContacto.nombreProspecto ?? ''}
                onChange={(e) => setNuevoContacto({ ...nuevoContacto, nombreProspecto: e.target.value })}
                className="px-3 py-2 rounded-lg border transition-colors"
                style={inputStyle}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddContacto}
                disabled={!nuevoContacto.numero}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-green-500 text-white disabled:opacity-50"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => setShowContactoForm(false)}
                className="px-4 py-2 rounded-lg font-medium text-sm"
                style={mutedSurfaceStyle}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de contactos */}
        {contactos.length > 0 ? (
          <div className="space-y-2">
            {contactos.map((contacto, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={mutedSurfaceStyle}
              >
                <div className="flex-1">
                  <p className="font-medium">{contacto.numero}</p>
                  {(contacto.nombreProspecto || contacto.perfilInstagram) && (
                    <p className="text-sm" style={mutedTextStyle}>
                      {contacto.nombreProspecto}
                      {contacto.nombreProspecto && contacto.perfilInstagram && ' • '}
                      {contacto.perfilInstagram}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContacto(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4" style={mutedTextStyle}>No hay contactos registrados</p>
        )}
      </section>

      {/* Reuniones */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-purple-600)' }}>
          <Video size={20} />
          {LABELS.REUNIONES}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agendadas */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar size={16} />
              {LABELS.REUNIONES_AGENDADAS}
              <button
                type="button"
                title={TOOLTIPS.REUNIONES_AGENDADAS}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle size={14} />
              </button>
            </label>
            <input
              type="number"
              min="0"
              value={reunionesAgendadas}
              onChange={(e) => setReunionesAgendadas(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={inputStyle}
            />
          </div>

          {/* Realizadas */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Video size={16} />
              {LABELS.REUNIONES_REALIZADAS}
              <button
                type="button"
                title={TOOLTIPS.REUNIONES_REALIZADAS}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle size={14} />
              </button>
            </label>
            <input
              type="number"
              min="0"
              max={reunionesAgendadas}
              value={reunionesRealizadas}
              onChange={(e) => setReunionesRealizadas(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={inputStyle}
            />
            {reunionesRealizadas > reunionesAgendadas && (
              <p className="text-xs text-red-500 mt-1">
                No puedes tener más realizadas que agendadas
              </p>
            )}
          </div>
        </div>

        {/* Tasa de efectividad */}
        {reunionesAgendadas > 0 && (
          <div className="mt-4 rounded-lg border p-3" style={mutedSurfaceStyle}>
            <p className="text-sm">
              <span className="font-medium">Tasa de Efectividad:</span>{' '}
              <span className="font-bold" style={{ color: 'var(--ot-purple-400, var(--ot-purple-500))' }}>
                {((reunionesRealizadas / reunionesAgendadas) * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        )}
      </section>

      {/* Modelos Cerradas */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ot-orange-600)' }}>
            <Users size={20} />
            {LABELS.MODELOS_CERRADAS}
            <span className="text-sm font-normal" style={mutedTextStyle}>({modelos.length})</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)' }}>
              {loadingModelos ? 'Cargando modelos...' : `Registradas: ${modelosRegistradas.length}`}
            </span>
          </h3>
          <button
            type="button"
            onClick={() => setShowModeloForm(!showModeloForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'var(--ot-orange-500)',
              color: 'white',
            }}
          >
            <Plus size={16} />
            Agregar Modelo
          </button>
        </div>

        {/* Formulario nuevo modelo */}
        {showModeloForm && (
          <div className="mb-4 p-4 rounded-lg border space-y-3" style={mutedSurfaceStyle}>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo registrada (opcional)</label>
              <select
                value={nuevoModelo.modeloId ?? ''}
                onChange={(e) => handleSelectModeloRegistrada(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={inputStyle}
                disabled={loadingModelos || modelosRegistradas.length === 0}
              >
                <option value="">{loadingModelos ? 'Cargando modelos...' : 'Sin relación (ingreso manual)'}</option>
                {modelosRegistradas.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}{modelo.instagram ? ` • ${modelo.instagram}` : ''}
                  </option>
                ))}
              </select>
              {!loadingModelos && modelosRegistradas.length > 0 && (
                <p className="text-xs mt-1" style={mutedTextStyle}>
                  Seleccionar una modelo registrada rellenará los campos, pero puedes modificarlos libremente.
                </p>
              )}
              {!loadingModelos && modelosRegistradas.length === 0 && (
                <p className="text-xs mt-1" style={mutedTextStyle}>
                  No se encontraron modelos registradas.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={PLACEHOLDERS.MODELO_NOMBRE}
                value={nuevoModelo.nombreModelo ?? ''}
                onChange={(e) => setNuevoModelo({ ...nuevoModelo, nombreModelo: e.target.value })}
                className="px-3 py-2 rounded-lg border transition-colors"
                style={inputStyle}
              />
              <input
                type="text"
                placeholder={PLACEHOLDERS.MODELO_PERFIL}
                value={nuevoModelo.perfilInstagram ?? ''}
                onChange={(e) => setNuevoModelo({ ...nuevoModelo, perfilInstagram: e.target.value })}
                className="px-3 py-2 rounded-lg border transition-colors"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{LABELS.FACTURACION_ULTIMOS_3_MESES}</label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <label className="block text-xs mb-1" style={mutedTextStyle}>{LABELS.FACTURACION_MES(index + 1)}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="USD"
                      value={nuevoModelo.facturacionUltimosTresMeses?.[index] || 0}
                      onChange={(e) => {
                        const newFacturacion = [...(nuevoModelo.facturacionUltimosTresMeses || [0, 0, 0])];
                        newFacturacion[index] = Number(e.target.value);
                        setNuevoModelo({ ...nuevoModelo, facturacionUltimosTresMeses: newFacturacion as [number, number, number] });
                      }}
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              {nuevoModelo.facturacionUltimosTresMeses && (
                <p className="text-sm mt-2" style={mutedTextStyle}>
                  {LABELS.PROMEDIO_FACTURACION}: <span className="font-bold text-orange-600">
                    ${calcularPromedioFacturacion(nuevoModelo.facturacionUltimosTresMeses as [number, number, number]).toFixed(2)}
                  </span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{LABELS.FECHA_CIERRE}</label>
                <input
                  type="date"
                  value={nuevoModelo.fechaCierre ?? ''}
                  onChange={(e) => setNuevoModelo({ ...nuevoModelo, fechaCierre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{LABELS.NOTAS}</label>
                <input
                  type="text"
                  placeholder="Observaciones..."
                  value={nuevoModelo.notas ?? ''}
                  onChange={(e) => setNuevoModelo({ ...nuevoModelo, notas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddModelo}
                disabled={!nuevoModelo.nombreModelo || !nuevoModelo.perfilInstagram}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-orange-500 text-white disabled:opacity-50"
              >
                Agregar Modelo
              </button>
              <button
                type="button"
                onClick={() => setShowModeloForm(false)}
                className="px-4 py-2 rounded-lg font-medium text-sm"
                style={tileSurfaceStyle}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de modelos */}
        {modelos.length > 0 ? (
          <div className="space-y-3">
            {modelos.map((modelo, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg border border-orange-200 dark:border-orange-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{modelo.nombreModelo}</h4>
                    <p className="text-sm" style={mutedTextStyle}>
                      <Instagram size={14} className="inline mr-1" />
                      {modelo.perfilInstagram}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {modelo.modeloId && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        Vinculada
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveModelo(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="text-center p-2 rounded-lg border" style={tileSurfaceStyle}>
                    <p className="text-xs" style={mutedTextStyle}>Mes 1</p>
                    <p className="font-bold text-orange-600">${modelo.facturacionUltimosTresMeses[0]}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg border" style={tileSurfaceStyle}>
                    <p className="text-xs" style={mutedTextStyle}>Mes 2</p>
                    <p className="font-bold text-orange-600">${modelo.facturacionUltimosTresMeses[1]}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg border" style={tileSurfaceStyle}>
                    <p className="text-xs" style={mutedTextStyle}>Mes 3</p>
                    <p className="font-bold text-orange-600">${modelo.facturacionUltimosTresMeses[2]}</p>
                  </div>
                  <div className="text-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-xs" style={mutedTextStyle}>Promedio</p>
                    <p className="font-bold text-orange-600 flex items-center justify-center gap-1">
                      <TrendingUp size={14} />
                      ${modelo.promedioFacturacion.toFixed(2)}
                    </p>
                  </div>
                </div>

                {modelo.notas && (
                  <p className="text-sm mt-2 italic" style={mutedTextStyle}>
                    "{modelo.notas}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4" style={mutedTextStyle}>
            No hay modelos cerradas registradas todavía. Puedes agregarlas manualmente o vincular una existente desde el listado.
          </p>
        )}
      </section>

      {/* Notas del Día */}
      <section className="rounded-xl shadow-sm border p-6" style={sectionStyle}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ot-gray-600)' }}>
          <MessageSquare size={20} />
          {LABELS.NOTAS_DIA}
        </h3>

        <textarea
          value={notasDia}
          onChange={(e) => setNotasDia(e.target.value)}
          placeholder={PLACEHOLDERS.NOTAS}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          style={inputStyle}
        />
      </section>

      {/* Botón de Submit */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="submit"
          disabled={loading || reunionesRealizadas > reunionesAgendadas}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))',
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Plus size={20} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

