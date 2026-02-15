import { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  onComplete?: () => void;
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(() => onComplete?.(), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-center">
        <div
          key={count}
          className="animate-[ping_0.5s_ease-out] text-9xl font-extrabold text-white"
        >
          {count === 0 ? 'GO!' : count}
        </div>
        <p className="text-white/70 text-xl mt-4">Get ready to type...</p>
      </div>
    </div>
  );
}
