import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/roomService';
import PlayerCard from '../components/PlayerCard';
import RoomSettings from '../components/RoomSettings';
import type { Player, RoomSettings as RoomSettingsType } from '../types';

export default function RoomLobby() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<RoomSettingsType>({
    difficulty: 'medium',
    duration: 60,
    category: 'common',
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const abortController = new AbortController();
    let cancelled = false;
    roomService
      .getRoom(code, abortController.signal)
      .then((room) => {
        if (!cancelled) {
          setSettings(room.settings);
          setPlayers(room.players || []);
        }
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || cancelled) return;
        // Room doesn't exist yet, initialize with current user
        setPlayers([
          {
            userId: user?._id || '',
            username: user?.username || 'You',
            ready: false,
            stats: user?.stats,
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [code]);

  const isHost = players[0]?.userId === user?._id;
  const allReady = players.length > 0 && players.every(p => p.ready);
  const canStart = isHost && allReady && players.length >= 1;

  const toggleReady = () => {
    setIsReady(!isReady);
    setPlayers(prev =>
      prev.map(p =>
        p.userId === user?._id ? { ...p, ready: !p.ready } : p
      )
    );
    // TODO: Emit ready state via WebSocket
  };

  const handleStart = () => {
    navigate(`/room/${code}/game`, {
      state: { settings, players },
    });
  };

  const handleSettingsChange = async (newSettings: RoomSettingsType) => {
    setSettings(newSettings);
    if (code && isHost) {
      try {
        await roomService.updateSettings(code, newSettings);
      } catch {
        // Settings update failed silently
      }
    }
  };

  const handleLeave = async () => {
    if (code) {
      try {
        await roomService.leave(code);
      } catch {
        // Leave failed silently
      }
    }
    navigate('/dashboard');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code || '');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Room Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Room Lobby</h1>
          <p className="text-gray-600 dark:text-gray-400">Waiting for players to join...</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-500 dark:text-gray-400">Room Code:</span>
            <span className="font-mono font-bold text-lg text-indigo-600 tracking-wider">{code}</span>
          </div>
          <button
            onClick={copyCode}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy room code"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Settings – first so host sets race before checking players */}
        <div className="lg:col-span-1 lg:order-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <RoomSettings
              settings={settings}
              onChange={handleSettingsChange}
              disabled={!isHost}
            />
          </div>

          <button
            onClick={handleLeave}
            className="w-full mt-4 py-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 font-medium rounded-lg transition-colors"
          >
            Leave Room
          </button>
        </div>

        {/* Players List */}
        <div className="lg:col-span-2 lg:order-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Players ({players.length}/4)
              </h2>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < players.length ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {players.map(player => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  isHost={player.userId === players[0]?.userId}
                  isCurrentUser={player.userId === user?._id}
                />
              ))}
              {/* Empty slots */}
              {Array.from({ length: 4 - players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400"
                >
                  <span className="text-sm">Waiting for player...</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={toggleReady}
                className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                  isReady
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {isReady ? 'Ready!' : 'Click to Ready Up'}
              </button>
              {isHost && (
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
