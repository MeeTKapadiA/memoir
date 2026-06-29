import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: {
    id: string
  }
}

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entry = await prisma.journalEntry.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      entities: true,
    },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entry = await prisma.journalEntry.findFirst({
    where: {
      id: params.id,
      userId,
    },
    select: {
      id: true,
    },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  await prisma.journalEntry.delete({
    where: {
      id: entry.id,
    },
  })

  return NextResponse.json({ success: true })
}
