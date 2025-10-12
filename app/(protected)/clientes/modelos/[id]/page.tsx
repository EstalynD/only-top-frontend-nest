"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { getModelo, deleteModelo } from '@/lib/service-clientes/api';
import type { Modelo, EmpleadoBasico } from '@/lib/service-clientes/types';
import { 
  TIPOS_DOCUMENTO, 
  PLATAFORMAS_CONTENIDO, 
  TIPOS_TRAFICO, 
  ESTADOS_MODELO,
  MESES 
} from '@/lib/service-clientes/constants';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Globe,
  DollarSign,
  Users,
  TrendingUp,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/clientes/ConfirmDeleteModal';
import { Button } from '@/components/ui/Button';

export default function ModeloDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, ready } = useAuth();
  const [modelo, setModelo] = React.useState<Modelo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const modeloId = params?.id as string;

  React.useEffect(() => {
    if (!ready || !token || !modeloId) return;

    const loadModelo = async () => {
      setLoading(true);
      try {
        const data = await getModelo(token, modeloId);
        setModelo(data);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error al cargar modelo',
          description: error?.message || 'No se pudo cargar la información de la modelo',
        });
        router.push('/clientes/modelos');
      } finally {
        setLoading(false);
      }
    };

    loadModelo();
  }, [token, ready, modeloId, router]);

  const handleDelete = async () => {
    if (!token || !modelo) return;

    setDeleting(true);
    try {
      await deleteModelo(token, modelo._id);
      addToast({
        type: 'success',
        title: 'Modelo eliminada',
        description: `${modelo.nombreCompleto} ha sido marcada como terminada`,
      });
      router.push('/clientes/modelos');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar la modelo',
      });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getEmpleadoName = (emp: string | EmpleadoBasico): string => {
    if (typeof emp === 'string') return 'No asignado';
    return `${emp.nombre} ${emp.apellido}`;
  };

  const getEmpleadoInfo = (emp: string | EmpleadoBasico): { name: string; email: string; phone: string } => {
    if (typeof emp === 'string') return { name: 'No asignado', email: '', phone: '' };
    return { name: `${emp.nombre} ${emp.apellido}`, email: emp.correoElectronico, phone: emp.telefono || '' };
  };

  const tipoDocLabel = TIPOS_DOCUMENTO.find(t => t.value === modelo?.tipoDocumento)?.label || modelo?.tipoDocumento;
  const estadoInfo = ESTADOS_MODELO.find(e => e.value === modelo?.estado);

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: 'var(--ot-blue-500)', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando modelo...</p>
        </div>
      </div>
    );
  }

  if (!modelo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={20} />}
            ariaLabel="Volver atrás"
          />
          <div className="flex items-center gap-4">
            {modelo.fotoPerfil ? (
              <img 
                src={modelo.fotoPerfil} 
                alt={modelo.nombreCompleto} 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--ot-blue-100)' }}>
                <span className="text-2xl font-medium" style={{ color: 'var(--ot-blue-700)' }}>
                  {modelo.nombreCompleto.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {modelo.nombreCompleto}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {modelo.numeroIdentificacion} • {tipoDocLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: `${estadoInfo?.color}20`,
              color: estadoInfo?.color,
            }}
          >
            {estadoInfo?.label || modelo.estado}
          </span>
          <Button
            onClick={() => router.push(`/clientes/modelos/${modelo._id}/editar`)}
            variant="neutral"
            size="md"
            icon={<Edit size={18} />}
          >
            Editar
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            size="md"
            icon={<Trash2 size={18} />}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <User size={20} />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Correo Electrónico</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{modelo.correoElectronico}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Teléfono</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{modelo.telefono}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fecha de Nacimiento</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                    {new Date(modelo.fechaNacimiento).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} style={{ color: 'var(--ot-blue-600)', marginTop: 2 }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ubicación</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                    {modelo.ciudadResidencia}, {modelo.paisResidencia}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plataformas de Contenido */}
          {modelo.plataformas && modelo.plataformas.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Globe size={20} />
                Plataformas de Contenido
              </h3>
              <div className="space-y-3">
                {modelo.plataformas.map((plat, idx) => {
                  const platInfo = PLATAFORMAS_CONTENIDO.find(p => p.value === plat.plataforma);
                  return (
                    <div key={idx} className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {platInfo?.label || plat.plataforma}
                      </p>
                      {plat.links.map((link, linkIdx) => (
                        <a 
                          key={linkIdx}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm mb-1 hover:underline"
                          style={{ color: 'var(--ot-blue-600)' }}
                        >
                          <LinkIcon size={14} />
                          {link}
                        </a>
                      ))}
                      {plat.notas && (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{plat.notas}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Redes Sociales */}
          {modelo.redesSociales && modelo.redesSociales.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Globe size={20} />
                Redes Sociales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modelo.redesSociales.map((red, idx) => (
                  <div key={idx} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--background)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{red.plataforma}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{red.username || 'N/A'}</p>
                    </div>
                    <a 
                      href={red.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-all duration-200"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <LinkIcon size={16} style={{ color: 'var(--ot-blue-600)' }} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facturación */}
          {modelo.facturacionHistorica && modelo.facturacionHistorica.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <DollarSign size={20} />
                Facturación Histórica
              </h3>
              <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--ot-blue-700)' }}>Promedio Mensual</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ot-blue-700)' }}>
                  ${modelo.promedioFacturacionMensual.toFixed(2)} USD
                </p>
              </div>
              <div className="space-y-2">
                {modelo.facturacionHistorica.map((fact, idx) => {
                  const mes = MESES.find(m => m.value === fact.mes);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {mes?.label || `Mes ${fact.mes}`} {fact.anio}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        ${fact.monto.toFixed(2)} {fact.moneda}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fuentes de Tráfico */}
          {modelo.fuentesTrafico && modelo.fuentesTrafico.length > 0 && (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp size={20} />
                Fuentes de Tráfico
              </h3>
              <div className="space-y-3">
                {modelo.fuentesTrafico.map((fuente, idx) => {
                  const tipoInfo = TIPOS_TRAFICO.find(t => t.value === fuente.tipo);
                  return (
                    <div key={idx} className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {tipoInfo?.label || fuente.tipo}
                        </span>
                        <span 
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: fuente.activo ? '#d1fae5' : '#f3f4f6',
                            color: fuente.activo ? '#10b981' : '#6b7280',
                          }}
                        >
                          {fuente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      {tipoInfo?.isPaid && (
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {fuente.inversionUSD !== undefined && (
                            <span>Inversión: ${fuente.inversionUSD} USD</span>
                          )}
                          {fuente.porcentaje !== undefined && (
                            <span>Porcentaje: {fuente.porcentaje}%</span>
                          )}
                        </div>
                      )}
                      {fuente.notas && (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{fuente.notas}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Equipo Asignado */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users size={20} />
              Equipo Asignado
            </h3>
            
            <div className="space-y-4">
              {/* Sales Closer */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Sales Closer</p>
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getEmpleadoName(modelo.salesCloserAsignado)}
                  </p>
                  {typeof modelo.salesCloserAsignado === 'object' && (
                    <>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {modelo.salesCloserAsignado.correoElectronico}
                      </p>
                      {modelo.salesCloserAsignado.telefono && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {modelo.salesCloserAsignado.telefono}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Trafficker */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Trafficker</p>
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getEmpleadoName(modelo.traffickerAsignado)}
                  </p>
                  {typeof modelo.traffickerAsignado === 'object' && (
                    <>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {modelo.traffickerAsignado.correoElectronico}
                      </p>
                      {modelo.traffickerAsignado.telefono && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {modelo.traffickerAsignado.telefono}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Equipo de Chatters */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Equipo de Chatters</p>
                <div className="space-y-2">
                  {typeof modelo.equipoChatters === 'object' && 'turnoAM' in modelo.equipoChatters && (
                    <>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Turno AM</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {getEmpleadoName(modelo.equipoChatters.turnoAM)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Turno PM</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {getEmpleadoName(modelo.equipoChatters.turnoPM)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Turno Madrugada</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {getEmpleadoName(modelo.equipoChatters.turnoMadrugada)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Supernumerario</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {getEmpleadoName(modelo.equipoChatters.supernumerario)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={20} />
              Información Adicional
            </h3>
            
            <div className="space-y-3">
              {modelo.linkFormularioRegistro && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Formulario de Registro</p>
                  <a 
                    href={modelo.linkFormularioRegistro} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:underline flex items-center gap-1"
                    style={{ color: 'var(--ot-blue-600)' }}
                  >
                    <LinkIcon size={14} />
                    Ver formulario
                  </a>
                </div>
              )}
              
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Fecha de Registro</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {new Date(modelo.fechaRegistro).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {modelo.fechaInicio && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Fecha de Inicio</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {new Date(modelo.fechaInicio).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {modelo.notasInternas && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notas Internas</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{modelo.notasInternas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        modeloName={modelo.nombreCompleto}
        loading={deleting}
      />
    </div>
  );
}

