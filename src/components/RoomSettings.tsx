import type { RoomSettings as RoomSettingsType } from '../types';

interface RoomSettingsProps {
  settings: RoomSettingsType;
  onChange: (settings: RoomSettingsType) => void;
  disabled: boolean;
}

export default function RoomSettings({ settings, onChange, disabled }: RoomSettingsProps) {
  const handleChange = (key: string, value: string | number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Room Settings</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty
        </label>
        <div className="flex gap-2">
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              disabled={disabled}
              onClick={() => handleChange('difficulty', d)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                settings.difficulty === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duration
        </label>
        <div className="flex gap-2">
          {[30, 60, 120].map(s => (
            <button
              key={s}
              disabled={disabled}
              onClick={() => handleChange('duration', s)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                settings.duration === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={settings.category}
          onChange={(e) => handleChange('category', e.target.value)}
          disabled={disabled}
          className="w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="common">Common English</option>
          <option value="programming">Programming</option>
          <option value="literature">Literature</option>
          <option value="science">Science</option>
          <option value="random">Random</option>
        </select>
      </div>
    </div>
  );
}
