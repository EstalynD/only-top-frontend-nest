"use client";
import React from 'react';
import { EstadoHoraExtra, ESTADO_LABELS, ESTADO_COLORS, ESTADO_BG_COLORS } from '@/lib/service-horas-extras';

interface BadgeEstadoProps {
  estado: EstadoHoraExtra;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BadgeEstado({ estado, size = 'md', className = '' }: BadgeEstadoProps) {
  const label = ESTADO_LABELS[estado];
  const color = ESTADO_COLORS[estado];
  const bgColor = ESTADO_BG_COLORS[estado];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
