import { useState, useEffect, useCallback } from 'react';

interface UseModalOptions {
  preventBodyScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

export function useModal(options: UseModalOptions = {}) {
  const {
    preventBodyScroll = true,
    closeOnEscape = true,
    closeOnBackdropClick = true
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    // La animación se maneja automáticamente por Framer Motion
    setIsAnimating(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsAnimating(false);
    // Cierre inmediato - Framer Motion maneja las animaciones
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Prevenir scroll del body
  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventBodyScroll]);

  // El manejo de Escape se delega al useFocusTrap para evitar duplicación

  return {
    isOpen,
    isAnimating,
    openModal,
    closeModal,
    toggleModal
  };
}
