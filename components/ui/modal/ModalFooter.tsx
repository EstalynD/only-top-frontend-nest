"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export default function ModalFooter({ 
  children, 
  className = "",
  align = 'right'
}: ModalFooterProps) {
  const { theme } = useTheme();

  const getAlignmentClass = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      case 'right':
      default:
        return 'justify-end';
    }
  };

  const footerStyles = `
    px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 border-t
    ${theme === 'dark' 
      ? 'border-gray-700 bg-gray-800/50' 
      : 'border-gray-200 bg-gray-50/50'
    }
    ${className}
  `;

  const contentStyles = `
    flex items-center gap-2 sm:gap-3 ${getAlignmentClass()}
    flex-wrap sm:flex-nowrap
  `;

  return (
    <div className={footerStyles}>
      <div className={contentStyles}>
        {children}
      </div>
    </div>
  );
}
