/**
 * FinanzasDetalleModal Component
 * 
 * Modal con desglose completo de finanzas de un modelo.
 */

'use client';

import React from 'react';
import { X, DollarSign, TrendingUp, Calendar, User } from 'lucide-react';
import type { ModeloConGanancias } from '@/lib/service-finanzas';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { FinanzasStatusBadge } from '@/components/ui/FinanzasStatusBadge';
import { getNombreMes } from '@/lib/service-finanzas';
import { CurrencyCode } from '@/lib/utils/money';

interface FinanzasDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelo: ModeloConGanancias | null;
}

export function FinanzasDetalleModal({ isOpen, onClose, modelo }: FinanzasDetalleModalProps) {
  if (!isOpen || !modelo || !modelo.finanzas) return null;

  const { finanzas } = modelo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl my-8"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'var(--ot-blue-500)', color: '#fff' }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Detalle de Finanzas
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {modelo.nombreCompleto}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info del Periodo */}
          <div
            className="p-4 rounded-lg border"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={18} style={{ color: 'var(--ot-blue-500)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Periodo
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {getNombreMes(finanzas.mes)} {finanzas.anio}
                  </p>
                </div>
              </div>
              <FinanzasStatusBadge estado={finanzas.estado} size="md" />
            </div>
          </div>

          {/* Desglose Financiero */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Desglose Financiero
            </h3>
            <div className="space-y-3">
              {/* Ventas Netas */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: 'var(--ot-blue-500)15', color: 'var(--ot-blue-500)' }}
                    >
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Ventas Netas
                      </p>
                      <MoneyDisplay
                        amount={parseFloat(finanzas.ventasNetas)}
                        currency={CurrencyCode.USD}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comisión Agencia */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: '#f59e0b15', color: '#f59e0b' }}
                    >
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Comisión Agencia ({finanzas.porcentajeComisionAgencia}%)
                      </p>
                      <MoneyDisplay
                        amount={parseFloat(finanzas.comisionAgencia)}
                        currency={CurrencyCode.USD}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comisión Banco */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: '#ef444415', color: '#ef4444' }}
                    >
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Comisión Banco ({finanzas.porcentajeComisionBanco}%)
                      </p>
                      <MoneyDisplay
                        amount={parseFloat(finanzas.comisionBanco)}
                        currency={CurrencyCode.USD}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ganancia Modelo */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: '#10b98115', borderColor: '#10b981' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: '#10b98130', color: '#10b981' }}
                    >
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#10b981' }}>
                        Ganancia Modelo
                      </p>
                      <MoneyDisplay
                        amount={parseFloat(finanzas.gananciaModelo)}
                        currency={CurrencyCode.USD}
                        size="lg"
                        color="#10b981"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ganancia OnlyTop */}
              <div
                className="p-4 rounded-lg border"
                style={{ background: '#8b5cf615', borderColor: '#8b5cf6' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: '#8b5cf630', color: '#8b5cf6' }}
                    >
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#8b5cf6' }}>
                        Ganancia OnlyTop
                      </p>
                      <MoneyDisplay
                        amount={parseFloat(finanzas.gananciaOnlyTop)}
                        currency={CurrencyCode.USD}
                        size="lg"
                        color="#8b5cf6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          {finanzas.meta && (
            <div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Información Adicional
              </h3>
              <div
                className="p-4 rounded-lg border space-y-2"
                style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Total Ventas:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{finanzas.meta.totalVentas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Días Trabajados:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{finanzas.meta.diasTrabajados}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Promedio Diario:</span>
                  <MoneyDisplay
                    amount={parseFloat(finanzas.meta.promedioVentaDiaria)}
                    currency={CurrencyCode.USD}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          {finanzas.notas && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Notas
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {finanzas.notas}
              </p>
            </div>
          )}

          {/* Auditoría */}
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Auditoría
            </h3>
            <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>
                Calculado el {new Date(finanzas.fechaCalculo).toLocaleDateString('es-ES')}
              </p>
              {finanzas.fechaAprobacion && (
                <p>
                  Aprobado el {new Date(finanzas.fechaAprobacion).toLocaleDateString('es-ES')}
                </p>
              )}
              {finanzas.fechaPago && (
                <p>
                  Pagado el {new Date(finanzas.fechaPago).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'var(--ot-blue-500)',
              color: '#ffffff',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
