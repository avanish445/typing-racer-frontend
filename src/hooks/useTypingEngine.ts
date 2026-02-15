import { useState, useCallback, useRef } from 'react';
import { calculateWPM, calculateAccuracy } from '../utils/wpmCalculator';

export function useTypingEngine(passage) {
  const [charIndex, setCharIndex] = useState(0);
  const [typed, setTyped] = useState([]);
  const [errors, setErrors] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpmTimeline, setWpmTimeline] = useState([]);
  const startTimeRef = useRef(null);
  const timelineIntervalRef = useRef(null);

  const text = passage?.text || '';

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    timelineIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTyped(current => {
        const correctCount = current.filter(c => c.correct).length;
        const currentWpm = calculateWPM(correctCount, elapsed);
        setWpmTimeline(prev => [...prev, { time: Math.round(elapsed), wpm: currentWpm }]);
        return current;
      });
    }, 1000);
  }, []);

  const stopTracking = useCallback(() => {
    if (timelineIntervalRef.current) {
      clearInterval(timelineIntervalRef.current);
      timelineIntervalRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (isComplete || !text) return;
    if (!startTimeRef.current) startTracking();

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (charIndex > 0) {
        setCharIndex(prev => prev - 1);
        setTyped(prev => prev.slice(0, -1));
      }
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    const isCorrect = e.key === text[charIndex];
    const newTyped = [...typed, { char: e.key, correct: isCorrect }];

    if (!isCorrect) {
      setErrors(prev => prev + 1);
    }

    setTyped(newTyped);
    setCharIndex(prev => prev + 1);

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const correctCount = newTyped.filter(c => c.correct).length;
    setWpm(calculateWPM(correctCount, elapsed));
    setAccuracy(calculateAccuracy(correctCount, newTyped.length));

    if (charIndex + 1 >= text.length) {
      setIsComplete(true);
      stopTracking();
    }
  }, [charIndex, isComplete, text, typed, startTracking, stopTracking]);

  const reset = useCallback(() => {
    setCharIndex(0);
    setTyped([]);
    setErrors(0);
    setIsComplete(false);
    setWpm(0);
    setAccuracy(100);
    setWpmTimeline([]);
    startTimeRef.current = null;
    stopTracking();
  }, [stopTracking]);

  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  const progress = text ? Math.round((charIndex / text.length) * 100) : 0;

  return {
    charIndex,
    typed,
    errors,
    isComplete,
    wpm,
    accuracy,
    wpmTimeline,
    progress,
    handleKeyDown,
    reset,
    getElapsedTime,
  };
}
