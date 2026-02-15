interface ProgressBarProps {
  username: string;
  progress: number;
  wpm: number;
  avatar?: string | null;
  isCurrentUser: boolean;
  rank: number;
}

export default function ProgressBar({ username, progress, wpm, avatar, isCurrentUser, rank }: ProgressBarProps) {
  const colors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
  ];
  const color = colors[(rank || 0) % colors.length];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
          {username?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {username} {isCurrentUser && <span className="text-xs text-indigo-500">(You)</span>}
          </span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-2">
            {wpm} WPM
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">
        {progress}%
      </span>
    </div>
  );
}
