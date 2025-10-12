"use client";
import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger',
  isLoading = false,
  icon
}: ConfirmationModalProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const defaultIcon = variant === 'danger' ? <Trash2 size={20} /> : <AlertTriangle size={20} />;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className={`fixed inset-0 backdrop-blur-sm transition-opacity ${
          theme === 'dark' ? 'bg-black/60' : 'bg-black/50'
        }`} />
        
        {/* Modal */}
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl shadow-2xl transition-all ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <div className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>
                  {icon || defaultIcon}
                </div>
              </div>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`transition-colors disabled:opacity-50 ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className={`text-sm leading-relaxed mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {message}
            </p>

            {/* Warning */}
            {variant === 'danger' && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-red-200' : 'text-red-800'
                  }`}>
                    Acción irreversible
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-600'
                  }`}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border ${
                  theme === 'dark'
                    ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:ring-gray-500'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
                }`}
              >
                {cancelText}
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
