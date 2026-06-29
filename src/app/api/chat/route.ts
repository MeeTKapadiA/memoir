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

type MemoryEntry = {
  entryDate: Date
  summary: string
  mood: string | null
  moodScore: number | null
  tags: string[]
  entities: {
    type: string
    value: string
    context: string | null
  }[]
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

function createFallbackChatReply(messages: ChatMessage[], entries: MemoryEntry[]) {
  const latestQuestion = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
  const queryWords = latestQuestion
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2)
    .filter((word) => !['when', 'what', 'where', 'who', 'did', 'was', 'were', 'about', 'with', 'your', 'have'].includes(word))

  const scoredEntries = entries
    .map((entry) => {
      const haystack = [
        entry.summary,
        entry.mood ?? '',
        entry.tags.join(' '),
        entry.entities.map((entity) => `${entity.value} ${entity.context ?? ''}`).join(' '),
      ].join(' ').toLowerCase()

      const score = queryWords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0)
      return { entry, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (entries.length === 0) {
    return 'I do not see any journal entries yet. Start by writing one memory, then I can help you reflect on it.'
  }

  if (scoredEntries.length === 0) {
    return "I can still read your saved memories, but I could not find a clear match for that question without the AI service. Try searching for a specific person, place, or event from your journal."
  }

  const bullets = scoredEntries
    .map(({ entry }) => {
      const people = formatEntityList(entry.entities, ['person'])
      const places = formatEntityList(entry.entities, ['place', 'location'])
      const details = [people ? `People: ${people}` : null, places ? `Places: ${places}` : null]
        .filter(Boolean)
        .join(' · ')

      return `- **${format(entry.entryDate, 'MMMM d, yyyy')}**: ${entry.summary}${details ? ` (${details})` : ''}`
    })
    .join('\n')

  return `OpenAI is currently unavailable, so I searched your saved memories locally. Here are the closest matches:\n\n${bullets}`
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

    if (process.env.AI_FALLBACK_MODE === 'true') {
      return NextResponse.json({ reply: createFallbackChatReply(messages, entries) })
    }

    try {
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
        throw new Error('No reply generated')
      }

      return NextResponse.json({ reply })
    } catch (error) {
      console.error('Memory chat AI failed; using local fallback', error)
      return NextResponse.json({ reply: createFallbackChatReply(messages, entries) })
    }
  } catch (error) {
    console.error('Chat route failed', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
