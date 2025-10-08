'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { formatMoney, parseMoney, CurrencyCode, DisplayFormat } from '@/lib/utils/money';

// Utilidad para combinar classNames (reemplazo de cn)
function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface MoneyInputProps {
  value?: number;
  onChange?: (value: number) => void;
  currency?: CurrencyCode;
  displayFormat?: DisplayFormat;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  className?: string;
  error?: string;
}

/**
 * MoneyInput - Input especializado para montos monetarios
 * 
 * Características:
 * - Formateo automático según moneda (COP/USD)
 * - Validación de rangos
 * - Parseo inteligente (ignora símbolos)
 * - Integración con formularios
 * 
 * @example
 * ```tsx
 * <MoneyInput
 *   value={presupuesto}
 *   onChange={setPresupuesto}
 *   currency={CurrencyCode.COP}
 *   label="Presupuesto"
 *   min={0}
 *   required
 * />
 * ```
 */
export function MoneyInput({
  value = 0,
  onChange,
  currency = CurrencyCode.COP,
  displayFormat = 'CODE_SYMBOL',
  label,
  placeholder,
  disabled = false,
  required = false,
  min,
  max,
  className,
  error,
}: MoneyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Sincronizar con valor externo
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? formatMoney(value, currency, displayFormat) : '');
    }
  }, [value, currency, displayFormat, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // En foco, mostrar solo el número sin formato
    setInputValue(value?.toString() || '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Parsear y validar
    const parsed = parseMoney(inputValue, currency);
    
    // Aplicar restricciones
    let validated = parsed;
    if (min !== undefined && validated < min) validated = min;
    if (max !== undefined && validated > max) validated = max;
    
    // Notificar cambio
    if (onChange && validated !== value) {
      onChange(validated);
    }
    
    // Formatear para mostrar
    setInputValue(validated ? formatMoney(validated, currency, displayFormat) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Si no está enfocado, parsear inmediatamente
    if (!isFocused) {
      const parsed = parseMoney(newValue, currency);
      if (onChange && parsed !== value) {
        onChange(parsed);
      }
    }
  };

  return (
    <div className={cx('space-y-2', className)}>
      {label && (
        <label htmlFor={`money-input-${label}`} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Input
        id={`money-input-${label}`}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || formatMoney(0, currency, displayFormat)}
        disabled={disabled}
        required={required}
        className={cx(
          'font-mono',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}
      />
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {(min !== undefined || max !== undefined) && (
        <p className="text-xs text-muted-foreground">
          {min !== undefined && max !== undefined
            ? `Rango: ${formatMoney(min, currency, displayFormat)} - ${formatMoney(max, currency, displayFormat)}`
            : min !== undefined
            ? `Mínimo: ${formatMoney(min, currency, displayFormat)}`
            : max !== undefined
            ? `Máximo: ${formatMoney(max, currency, displayFormat)}`
            : ''}
        </p>
      )}
    </div>
  );
}

/**
 * MoneyDisplay - Componente para mostrar montos formateados
 * 
 * @example
 * ```tsx
 * <MoneyDisplay
 *   amount={3000000.25}
 *   currency={CurrencyCode.COP}
 *   size="lg"
 * />
 * // Renderiza: $ 3.000.000,25 COP
 * ```
 */
export interface MoneyDisplayProps {
  amount: number;
  currency?: CurrencyCode;
  displayFormat?: DisplayFormat;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCurrency?: boolean;
}

export function MoneyDisplay({
  amount,
  currency = CurrencyCode.COP,
  displayFormat = 'CODE_SYMBOL',
  size = 'md',
  className,
}: MoneyDisplayProps) {
  const formatted = formatMoney(amount, currency, displayFormat);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold',
  };
  
  return (
    <span className={cx('font-mono', sizeClasses[size], className)}>
      {formatted}
    </span>
  );
}
