"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modeloName: string;
  loading?: boolean;
};

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  modeloName,
  loading = false 
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md rounded-xl shadow-2xl transition-all duration-200"
          style={{ background: 'var(--surface)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#fee2e2' }}
              >
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Confirmar Eliminación
              </h3>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              icon={<X size={18} />}
              disabled={loading}
              style={{
                border: '1px solid var(--border)',
                padding: '0.375rem'
              }}
              ariaLabel="Cerrar modal"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ¿Estás seguro de que deseas marcar como <strong style={{ color: 'var(--text-primary)' }}>terminada</strong> a{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{modeloName}</strong>?
            </p>
            <div className="mt-4 p-3 rounded-lg" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
              <p className="text-xs" style={{ color: '#78350f' }}>
                ⚠️ Esta acción cambiará el estado de la modelo a "TERMINADA". La modelo no será eliminada del sistema,
                pero ya no aparecerá en las listas activas.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="neutral"
              size="md"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant="danger"
              size="md"
              loading={loading}
              loadingText="Eliminando..."
            >
              Sí, marcar como terminada
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

