import type { Player } from '../types'

interface PlayerCardProps {
  player: Player
  isHost: boolean
  isCurrentUser: boolean
}

export default function PlayerCard({ player, isHost, isCurrentUser }: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        isCurrentUser
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div className='relative'>
        <div className='w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center'>
          <span className='text-white font-bold text-lg'>{player.username[0].toUpperCase()}</span>
        </div>
        {player.ready && (
          <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800'>
            <svg
              className='w-3 h-3 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-gray-900 dark:text-white truncate'>
            {player.username}
          </span>
          {isHost && (
            <span className='px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full'>
              Host
            </span>
          )}
          {isCurrentUser && (
            <span className='px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full'>
              You
            </span>
          )}
        </div>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          {player.stats?.avgWPM ? `Avg ${player.stats.avgWPM} WPM` : 'New player'}
        </p>
      </div>
      <div
        className={`w-3 h-3 rounded-full ${player.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      />
    </div>
  )
}
