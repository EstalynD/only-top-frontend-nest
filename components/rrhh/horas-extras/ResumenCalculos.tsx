"use client";
import React from 'react';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import {
  bigIntToNumber,
  formatBigIntCOP,
  HORAS_LABORALES_MES_DEFAULT,
  calcularValorHoraOrdinaria,
  formatCOP,
} from '@/lib/service-horas-extras';

interface ResumenCalculosProps {
  salarioBase: number;
  horasLaboralesMes?: number;
  totalHoras: number;
  totalRecargoCOP: string | number;
  moneda?: string;
  className?: string;
}

export default function ResumenCalculos({
  salarioBase,
  horasLaboralesMes = HORAS_LABORALES_MES_DEFAULT,
  totalHoras,
  totalRecargoCOP,
  moneda = 'USD',
  className = '',
}: ResumenCalculosProps) {
  const valorHoraOrdinaria = calcularValorHoraOrdinaria(salarioBase, horasLaboralesMes);
  const totalRecargo = typeof totalRecargoCOP === 'string' 
    ? bigIntToNumber(totalRecargoCOP) 
    : totalRecargoCOP;

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  };

  const valueStyle: React.CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    fontWeight: '600',
  };

  return (
    <div className={`p-4 ${className}`} style={cardStyle}>
      <h3
        className="text-sm font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--text-primary)' }}
      >
        <TrendingUp size={16} style={{ color: 'var(--text-primary)' }} />
        Resumen de Cálculos
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Salario Base */}
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-muted)' }}
          >
            <DollarSign size={18} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={labelStyle}>Salario Base</p>
            <p style={valueStyle} className="truncate">
              {moneda === 'COP' ? formatCOP(salarioBase) : `$ ${salarioBase.toFixed(2)}`} {moneda}
            </p>
          </div>
        </div>

        {/* Horas Laborales */}
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-muted)' }}
          >
            <Calendar size={18} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={labelStyle}>Horas Laborales/Mes</p>
            <p style={valueStyle}>{horasLaboralesMes} hrs</p>
          </div>
        </div>

        {/* Valor Hora Ordinaria */}
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-muted)' }}
          >
            <Clock size={18} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={labelStyle}>Valor Hora Ordinaria</p>
            <p style={valueStyle} className="truncate">
              {moneda === 'COP' ? formatCOP(valorHoraOrdinaria) : `$ ${valorHoraOrdinaria.toFixed(2)}`} {moneda}
            </p>
          </div>
        </div>

        {/* Total Horas Extras */}
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-muted)' }}
          >
            <Clock size={18} style={{ color: '#10b981' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={labelStyle}>Total Horas Extras</p>
            <p style={valueStyle}>{totalHoras.toFixed(2)} hrs</p>
          </div>
        </div>
      </div>

      {/* Total a Pagar - Destacado */}
      <div
        className="mt-4 p-4 rounded-lg border-2"
        style={{
          background: 'var(--surface-muted)',
          borderColor: '#10b981',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Total Recargo a Pagar
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Incluye recargos según legislación colombiana
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: '#10b981' }}
          >
            {typeof totalRecargoCOP === 'string'
              ? formatBigIntCOP(totalRecargoCOP)
              : (moneda === 'COP' ? formatCOP(totalRecargo) : `$ ${totalRecargo.toFixed(2)}`)} {moneda}
          </p>
        </div>
      </div>
    </div>
  );
}
