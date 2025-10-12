"use client";
import React, { useMemo, useState, useCallback } from 'react';
import { Palette, Check, AlertCircle } from 'lucide-react';

/** =========================
 *   Tipos
 *  ========================= */
type ColorPickerSize = 'sm' | 'md' | 'lg';

type ColorPickerVariant = 'default' | 'compact' | 'extended';

type Props = {
  // Identificación
  id?: string;
  name?: string;
  
  // Valor y estado
  value?: string;
  onChange?: (color: string) => void;
  
  // Apariencia
  size?: ColorPickerSize;
  variant?: ColorPickerVariant;
  className?: string;
  
  // Estados
  disabled?: boolean;
  required?: boolean;
  
  // Validación
  error?: string;
  success?: string;
  warning?: string;
  
  // Características
  showPreview?: boolean;
  showPalette?: boolean;
  showCustomInput?: boolean;
  paletteColors?: string[];
  maxColors?: number;
  
  // Accesibilidad
  label?: string;
  helpText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

/** =========================
 *   Configuraciones
 *  ========================= */
const sizeClasses: Record<ColorPickerSize, { picker: string; preview: string; palette: string }> = {
  sm: {
    picker: 'w-8 h-8',
    preview: 'w-10 h-10',
    palette: 'w-6 h-6'
  },
  md: {
    picker: 'w-10 h-10',
    preview: 'w-12 h-12',
    palette: 'w-8 h-8'
  },
  lg: {
    picker: 'w-12 h-12',
    preview: 'w-16 h-16',
    palette: 'w-10 h-10'
  },
};

// Paleta de colores por defecto
const DEFAULT_PALETTE = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E',
  '#84CC16', '#F59E0B', '#10B981', '#14B8A6', '#6366F1',
  '#A855F7', '#D946EF', '#F472B6', '#FB7185', '#94A3B8'
];

/** =========================
 *   Componente Principal
 *  ========================= */
export const ColorPicker = React.memo<Props>(({
  id,
  name,
  value = '#6B7280',
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
  required = false,
  error,
  success,
  warning,
  showPreview = true,
  showPalette = true,
  showCustomInput = true,
  paletteColors = DEFAULT_PALETTE,
  maxColors = 20,
  label,
  helpText,
  ariaLabel,
  ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  // Memoizar colores de la paleta
  const displayPalette = useMemo(() => {
    return paletteColors.slice(0, maxColors);
  }, [paletteColors, maxColors]);

  // Memoizar las clases CSS
  const pickerClasses = useMemo(() => {
    const baseClasses = 'rounded-lg border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200';
    const sizeClass = sizeClasses[size].picker;
    
    // Estados de validación
    let stateClasses = '';
    if (error) {
      stateClasses = 'border-red-500 focus:border-red-500 focus:ring-red-200';
    } else if (success) {
      stateClasses = 'border-green-500 focus:border-green-500 focus:ring-green-200';
    } else if (warning) {
      stateClasses = 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-200';
    } else {
      stateClasses = 'border-border hover:border-blue-400';
    }
    
    // Estados de interacción
    const interactionClasses = disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:scale-105';
    
    return `${baseClasses} ${sizeClass} ${stateClasses} ${interactionClasses} ${className}`.trim();
  }, [size, error, success, warning, disabled, className]);

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
  const handleColorSelect = useCallback((color: string) => {
    if (onChange && !disabled) {
      onChange(color);
      setCustomColor(color);
    }
  }, [onChange, disabled]);

  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (onChange && !disabled) {
      onChange(color);
    }
  }, [onChange, disabled]);

  const handlePaletteColorClick = useCallback((color: string) => {
    handleColorSelect(color);
    setIsOpen(false);
  }, [handleColorSelect]);

  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  // Renderizar preview del color
  const colorPreview = showPreview && (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size].preview} rounded-lg border-2 flex items-center justify-center`}
        style={{ 
          backgroundColor: value,
          borderColor: 'var(--border)'
        }}
      >
        <Palette size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Vista previa
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {value}
        </p>
      </div>
    </div>
  );

  // Renderizar paleta de colores
  const colorPalette = showPalette && (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Paleta de Colores
      </label>
      <div className="grid grid-cols-5 gap-2">
        {displayPalette.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePaletteColorClick(color)}
            className={`${sizeClasses[size].palette} rounded-lg border-2 transition-all hover:scale-105 ${
              value === color ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ 
              backgroundColor: color,
              borderColor: value === color ? 'var(--ot-blue-500)' : 'var(--border)'
            }}
            disabled={disabled}
            title={color}
          >
            {value === color && (
              <Check 
                size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} 
                className="text-white" 
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Renderizar input personalizado
  const customColorInput = showCustomInput && (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Color Personalizado
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className={`${sizeClasses[size].picker} rounded-lg border cursor-pointer`}
          style={{ borderColor: 'var(--border)' }}
          disabled={disabled}
          aria-label="Seleccionar color personalizado"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          onBlur={() => handleColorSelect(customColor)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleColorSelect(customColor);
            }
          }}
          placeholder="#6B7280"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-primary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          disabled={disabled}
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          aria-label="Código de color hexadecimal"
        />
      </div>
    </div>
  );

  // Renderizar picker compacto
  const compactPicker = variant === 'compact' && (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={handleCustomColorChange}
        className={pickerClasses}
        disabled={disabled}
        {...ariaAttributes}
      />
      {showPreview && (
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {value}
        </span>
      )}
    </div>
  );

  // Renderizar picker extendido
  const extendedPicker = variant === 'extended' && (
    <div className="space-y-4">
      {colorPreview}
      {colorPalette}
      {customColorInput}
    </div>
  );

  // Renderizar picker por defecto
  const defaultPicker = variant === 'default' && (
    <div className="space-y-3">
      {colorPreview}
      {colorPalette}
      {customColorInput}
    </div>
  );

  const pickerContent = compactPicker || extendedPicker || defaultPicker;

  // Si no hay label, devolver solo el picker
  if (!label) {
    return pickerContent;
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
      
      {pickerContent}
      
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
});

ColorPicker.displayName = 'ColorPicker';

/** =========================
 *   Componente ColorPickerField
 *  ========================= */
interface ColorPickerFieldProps extends Props {
  label: string;
  required?: boolean;
}

export const ColorPickerField = React.memo<ColorPickerFieldProps>(({
  label,
  required = false,
  ...colorPickerProps
}) => {
  return (
    <ColorPicker
      label={label}
      required={required}
      {...colorPickerProps}
    />
  );
});

ColorPickerField.displayName = 'ColorPickerField';

export default ColorPicker;