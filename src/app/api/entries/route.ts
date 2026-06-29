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

type ApiErrorLike = {
  status?: number
  code?: string
  message?: string
}

const knownPeople = ['Priya', 'Rohan', 'Dad', 'Neha', 'Anjali', 'Kavya']
const knownPlaces = ['Goa', 'Mumbai', 'Office', 'Marine Drive', 'Assagao', 'Aldona']

function getUserId(session: unknown) {
  return (session as { user?: { id?: string } } | null)?.user?.id
}

function getApiError(error: unknown): ApiErrorLike {
  if (error && typeof error === 'object') {
    const candidate = error as ApiErrorLike
    return {
      status: candidate.status,
      code: candidate.code,
      message: candidate.message,
    }
  }

  return { message: String(error) }
}

function getFallbackMood(rawInput: string) {
  const text = rawInput.toLowerCase()

  if (/(happy|great|good|celebrate|laugh|joy|birthday|proud|excited)/.test(text)) {
    return { mood: 'happy', moodScore: 8 }
  }

  if (/(stress|worried|anxious|interview|scared|panic|nervous)/.test(text)) {
    return { mood: 'anxious', moodScore: 4 }
  }

  if (/(sad|miss|breakup|hurt|rejection|lonely|empty)/.test(text)) {
    return { mood: 'sad', moodScore: 4 }
  }

  if (/(angry|frustrated|annoyed|irritated)/.test(text)) {
    return { mood: 'frustrated', moodScore: 4 }
  }

  if (/(tired|exhausted|sleep|drained)/.test(text)) {
    return { mood: 'tired', moodScore: 5 }
  }

  if (/(calm|quiet|peaceful|chai|walk|rain)/.test(text)) {
    return { mood: 'calm', moodScore: 7 }
  }

  if (/(thank|grateful|relief|lucky)/.test(text)) {
    return { mood: 'grateful', moodScore: 8 }
  }

  return { mood: 'reflective', moodScore: 6 }
}

function getFallbackTags(rawInput: string) {
  const text = rawInput.toLowerCase()
  const candidates = [
    ['work', /(work|office|colleague|interview|client|freelance)/],
    ['family', /(dad|father|neha|sister|family)/],
    ['friendship', /(priya|friend|anjali|rohan)/],
    ['travel', /(goa|trip|beach|train|travel)/],
    ['health', /(health|doctor|hospital|chest|medicine)/],
    ['relationship', /(kavya|breakup|date|miss)/],
    ['side-project', /(project|app|demo|feature|build)/],
    ['reflection', /(felt|thinking|realized|remember|quiet)/],
  ] as const

  const tags = candidates
    .filter(([, pattern]) => pattern.test(text))
    .map(([tag]) => tag)

  return (tags.length ? tags : ['journal', 'memory']).slice(0, 5)
}

function getFallbackEntities(rawInput: string): ProcessedEntry['entities'] {
  const entities: ProcessedEntry['entities'] = []

  for (const person of knownPeople) {
    if (rawInput.toLowerCase().includes(person.toLowerCase())) {
      entities.push({
        type: 'person',
        value: person,
        context: `Mentioned in the original notes`,
      })
    }
  }

  for (const place of knownPlaces) {
    if (rawInput.toLowerCase().includes(place.toLowerCase())) {
      entities.push({
        type: 'place',
        value: place,
        context: `Place mentioned in the original notes`,
      })
    }
  }

  if (/(interview|birthday|trip|workshop|project|client|meeting)/i.test(rawInput)) {
    entities.push({
      type: 'event',
      value: 'Notable day',
      context: 'The notes describe a specific event or milestone',
    })
  }

  if (/(decided|decision|chose|need to|should)/i.test(rawInput)) {
    entities.push({
      type: 'decision',
      value: 'Personal decision',
      context: 'The notes mention a choice or intention',
    })
  }

  return entities
}

function createFallbackEntry(rawInput: string): ProcessedEntry {
  const trimmed = rawInput.trim()
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const summary = sentences.slice(0, 2).join(' ') || trimmed.slice(0, 220)
  const { mood, moodScore } = getFallbackMood(trimmed)

  return {
    summary,
    content: `Today I captured this memory in my own words: ${trimmed}

Looking back at it, the details feel worth saving because they point to what mattered in the moment. The people, places, and emotions inside the day may seem ordinary now, but they are exactly the kind of ordinary things that become meaningful later.

I want to remember not just what happened, but how it felt to move through it. This entry is a small marker of that day, saved honestly and without needing it to be perfect.`,
    mood,
    moodScore,
    tags: getFallbackTags(trimmed),
    entities: getFallbackEntities(trimmed),
  }
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
  const session = await getServerSession(authOptions)
  const userId = getUserId(session)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rawInput, inputType, entryDate } = await req.json()

  if (typeof rawInput !== 'string' || rawInput.trim().length < 20) {
    return NextResponse.json({ error: 'Entry must be at least 20 characters' }, { status: 400 })
  }

  let processed: ProcessedEntry

  try {
    if (process.env.AI_FALLBACK_MODE === 'true') {
      processed = createFallbackEntry(rawInput)
    } else {
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
        throw new Error('No AI response content')
      }

      processed = parseProcessedEntry(content)
    }
  } catch (error) {
    const apiError = getApiError(error)
    console.error('Entry AI processing failed; using local fallback', apiError)
    processed = createFallbackEntry(rawInput)
  }

  try {
    const parsedEntryDate = typeof entryDate === 'string' ? new Date(entryDate) : new Date()

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
  } catch (error) {
    console.error('Entry database write failed', getApiError(error))
    return NextResponse.json({ error: 'Entry save failed' }, { status: 500 })
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
