import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useTimer } from '../hooks/useTimer';
import TypingArea from '../components/TypingArea';
import ProgressBar from '../components/ProgressBar';
import CountdownOverlay from '../components/CountdownOverlay';
import WPMChart from '../components/WPMChart';
import { getRandomPassage } from '../utils/samplePassages';
import { formatTime } from '../utils/formatters';
import type { Passage, Player } from '../types';

export default function Game() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = (location.state as any)?.settings || { difficulty: 'medium', duration: 60 };
  const initialPlayers: Player[] = (location.state as any)?.players || [];

  const [showCountdown, setShowCountdown] = useState(true);
  const [passage] = useState<Passage>(() => getRandomPassage(settings.difficulty));
  const [gameStarted, setGameStarted] = useState(false);
  const [opponents, setOpponents] = useState<{ userId: string; username: string; progress: number; wpm: number }[]>(
    initialPlayers
      .filter((p: Player) => p.userId !== user?._id)
      .map((p: Player) => ({ userId: p.userId, username: p.username, progress: 0, wpm: 0 }))
  );

  const typingEngine = useTypingEngine(passage);
  const typingEngineRef = useRef(typingEngine);
  typingEngineRef.current = typingEngine;

  const handleGameEnd = useCallback(() => {
    const engine = typingEngineRef.current;
    const duration = settings.duration ?? 60;
    const time =
      engine?.isComplete
        ? Math.round(engine.getElapsedTime?.() ?? 0)
        : duration;
    navigate(`/room/${code}/results`, {
      state: {
        results: [
          {
            userId: user?._id,
            username: user?.username,
            wpm: engine?.wpm ?? 0,
            rawWpm: engine?.wpm ?? 0,
            accuracy: engine?.accuracy ?? 0,
            errors: engine?.errors ?? 0,
            time,
            rank: 1,
            wpmTimeline: engine?.wpmTimeline ?? [],
            status: engine?.isComplete ? 'FINISHED' : 'DNF',
          },
        ],
      },
    });
  }, [code, navigate, user, settings.duration]);

  const { timeLeft, isRunning, start: startTimer, stop: stopTimer } = useTimer(settings.duration, handleGameEnd);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGameStarted(true);
    startTimer();
  };

  // TODO: Replace with WebSocket-based opponent progress updates
  // Socket should emit opponent progress events that update the opponents state

  // Handle typing
  useEffect(() => {
    if (!gameStarted || typingEngine.isComplete) return;
    const handler = (e: KeyboardEvent) => typingEngine.handleKeyDown(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameStarted, typingEngine.isComplete, typingEngine.handleKeyDown]);

  // Auto-navigate to results when complete
  useEffect(() => {
    if (typingEngine.isComplete) {
      stopTimer();
      setTimeout(handleGameEnd, 1500);
    }
  }, [typingEngine.isComplete, stopTimer, handleGameEnd]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}

      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Room <span className="text-indigo-600 font-mono">{code}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {settings.difficulty} difficulty
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-indigo-600">{typingEngine.wpm}</p>
          <p className="text-sm text-gray-500">WPM</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className={`text-3xl font-bold ${typingEngine.accuracy >= 95 ? 'text-green-600' : typingEngine.accuracy >= 85 ? 'text-amber-600' : 'text-red-600'}`}>
            {typingEngine.accuracy}%
          </p>
          <p className="text-sm text-gray-500">Accuracy</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-purple-600">{typingEngine.progress}%</p>
          <p className="text-sm text-gray-500">Progress</p>
        </div>
      </div>

      {/* Typing Area */}
      <div className="mb-6">
        <TypingArea
          passage={passage}
          typed={typingEngine.typed}
          charIndex={typingEngine.charIndex}
          disabled={!gameStarted || typingEngine.isComplete}
        />
      </div>

      {/* Progress Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Race Progress</h3>
        <ProgressBar
          username={user?.username || 'You'}
          progress={typingEngine.progress}
          wpm={typingEngine.wpm}
          isCurrentUser={true}
          rank={0}
        />
        {opponents.map((opp, i) => (
          <ProgressBar
            key={opp.userId}
            username={opp.username}
            progress={Math.round(opp.progress)}
            wpm={opp.wpm}
            isCurrentUser={false}
            rank={i + 1}
          />
        ))}
      </div>

      {/* Live WPM Chart */}
      {typingEngine.wpmTimeline.length > 1 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <WPMChart data={typingEngine.wpmTimeline} title="Your WPM (Live)" />
        </div>
      )}
    </div>
  );
}
