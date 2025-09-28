import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { full?: boolean };

export function Button({ className, full, ...props }: Props) {
  return (
    <button className={`ot-button ${full ? 'w-full' : ''} ${className ?? ''}`} {...props} />
  );
}
