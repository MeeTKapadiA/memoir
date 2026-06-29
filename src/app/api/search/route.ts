import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json([])
  }

  const [contentMatches, entityMatches] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        userId,
        OR: [
          { summary: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { rawInput: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
      include: {
        entities: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
      take: 20,
    }),
    prisma.extractedEntity.findMany({
      where: {
        value: {
          contains: q,
          mode: 'insensitive',
        },
        entry: {
          userId,
        },
      },
      include: {
        entry: {
          include: {
            entities: true,
          },
        },
      },
      orderBy: {
        entry: {
          entryDate: 'desc',
        },
      },
      take: 20,
    }),
  ])

  const resultMap = new Map<
    string,
    (typeof contentMatches)[number] & { matchedOn: 'content' | 'entities' | 'content, entities' }
  >()

  for (const entry of contentMatches) {
    resultMap.set(entry.id, { ...entry, matchedOn: 'content' })
  }

  for (const entity of entityMatches) {
    const existing = resultMap.get(entity.entry.id)
    resultMap.set(entity.entry.id, {
      ...entity.entry,
      matchedOn: existing ? 'content, entities' : 'entities',
    })
  }

  const results = Array.from(resultMap.values())
    .sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime())
    .slice(0, 20)

  return NextResponse.json(results)
}
