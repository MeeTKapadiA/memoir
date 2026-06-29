import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

function isChatMessage(message: unknown): message is ChatMessage {
  const candidate = message as Partial<ChatMessage>
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string'
  )
}

function formatEntityList(
  entities: { type: string; value: string; context: string | null }[],
  types: string[]
) {
  return entities
    .filter((entity) => types.includes(entity.type.toLowerCase()))
    .map((entity) => entity.context ? `${entity.value} (${entity.context})` : entity.value)
    .join(', ')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = getUserId(session)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = await req.json()

    if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
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
            type: true,
            value: true,
            context: true,
          },
        },
      },
      orderBy: {
        entryDate: 'desc',
      },
      take: 60,
    })

    const memoryContext = entries
      .map((entry) => {
        const people = formatEntityList(entry.entities, ['person'])
        const places = formatEntityList(entry.entities, ['place', 'location'])
        const events = formatEntityList(entry.entities, ['event'])
        const mood = entry.moodScore
          ? `${entry.mood ?? 'unknown'} ${entry.moodScore}/10`
          : entry.mood ?? 'unknown'

        return [
          `[Date: ${format(entry.entryDate, 'yyyy-MM-dd')}] [Mood: ${mood}] [Tags: ${entry.tags.join(', ')}]`,
          `Summary: ${entry.summary}`,
          people ? `People: ${people}` : null,
          places ? `Places: ${places}` : null,
          events ? `Events: ${events}` : null,
          '---',
        ]
          .filter(Boolean)
          .join('\n')
      })
      .join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content:
            "You are a warm, personal memory assistant with access to the user's private journal. Answer questions about their life experiences, memories, and past entries based ONLY on the journal data provided. Always cite specific dates when referencing entries. If the answer isn't in the journals, say so honestly. Be conversational and empathetic.\n\nJOURNAL MEMORIES:\n" +
            memoryContext,
        },
        ...messages,
      ],
    })

    const reply = completion.choices[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ error: 'No reply generated' }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
