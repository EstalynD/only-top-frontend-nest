/**
 * FinanzasStatusBadge Component
 * 
 * Badge para mostrar el estado de las finanzas con colores.
 */

'use client';

import React from 'react';
import { EstadoFinanzas } from '@/lib/service-finanzas';
import { getColorEstado, getLabelEstado } from '@/lib/service-finanzas';

interface FinanzasStatusBadgeProps {
  estado: EstadoFinanzas;
  size?: 'sm' | 'md' | 'lg';
}

export function FinanzasStatusBadge({ estado, size = 'md' }: FinanzasStatusBadgeProps) {
  const color = getColorEstado(estado);
  const label = getLabelEstado(estado);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
