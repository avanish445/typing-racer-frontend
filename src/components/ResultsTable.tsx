import type { PlayerResult } from '../types'

interface ResultsTableProps {
  results: PlayerResult[]
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (!results || results.length === 0) return null

  const medals = ['', '1st', '2nd', '3rd', '4th']
  const medalColors = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-600', 'text-gray-500']

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700'>
            <th className='pb-3 pr-4'>Rank</th>
            <th className='pb-3 pr-4'>Player</th>
            <th className='pb-3 pr-4 text-right'>WPM</th>
            <th className='pb-3 pr-4 text-right'>Accuracy</th>
            <th className='pb-3 pr-4 text-right'>Errors</th>
            <th className='pb-3 text-right'>Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((player, index) => (
            <tr
              key={player.userId || index}
              className='border-b border-gray-100 dark:border-gray-800 last:border-0'
            >
              <td className='py-4 pr-4'>
                <span className={`font-bold text-lg ${medalColors[index + 1] || 'text-gray-500'}`}>
                  #{index + 1}
                </span>
              </td>
              <td className='py-4 pr-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center'>
                    <span className='text-white font-bold'>
                      {player.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white'>{player.username}</p>
                    <p className='text-xs text-gray-500'>
                      {player.status === 'DNF' ? 'Did Not Finish' : medals[index + 1]}
                    </p>
                  </div>
                </div>
              </td>
              <td className='py-4 pr-4 text-right'>
                <span className='text-2xl font-bold text-indigo-600 dark:text-indigo-400'>
                  {player.wpm}
                </span>
              </td>
              <td className='py-4 pr-4 text-right'>
                <span
                  className={`font-semibold ${player.accuracy >= 95 ? 'text-green-600' : player.accuracy >= 85 ? 'text-amber-600' : 'text-red-600'}`}
                >
                  {player.accuracy}%
                </span>
              </td>
              <td className='py-4 pr-4 text-right text-gray-600 dark:text-gray-400'>
                {player.errors}
              </td>
              <td className='py-4 text-right text-gray-600 dark:text-gray-400'>{player.time}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
