'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type MoodDistributionPoint = {
  mood: string
  count: number
}

const moodColors: Record<string, string> = {
  happy: '#f59e0b',
  sad: '#60a5fa',
  anxious: '#a78bfa',
  excited: '#fb923c',
  calm: '#2dd4bf',
  frustrated: '#f87171',
  grateful: '#4ade80',
  reflective: '#818cf8',
  tired: '#9ca3af',
  motivated: '#34d399',
  melancholy: '#64748b',
  joyful: '#facc15',
  stressed: '#fb7185',
  content: '#a3e635',
}

export function MoodDistribution({ data }: { data: MoodDistributionPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-500">
        No mood distribution yet.
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 12, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="mood"
            width={80}
            tick={{ fill: '#78716c', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: '#fafaf9' }}
            formatter={(value) => [`${value} entries`, 'Count']}
            contentStyle={{
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              color: '#44403c',
              boxShadow: '0 8px 24px rgba(68, 64, 60, 0.08)',
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.mood}
                fill={moodColors[entry.mood.toLowerCase()] ?? '#d6d3d1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
