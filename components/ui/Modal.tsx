"use client";
import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  maxWidth = 'max-w-2xl',
  children 
}: ModalProps) {
  const { theme } = useTheme();
  const overlayStyle: React.CSSProperties = {
    background: theme === 'dark' ? '#080b18' : '#0f172a',
  };

  const panelStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: `1px solid var(--border)`
  };

  const headerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)'
  };

  const headingStyle: React.CSSProperties = {
    color: 'var(--text-primary)'
  };

  const bodyStyle: React.CSSProperties = {
    background: 'var(--surface)',
    color: 'var(--text-primary)'
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={overlayStyle}
    >
      <div 
        className={`w-full ${maxWidth} rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}
        style={panelStyle}
      >
        <div 
          className="flex items-center justify-between p-4 sm:p-6 border-b"
          style={headerStyle}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {icon}
            <h2
              className="text-base sm:text-lg font-semibold truncate"
              style={headingStyle}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-muted)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-120px)]"
          style={bodyStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
