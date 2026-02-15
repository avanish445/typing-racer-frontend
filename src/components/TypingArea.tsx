import { useEffect, useRef } from 'react';
import type { Passage, TypedChar } from '../types';

interface TypingAreaProps {
  passage: Passage | null;
  typed: TypedChar[];
  charIndex: number;
  disabled: boolean;
}

export default function TypingArea({ passage, typed, charIndex, disabled }: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!disabled && containerRef.current) {
      containerRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [charIndex]);

  if (!passage) return null;

  const text = passage.text;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative p-6 rounded-2xl border-2 transition-colors focus:outline-none ${
        disabled
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          : 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-lg'
      }`}
    >
      <div className="text-lg md:text-xl leading-relaxed font-mono tracking-wide select-none">
        {text.split('').map((char, i) => {
          let className = 'text-gray-400 dark:text-gray-500';
          if (i < charIndex) {
            className = typed[i]?.correct
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 underline decoration-red-400';
          } else if (i === charIndex) {
            className = 'text-gray-900 dark:text-white';
          }

          return (
            <span
              key={i}
              ref={i === charIndex ? cursorRef : null}
              className={`${className} ${i === charIndex && !disabled ? 'border-l-2 border-amber-500 animate-pulse' : ''}`}
            >
              {char}
            </span>
          );
        })}
      </div>
      {disabled && charIndex === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Waiting for game to start...
          </p>
        </div>
      )}
    </div>
  );
}
