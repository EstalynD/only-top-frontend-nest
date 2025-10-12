import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyModalOptions {
  delay?: number;
  preload?: boolean;
}

export function useLazyModal(options: UseLazyModalOptions = {}) {
  const { delay = 0, preload = false } = options;
  const [isLoaded, setIsLoaded] = useState(preload);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadContent = useCallback(() => {
    if (isLoaded) return Promise.resolve();

    setIsLoading(true);
    
    return new Promise<void>((resolve) => {
      timeoutRef.current = setTimeout(() => {
        setIsLoaded(true);
        setIsLoading(false);
        resolve();
      }, delay);
    });
  }, [delay, isLoaded]);

  const reset = useCallback(() => {
    setIsLoaded(preload);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [preload]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoaded,
    isLoading,
    loadContent,
    reset
  };
}
