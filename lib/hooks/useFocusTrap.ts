import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean; // Nueva opción para controlar el foco inicial
}

export function useFocusTrap({ isActive, onEscape, initialFocus = true }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const hasInitialFocus = useRef(false);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Guardar el elemento activo antes de abrir el modal
    previousActiveElement.current = document.activeElement;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Solo enfocar el primer elemento si se solicita y no se ha hecho antes
    if (initialFocus && firstElement && !hasInitialFocus.current) {
      // Usar setTimeout para evitar conflictos con otros manejadores de foco
      setTimeout(() => {
        if (containerRef.current && document.activeElement !== firstElement) {
          firstElement.focus();
        }
      }, 0);
      hasInitialFocus.current = true;
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        event.stopPropagation();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Restaurar el foco al elemento anterior
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
      
      // Reset del flag de foco inicial
      hasInitialFocus.current = false;
    };
  }, [isActive, onEscape, initialFocus]);

  return containerRef;
}
