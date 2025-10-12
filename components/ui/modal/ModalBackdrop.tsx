"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';

interface ModalBackdropProps {
  onClick?: () => void;
  className?: string;
}

export default function ModalBackdrop({ 
  onClick, 
  className = ""
}: ModalBackdropProps) {
  const { theme } = useTheme();

  const backdropStyles = `
    fixed inset-0 backdrop-blur-md transition-all duration-150 ease-out
    ${theme === 'dark' ? 'bg-black/70' : 'bg-black/60'}
    ${className}
  `;

  return (
    <div 
      className={backdropStyles}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
