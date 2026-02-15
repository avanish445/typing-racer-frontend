import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WPMDataPoint } from '../types';

interface WPMChartProps {
  data: WPMDataPoint[];
  title?: string;
}

export default function WPMChart({ data, title = 'WPM Over Time' }: WPMChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            label={{ value: 'Time (s)', position: 'bottom', fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            label={{ value: 'WPM', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
            formatter={(value) => [`${value} WPM`, 'Speed']}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
