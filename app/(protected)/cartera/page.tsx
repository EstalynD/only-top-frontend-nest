/**
 * Página de Cartera
 * 
 * Gestión de facturas, pagos y cobranza
 */

'use client';

import React from 'react';
import {
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { 
  FacturasTable, 
  RegistrarPagoModal, 
  FacturaDetalleModal, 
  GenerarFacturasModal 
} from '@/components/finanzas/cartera';
import type { Factura, Pago, CreatePagoDto, FiltrosFacturasDto, TipoRecordatorio } from '@/lib/service-cartera';
import {
  getFacturas,
  getPagosByFactura,
  createPago,
  downloadEstadoCuentaPDF,
  enviarRecordatorio,
  getTotalesCartera,
  CARTERA_MESSAGES,
} from '@/lib/service-cartera';

type Tab = 'facturas' | 'dashboard' | 'configuracion';

export default function CarteraPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  // Estado
  const [activeTab, setActiveTab] = React.useState<Tab>('facturas');
  const [facturas, setFacturas] = React.useState<Factura[]>([]);
  const [totales, setTotales] = React.useState<any>(null);
  const [loadingFacturas, setLoadingFacturas] = React.useState(false);
  const [filtros, setFiltros] = React.useState<FiltrosFacturasDto>({});

  // Modales
  const [facturaSeleccionada, setFacturaSeleccionada] = React.useState<Factura | null>(null);
  const [modalDetalle, setModalDetalle] = React.useState(false);
  const [modalPago, setModalPago] = React.useState(false);
  const [modalGenerar, setModalGenerar] = React.useState(false);
  const [pagosFactura, setPagosFactura] = React.useState<Pago[]>([]);

  // Cargar datos iniciales
  React.useEffect(() => {
    cargarFacturas();
    cargarTotales();
  }, [filtros]);

  const cargarFacturas = async () => {
    if (!token) return;
    setLoadingFacturas(true);
    try {
      const response = await getFacturas(token, filtros);
      setFacturas(response.data || []);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error',
        description: error.message || CARTERA_MESSAGES.error.errorCargarFacturas,
      });
    } finally {
      setLoadingFacturas(false);
    }
  };

  const cargarTotales = async () => {
    if (!token) return;
    try {
      const data = await getTotalesCartera(token);
      setTotales(data);
    } catch (error: any) {
      console.error('Error cargando totales:', error);
    }
  };

  const handleVerDetalle = async (factura: Factura) => {
    setFacturaSeleccionada(factura);
    
    // Cargar pagos de la factura
    if (!token) return;
    try {
      const response = await getPagosByFactura(token, factura._id);
      setPagosFactura(response.pagos || []);
    } catch (error: any) {
      console.error('Error cargando pagos:', error);
      setPagosFactura([]);
    }
    
    setModalDetalle(true);
  };

  const handleRegistrarPago = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setModalPago(true);
  };

  const handleSubmitPago = async (dto: CreatePagoDto, file: File | null) => {
    if (!token) {
      toast({ type: 'error', title: 'Error', description: 'No autorizado' });
      return;
    }

    try {
      await createPago(token, dto, file);
      
      toast({
        type: 'success',
        title: 'Éxito',
        description: CARTERA_MESSAGES.success.pagoRegistrado,
      });

      // Recargar facturas y cerrar modal
      await cargarFacturas();
      await cargarTotales();
      setModalPago(false);
      setFacturaSeleccionada(null);
    } catch (error: any) {
      throw error; // El modal maneja el error
    }
  };

  const handleEnviarRecordatorio = async (factura: Factura) => {
    if (!token) {
      toast({ type: 'error', title: 'Error', description: 'No autorizado' });
      return;
    }

    try {
      await enviarRecordatorio(
        token,
        factura._id,
        { tipo: 'PROXIMO_VENCIMIENTO' as TipoRecordatorio },
      );

      toast({
        type: 'success',
        title: 'Recordatorio Enviado',
        description: `Recordatorio enviado para factura ${factura.numeroFactura}`,
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error',
        description: error.message || CARTERA_MESSAGES.error.errorEnviarRecordatorio,
      });
    }
  };

  const handleDescargarPDF = async (factura: Factura) => {
    if (!token) {
      toast({ type: 'error', title: 'Error', description: 'No autorizado' });
      return;
    }

    try {
      // Calcular fechas del periodo
      const anio = factura.periodo.anio;
      const mes = factura.periodo.mes;
  const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
      const ultimoDia = new Date(anio, mes, 0).getDate();
  const fechaFin = `${anio}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;

      // Extraer modeloId (puede ser string u objeto)
      const modeloId = typeof factura.modeloId === 'string' ? factura.modeloId : factura.modeloId._id;

      const blob = await downloadEstadoCuentaPDF(token, modeloId, { fechaInicio, fechaFin });

      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estado-cuenta-${factura.numeroFactura}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        type: 'success',
        title: 'PDF Descargado',
        description: 'El estado de cuenta se ha descargado correctamente',
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error',
        description: error.message || CARTERA_MESSAGES.error.errorExportarPDF,
      });
    }
  };

  // Estilos
  const pageStyle: React.CSSProperties = {
    background: 'var(--background)',
    minHeight: '100vh',
    padding: '24px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    borderBottom: isActive ? '2px solid' : '2px solid transparent',
    borderColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          Cartera
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Gestión de facturas, pagos y cobranza
        </p>
      </div>

      {/* Dashboard Cards */}
      {totales && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div style={cardStyle} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText size={20} style={{ color: 'var(--text-muted)' }} />
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Total Facturado</p>
            <p
              style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700 }}
              className="font-mono"
            >
              {totales?.totalFacturadoFormateado ?? '$0.00'}
            </p>
          </div>

          <div style={cardStyle} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 size={20} style={{ color: 'var(--text-muted)' }} />
              <div className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {(totales?.tasaCobranza ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Total Recaudado</p>
            <p
              style={{ fontSize: '24px', fontWeight: 700 }}
              className="font-mono text-green-600 dark:text-green-400"
            >
              {totales?.totalPagadoFormateado ?? '$0.00'}
            </p>
          </div>

          <div style={cardStyle} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock size={20} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs text-gray-500">{(totales?.facturasPendientes ?? 0) + (totales?.facturasParciales ?? 0)}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Saldo Pendiente</p>
            <p
              style={{ fontSize: '24px', fontWeight: 700 }}
              className="font-mono text-yellow-600 dark:text-yellow-400"
            >
              {totales?.saldoPendienteFormateado ?? '$0.00'}
            </p>
          </div>

          <div style={cardStyle} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle size={20} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs text-red-500">{totales?.facturasVencidas ?? 0}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Facturas Vencidas</p>
            <p
              style={{ fontSize: '24px', fontWeight: 700 }}
              className="font-mono text-red-600 dark:text-red-400"
            >
              {totales?.montoVencidoFormateado ?? '$0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={cardStyle}>
        <div className="flex items-center border-b" style={{ borderColor: 'var(--border)' }}>
          <button style={tabStyle(activeTab === 'facturas')} onClick={() => setActiveTab('facturas')}>
            <FileText size={18} />
            Facturas
          </button>
          <button style={tabStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} />
            Dashboard
          </button>
          <button style={tabStyle(activeTab === 'configuracion')} onClick={() => setActiveTab('configuracion')}>
            <Settings size={18} />
            Configuración
          </button>

          <div className="ml-auto p-4 flex items-center gap-2">
            <button
              onClick={() => setModalGenerar(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <Plus size={16} />
              Generar Facturas
            </button>
            <button
              onClick={cargarFacturas}
              disabled={loadingFacturas}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <RefreshCw size={16} className={loadingFacturas ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Contenido de Tabs */}
        <div className="p-6">
          {activeTab === 'facturas' && (
            <FacturasTable
              facturas={facturas}
              loading={loadingFacturas}
              onVerDetalle={handleVerDetalle}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onDescargarPDF={handleDescargarPDF}
              filtros={filtros}
              onFiltrosChange={setFiltros}
            />
          )}

          {activeTab === 'dashboard' && (
            <div className="text-center py-12">
              <BarChart3 size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4 opacity-20" />
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                Dashboard de estadísticas en desarrollo
              </p>
            </div>
          )}

          {activeTab === 'configuracion' && (
            <div className="text-center py-12">
              <Settings size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4 opacity-20" />
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                Configuración de cartera en desarrollo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <GenerarFacturasModal
        isOpen={modalGenerar}
        onClose={() => setModalGenerar(false)}
        token={token || ''}
        onSuccess={() => {
          cargarFacturas();
          cargarTotales();
        }}
      />

      <RegistrarPagoModal
        isOpen={modalPago}
        onClose={() => {
          setModalPago(false);
          setFacturaSeleccionada(null);
        }}
        factura={facturaSeleccionada}
        onSubmit={handleSubmitPago}
      />

      <FacturaDetalleModal
        isOpen={modalDetalle}
        onClose={() => {
          setModalDetalle(false);
          setFacturaSeleccionada(null);
          setPagosFactura([]);
        }}
        factura={facturaSeleccionada}
        pagos={pagosFactura}
        onRegistrarPago={() => {
          setModalDetalle(false);
          setModalPago(true);
        }}
        onEnviarRecordatorio={() => {
          if (facturaSeleccionada) {
            handleEnviarRecordatorio(facturaSeleccionada);
          }
        }}
        onDescargarPDF={() => {
          if (facturaSeleccionada) {
            handleDescargarPDF(facturaSeleccionada);
          }
        }}
      />
    </div>
  );
}
