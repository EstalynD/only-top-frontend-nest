"use client";
import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ModalHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export default function ModalHeader({ 
  title, 
  description,
  icon, 
  onClose, 
  showCloseButton = true,
  className = ""
}: ModalHeaderProps) {
  const { theme } = useTheme();

  const headerStyles = `
    flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 border-b
    ${theme === 'dark' 
      ? 'border-gray-700 bg-gray-800/50' 
      : 'border-gray-200 bg-gray-50/50'
    }
    ${className}
  `;

  const titleStyles = `
    text-base sm:text-lg lg:text-xl font-semibold truncate
    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
  `;

  const closeButtonStyles = `
    p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
    touch-manipulation
    ${theme === 'dark' 
      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-600' 
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200'
    }
  `;

  return (
    <div className={headerStyles}>
      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 mt-0.5 sm:mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 
            id="modal-title"
            className={titleStyles}
          >
            {title}
          </h2>
          {description && (
            <p 
              id="modal-description"
              className={`text-xs sm:text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      
      {showCloseButton && (
        <button
          onClick={onClose}
          className={closeButtonStyles}
          aria-label="Cerrar modal"
          type="button"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
