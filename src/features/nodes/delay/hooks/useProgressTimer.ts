import { useState,useRef,useEffect ,useCallback } from "react";


export const useProgressTimer = (isActive: boolean, duration: number) => {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current);
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(progressPercent);

      if (progressPercent < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  }, [duration]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      setProgress(0);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      setProgress(0);
      startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, updateProgress]);



  return { progress };
};