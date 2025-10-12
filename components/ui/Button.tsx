"use client";
import React, { useMemo, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import Loader from './Loader';

type Variant = 'primary' | 'success' | 'danger' | 'neutral' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  full?: boolean;
  variant?: Variant;
  size?: Size;
  responsive?: boolean;
  // Accesibilidad avanzada
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  // Estados adicionales
  loading?: boolean;
  loadingText?: string;
  loadingSize?: LoaderSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  // Manejo de eventos
  debounceMs?: number;
  preventMultipleClicks?: boolean;
};

export const Button = React.memo(({ 
  className, 
  full, 
  variant = 'primary', 
  size = 'md',
  responsive = true,
  disabled,
  children,
  // Accesibilidad avanzada
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  // Estados adicionales
  loading = false,
  loadingText,
  loadingSize = 'sm',
  icon,
  iconPosition = 'left',
  // Manejo de eventos
  debounceMs = 0,
  preventMultipleClicks = false,
  onClick,
  ...props 
}: Props) => {
  const { theme } = useTheme();

  // Memoizar estilos para mejor performance
  const sizeClasses = useMemo(() => {
    if (!responsive) {
      // Tamaños fijos sin responsive
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'lg':
          return 'px-6 py-3 text-base';
        default:
          return 'px-4 py-2 text-sm';
      }
    }
    
    // Tamaños responsive
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm';
      case 'lg':
        return 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base';
      default:
        return 'px-3 py-1.5 text-sm sm:px-4 sm:py-2';
    }
  }, [size, responsive]);

  const variantClasses = useMemo(() => {
    const baseClasses = responsive 
      ? 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center justify-center gap-1 sm:gap-2'
      : 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[2.5rem] flex items-center justify-center gap-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${
          theme === 'dark'
            ? 'text-white bg-[#1e338a] hover:bg-[#2a4ba8] focus:ring-[#1e338a] border border-[#2a4ba8]'
            : 'text-white bg-[#1e338a] hover:bg-[#152a6b] focus:ring-[#1e338a] border border-[#1e338a]'
        }`;
      
      case 'success':
        return `${baseClasses} ${
          theme === 'dark'
            ? 'text-white bg-[#059669] hover:bg-[#047857] focus:ring-[#059669] border border-[#059669]'
            : 'text-white bg-[#10b981] hover:bg-[#059669] focus:ring-[#10b981] border border-[#10b981]'
        }`;
      
      case 'danger':
        return `${baseClasses} ${
          theme === 'dark'
            ? 'text-white bg-[#dc2626] hover:bg-[#b91c1c] focus:ring-[#dc2626] border border-[#dc2626]'
            : 'text-white bg-[#ef4444] hover:bg-[#dc2626] focus:ring-[#ef4444] border border-[#ef4444]'
        }`;
      
      case 'neutral':
        return `${baseClasses} border ${
          theme === 'dark'
            ? 'text-gray-200 bg-[#374151] border-[#4b5563] hover:bg-[#4b5563] focus:ring-[#6b7280]'
            : 'text-gray-700 bg-white border-[#d1d5db] hover:bg-[#f9fafb] focus:ring-[#9ca3af]'
        }`;
      
      case 'secondary':
        return `${baseClasses} border ${
          theme === 'dark'
            ? 'text-gray-200 bg-[#1f2937] border-[#374151] hover:bg-[#374151] focus:ring-[#6b7280]'
            : 'text-gray-700 bg-[#f3f4f6] border-[#d1d5db] hover:bg-[#e5e7eb] focus:ring-[#9ca3af]'
        }`;
      
      case 'ghost':
        return `${baseClasses} ${
          theme === 'dark'
            ? 'text-gray-300 hover:bg-[#374151] focus:ring-[#6b7280]'
            : 'text-gray-700 hover:bg-[#f3f4f6] focus:ring-[#9ca3af]'
        }`;
      
      default:
        return `${baseClasses} ${
          theme === 'dark'
            ? 'text-white bg-[#1e338a] hover:bg-[#2a4ba8] focus:ring-[#1e338a] border border-[#2a4ba8]'
            : 'text-white bg-[#1e338a] hover:bg-[#152a6b] focus:ring-[#1e338a] border border-[#1e338a]'
        }`;
    }
  }, [variant, theme, responsive]);

  // Manejo avanzado de eventos
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }

    if (preventMultipleClicks && loading) {
      event.preventDefault();
      return;
    }

    if (onClick) {
      if (debounceMs > 0) {
        // Implementar debouncing si es necesario
        setTimeout(() => {
          onClick(event);
        }, debounceMs);
      } else {
        onClick(event);
      }
    }
  }, [loading, disabled, preventMultipleClicks, onClick, debounceMs]);

  // Determinar el contenido del botón
  const buttonContent = useMemo(() => {
    const displayText = loading && loadingText ? loadingText : children;
    
    if (loading) {
      return (
        <>
          <Loader size={loadingSize} variant="primary" />
          {displayText && <span className="ml-2">{displayText}</span>}
        </>
      );
    }

    if (icon) {
      const iconElement = <span className="flex-shrink-0">{icon}</span>;
      const textElement = displayText && <span>{displayText}</span>;
      
      if (iconPosition === 'right') {
        return (
          <>
            {textElement}
            {iconElement}
          </>
        );
      }
      
      return (
        <>
          {iconElement}
          {textElement}
        </>
      );
    }

    return displayText;
  }, [loading, loadingText, children, icon, iconPosition, loadingSize]);

  // Atributos ARIA
  const ariaAttributes = useMemo(() => {
    const attrs: Record<string, any> = {};
    
    if (ariaLabel) attrs['aria-label'] = ariaLabel;
    if (ariaDescribedBy) attrs['aria-describedby'] = ariaDescribedBy;
    if (ariaPressed !== undefined) attrs['aria-pressed'] = ariaPressed;
    if (ariaExpanded !== undefined) attrs['aria-expanded'] = ariaExpanded;
    if (loading) attrs['aria-busy'] = true;
    
    return attrs;
  }, [ariaLabel, ariaDescribedBy, ariaPressed, ariaExpanded, loading]);

  return (
    <button
      className={`${sizeClasses} ${variantClasses} ${full ? 'w-full' : ''} ${className ?? ''}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...ariaAttributes}
      {...props}
    >
      {buttonContent}
    </button>
  );
});
