import React from 'react';

export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`ot-card ${className ?? ''}`}>{children}</div>;
}

export function CardSection({ title, description, children, className }: React.PropsWithChildren<{ title?: string; description?: string; className?: string }>) {
  return (
    <Card className={className}>
      {(title || description) ? (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {title ? <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3> : null}
          {description ? <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p> : null}
        </div>
      ) : null}
      <div className="p-4">
        {children}
      </div>
    </Card>
  );
}
