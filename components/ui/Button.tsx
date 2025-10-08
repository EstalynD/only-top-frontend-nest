import React from 'react';

type Variant = 'primary' | 'success' | 'danger' | 'neutral' | 'secondary' | 'ghost';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  full?: boolean;
  variant?: Variant;
};

export function Button({ className, full, variant = 'primary', style, ...props }: Props) {
  // Estilos por variante con fallback en hex para evitar transparencias
  const variantBackground: Record<Variant, string> = {
    primary: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
    success: 'linear-gradient(135deg, #10b981, #047857)', // verde sólido con fallback
    danger: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    neutral: 'linear-gradient(135deg, var(--surface-muted), var(--border))',
    secondary: 'linear-gradient(135deg, var(--surface), var(--border))',
    ghost: 'transparent',
  };

  const baseStyle: React.CSSProperties = {
    background: variantBackground[variant],
  };

  const mergedStyle: React.CSSProperties = { ...baseStyle, ...(style || {}) };

  return (
    <button
      className={`ot-button ${full ? 'w-full' : ''} ${className ?? ''}`}
      style={mergedStyle}
      {...props}
    />
  );
}
