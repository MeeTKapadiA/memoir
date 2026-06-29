import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { TimelineView } from '@/components/journal/TimelineView'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function TimelinePage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    redirect('/login')
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    select: {
      id: true,
      entryDate: true,
      summary: true,
      mood: true,
      moodScore: true,
      tags: true,
      entities: {
        select: {
          id: true,
          type: true,
          value: true,
          context: true,
        },
      },
    },
    orderBy: {
      entryDate: 'desc',
    },
  })

  return (
    <TimelineView
      entries={entries.map((entry) => ({
        ...entry,
        entryDate: entry.entryDate.toISOString(),
      }))}
    />
  )
}
