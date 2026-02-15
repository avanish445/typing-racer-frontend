import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ResultsTable from '../components/ResultsTable';
import WPMChart from '../components/WPMChart';
import { roomService } from '../services/roomService';
import type { PlayerResult } from '../types';

function sortAndRankResults(results: PlayerResult[]): PlayerResult[] {
  const sorted = [...results].sort((a, b) => {
    if (a.status === 'DNF' && b.status !== 'DNF') return 1;
    if (a.status !== 'DNF' && b.status === 'DNF') return -1;
    return b.wpm - a.wpm;
  });
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

let lastSubmitKey = '';

export default function Results() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedResults: PlayerResult[] | undefined = (location.state as any)?.results;

  const [results, setResults] = useState<PlayerResult[]>(() =>
    passedResults?.length ? sortAndRankResults(passedResults) : []
  );
  const [loading, setLoading] = useState(!passedResults);

  useEffect(() => {
    if (!passedResults?.length || !code) return;
    const sorted = sortAndRankResults(passedResults);
    setResults(sorted);
    const key = `${code}-${sorted[0]?.userId}-${sorted[0]?.time}-${sorted[0]?.wpm}`;
    if (key === lastSubmitKey) return;
    lastSubmitKey = key;
    roomService.submitResults(code, sorted).catch(() => {});
  }, [code, passedResults]);

  useEffect(() => {
    if (passedResults?.length || !code) return;
    roomService
      .getResults(code)
      .then((data) => setResults(sortAndRankResults(data.results || [])))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [code, passedResults]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading results...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">No results available.</div>
      </div>
    );
  }

  const winner = results[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Winner Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl p-8 text-center mb-8">
        <p className="text-amber-900 text-sm font-medium mb-2">Winner</p>
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/30 flex items-center justify-center">
          <span className="text-4xl font-bold text-amber-900">
            {winner?.username?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-amber-900 mb-1">{winner?.username}</h1>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div>
            <p className="text-2xl font-bold text-amber-900">{winner?.wpm}</p>
            <p className="text-amber-800 text-sm">WPM</p>
          </div>
          <div className="w-px h-10 bg-amber-700/30" />
          <div>
            <p className="text-2xl font-bold text-amber-900">{winner?.accuracy}%</p>
            <p className="text-amber-800 text-sm">Accuracy</p>
          </div>
          <div className="w-px h-10 bg-amber-700/30" />
          <div>
            <p className="text-2xl font-bold text-amber-900">{winner?.time}s</p>
            <p className="text-amber-800 text-sm">Time</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Final Rankings</h2>
        <ResultsTable results={results} />
      </div>

      {/* WPM Chart for winner */}
      {winner?.wpmTimeline && winner.wpmTimeline.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <WPMChart data={winner.wpmTimeline} title={`${winner.username}'s WPM Over Time`} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate(`/room/${code}`)}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
        >
          View Analytics
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
