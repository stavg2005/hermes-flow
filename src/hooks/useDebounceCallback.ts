import { useCallback, useRef } from 'react';

export function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  // Use a ref to store the timeout ID across renders without triggering re-renders
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
