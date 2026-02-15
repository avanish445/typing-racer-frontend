import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { generateRoomCode } from '../utils/formatters';

interface RecentMatch {
  id: string;
  date: string;
  opponents: string[];
  wpm: number;
  accuracy: number;
  rank: number;
}

/** Normalize API stats (camelCase or snake_case) and merge into UserStats shape */
function normalizeStats(raw: unknown): {
  totalMatches: number;
  bestWPM: number;
  avgWPM: number;
  avgAccuracy: number;
  totalTimeTyped: number;
} {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    totalMatches: Number(o.totalMatches ?? o.total_matches ?? 0),
    bestWPM: Number(o.bestWPM ?? o.best_wpm ?? 0),
    avgWPM: Number(o.avgWPM ?? o.avg_wpm ?? 0),
    avgAccuracy: Number(o.avgAccuracy ?? o.avg_accuracy ?? 0),
    totalTimeTyped: Number(o.totalTimeTyped ?? o.total_time_typed ?? 0),
  };
}

/** Derive best WPM, avg WPM, avg accuracy from match list when API stats are missing/zero */
function deriveStatsFromMatches(matches: RecentMatch[]): { bestWPM: number; avgWPM: number; avgAccuracy: number } {
  if (!matches.length) return { bestWPM: 0, avgWPM: 0, avgAccuracy: 0 };
  const wpms = matches.map((m) => m.wpm).filter((n) => typeof n === 'number');
  const accs = matches.map((m) => m.accuracy).filter((n) => typeof n === 'number');
  const sum = (a: number[]): number => a.reduce((s, x) => s + x, 0);
  return {
    bestWPM: wpms.length ? Math.max(...wpms) : 0,
    avgWPM: wpms.length ? Math.round(sum(wpms) / wpms.length) : 0,
    avgAccuracy: accs.length ? Math.round(sum(accs) / accs.length) : 0,
  };
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const statsFetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;
    userService
      .getMatchHistory(user._id, 1)
      .then((data) => setRecentMatches(data.matches || []))
      .catch(() => setRecentMatches([]))
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    if (statsFetchedForRef.current === user._id) return;
    statsFetchedForRef.current = user._id;
    userService
      .getStats(user._id)
      .then((data) => {
        const raw = data && typeof data === 'object' ? (data as Record<string, unknown>).stats ?? data : data;
        if (raw != null) updateUser({ stats: normalizeStats(raw) });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps -- updateUser changes each render and causes infinite fetch; ref limits to one per user
  }, [user?._id]);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    navigate(`/room/${code}`);
  };

  const handleJoinRoom = () => {
    if (joinCode.trim().length === 6) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  const derived = deriveStatsFromMatches(recentMatches);
  const bestWPM = user?.stats?.bestWPM || derived.bestWPM;
  const avgWPM = user?.stats?.avgWPM || derived.avgWPM;
  const avgAccuracy = user?.stats?.avgAccuracy ?? derived.avgAccuracy;
  const totalMatches = user?.stats?.totalMatches ?? recentMatches.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, <span className="text-indigo-600">{user?.username}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Ready for another race?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Best WPM', value: bestWPM, icon: '🏆', color: 'text-amber-600' },
          { label: 'Avg WPM', value: avgWPM, icon: '⚡', color: 'text-indigo-600' },
          { label: 'Accuracy', value: `${avgAccuracy}%`, icon: '🎯', color: 'text-green-600' },
          { label: 'Matches', value: totalMatches, icon: '🏁', color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Create Room */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Create a Room</h2>
          <p className="text-indigo-100 mb-6">
            Start a new race and invite friends with a unique room code.
          </p>
          <button
            onClick={handleCreateRoom}
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Create Room
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Join a Room</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter a 6-character room code to join an existing race.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCD12"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-lg tracking-widest text-center uppercase placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={joinCode.length !== 6}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Matches</h2>
          <button
            onClick={() => navigate(`/profile/${user?._id}`)}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading matches...</div>
          ) : recentMatches.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No matches yet. Start a race!</div>
          ) : (
            recentMatches.map(match => (
              <div key={match.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${match.rank === 1 ? 'text-amber-500' : 'text-gray-500'}`}>
                      #{match.rank}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      vs {match.opponents.join(', ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{match.date}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">{match.wpm}</p>
                    <p className="text-xs text-gray-500">WPM</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{match.accuracy}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
