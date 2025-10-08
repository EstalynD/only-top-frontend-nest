/**
 * MoneyDisplay Component
 * 
 * Componente para mostrar montos formateados.
 * Integra con MoneyService del backend.
 */

'use client';

import React from 'react';
import { formatMoney, CurrencyCode, type DisplayFormat } from '@/lib/utils/money';

interface MoneyDisplayProps {
  amount: number | string;
  currency?: CurrencyCode;
  format?: DisplayFormat;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  showZero?: boolean;
}

export function MoneyDisplay({
  amount,
  currency = CurrencyCode.USD,
  format = 'CODE_SYMBOL',
  className = '',
  size = 'md',
  color,
  showZero = true,
}: MoneyDisplayProps) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Si es 0 y no queremos mostrarlo
  if (numAmount === 0 && !showZero) {
    return <span className={className}>-</span>;
  }
  
  const formatted = formatMoney(numAmount, currency, format);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg font-semibold',
  };
  
  return (
    <span
      className={`font-mono tabular-nums ${sizeClasses[size]} ${className}`}
      style={{ color: color || 'var(--text-primary)' }}
      title={formatted}
    >
      {formatted}
    </span>
  );
}
