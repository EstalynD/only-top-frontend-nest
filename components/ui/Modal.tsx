"use client";
import React from 'react';
import { X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div 
        className={`w-full ${maxWidth} rounded-xl shadow-2xl max-h-[90vh] overflow-hidden`}
        style={{ background: 'var(--surface)' }}
      >
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
