/**
 * ResumenTransacciones Component
 * 
 * Muestra un resumen visual de las transacciones del periodo actual
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Transacciones } from '@/lib/service-finanzas';

interface ResumenTransaccionesProps {
  mes: number;
  anio: number;
}

export default function ResumenTransacciones({ mes, anio }: ResumenTransaccionesProps) {
  const { token } = useAuth();
  const [resumen, setResumen] = React.useState<Transacciones.ResumenTransaccionesPeriodoDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!token) return;

    const cargarResumen = async () => {
      try {
        const data = await Transacciones.obtenerResumenPeriodo(token, mes, anio);
        setResumen(data);
      } catch (error) {
        console.error('Error al cargar resumen de transacciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, [token, mes, anio]);

  if (loading) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <p className="text-center" style={{ color: 'var(--text-muted)' }}>
          Cargando resumen...
        </p>
      </div>
    );
  }

  if (!resumen) return null;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        📊 Resumen de Transacciones - {resumen.periodo}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Ingresos */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: '#10b98110',
            borderColor: '#10b981',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#10b981' }}>
              Ingresos
            </span>
            <TrendingUp size={20} style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
            {resumen.totalIngresosFormateado}
          </p>
          <p className="text-xs mt-1" style={{ color: '#059669' }}>
            {resumen.cantidadIngresos} transacciones
          </p>
        </div>

        {/* Total Egresos */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: '#ef444410',
            borderColor: '#ef4444',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#ef4444' }}>
              Egresos
            </span>
            <TrendingDown size={20} style={{ color: '#ef4444' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {resumen.totalEgresosFormateado}
          </p>
          <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
            {resumen.cantidadEgresos} transacciones
          </p>
        </div>

        {/* Saldo Neto */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: resumen.saldoNeto >= 0 ? '#10b98110' : '#ef444410',
            borderColor: resumen.saldoNeto >= 0 ? '#10b981' : '#ef4444',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: resumen.saldoNeto >= 0 ? '#10b981' : '#ef4444' }}>
              Saldo Neto
            </span>
            <DollarSign size={20} style={{ color: resumen.saldoNeto >= 0 ? '#10b981' : '#ef4444' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: resumen.saldoNeto >= 0 ? '#10b981' : '#ef4444' }}>
            {resumen.saldoNetoFormateado}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {resumen.estado === 'CONSOLIDADO' ? '🔒 Consolidado' : '💸 En movimiento'}
          </p>
        </div>

        {/* Total Transacciones */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: '#8b5cf610',
            borderColor: '#8b5cf6',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>
              Transacciones
            </span>
            <Activity size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
            {resumen.cantidadTotal}
          </p>
          <p className="text-xs mt-1" style={{ color: '#7c3aed' }}>
            {resumen.transaccionesEnMovimiento} en movimiento
          </p>
        </div>
      </div>

      {/* Desglose por Origen */}
      {resumen.desglosePorOrigen && resumen.desglosePorOrigen.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            Desglose por Origen
          </h3>
          <div className="space-y-2">
            {resumen.desglosePorOrigen.map((item, index) => (
              <div
                key={`${item.origen}-${item.tipo}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--surface-muted)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: item.tipo === 'INGRESO' ? '#10b98120' : '#ef444420',
                      color: item.tipo === 'INGRESO' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {item.tipo === 'INGRESO' ? '↑' : '↓'}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {Transacciones.getLabelOrigen(item.origen)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    ({item.cantidad} transacciones)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span
                    className="font-semibold"
                    style={{ color: item.tipo === 'INGRESO' ? '#10b981' : '#ef4444' }}
                  >
                    {item.tipo === 'INGRESO' ? '+' : '-'}{item.totalFormateado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
