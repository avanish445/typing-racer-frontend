import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  matches: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'matches'>('wpm');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getLeaderboard()
      .then((data) => setLeaderboardData(data))
      .catch(() => setLeaderboardData([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...leaderboardData].sort((a, b) => b[sortBy] - a[sortBy]);

  const getMedalStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Global Leaderboard</h1>
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">No leaderboard data yet. Be the first to race!</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Top typists ranked by best WPM (min 95% accuracy)</p>
        </div>
        <div className="flex gap-2">
          {(['wpm', 'accuracy', 'matches'] as const).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                sortBy === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[sorted[1], sorted[0], sorted[2]].map((player, i) => {
            const order = [2, 1, 3][i];
            const heights = ['h-32', 'h-40', 'h-28'];
            return (
              <div key={player.username} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-xl">{player.username[0].toUpperCase()}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{player.username}</p>
                <p className="text-indigo-600 font-bold text-lg">{player.wpm} WPM</p>
                <div className={`w-full ${heights[i]} bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl mt-2 flex items-end justify-center pb-3`}>
                  <span className="text-white font-extrabold text-2xl">#{order}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3 text-right">Best WPM</th>
              <th className="px-6 py-3 text-right">Accuracy</th>
              <th className="px-6 py-3 text-right">Matches</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, index) => {
              const isMe = player.username === user?.username;
              return (
                <tr
                  key={player.username}
                  className={`border-t border-gray-100 dark:border-gray-700 ${isMe ? 'bg-indigo-50 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'} transition-colors`}
                >
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getMedalStyle(index + 1)}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">{player.username[0].toUpperCase()}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {player.username}
                        {isMe && <span className="ml-2 text-xs text-indigo-600">(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600 text-lg">{player.wpm}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-semibold">{player.accuracy}%</td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">{player.matches}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
