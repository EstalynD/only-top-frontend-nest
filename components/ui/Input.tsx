import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function Input({ label, className, id, ...props }: Props) {
  // useId debe llamarse siempre de forma incondicional
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="block mb-1 text-sm" style={{ color: 'var(--color-ot-white)' }}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`ot-input ${className ?? ''}`} {...props} />
    </div>
  );
}
