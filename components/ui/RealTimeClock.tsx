"use client";
import React from 'react';
import { Clock } from 'lucide-react';
import { getSelectedTimeFormat } from '@/lib/service-sistema/api';
import { useAuth } from '@/lib/auth';
import type { TimeFormat } from '@/lib/service-sistema/types';

interface RealTimeClockProps {
  className?: string;
  showIcon?: boolean;
}

export function RealTimeClock({ className = '', showIcon = true }: RealTimeClockProps) {
  const { token } = useAuth();
  const [time, setTime] = React.useState(new Date());
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h');
  const [loading, setLoading] = React.useState(true);

  // Cargar formato de hora al montar el componente
  React.useEffect(() => {
    if (!token) return;
    
    const loadTimeFormat = async () => {
      try {
        const format = await getSelectedTimeFormat(token);
        setTimeFormat(format);
      } catch (error) {
        console.warn('Error loading time format, using default 24h:', error);
        setTimeFormat('24h');
      } finally {
        setLoading(false);
      }
    };

    loadTimeFormat();
  }, [token]);

  // Actualizar tiempo cada segundo
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formatear hora según el formato seleccionado
  const formatTime = (date: Date, format: TimeFormat): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes}:${seconds} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Clock size={16} className="animate-pulse" />}
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          --:--:--
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Clock 
          size={16} 
          style={{ color: 'var(--text-muted)' }}
          className="animate-pulse"
        />
      )}
      <span 
        className="text-sm font-mono font-medium"
        style={{ color: 'var(--text-primary)' }}
        title={`Formato: ${timeFormat === '24h' ? '24 horas' : '12 horas (AM/PM)'}`}
      >
        {formatTime(time, timeFormat)}
      </span>
    </div>
  );
}
