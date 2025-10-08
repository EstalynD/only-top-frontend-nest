"use client";

import { useState, useEffect, CSSProperties, useMemo } from 'react';
import { Trash2, AlertTriangle, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { GastosFijos } from '@/lib/service-finanzas';
import { type GastoFijoFormateadoDto, CategoriaGasto, QuincenaEnum } from '@/lib/service-finanzas/service-gastos-fijos/types';

interface EliminarNominaModalProps {
  mes: number;
  anio: number;
  quincena?: QuincenaEnum;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EliminarNominaModal({
  mes,
  anio,
  quincena,
  onClose,
  onSuccess,
}: EliminarNominaModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gastosNomina, setGastosNomina] = useState<GastoFijoFormateadoDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacionTexto, setConfirmacionTexto] = useState('');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const TEXTO_CONFIRMACION = 'ELIMINAR';

  useEffect(() => {
    cargarGastosNomina();
  }, []);

  const cargarGastosNomina = async () => {
    if (!token) return;
    
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await GastosFijos.obtenerResumenQuincenal(token, mes, anio, quincena || QuincenaEnum.PRIMERA_QUINCENA);
      
      // Filtrar solo gastos de categoría NOMINA
      const gastosNomina = respuesta.data.gastos.filter((g: GastoFijoFormateadoDto) => g.categoria === CategoriaGasto.NOMINA);
      setGastosNomina(gastosNomina);
    } catch (err: any) {
      console.error('Error al cargar gastos de nómina:', err);
      setError(err.message || 'Error al cargar gastos de nómina');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    if (!token || confirmacionTexto !== TEXTO_CONFIRMACION) {
      setError(`Debe escribir "${TEXTO_CONFIRMACION}" para confirmar`);
      return;
    }
    
    setEliminando(true);
    setError(null);
    
    try {
      // Eliminar cada gasto de nómina
      for (const gasto of gastosNomina) {
        await GastosFijos.eliminarGasto(token, gasto.id);
      }
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar nómina:', err);
      setError(err.message || 'Error al eliminar gastos de nómina');
    } finally {
      setEliminando(false);
    }
  };

  // Estilos
  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: '#fee2e2', color: '#ef4444' }}
      >
        <Trash2 size={20} />
      </div>
    ),
    [],
  );

  const quincenaText = quincena === QuincenaEnum.PRIMERA_QUINCENA 
    ? 'Primera Quincena' 
    : quincena === QuincenaEnum.SEGUNDA_QUINCENA 
    ? 'Segunda Quincena' 
    : 'Ambas Quincenas';

  const totalMonto = gastosNomina.reduce((sum, g) => sum + (typeof g.montoUSD === 'number' ? g.montoUSD : parseFloat(g.montoUSD || '0')), 0);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Eliminar Nómina Generada"
      icon={headerIcon}
      maxWidth="max-w-2xl"
    >
      <div className="p-6 space-y-6">
        {/* Información del período */}
        <div className="p-3 rounded-lg flex items-center gap-2" style={{ background: 'var(--surface-muted)' }}>
          <Calendar size={16} style={mutedTextStyle} />
          <p className="text-sm font-medium" style={labelStyle}>
            {meses[mes - 1]} {anio} - {quincenaText}
          </p>
        </div>
          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {cargando ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3" style={mutedTextStyle}>Cargando gastos de nómina...</span>
            </div>
          ) : gastosNomina.length === 0 ? (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#e0e7ff', color: '#3730a3' }}>
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">No hay nómina generada</p>
                <p className="text-sm mt-1">
                  No se encontraron gastos de nómina para el periodo seleccionado.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Advertencia de peligro */}
              <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">⚠️ Acción Irreversible</p>
                  <p className="text-sm mt-1">
                    Esta acción eliminará permanentemente {gastosNomina.length} gasto(s) de nómina del sistema.
                    Los registros no podrán ser recuperados.
                  </p>
                </div>
              </div>

              {/* Resumen de gastos a eliminar */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={labelStyle}>
                  <Users size={18} />
                  Gastos de Nómina a Eliminar
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span style={mutedTextStyle}>Total de gastos:</span>
                    <span className="font-semibold" style={labelStyle}>{gastosNomina.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={mutedTextStyle}>Monto total:</span>
                    <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                      ${totalMonto.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Lista de empleados */}
                <div className="mt-4 max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium mb-2" style={mutedTextStyle}>Empleados afectados:</p>
                  <div className="space-y-1">
                    {gastosNomina.map(gasto => (
                      <div
                        key={gasto.id}
                        className="text-xs p-2 rounded flex items-center justify-between"
                        style={{ background: 'var(--surface)' }}
                      >
                        <span style={labelStyle}>{gasto.empleadoNombre || 'N/A'}</span>
                        <span style={mutedTextStyle}>${(typeof gasto.montoUSD === 'number' ? gasto.montoUSD : parseFloat(gasto.montoUSD || '0')).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campo de confirmación */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={labelStyle}>
                  Escriba "{TEXTO_CONFIRMACION}" para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmacionTexto}
                  onChange={(e) => {
                    setConfirmacionTexto(e.target.value);
                    setError(null);
                  }}
                  placeholder={TEXTO_CONFIRMACION}
                  className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  style={{
                    ...inputStyle,
                    borderColor: confirmacionTexto === TEXTO_CONFIRMACION ? '#10b981' : 'var(--border)',
                  }}
                  disabled={eliminando}
                />
                {confirmacionTexto && confirmacionTexto !== TEXTO_CONFIRMACION && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>
                    El texto no coincide. Debe escribir exactamente: {TEXTO_CONFIRMACION}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-muted)',
              }}
              disabled={eliminando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={{
                background: gastosNomina.length > 0 && confirmacionTexto === TEXTO_CONFIRMACION 
                  ? '#ef4444' 
                  : '#9ca3af',
                color: 'white',
              }}
              disabled={eliminando || gastosNomina.length === 0 || confirmacionTexto !== TEXTO_CONFIRMACION}
            >
              {eliminando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Eliminar Nómina ({gastosNomina.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
  );
}
