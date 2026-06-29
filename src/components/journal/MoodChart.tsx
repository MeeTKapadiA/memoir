'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'

type MoodChartPoint = {
  date: string
  score: number
  mood?: string | null
}

export function MoodChart({ data }: { data: MoodChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-500">
        No mood data yet.
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
            tick={{ fill: '#78716c', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
            tick={{ fill: '#78716c', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: '#d6d3d1', strokeWidth: 1 }}
            formatter={(value, _name, item) => {
              const payload = item.payload as MoodChartPoint
              return [`${value}/10 · ${payload.mood ?? 'mood'}`, 'Mood']
            }}
            labelFormatter={(value) => format(parseISO(String(value)), 'MMMM d')}
            contentStyle={{
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              color: '#44403c',
              boxShadow: '0 8px 24px rgba(68, 64, 60, 0.08)',
            }}
            labelStyle={{ color: '#57534e' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#d97706"
            strokeWidth={3}
            dot={{ fill: '#d97706', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
