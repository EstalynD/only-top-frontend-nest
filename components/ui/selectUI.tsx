"use client";
import React from 'react';
import type { CSSProperties } from 'react';
import { ChevronDown, Check, X, Search, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
  clearable = false
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const selectRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (e.target !== searchInputRef.current) {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <div 
      ref={selectRef}
      className={`relative ot-select ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 rounded-lg border transition-colors
          ${sizeClasses[size]}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-[var(--ot-blue-600)] focus:outline-none focus:border-[var(--ot-blue-600)]'
          }
          ${isOpen ? 'border-[var(--ot-blue-600)]' : 'border-[var(--border)]'}
        `}
        style={{
          background: 'var(--ot-select-bg, var(--input-bg))',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)'
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <span className="truncate flex-1 text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="flex items-center gap-1">
          {clearable && value && !disabled && (
            <div
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-[var(--surface-muted)] transition-colors"
            >
              <X size={iconSizes[size] - 4} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <ChevronDown 
            size={iconSizes[size]} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-lg border overflow-hidden ot-select__panel"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--ot-select-panel, var(--surface))',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {options.length > 5 && (
            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <Search 
                  size={16} 
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border transition-colors focus:outline-none focus:border-[var(--ot-blue-600)]"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--ot-select-input, var(--input-bg))',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}

          <div 
            className="max-h-60 overflow-y-auto"
            role="listbox"
            style={{ background: 'var(--ot-select-panel, var(--surface))' }}
          >
            {filteredOptions.length === 0 ? (
              <div 
                className="px-4 py-6 text-sm text-center flex flex-col items-center gap-2"
                style={{ color: 'var(--text-muted)' }}
              >
                <Search size={20} />
                <span>No se encontraron opciones</span>
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors
                    ${option.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-[var(--ot-select-hover, var(--surface-muted))] cursor-pointer'
                    }
                  `}
                  style={{
                    color: option.disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                    background: value === option.value ? 'var(--ot-select-hover, var(--surface-muted))' : undefined,
                    boxShadow: value === option.value ? 'inset 2px 0 0 var(--ot-blue-600)' : undefined
                  }}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check 
                      size={iconSizes[size]} 
                      style={{ color: 'var(--ot-blue-600)' }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectFieldProps extends SelectProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export function SelectField({
  label,
  required = false,
  error,
  helpText,
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label 
        className="block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>
        )}
      </label>
      
      <Select {...selectProps} />
      
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        </div>
      )}
      
      {helpText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}

export default function SelectDemo() {
  const [value1, setValue1] = React.useState('');
  const [value2, setValue2] = React.useState('2');
  const [value3, setValue3] = React.useState('');

  const simpleOptions: SelectOption[] = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
    { value: '4', label: 'Opción 4', disabled: true },
  ];

  const countryOptions: SelectOption[] = [
    { value: 'pe', label: 'Perú' },
    { value: 'ar', label: 'Argentina' },
    { value: 'br', label: 'Brasil' },
    { value: 'mx', label: 'México' },
    { value: 'co', label: 'Colombia' },
    { value: 'cl', label: 'Chile' },
    { value: 'es', label: 'España' },
    { value: 'us', label: 'Estados Unidos' },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <style>{`
        :root {
          --background: #f9fafb;
          --surface: #ffffff;
          --input-bg: #ffffff;
          --border: #e5e7eb;
          --text-muted: #6b7280;
          --ot-black: #18181b;
          --ot-blue-600: #1c3fb8;
          --ot-blue-700: #1e338a;
          --danger: #dc2626;
        }
      `}</style>
      
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--ot-black)' }}>
            Select Component
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Componente select con búsqueda y limpieza
          </p>
        </div>

        <div className="space-y-6">
          <SelectField
            label="Select Simple"
            value={value1}
            onChange={setValue1}
            options={simpleOptions}
            placeholder="Selecciona una opción"
            clearable
            helpText="Puedes limpiar la selección"
          />

          <SelectField
            label="Select con Valor"
            value={value2}
            onChange={setValue2}
            options={simpleOptions}
            required
            clearable
          />

          <SelectField
            label="Select con Búsqueda"
            value={value3}
            onChange={setValue3}
            options={countryOptions}
            placeholder="Selecciona un país"
            clearable
          />

          <SelectField
            label="Select Deshabilitado"
            value="2"
            onChange={() => {}}
            options={simpleOptions}
            disabled
          />

          <SelectField
            label="Select con Error"
            value=""
            onChange={() => {}}
            options={simpleOptions}
            required
            error="Este campo es obligatorio"
          />

          <div className="grid grid-cols-3 gap-4">
            <SelectField
              label="Pequeño"
              value={value1}
              onChange={setValue1}
              options={simpleOptions}
              size="sm"
            />
            <SelectField
              label="Mediano"
              value={value1}
              onChange={setValue1}
              options={simpleOptions}
              size="md"
            />
            <SelectField
              label="Grande"
              value={value1}
              onChange={setValue1}
              options={simpleOptions}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}