"use client";
import React from 'react';
import type { CSSProperties } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md'
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const selectRef = React.useRef<HTMLDivElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
        }
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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  const dropdownStyle: CSSProperties = {
    borderColor: 'var(--border)',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-lg)'
  };

  const searchContainerStyle: CSSProperties = {
    borderColor: 'var(--border)',
    background: 'var(--surface)'
  };

  const searchInputStyle: CSSProperties = {
    borderColor: 'var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)'
  };

  const optionsWrapperStyle: CSSProperties = {
    background: 'var(--surface)'
  };

  const emptyStateStyle: CSSProperties = {
    color: 'var(--text-muted)'
  };

  return (
    <div 
      ref={selectRef}
      className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 rounded-lg border transition-all duration-200
          ${sizeClasses[size]}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        style={{
          borderColor: disabled ? 'var(--border-muted)' : 'var(--border)',
          background: disabled ? 'var(--surface-muted)' : 'var(--surface)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)'
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={iconSizes[size]} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-lg border"
          style={dropdownStyle}
        >
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-2 border-b" style={searchContainerStyle}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-2 py-1 text-sm rounded border transition-colors focus:ring-2 focus:ring-blue-500"
                style={searchInputStyle}
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div 
            className="max-h-60 overflow-y-auto"
            role="listbox"
            style={optionsWrapperStyle}
          >
            {filteredOptions.length === 0 ? (
              <div 
                className="px-3 py-2 text-sm text-center"
                style={emptyStateStyle}
              >
                No se encontraron opciones
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
                    ${sizeClasses[size]}
                    ${option.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    }
                    ${value === option.value ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  `}
                  style={{
                    color: option.disabled ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check 
                      size={iconSizes[size]} 
                      style={{ color: 'var(--ot-blue-500)' }}
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

// Select with label wrapper
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
    <div className="space-y-2">
      <label 
        className="block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Select {...selectProps} />
      
      {error && (
        <p className="text-sm text-red-600" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}
