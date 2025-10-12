"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';

interface ModalBodyProps {
  children: React.ReactNode;
  hasFooter?: boolean;
  className?: string;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

export default function ModalBody({ 
  children, 
  hasFooter = false,
  className = "",
  isLoading = false,
  loadingComponent
}: ModalBodyProps) {
  const { theme } = useTheme();

  const bodyStyles = `
    overflow-y-auto overscroll-contain
    ${hasFooter 
      ? 'max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-160px)] lg:max-h-[calc(85vh-180px)]' 
      : 'max-h-[calc(95vh-70px)] sm:max-h-[calc(90vh-90px)] lg:max-h-[calc(85vh-110px)]'
    }
    ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
    ${className}
  `;

  const contentStyles = `
    p-3 sm:p-4 lg:p-6 xl:p-8
    ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
  `;

  if (isLoading) {
    return (
      <div className={bodyStyles}>
        <div className={contentStyles}>
          {loadingComponent || (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={bodyStyles}>
      <div className={contentStyles}>
        {children}
      </div>
    </div>
  );
}
