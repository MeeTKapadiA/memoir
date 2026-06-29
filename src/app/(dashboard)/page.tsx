import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Users,
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns'

import { MoodChart } from '@/components/journal/MoodChart'
import { MoodDistribution } from '@/components/journal/MoodDistribution'
import { PageTransition } from '@/components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const moodEmojis: Record<string, string> = {
  happy: '😊',
  joyful: '😊',
  excited: '🤩',
  calm: '😌',
  grateful: '🙏',
  sad: '😔',
  anxious: '😟',
  angry: '😠',
  tired: '😴',
}

function getGreeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(name?: string | null, email?: string | null) {
  if (name) return name.split(' ')[0]
  return email?.split('@')[0] ?? 'there'
}

function getMoodEmoji(mood?: string | null, moodScore?: number | null) {
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

function calculateStreak(entries: { entryDate: Date }[], today: Date) {
  const entryDays = new Set(entries.map((entry) => format(entry.entryDate, 'yyyy-MM-dd')))
  let streak = 0

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const dateKey = format(subDays(today, dayOffset), 'yyyy-MM-dd')
    if (!entryDays.has(dateKey)) break
    streak += 1
  }

  return streak
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: typeof BookOpen
}) {
  return (
    <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-stone-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

type AnalyticsResponse = {
  moodTrend: {
    date: string
    score: number
    mood?: string | null
  }[]
  moodDistribution: {
    mood: string
    count: number
  }[]
  streak: number
  totalEntries: number
  peopleCount: number
  placesCount: number
}

async function getAnalytics() {
  const requestHeaders = headers()
  const host = requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http'
  const baseUrl = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL

  if (!baseUrl) {
    return null
  }

  const response = await fetch(`${baseUrl}/api/analytics`, {
    headers: {
      cookie: cookies().toString(),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json() as Promise<AnalyticsResponse>
}

export default async function TodayPage() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user
  const userId = (sessionUser as { id?: string } | undefined)?.id

  if (!userId) {
    redirect('/login')
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const last30Start = startOfDay(subDays(now, 29))
  const monthStart = startOfMonth(now)

  const [
    todayEntry,
    totalEntries,
    last30Entries,
    peopleEntities,
    thisMonthEntries,
    analytics,
  ] = await Promise.all([
    prisma.journalEntry.findFirst({
      where: {
        userId,
        entryDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        entities: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    }),
    prisma.journalEntry.count({
      where: { userId },
    }),
    prisma.journalEntry.findMany({
      where: {
        userId,
        entryDate: {
          gte: last30Start,
          lte: todayEnd,
        },
      },
      select: {
        entryDate: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    }),
    prisma.extractedEntity.findMany({
      where: {
        type: 'person',
        entry: {
          userId,
        },
      },
      distinct: ['value'],
      select: {
        value: true,
      },
    }),
    prisma.journalEntry.count({
      where: {
        userId,
        entryDate: {
          gte: monthStart,
          lte: todayEnd,
        },
      },
    }),
    getAnalytics(),
  ])

  const currentStreak = calculateStreak(last30Entries, now)
  const firstName = getFirstName(sessionUser?.name, sessionUser?.email)
  const moodTrend = analytics?.moodTrend ?? []
  const moodDistribution = analytics?.moodDistribution ?? []

  const visibleEntities =
    todayEntry?.entities.filter((entity) =>
      ['person', 'place', 'location'].includes(entity.type.toLowerCase())
    ) ?? []

  return (
    <PageTransition className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-8 py-10">
      <header>
        <p className="text-sm font-medium text-amber-700">
          {getGreeting(now)}, {firstName}
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-stone-900">
          {format(now, 'EEEE, d MMMM yyyy')}
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Entries" value={totalEntries} icon={BookOpen} />
        <StatCard title="Current Streak" value={`${currentStreak} days 🔥`} icon={CalendarDays} />
        <StatCard title="People Mentioned" value={peopleEntities.length} icon={Users} />
        <StatCard title="This Month" value={thisMonthEntries} icon={CalendarDays} />
      </section>

      <section>
        {todayEntry ? (
          <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700">
                    Today&apos;s Entry
                  </p>
                  <CardTitle className="mt-3 font-serif text-3xl text-stone-900">
                    {getMoodEmoji(todayEntry.mood, todayEntry.moodScore)}{' '}
                    {todayEntry.mood ?? 'A memory saved'}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <p className="text-base leading-7 text-stone-600">{todayEntry.summary}</p>

              {visibleEntities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {visibleEntities.map((entity) => (
                    <Badge
                      key={entity.id}
                      className="gap-1 rounded-full bg-stone-100 text-stone-700"
                      variant="secondary"
                    >
                      {entity.type.toLowerCase() === 'person' ? (
                        <Users className="size-3" />
                      ) : (
                        <MapPin className="size-3" />
                      )}
                      {entity.value}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <Link
                className="inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
                href={`/entry/${todayEntry.id}`}
              >
                Read Full Entry
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <BookOpen className="size-8" />
              </div>
              <h2 className="mt-6 font-serif text-4xl font-semibold text-stone-900">
                How was your day?
              </h2>
              <p className="mt-3 max-w-md text-stone-600">
                Take 2 minutes to capture today&apos;s memories before they fade.
              </p>
              <Link
                className="mt-8 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                href="/new"
              >
                Start Today&apos;s Entry
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Analytics
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-900">
            Your Mood Journey
          </h2>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="font-serif text-2xl text-stone-900">
              Mood Trend
            </CardTitle>
            <p className="text-sm text-stone-500">Last 30 days</p>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <MoodChart data={moodTrend} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="font-serif text-2xl text-stone-900">
              Mood Distribution
            </CardTitle>
            <p className="text-sm text-stone-500">All-time mood counts</p>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <MoodDistribution data={moodDistribution} />
          </CardContent>
        </Card>
        </div>
      </section>
    </PageTransition>
  )
}
