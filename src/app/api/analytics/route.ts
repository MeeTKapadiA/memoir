import { format, startOfDay, subDays } from 'date-fns'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

function calculateStreakEndingToday(entries: { entryDate: Date }[]) {
  const entryDays = new Set(entries.map((entry) => format(entry.entryDate, 'yyyy-MM-dd')))
  let streak = 0
  const today = startOfDay(new Date())

  for (let dayOffset = 0; ; dayOffset++) {
    const dateKey = format(subDays(today, dayOffset), 'yyyy-MM-dd')
    if (!entryDays.has(dateKey)) break
    streak += 1
  }

  return streak
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const last30Start = startOfDay(subDays(today, 29))

  const [
    last30Entries,
    moodGroups,
    allEntryDates,
    totalEntries,
    people,
    places,
  ] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        userId,
        entryDate: {
          gte: last30Start,
        },
        moodScore: {
          not: null,
        },
      },
      select: {
        entryDate: true,
        mood: true,
        moodScore: true,
      },
      orderBy: {
        entryDate: 'asc',
      },
    }),
    prisma.journalEntry.groupBy({
      by: ['mood'],
      where: {
        userId,
        mood: {
          not: null,
        },
      },
      _count: {
        mood: true,
      },
      orderBy: {
        _count: {
          mood: 'desc',
        },
      },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      select: {
        entryDate: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    }),
    prisma.journalEntry.count({
      where: { userId },
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
    prisma.extractedEntity.findMany({
      where: {
        type: {
          in: ['place', 'location'],
        },
        entry: {
          userId,
        },
      },
      distinct: ['value'],
      select: {
        value: true,
      },
    }),
  ])

  return NextResponse.json({
    moodTrend: last30Entries.map((entry) => ({
      date: format(entry.entryDate, 'yyyy-MM-dd'),
      score: entry.moodScore,
      mood: entry.mood,
    })),
    moodDistribution: moodGroups.map((group) => ({
      mood: group.mood ?? 'unknown',
      count: group._count.mood,
    })),
    streak: calculateStreakEndingToday(allEntryDates),
    totalEntries,
    peopleCount: people.length,
    placesCount: places.length,
  })
}
