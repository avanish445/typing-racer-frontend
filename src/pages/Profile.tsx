import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { formatDate } from '../utils/formatters';
import type { User } from '../types';

interface MatchHistoryEntry {
  id: string;
  date: string;
  opponents: string[];
  wpm: number;
  accuracy: number;
  rank: number;
  difficulty: string;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = id === user?._id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? user : null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, matchData] = await Promise.all([
          isOwnProfile ? Promise.resolve(user) : userService.getProfile(id),
          userService.getMatchHistory(id),
        ]);
        setProfileUser(profileData);
        setMatchHistory(matchData.matches || []);
      } catch {
        setMatchHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isOwnProfile, user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-4 ring-white dark:ring-gray-800">
              <span className="text-white font-bold text-3xl">
                {profileUser?.username?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser?.username}</h1>
              <p className="text-gray-600 dark:text-gray-400">{profileUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Matches', value: profileUser?.stats?.totalMatches || 0 },
          { label: 'Best WPM', value: profileUser?.stats?.bestWPM || 0 },
          { label: 'Avg WPM', value: profileUser?.stats?.avgWPM || 0 },
          { label: 'Avg Accuracy', value: `${profileUser?.stats?.avgAccuracy || 0}%` },
          { label: 'Time Typed', value: `${Math.round((profileUser?.stats?.totalTimeTyped || 0) / 60)}m` },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Match History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Match History</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {matchHistory.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No matches yet.</div>
          ) : (
            matchHistory.map(match => (
              <div key={match.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    match.rank === 1 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    #{match.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      vs {match.opponents.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatDate(match.date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        match.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        match.difficulty === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {match.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">{match.wpm}</p>
                    <p className="text-xs text-gray-500">WPM</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${match.accuracy >= 95 ? 'text-green-600' : 'text-amber-600'}`}>
                      {match.accuracy}%
                    </p>
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
