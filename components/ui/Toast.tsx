"use client";
import React from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type ToastColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export type ToastOptions = {
  id?: string;
  type?: ToastType;
  color?: ToastColor;
  title?: string;
  description?: string;
  duration?: number; // ms
};

type ToastItem = Required<Pick<ToastOptions, 'id'>> & Omit<ToastOptions, 'id'> & { duration: number; color: ToastColor };

type ToastContextType = {
  toast: (opts: ToastOptions) => string; // returns id
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// API global opcional estilo `addToast()`
let _enqueueGlobal: ((opts: ToastOptions) => string) | null = null;
const _bufferQueue: ToastOptions[] = [];
export function addToast(opts: ToastOptions) {
  if (_enqueueGlobal) return _enqueueGlobal(opts);
  _bufferQueue.push(opts);
  return opts.id ?? Math.random().toString(36).slice(2, 10);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((opts: ToastOptions) => {
    const id = opts.id ?? uid();
    const item: ToastItem = {
      id,
      type: (opts.type ?? 'info') as ToastType,
      color: (opts.color ?? mapTypeToColor(opts.type)) as ToastColor,
      title: opts.title ?? '',
      description: opts.description ?? '',
      duration: typeof opts.duration === 'number' ? opts.duration : 4000,
    };
    setToasts((prev) => [item, ...prev].slice(0, 6));
    if (item.duration > 0) {
      window.setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, [dismiss]);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  // Conectar API global
  useConnectGlobal(toast);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  const [closing, setClosing] = React.useState<Set<string>>(new Set());

  const requestClose = React.useCallback((id: string) => {
    setClosing((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      onDismiss(id);
      setClosing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 180);
  }, [onDismiss]);

  return (
    <div
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
      className="fixed z-50 top-4 left-1/2 -translate-x-1/2 flex flex-col gap-3 w-[min(92vw,40rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} isClosing={closing.has(t.id)} onClose={() => requestClose(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onClose, isClosing = false }: { toast: ToastItem; onClose: () => void; isClosing?: boolean }) {
  const { color, title, description } = toast;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Estilo tipo HeroUI (variant flat) con colores sólidos suaves
  const palette: Record<ToastColor, { bg: string; border: string; text: string; subtext: string }> = {
    default: { bg: '#111827', border: '#374151', text: '#ffffff', subtext: 'rgba(255,255,255,0.85)' },
    primary: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', subtext: '#1f2937' },
    secondary: { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95', subtext: '#1f2937' },
    success: { bg: '#d1fae5', border: '#10b981', text: '#064e3b', subtext: '#1f2937' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', subtext: '#1f2937' },
    danger: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d', subtext: '#1f2937' },
  };

  const p = palette[color];

  const visible = mounted && !isClosing;
  const cardClasses = `rounded-xl shadow-lg border overflow-hidden pointer-events-auto transition-all duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`;

  return (
    <div
      role="status"
      className={cardClasses}
      style={{ background: p.bg, borderColor: p.border }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="w-1.5 h-6 rounded" style={{ background: p.border, marginTop: 2 }} />
        <div className="flex-1 min-w-0">
          {title ? (
            <p className="text-sm font-semibold truncate" style={{ color: p.text }}>{title}</p>
          ) : null}
          {description ? (
            <p className="text-xs mt-0.5" style={{ color: p.subtext }}>{description}</p>
          ) : null}
        </div>
        <button
          aria-label="Cerrar notificación"
          onClick={onClose}
          className="p-1.5 rounded-md"
          style={{ border: `1px solid ${p.border}`, color: p.text, background: 'transparent' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function mapTypeToColor(t?: ToastType): ToastColor {
  switch (t) {
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'info':
    default:
      return 'primary';
  }
}

// Conectar API global al provider
function useConnectGlobal(toastFn: (opts: ToastOptions) => string) {
  React.useEffect(() => {
    _enqueueGlobal = toastFn;
    // drenar cola en espera
    if (_bufferQueue.length) {
      _bufferQueue.splice(0).forEach((opts) => toastFn(opts));
    }
    return () => {
      _enqueueGlobal = null;
    };
  }, [toastFn]);
}
