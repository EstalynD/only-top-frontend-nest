"use client";
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import ModalHeader from './modal/ModalHeader';
import ModalBody from './modal/ModalBody';
import ModalFooter from './modal/ModalFooter';
import ModalBackdrop from './modal/ModalBackdrop';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerAlign?: 'left' | 'center' | 'right' | 'between';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  className?: string;
  description?: string;
  disableFocusTrap?: boolean; // Nueva prop para deshabilitar el focus trap
}

const maxWidthClasses = {
  sm: 'max-w-sm sm:max-w-md',
  md: 'max-w-sm sm:max-w-md md:max-w-lg', 
  lg: 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl',
  xl: 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
  '2xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl',
  '3xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-5xl',
  '4xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-5xl',
  '5xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-6xl',
  '6xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-6xl',
  '7xl': 'max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-7xl',
  full: 'max-w-full'
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  icon,
  maxWidth = '2xl',
  children,
  footer,
  footerAlign = 'right',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  isLoading = false,
  loadingComponent,
  className = "",
  description,
  disableFocusTrap = false
}: ModalProps) {
  const { theme } = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Solo usar focus trap si no está deshabilitado
  const focusTrapRef = useFocusTrap({ 
    isActive: isOpen && !disableFocusTrap, 
    onEscape: closeOnEscape ? onClose : undefined,
    initialFocus: false
  });

  // Manejo manual del Escape solo cuando el focus trap está deshabilitado
  React.useEffect(() => {
    if (!isOpen || !disableFocusTrap || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, { capture: true });
    return () => document.removeEventListener('keydown', handleEscape, { capture: true });
  }, [isOpen, disableFocusTrap, closeOnEscape, onClose]);

  // Usar el ref del focus trap o el ref manual
  const finalContainerRef = disableFocusTrap ? containerRef : focusTrapRef;

  // Prevenir scroll del body
  React.useEffect(() => {
    if (preventBodyScroll && isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventBodyScroll]);

  // Memoizar estilos para mejor performance
  const modalStyles = useMemo(() => {
    const baseStyles = `
      relative w-full ${maxWidthClasses[maxWidth]} 
      max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] 
      overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl
      transform transition-all duration-300
      mx-auto
    `;
    
    const themeStyles = theme === 'dark'
      ? 'bg-gray-900 border border-gray-700'
      : 'bg-white border border-gray-200';
    
    return `${baseStyles} ${themeStyles} ${className}`;
  }, [maxWidth, theme, className]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Animaciones optimizadas para cierre más suave
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.15
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      y: 10,
      transition: {
        duration: 0.15
      }
    }
  };

  // Crear portal al body
  const modalContent = (
    <AnimatePresence mode="wait" onExitComplete={() => {}}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 xl:p-8"
          onClick={handleBackdropClick}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <ModalBackdrop />
          
          <motion.div
            ref={finalContainerRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={modalStyles}
            onClick={handleModalClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? "modal-description" : undefined}
            tabIndex={-1}
          >
            <ModalHeader
              title={title}
              description={description}
              icon={icon}
              onClose={onClose}
              showCloseButton={showCloseButton}
            />

            <ModalBody
              hasFooter={!!footer}
              isLoading={isLoading}
              loadingComponent={loadingComponent}
            >
              {children}
            </ModalBody>

            {footer && (
              <ModalFooter align={footerAlign}>
                {footer}
              </ModalFooter>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Renderizar en portal
  return createPortal(modalContent, document.body);
}