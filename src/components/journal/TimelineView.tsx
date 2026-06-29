'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { BookOpenCheck, ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageTransition } from '@/components/layout/PageTransition'
import { cn } from '@/lib/utils'

type TimelineEntry = {
  id: string
  entryDate: string
  summary: string
  mood: string | null
  moodScore: number | null
  tags: string[]
  entities: {
    id: string
    type: string
    value: string
    context: string | null
  }[]
}

const moodColors: Record<string, string> = {
  happy: 'bg-amber-400',
  sad: 'bg-blue-400',
  anxious: 'bg-purple-400',
  excited: 'bg-orange-400',
  calm: 'bg-teal-400',
  frustrated: 'bg-red-400',
  grateful: 'bg-green-400',
  reflective: 'bg-indigo-400',
  tired: 'bg-gray-400',
  motivated: 'bg-emerald-400',
  melancholy: 'bg-slate-400',
  joyful: 'bg-yellow-400',
  stressed: 'bg-rose-400',
  content: 'bg-lime-400',
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😔',
  anxious: '😟',
  excited: '🤩',
  calm: '😌',
  frustrated: '😤',
  grateful: '🙏',
  reflective: '🤔',
  tired: '😴',
  motivated: '💪',
  melancholy: '🌧️',
  joyful: '😊',
  stressed: '😓',
  content: '🙂',
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonthDays(month: Date) {
  const monthStart = startOfMonth(month)
  const daysInMonth = getDaysInMonth(month)
  const leadingBlanks = (getDay(monthStart) + 6) % 7

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ]
}

function getMoodLabel(mood: string | null) {
  return mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Memory'
}

function getMoodEmoji(mood: string | null, moodScore: number | null) {
  if (mood) {
    const emoji = moodEmojis[mood.toLowerCase()]
    if (emoji) return emoji
  }

  if (!moodScore) return '✨'
  if (moodScore >= 8) return '😊'
  if (moodScore >= 6) return '🙂'
  if (moodScore >= 4) return '😐'
  return '😔'
}

function getMoodColor(mood: string | null) {
  if (!mood) return 'bg-stone-300'
  return moodColors[mood.toLowerCase()] ?? 'bg-stone-300'
}

function groupEntriesByMonth(entries: TimelineEntry[]) {
  return entries.reduce<Record<string, TimelineEntry[]>>((groups, entry) => {
    const month = format(parseISO(entry.entryDate), 'MMMM yyyy')
    groups[month] = groups[month] ?? []
    groups[month].push(entry)
    return groups
  }, {})
}

export function TimelineView({ entries }: { entries: TimelineEntry[] }) {
  const router = useRouter()
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const entriesByDate = useMemo(() => {
    return entries.reduce<Record<string, TimelineEntry[]>>((dateMap, entry) => {
      const key = format(parseISO(entry.entryDate), 'yyyy-MM-dd')
      dateMap[key] = dateMap[key] ?? []
      dateMap[key].push(entry)
      return dateMap
    }, {})
  }, [entries])

  const groupedEntries = useMemo(() => groupEntriesByMonth(entries), [entries])
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])

  function scrollToEntry(date: Date) {
    const entriesForDate = entriesByDate[format(date, 'yyyy-MM-dd')]
    const entry = entriesForDate?.[0]

    if (!entry) return

    setSelectedDate(date)
    document.getElementById(`entry-${entry.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  if (entries.length === 0) {
    return (
      <PageTransition className="flex min-h-screen items-center justify-center px-8 py-10">
        <Card className="w-full max-w-lg rounded-2xl border border-stone-100 bg-white text-center shadow-sm">
          <CardContent className="flex flex-col items-center p-10">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <BookOpenCheck className="size-8" />
            </div>
            <h1 className="mt-6 font-serif text-4xl font-semibold text-stone-900">
              Your journal is waiting
            </h1>
            <p className="mt-3 max-w-sm text-stone-600">
              Capture your first memory and Memoir will turn it into a searchable timeline of your life.
            </p>
            <Link
              className="mt-8 rounded-xl bg-amber-500 px-6 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
              href="/new"
            >
              Write your first entry
            </Link>
          </CardContent>
        </Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
          Timeline
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-stone-900">
          Your Memory Calendar
        </h1>
      </header>

      <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <Button
              aria-label="Previous month"
              className="rounded-full"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="font-serif text-3xl font-semibold text-stone-900">
              {format(visibleMonth, 'MMMM yyyy')}
            </h2>
            <Button
              aria-label="Next month"
              className="rounded-full"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                {day}
              </div>
            ))}

            {monthDays.map((day, index) => {
              const dateKey = day ? format(day, 'yyyy-MM-dd') : ''
              const hasEntry = Boolean(day && entriesByDate[dateKey]?.length)
              const isToday = Boolean(day && isSameDay(day, new Date()))
              const isSelected = Boolean(day && selectedDate && isSameDay(day, selectedDate))
              const isCurrentMonth = Boolean(day && isSameMonth(day, visibleMonth))

              return (
                <button
                  key={day?.toISOString() ?? `blank-${index}`}
                  className={cn(
                    'flex min-h-16 flex-col items-center justify-center rounded-xl text-sm transition-colors duration-200',
                    day && 'text-stone-700',
                    !day && 'pointer-events-none',
                    day && !hasEntry && 'hover:bg-stone-50',
                    hasEntry && 'cursor-pointer hover:bg-amber-50',
                    isSelected && 'rounded-full bg-amber-500 font-semibold text-white hover:bg-amber-500',
                    isToday && !isSelected && 'rounded-full ring-2 ring-amber-400',
                    !isCurrentMonth && 'text-stone-300'
                  )}
                  type="button"
                  disabled={!hasEntry}
                  onClick={() => day && scrollToEntry(day)}
                >
                  {day ? (
                    <>
                      <span>{format(day, 'd')}</span>
                      <span
                        className={cn(
                          'mt-1 size-1.5 rounded-full',
                          hasEntry ? (isSelected ? 'bg-white' : 'bg-amber-500') : 'bg-transparent'
                        )}
                      />
                    </>
                  ) : null}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-10">
        {Object.entries(groupedEntries).map(([month, monthEntries]) => (
          <section key={month}>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-stone-900">
              {month}
            </h2>
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {monthEntries.map((entry, index) => {
                const mood = entry.mood?.toLowerCase() ?? null
                const visibleEntities = entry.entities
                  .filter((entity) =>
                    ['person', 'place', 'location'].includes(entity.type.toLowerCase())
                  )
                  .slice(0, 3)

                return (
                  <motion.article
                    key={entry.id}
                    id={`entry-${entry.id}`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.4, delay: index * 0.01 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/entry/${entry.id}`)}
                  >
                    <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="relative overflow-hidden p-0">
                        <div className={cn('absolute inset-y-0 left-0 w-[3px]', getMoodColor(mood))} />
                        <div className="space-y-4 p-5 pl-6">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {format(parseISO(entry.entryDate), 'EEE, d MMM')}
                            </p>
                            <p className="mt-2 line-clamp-2 leading-6 text-stone-600">
                              {entry.summary}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-amber-50 text-amber-800" variant="secondary">
                              {getMoodEmoji(mood, entry.moodScore)} {getMoodLabel(mood)}
                            </Badge>
                            {visibleEntities.map((entity) => (
                              <Badge
                                key={entity.id}
                                className="rounded-full bg-stone-100 text-stone-700"
                                variant="secondary"
                              >
                                {entity.type.toLowerCase() === 'person' ? '👤' : '📍'} {entity.value}
                              </Badge>
                            ))}
                          </div>

                          {entry.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.article>
                )
              })}
            </motion.div>
          </section>
        ))}
      </div>
    </PageTransition>
  )
}
