"use client";
import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

type Severity = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: Severity;
  icon?: React.ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  severity = 'warning',
  icon,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const Icon = icon ?? (severity === 'danger' ? <Trash2 size={20} style={{ color: '#ef4444' }} /> : severity === 'warning' ? <AlertTriangle size={20} style={{ color: '#f59e0b' }} /> : <Info size={20} style={{ color: 'var(--ot-blue-500)' }} />);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} icon={Icon} maxWidth="md">
      <div className="p-6 space-y-6">
        {description ? (
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {description}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {cancelLabel}
          </button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={severity === 'danger' ? 'danger' : 'primary'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {severity === 'danger' ? <Trash2 size={16} /> : <AlertTriangle size={16} />}
            <span>{loading ? 'Procesando…' : confirmLabel}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
