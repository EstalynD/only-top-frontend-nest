"use client";
import React, { useMemo, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/** =========================
 *   Tipos
 *  ========================= */
type TextareaSize = 'sm' | 'md' | 'lg';

type TextareaVariant = 'default' | 'filled' | 'outlined' | 'ghost';

type Props = {
  // Identificación
  id?: string;
  name?: string;
  
  // Valor y estado
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  
  // Apariencia
  size?: TextareaSize;
  variant?: TextareaVariant;
  placeholder?: string;
  className?: string;
  
  // Dimensiones
  rows?: number;
  cols?: number;
  minRows?: number;
  maxRows?: number;
  
  // Estados
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  
  // Validación
  error?: string;
  success?: string;
  warning?: string;
  
  // Características especiales
  maxLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
  
  // Accesibilidad
  label?: string;
  helpText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

/** =========================
 *   Configuraciones
 *  ========================= */
const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const variantClasses: Record<TextareaVariant, string> = {
  default: 'border border-border bg-surface text-primary',
  filled: 'border-0 bg-surface-muted text-primary',
  outlined: 'border-2 border-border bg-transparent text-primary',
  ghost: 'border-0 bg-transparent text-primary',
};

/** =========================
 *   Componente Principal
 *  ========================= */
export const Textarea = React.memo(forwardRef<HTMLTextAreaElement, Props>(({
  id,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  size = 'md',
  variant = 'default',
  placeholder,
  className = '',
  rows = 3,
  cols,
  minRows = 2,
  maxRows = 10,
  disabled = false,
  readonly = false,
  required = false,
  autoFocus = false,
  error,
  success,
  warning,
  maxLength,
  resize = 'vertical',
  autoResize = false,
  label,
  helpText,
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Combinar refs
  React.useImperativeHandle(ref, () => textareaRef.current!);

  // Auto-resize functionality
  const adjustHeight = React.useCallback(() => {
    if (!autoResize || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [autoResize, minRows, maxRows]);

  // Memoizar las clases CSS
  const textareaClasses = useMemo(() => {
    const baseClasses = 'w-full rounded-lg transition-all duration-200 focus:outline-none';
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];
    
    // Estados de validación
    let stateClasses = '';
    if (error) {
      stateClasses = 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200';
    } else if (success) {
      stateClasses = 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200';
    } else if (warning) {
      stateClasses = 'border-yellow-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200';
    } else if (isFocused) {
      stateClasses = 'border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
    }
    
    // Estados de interacción
    const interactionClasses = disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : readonly 
        ? 'cursor-default' 
        : 'hover:border-blue-400';
    
    // Resize
    const resizeClass = autoResize ? 'resize-none overflow-hidden' : `resize-${resize}`;
    
    return `${baseClasses} ${sizeClass} ${variantClass} ${stateClasses} ${interactionClasses} ${resizeClass} ${className}`.trim();
  }, [size, variant, error, success, warning, isFocused, disabled, readonly, autoResize, resize, className]);

  // Memoizar atributos ARIA
  const ariaAttributes = useMemo(() => {
    const attrs: Record<string, any> = {};
    
    if (ariaLabel) attrs['aria-label'] = ariaLabel;
    if (ariaDescribedBy) attrs['aria-describedby'] = ariaDescribedBy;
    if (error) attrs['aria-invalid'] = true;
    if (required) attrs['aria-required'] = true;
    
    return attrs;
  }, [ariaLabel, ariaDescribedBy, error, required]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    
    // Auto-resize después del cambio
    if (autoResize) {
      setTimeout(adjustHeight, 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Auto-resize en mount y cuando cambia el valor
  React.useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [value, autoResize, adjustHeight]);

  // Contador de caracteres
  const characterCount = useMemo(() => {
    if (!maxLength || !value) return null;
    return `${value.length}/${maxLength}`;
  }, [maxLength, value]);

  const textareaElement = (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        autoFocus={autoFocus}
        rows={autoResize ? minRows : rows}
        cols={cols}
        maxLength={maxLength}
        className={textareaClasses}
        {...ariaAttributes}
        {...props}
      />
      
      {/* Contador de caracteres */}
      {characterCount && (
        <div className="absolute bottom-2 right-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {characterCount}
        </div>
      )}
    </div>
  );

  // Si no hay label, devolver solo el textarea
  if (!label) {
    return textareaElement;
  }

  // Renderizar con label
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={id}
        className="block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>
        )}
      </label>
      
      {textareaElement}
      
      {/* Mensajes de estado */}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <p className="text-sm" style={{ color: 'var(--success)' }}>
            {success}
          </p>
        </div>
      )}
      
      {warning && !error && !success && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--warning)' }}>
            {warning}
          </p>
        </div>
      )}
      
      {helpText && !error && !success && !warning && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}));

Textarea.displayName = 'Textarea';

/** =========================
 *   Componente TextareaField
 *  ========================= */
interface TextareaFieldProps extends Props {
  label: string;
  required?: boolean;
}

export const TextareaField = React.memo(forwardRef<HTMLTextAreaElement, TextareaFieldProps>(({
  label,
  required = false,
  ...textareaProps
}, ref) => {
  return (
    <Textarea
      ref={ref}
      label={label}
      required={required}
      {...textareaProps}
    />
  );
}));

TextareaField.displayName = 'TextareaField';

export default Textarea;
