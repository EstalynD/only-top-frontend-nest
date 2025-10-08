"use client";
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'var(--ot-blue-500)',
  trend,
}: StatsCardProps) {
  return (
    <div
      className="rounded-lg p-6 transition-all hover:shadow-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="p-3 rounded-lg"
            style={{ background: `${iconColor}20`, color: iconColor }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className="font-medium"
            style={{ color: trend.isPositive ? '#10b981' : '#ef4444' }}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs período anterior</span>
        </div>
      )}
    </div>
  );
}

