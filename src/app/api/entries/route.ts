import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

const systemPrompt = `You are an AI journaling assistant. Process raw journal input and return ONLY a valid JSON object — no markdown, no explanation, no code fences — with exactly this structure:
{
  "summary": "2-3 sentence summary of the day",
  "content": "A beautifully written, warm, first-person journal entry in 3-5 paragraphs. Expand the raw input with reflection and detail. Use the user's own experiences and emotions.",
  "mood": "one of: happy | sad | anxious | excited | calm | frustrated | grateful | reflective | tired | motivated | melancholy | joyful | stressed | content",
  "moodScore": <integer 1-10, 10 is most positive>,
  "tags": ["array", "of", "2-5", "relevant", "topic", "tags"],
  "entities": [
    { "type": "person", "value": "Full Name or nickname", "context": "How this person appears in the entry" },
    { "type": "place", "value": "Place name", "context": "Context of this place" },
    { "type": "event", "value": "Event name", "context": "What happened" },
    { "type": "decision", "value": "Decision made", "context": "Context of decision" },
    { "type": "emotion", "value": "Specific emotion", "context": "What triggered it" }
  ]
}`

type ProcessedEntry = {
  summary: string
  content: string
  mood: string
  moodScore: number
  tags: string[]
  entities: {
    type: string
    value: string
    context?: string | null
  }[]
}

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

function stripMarkdownFences(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function parseProcessedEntry(content: string): ProcessedEntry {
  const parsed = JSON.parse(stripMarkdownFences(content)) as Partial<ProcessedEntry>

  if (
    typeof parsed.summary !== 'string' ||
    typeof parsed.content !== 'string' ||
    typeof parsed.mood !== 'string' ||
    typeof parsed.moodScore !== 'number' ||
    !Array.isArray(parsed.tags) ||
    !Array.isArray(parsed.entities)
  ) {
    throw new Error('Invalid AI response')
  }

  return {
    summary: parsed.summary,
    content: parsed.content,
    mood: parsed.mood,
    moodScore: Math.max(1, Math.min(10, Math.round(parsed.moodScore))),
    tags: parsed.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 5),
    entities: parsed.entities
      .filter(
        (entity) =>
          entity &&
          typeof entity.type === 'string' &&
          typeof entity.value === 'string'
      )
      .map((entity) => ({
        type: entity.type,
        value: entity.value,
        context: typeof entity.context === 'string' ? entity.context : null,
      })),
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = getUserId(session)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rawInput, inputType, entryDate } = await req.json()

    if (typeof rawInput !== 'string' || rawInput.trim().length < 20) {
      return NextResponse.json({ error: 'Entry must be at least 20 characters' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawInput },
      ],
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
    }

    const processed = parseProcessedEntry(content)
    const parsedEntryDate = entryDate ? new Date(entryDate) : new Date()

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.journalEntry.create({
        data: {
          userId,
          rawInput,
          summary: processed.summary,
          content: processed.content,
          mood: processed.mood,
          moodScore: processed.moodScore,
          tags: processed.tags,
          inputType: typeof inputType === 'string' ? inputType : 'text',
          entryDate: Number.isNaN(parsedEntryDate.getTime()) ? new Date() : parsedEntryDate,
        },
      })

      if (processed.entities.length > 0) {
        await tx.extractedEntity.createMany({
          data: processed.entities.map((entity) => ({
            entryId: created.id,
            type: entity.type,
            value: entity.value,
            context: entity.context,
          })),
        })
      }

      return tx.journalEntry.findUnique({
        where: { id: created.id },
        include: { entities: true },
      })
    })

    return NextResponse.json(entry)
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      inputType: true,
      entities: true,
    },
    orderBy: {
      entryDate: 'desc',
    },
  })

  return NextResponse.json(entries)
}
