/**
 * TransaccionesTable Component
 * 
 * Tabla para mostrar transacciones de dinero en movimiento con filtros y paginación
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  obtenerTransacciones,
  revertirTransaccion,
  type TransaccionMovimiento,
  type FiltrarTransaccionesDto,
  TipoTransaccion,
  OrigenTransaccion,
  EstadoTransaccion,
  formatearTransaccion,
  formatearMontoConSigno,
  formatearFechaTransaccion,
  puedeRevertirse,
  TRANSACCIONES_MESSAGES,
} from '@/lib/service-finanzas/service-transacciones';

interface TransaccionesTableProps {
  mes?: number;
  anio?: number;
  tipo?: TipoTransaccion;
  origen?: OrigenTransaccion;
  estado?: EstadoTransaccion;
  onTransaccionRevertida?: () => void;
}

export default function TransaccionesTable({
  mes,
  anio,
  tipo,
  origen,
  estado,
  onTransaccionRevertida,
}: TransaccionesTableProps) {
  const { token } = useAuth();
  const [transacciones, setTransacciones] = React.useState<TransaccionMovimiento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [totalPaginas, setTotalPaginas] = React.useState(1);
  const [totalResultados, setTotalResultados] = React.useState(0);
  const [revirtiendoId, setRevirtiendoId] = React.useState<string | null>(null);

  const cargarTransacciones = React.useCallback(async () => {
    if (!token) return;

    setError(null);
    setLoading(true);
    
    try {
      const limite = 20;
      const saltar = (paginaActual - 1) * limite;
      
      const filtros: FiltrarTransaccionesDto = {
        mes,
        anio,
        tipo,
        origen,
        estado,
        saltar,
        limite,
      };

      const response = await obtenerTransacciones(token, filtros);
      setTransacciones(response.transacciones);
      setPaginaActual(response.paginacion.paginaActual);
      setTotalPaginas(response.paginacion.totalPaginas);
      setTotalResultados(response.paginacion.totalResultados);
    } catch (error: any) {
      console.error('Error al cargar transacciones:', error);
      setError(error.message || TRANSACCIONES_MESSAGES.errorCargarTransacciones);
    } finally {
      setLoading(false);
    }
  }, [token, mes, anio, tipo, origen, estado, paginaActual]);

  React.useEffect(() => {
    cargarTransacciones();
  }, [cargarTransacciones]);

  const handleRevertir = async (transaccion: TransaccionMovimiento) => {
    if (!token) return;
    if (!puedeRevertirse(transaccion)) {
      alert(TRANSACCIONES_MESSAGES.noSePuedeRevertir);
      return;
    }

    const razon = prompt(TRANSACCIONES_MESSAGES.confirmarRevertir);
    if (!razon || razon.trim().length < 10) {
      alert(TRANSACCIONES_MESSAGES.razonRequerida);
      return;
    }

    setRevirtiendoId(transaccion._id);
    try {
      await revertirTransaccion(token, transaccion._id, { razon });
      alert(TRANSACCIONES_MESSAGES.transaccionRevertida);
      await cargarTransacciones();
      onTransaccionRevertida?.();
    } catch (error: any) {
      console.error('Error al revertir transacción:', error);
      alert(error.message || TRANSACCIONES_MESSAGES.errorRevertir);
    } finally {
      setRevirtiendoId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón de refresh */}
      <div className="flex justify-end">
        <button
          onClick={cargarTransacciones}
          disabled={loading}
          className="p-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span className="text-sm">Actualizar</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-lg border flex items-start gap-3"
          style={{ background: '#ef444415', borderColor: '#ef4444' }}
        >
          <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full">
          <thead style={{ background: 'var(--surface-muted)' }}>
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Fecha</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Tipo</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Origen</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Descripción</th>
              <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Monto</th>
              <th className="text-center px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Estado</th>
              <th className="text-center px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody style={{ background: 'var(--surface)' }}>
            {loading ? (
              <tr key="loading">
                <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  Cargando transacciones...
                </td>
              </tr>
            ) : transacciones.length === 0 ? (
              <tr key="empty">
                <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron transacciones
                </td>
              </tr>
            ) : (
              transacciones.map((transaccion) => {
                const formatted = formatearTransaccion(transaccion);
                return (
                  <tr
                    key={transaccion._id}
                    className="border-t transition-colors hover:bg-opacity-50"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatearFechaTransaccion(transaccion.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                        style={{ background: `${formatted.tipoColor}20`, color: formatted.tipoColor }}
                      >
                        {formatted.tipoIcono} {formatted.tipoLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                        style={{ background: `${formatted.origenColor}20`, color: formatted.origenColor }}
                      >
                        {formatted.origenIcono} {formatted.origenLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {transaccion.descripcion}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: formatted.tipoColor }}>
                      {formatearMontoConSigno(transaccion.montoFormateado, transaccion.tipo)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                        style={{ background: `${formatted.estadoColor}20`, color: formatted.estadoColor }}
                      >
                        {formatted.estadoIcono} {formatted.estadoLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {puedeRevertirse(transaccion) && (
                        <button
                          onClick={() => handleRevertir(transaccion)}
                          disabled={revirtiendoId === transaccion._id}
                          className="p-2 rounded hover:bg-opacity-80 transition-all disabled:opacity-50"
                          style={{ background: '#ef444420', color: '#ef4444' }}
                          title="Revertir transacción"
                        >
                          <RotateCcw size={16} className={revirtiendoId === transaccion._id ? 'animate-spin' : ''} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Mostrando {transacciones.length} de {totalResultados} resultados
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1 || loading}
              className="p-2 rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm px-4" style={{ color: 'var(--text-primary)' }}>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas || loading}
              className="p-2 rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
