"use client";

import { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Check,
  X,
  Clock,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { GastosFijos } from '@/lib/service-finanzas';
import { Button } from '@/components/ui/Button';
import { Select, SelectField } from '@/components/ui/selectUI';
import {
  type ResumenQuincenalDto,
  type ResumenMensualConsolidadoDto,
  type GastoFijoFormateadoDto,
  type QuincenaEnum,
  CategoriaGasto,
  type EstadoGasto,
} from '@/lib/service-finanzas/service-gastos-fijos';
import {
  getQuincenaLabel,
  getCategoriaLabel,
  getCategoriaColor,
  getCategoriaIcon,
  getEstadoGastoLabel,
  getEstadoGastoColor,
  formatPeriodo,
  getPeriodoActual,
  getQuincenaActual,
  getIndicadorColors,
  formatFecha,
} from '@/lib/service-finanzas/service-gastos-fijos';
import {
  OPCIONES_MESES,
  OPCIONES_QUINCENA,
  OPCIONES_CATEGORIA,
  GASTOS_FIJOS_MESSAGES,
} from '@/lib/service-finanzas/service-gastos-fijos';
import GastoFijoForm from '@/components/finanzas/GastoFijoForm';
import GenerarNominaModal from '@/components/finanzas/GenerarNominaModal';
import CambiarEstadoGastoModal from '@/components/finanzas/CambiarEstadoGastoModal';
import EliminarNominaModal from '@/components/finanzas/EliminarNominaModal';
import ConsolidarGastosFijosModal from '@/components/finanzas/ConsolidarGastosFijosModal';

export default function GastosFijosPage() {
  const { token } = useAuth();
  
  // Estado de periodo
  const { mes: mesActual, anio: anioActual } = getPeriodoActual();
  const [mes, setMes] = useState(mesActual);
  const [anio, setAnio] = useState(anioActual);
  const [quincena, setQuincena] = useState<QuincenaEnum>(getQuincenaActual());
  
  // Estado de datos
  const [resumenQuincenal, setResumenQuincenal] = useState<ResumenQuincenalDto | null>(null);
  const [resumenMensual, setResumenMensual] = useState<ResumenMensualConsolidadoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de UI
  const [vistaActual, setVistaActual] = useState<'quincenal' | 'mensual'>('quincenal');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaGasto | 'TODAS'>('TODAS');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoGasto | 'TODOS'>('TODOS');
  
  // Modales
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [showGenerarNomina, setShowGenerarNomina] = useState(false);
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);
  const [showEliminarNomina, setShowEliminarNomina] = useState(false);
  const [showConsolidar, setShowConsolidar] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoFijoFormateadoDto | null>(null);

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token, mes, anio, quincena, vistaActual]);

  const cargarDatos = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (vistaActual === 'quincenal') {
        const response = await GastosFijos.obtenerResumenQuincenal(token, mes, anio, quincena);
        // Algunas implementaciones de requestJSON retornan el objeto ya "desenvuelto" (data directa)
        const resumen = (response as any)?.data ?? (response as any);
        console.log('🔍 Respuesta completa del backend:', response);
        console.log('📊 Resumen normalizado:', resumen);
        console.log('📝 Gastos en resumen:', resumen?.gastos);
        console.log('💰 Totales en resumen:', resumen?.totales);
        setResumenQuincenal(resumen ?? null);
        console.log('✅ Estado actualizado, resumenQuincenal ahora es:', resumen);
      } else {
        const response = await GastosFijos.obtenerResumenMensual(token, mes, anio);
        const resumen = (response as any)?.data ?? (response as any);
        setResumenMensual(resumen ?? null);
      }
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || GASTOS_FIJOS_MESSAGES.errorCargarResumen);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoGasto = () => {
    setGastoSeleccionado(null);
    setShowGastoForm(true);
  };

  const handleEditarGasto = (gasto: GastoFijoFormateadoDto) => {
    setGastoSeleccionado(gasto);
    setShowGastoForm(true);
  };

  const handleGenerarNomina = () => {
    setShowGenerarNomina(true);
  };

  const handleCambiarEstado = (gasto: GastoFijoFormateadoDto) => {
    setGastoSeleccionado(gasto);
    setShowCambiarEstado(true);
  };

  const handleEliminarNomina = () => {
    setShowEliminarNomina(true);
  };

  const handleEliminarGasto = async (gastoId: string) => {
    if (!token) return;
    
    if (!confirm('¿Está seguro de eliminar este gasto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await GastosFijos.eliminarGasto(token, gastoId);
      cargarDatos();
    } catch (err: any) {
      console.error('Error al eliminar gasto:', err);
      alert(err.message || 'Error al eliminar el gasto');
    }
  };

  const handleConsolidar = () => {
    setShowConsolidar(true);
  };

  const gastosFiltrados = resumenQuincenal?.gastos?.filter(gasto => {
    if (categoriaFiltro !== 'TODAS' && gasto.categoria !== categoriaFiltro) return false;
    if (estadoFiltro !== 'TODOS' && gasto.estado !== estadoFiltro) return false;
    return true;
  }) || [];
  

  // Estilos
  const pageStyle: CSSProperties = {
    background: 'var(--background)',
    minHeight: '100vh',
    color: 'var(--text-primary)',
  };

  const headerStyle: CSSProperties = {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
  };

  const cardStyle: CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const buttonPrimaryStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  if (loading) {
    return (
      <div style={pageStyle} className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p style={mutedTextStyle}>Cargando gastos fijos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="p-6">
      {/* Header */}
      <div style={headerStyle} className="sticky top-0 z-10 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              💰 Gastos Fijos Quincenales
            </h1>
            <p style={mutedTextStyle} className="text-sm mt-1">
              Gestión de gastos discriminados por quincenas con utilidad neta
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleConsolidar}
              variant="primary"
              size="sm"
              icon={<Lock size={18} />}
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}
            >
              Consolidar
            </Button>
            
            <Button
              onClick={handleGenerarNomina}
              variant="success"
              size="sm"
              icon={<Users size={18} />}
            >
              Generar Nómina
            </Button>
            
            <Button
              onClick={handleEliminarNomina}
              variant="danger"
              size="sm"
              icon={<X size={18} />}
            >
              Eliminar Nómina
            </Button>
            
            <Button
              onClick={handleNuevoGasto}
              variant="primary"
              size="sm"
              icon={<Plus size={18} />}
              style={buttonPrimaryStyle}
            >
              Nuevo Gasto
            </Button>
          </div>
        </div>
        
        {/* Filtros de periodo */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} style={mutedTextStyle} />
            <Select
              value={mes.toString()}
              onChange={(value) => setMes(Number(value))}
              options={OPCIONES_MESES.map(opcion => ({
                value: opcion.value.toString(),
                label: opcion.label
              }))}
              placeholder="Seleccionar mes"
              size="sm"
              className="w-40"
            />
          </div>
          
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            min="2020"
            max="2030"
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
            style={inputStyle}
          />
          
          {/* Tabs Vista */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setVistaActual('quincenal')}
              variant={vistaActual === 'quincenal' ? 'primary' : 'neutral'}
              size="sm"
            >
              Vista Quincenal
            </Button>
            <Button
              onClick={() => setVistaActual('mensual')}
              variant={vistaActual === 'mensual' ? 'primary' : 'neutral'}
              size="sm"
            >
              Resumen Mensual
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {vistaActual === 'quincenal' ? (
        <>
          {console.log('🎯 Antes de pasar a VistaQuincenal - resumenQuincenal:', resumenQuincenal)}
          {console.log('🎯 Antes de pasar a VistaQuincenal - gastosFiltrados.length:', gastosFiltrados?.length)}
          <VistaQuincenal
            resumen={resumenQuincenal}
            quincena={quincena}
            onQuincenaChange={setQuincena}
            gastosFiltrados={gastosFiltrados}
            categoriaFiltro={categoriaFiltro}
            estadoFiltro={estadoFiltro}
            onCategoriaChange={setCategoriaFiltro}
            onEstadoChange={setEstadoFiltro}
            onEditarGasto={handleEditarGasto}
            onCambiarEstado={handleCambiarEstado}
            onEliminarGasto={handleEliminarGasto}
          />
        </>
      ) : (
        <VistaMensual resumen={resumenMensual} />
      )}
      
      {/* Modales */}
      {showGastoForm && (
        <GastoFijoForm
          initialData={gastoSeleccionado ?? undefined}
          mesInicial={mes}
          anioInicial={anio}
          quincenaInicial={quincena}
          onClose={() => {
            setShowGastoForm(false);
            setGastoSeleccionado(null);
          }}
          onSuccess={() => {
            cargarDatos();
          }}
        />
      )}
      
      {showGenerarNomina && (
        <GenerarNominaModal
          mes={mes}
          anio={anio}
          quincena={quincena}
          onClose={() => setShowGenerarNomina(false)}
          onSuccess={(resultado) => {
            console.log('Nómina generada:', resultado);
            cargarDatos();
          }}
        />
      )}
      
      {showCambiarEstado && gastoSeleccionado && (
        <CambiarEstadoGastoModal
          gasto={gastoSeleccionado}
          onClose={() => {
            setShowCambiarEstado(false);
            setGastoSeleccionado(null);
          }}
          onSuccess={() => {
            cargarDatos();
          }}
        />
      )}
      
      {showEliminarNomina && (
        <EliminarNominaModal
          mes={mes}
          anio={anio}
          quincena={quincena}
          onClose={() => setShowEliminarNomina(false)}
          onSuccess={() => {
            cargarDatos();
          }}
        />
      )}
      
      {showCambiarEstado && gastoSeleccionado && (
        <CambiarEstadoGastoModal
          gasto={gastoSeleccionado}
          onClose={() => {
            setShowCambiarEstado(false);
            setGastoSeleccionado(null);
          }}
          onSuccess={() => {
            cargarDatos();
          }}
        />
      )}
      
      {showEliminarNomina && (
        <EliminarNominaModal
          mes={mes}
          anio={anio}
          quincena={quincena}
          onClose={() => setShowEliminarNomina(false)}
          onSuccess={() => {
            cargarDatos();
          }}
        />
      )}

      {showConsolidar && resumenQuincenal && (
        <ConsolidarGastosFijosModal
          mes={mes}
          anio={anio}
          totalGastos={resumenQuincenal.totales?.cantidadGastos || 0}
          gastosPendientes={resumenQuincenal.porEstado?.pendientes || 0}
          gastosAprobados={resumenQuincenal.porEstado?.aprobados || 0}
          gastosPagados={resumenQuincenal.porEstado?.pagados || 0}
          montoTotal={resumenQuincenal.totales?.totalGastosFormateado || '$0.00'}
          onClose={() => setShowConsolidar(false)}
          onSuccess={() => {
            setShowConsolidar(false);
            cargarDatos();
          }}
        />
      )}
    </div>
  );
}

// ========== COMPONENTE: Vista Quincenal ==========
function VistaQuincenal({
  resumen,
  quincena,
  onQuincenaChange,
  gastosFiltrados,
  categoriaFiltro,
  estadoFiltro,
  onCategoriaChange,
  onEstadoChange,
  onEditarGasto,
  onCambiarEstado,
  onEliminarGasto,
}: {
  resumen: ResumenQuincenalDto | null;
  quincena: QuincenaEnum;
  onQuincenaChange: (q: QuincenaEnum) => void;
  gastosFiltrados: GastoFijoFormateadoDto[];
  categoriaFiltro: CategoriaGasto | 'TODAS';
  estadoFiltro: EstadoGasto | 'TODOS';
  onCategoriaChange: (c: CategoriaGasto | 'TODAS') => void;
  onEstadoChange: (e: EstadoGasto | 'TODOS') => void;
  onEditarGasto: (gasto: GastoFijoFormateadoDto) => void;
  onCambiarEstado: (gasto: GastoFijoFormateadoDto) => void;
  onEliminarGasto: (gastoId: string) => void;
}) {
  const cardStyle: CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  // Validación mejorada: verificar que resumen existe y tiene la estructura esperada
  console.log('🔎 VistaQuincenal - resumen recibido:', resumen);
  console.log('🔎 VistaQuincenal - tiene totales?:', resumen?.totales);
  console.log('🔎 VistaQuincenal - tiene gastos?:', resumen?.gastos);
  console.log('🔎 VistaQuincenal - cantidad de gastos:', resumen?.gastos?.length);

  if (!resumen || !resumen.totales) {
    console.log('❌ VistaQuincenal - No hay datos: resumen =', resumen);
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No hay datos disponibles para esta quincena</p>
      </div>
    );
  }

  console.log('✅ VistaQuincenal - Renderizando con datos válidos');

  return (
    <div className="space-y-6">
      {/* Selector de Quincena */}
      <div className="flex items-center justify-center gap-4">
        {OPCIONES_QUINCENA.map(opcion => (
          <Button
            key={opcion.value}
            onClick={() => onQuincenaChange(opcion.value)}
            variant={quincena === opcion.value ? 'primary' : 'neutral'}
            size="md"
          >
            {opcion.label}
          </Button>
        ))}
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div style={cardStyle} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">Total Gastos</span>
            <DollarSign size={18} style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold">{resumen.totales.totalGastosFormateado}</p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">Cantidad</span>
            <FileText size={18} style={{ color: '#3b82f6' }} />
          </div>
          <p className="text-2xl font-bold">{resumen.totales.cantidadGastos}</p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">Aprobados</span>
            <Check size={18} style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold">{resumen.porEstado.aprobados}</p>
        </div>

        <div style={cardStyle} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">Pendientes</span>
            <Clock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <p className="text-2xl font-bold">{resumen.porEstado.pendientes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={cardStyle} className="p-4">
        <div className="flex items-center gap-4">
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          
          <Select
            value={categoriaFiltro}
            onChange={(value) => onCategoriaChange(value as CategoriaGasto | 'TODAS')}
            options={[
              { value: 'TODAS', label: 'Todas las categorías' },
              ...OPCIONES_CATEGORIA.map(cat => ({
                value: cat.value,
                label: `${cat.icon} ${cat.label}`
              }))
            ]}
            placeholder="Seleccionar categoría"
            size="sm"
            className="w-48"
          />

          <Select
            value={estadoFiltro}
            onChange={(value) => onEstadoChange(value as EstadoGasto | 'TODOS')}
            options={[
              { value: 'TODOS', label: 'Todos los estados' },
              { value: 'PENDIENTE', label: 'Pendiente' },
              { value: 'APROBADO', label: 'Aprobado' },
              { value: 'PAGADO', label: 'Pagado' }
            ]}
            placeholder="Seleccionar estado"
            size="sm"
            className="w-40"
          />

          <span style={{ color: 'var(--text-muted)' }} className="ml-auto text-sm">
            {gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'gasto' : 'gastos'}
          </span>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div style={cardStyle} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Concepto</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Empleado</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Monto</th>
                <th className="px-4 py-3 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Estado</th>
                <th className="px-4 py-3 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((gasto, index) => (
                <tr
                  key={gasto.id || `gasto-${index}-${gasto.fechaPago}`}
                  className="hover:bg-opacity-50 cursor-pointer transition-colors"
                  style={{
                    borderBottom: index < gastosFiltrados.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  onDoubleClick={() => onEditarGasto(gasto)}
                >
                  <td className="px-4 py-3 text-sm">{formatFecha(gasto.fechaPago)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span style={{ color: getCategoriaColor(gasto.categoria) }}>
                        {getCategoriaIcon(gasto.categoria)}
                      </span>
                      <span className="text-sm">{getCategoriaLabel(gasto.categoria)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{gasto.concepto}</td>
                  <td className="px-4 py-3 text-sm">{gasto.empleadoNombre || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{gasto.montoFormateado}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${getEstadoGastoColor(gasto.estado)}20`,
                        color: getEstadoGastoColor(gasto.estado),
                      }}
                    >
                      {getEstadoGastoLabel(gasto.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Botón Cambiar Estado (siempre visible) */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCambiarEstado(gasto);
                        }}
                        variant="neutral"
                        size="sm"
                        icon={<Check size={14} />}
                        style={{
                          background: '#3b82f620',
                          color: '#3b82f6',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem'
                        }}
                        ariaLabel="Cambiar Estado"
                      >
                        Estado
                      </Button>
                      
                      {/* Botón Editar (solo si NO es NOMINA) */}
                      {gasto.categoria !== CategoriaGasto.NOMINA && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditarGasto(gasto);
                          }}
                          variant="ghost"
                          size="sm"
                          icon={<ChevronRight size={18} />}
                          style={{ color: '#8b5cf6' }}
                          ariaLabel="Editar Gasto"
                        />
                      )}
                      
                      {/* Botón Eliminar (siempre visible) */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminarGasto(gasto.id);
                        }}
                        variant="ghost"
                        size="sm"
                        icon={<X size={18} />}
                        style={{ color: '#ef4444' }}
                        ariaLabel="Eliminar Gasto"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {gastosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>No hay gastos que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== COMPONENTE: Vista Mensual ==========
function VistaMensual({ resumen }: { resumen: ResumenMensualConsolidadoDto | null }) {
  const cardStyle: CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
  };

  if (!resumen) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No hay datos disponibles</p>
      </div>
    );
  }

  const utilidadColors = getIndicadorColors(resumen.utilidadNeta?.color || 'gris');

  return (
    <div className="space-y-6">
      {/* Card Utilidad Neta (destacado) */}
      <div style={cardStyle} className="p-6">
        <div className="text-center">
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-2">Utilidad Neta del Mes</p>
          <div
            className="inline-block px-8 py-4 rounded-lg"
            style={{
              background: utilidadColors?.bg || '#f3f4f6',
              border: `2px solid ${utilidadColors?.border || '#d1d5db'}`,
            }}
          >
            <p className="text-4xl font-bold" style={{ color: utilidadColors?.text || '#6b7280' }}>
              {resumen.utilidadNeta?.totalFormateado || '$ 0.00'}
            </p>
            <p className="text-sm mt-2" style={{ color: utilidadColors?.text || '#6b7280' }}>
              {resumen.utilidadNeta?.esPositiva ? '✓ Positiva' : '✗ Negativa'}
            </p>
          </div>
        </div>

        {/* Comparativa */}
        {resumen.comparativa && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mb-1">{resumen.comparativa.mesAnterior || 'Mes anterior'}</p>
                <p className="text-lg font-semibold">{resumen.comparativa.utilidadMesAnteriorFormateado || '$ 0.00'}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {resumen.comparativa.direccion === 'crecimiento' ? (
                  <TrendingUp size={24} style={{ color: '#10b981' }} />
                ) : resumen.comparativa.direccion === 'decrecimiento' ? (
                  <TrendingDown size={24} style={{ color: '#ef4444' }} />
                ) : (
                  <div style={{ color: '#6b7280' }}>●</div>
                )}
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: resumen.comparativa.direccion === 'crecimiento' ? '#10b981' : 
                           resumen.comparativa.direccion === 'decrecimiento' ? '#ef4444' : '#6b7280'
                  }}
                >
                  {resumen.comparativa.porcentajeCrecimiento > 0 ? '+' : ''}
                  {resumen.comparativa.porcentajeCrecimiento?.toFixed(2) || '0.00'}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Totales por quincena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={cardStyle} className="p-6">
          <h3 className="text-lg font-semibold mb-4">Primera Quincena (Q1)</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Total:</span>
              <span className="font-semibold">{resumen.primeraQuincena?.totalFormateado || '$ 0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Gastos:</span>
              <span className="font-semibold">{resumen.primeraQuincena?.cantidadGastos || 0}</span>
            </div>
          </div>
        </div>

        <div style={cardStyle} className="p-6">
          <h3 className="text-lg font-semibold mb-4">Segunda Quincena (Q2)</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Total:</span>
              <span className="font-semibold">{resumen.segundaQuincena?.totalFormateado || '$ 0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Gastos:</span>
              <span className="font-semibold">{resumen.segundaQuincena?.cantidadGastos || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por categoría */}
      <div style={cardStyle} className="p-6">
        <h3 className="text-lg font-semibold mb-4">Desglose por Categoría</h3>
        {resumen.desgloseCategoria && resumen.desgloseCategoria.length > 0 ? (
          <div className="space-y-3">
            {resumen.desgloseCategoria.map(cat => (
              <div key={cat.categoria} className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span style={{ color: getCategoriaColor(cat.categoria), fontSize: '20px' }}>
                    {getCategoriaIcon(cat.categoria)}
                  </span>
                  <span>{getCategoriaLabel(cat.categoria)}</span>
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold">{cat.totalFormateado || '$ 0.00'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {cat.porcentaje?.toFixed(1) || '0.0'}% del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }} className="text-center py-4">No hay gastos en este periodo</p>
        )}
      </div>
    </div>
  );
}
