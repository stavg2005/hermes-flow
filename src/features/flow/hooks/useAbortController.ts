import { useRef, useCallback } from 'react';

export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const createController = useCallback((): AbortController => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const cleanup = useCallback(() => {
    abortControllerRef.current = null;
  }, []);

  return {
    createController,
    abort,
    cleanup,
    current: abortControllerRef.current,
  };
};
