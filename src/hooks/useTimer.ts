import { useState, useRef, useCallback } from 'react';

export function useTimer(initialSeconds = 60, onEnd) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          onEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onEnd]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds) => {
    stop();
    setTimeLeft(seconds ?? initialSeconds);
  }, [stop, initialSeconds]);

  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  return { timeLeft, isRunning, start, stop, reset, getElapsed };
}
