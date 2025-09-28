import React from 'react';

export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`ot-card ${className ?? ''}`}>{children}</div>;
}
