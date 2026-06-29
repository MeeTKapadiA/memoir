import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  ChevronDown,
  GitBranch,
  MapPin,
  Mic,
  PenLine,
  User,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'

import { DeleteEntryButton } from '@/components/journal/DeleteEntryButton'
import { PageTransition } from '@/components/layout/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type EntryDetailPageProps = {
  params: {
    id: string
  }
}

type Entity = {
  id: string
  type: string
  value: string
  context: string | null
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

function getMoodLabel(mood: string | null) {
  return mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Memory'
}

function getInitials(value: string) {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function EntitySection({
  title,
  entities,
  icon,
}: {
  title: string
  entities: Entity[]
  icon: 'person' | 'place' | 'event'
}) {
  if (entities.length === 0) return null

  const Icon = icon === 'place' ? MapPin : icon === 'event' ? Zap : User

  return (
    <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-stone-900">
        <Icon className="size-4 text-amber-700" />
        {title}
      </h2>
      <div className="space-y-3">
        {entities.map((entity) => (
          <div key={entity.id} className="rounded-xl bg-stone-50 p-3">
            <div className="flex items-center gap-3">
              {icon === 'person' ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
                  {getInitials(entity.value)}
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  {entity.type.toLowerCase() === 'decision' ? (
                    <GitBranch className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>
              )}
              <div>
                <p className="font-semibold text-stone-900">{entity.value}</p>
                {entity.context ? (
                  <p className="mt-1 text-xs leading-5 text-stone-500">{entity.context}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    redirect('/login')
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
    notFound()
  }

  const [previousEntry, nextEntry] = await Promise.all([
    prisma.journalEntry.findFirst({
      where: {
        userId,
        entryDate: {
          lt: entry.entryDate,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    }),
    prisma.journalEntry.findFirst({
      where: {
        userId,
        entryDate: {
          gt: entry.entryDate,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        entryDate: 'asc',
      },
    }),
  ])

  const people = entry.entities.filter((entity) => entity.type.toLowerCase() === 'person')
  const places = entry.entities.filter((entity) =>
    ['place', 'location'].includes(entity.type.toLowerCase())
  )
  const eventsAndDecisions = entry.entities.filter((entity) =>
    ['event', 'decision'].includes(entity.type.toLowerCase())
  )
  const isVoiceEntry = entry.inputType.toLowerCase() === 'voice'

  return (
    <article className="min-h-screen bg-[#FAFAF7]">
      <PageTransition className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-white hover:text-stone-900"
            href="/timeline"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <p className="font-serif text-sm text-stone-500">
            {format(entry.entryDate, 'EEEE, d MMMM yyyy')}
          </p>
          <DeleteEntryButton entryId={entry.id} />
        </div>

        <header className="rounded-[2rem] border border-stone-100 bg-white px-8 py-10 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-6xl font-semibold tracking-tight text-stone-900">
                {format(entry.entryDate, 'MMMM d')}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-[40px] leading-none">
                  {getMoodEmoji(entry.mood, entry.moodScore)}
                </span>
                <span className="text-lg font-semibold text-stone-800">
                  {getMoodLabel(entry.mood)}
                </span>
                {entry.moodScore ? (
                  <Badge className="rounded-full bg-stone-100 text-stone-700" variant="secondary">
                    {entry.moodScore}/10
                  </Badge>
                ) : null}
              </div>
            </div>
            {entry.tags.length > 0 ? (
              <div className="flex max-w-xl flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="mx-auto w-full max-w-2xl">
            <Card className="rounded-[2rem] border border-stone-100 bg-white shadow-sm">
              <CardContent className="space-y-8 p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-600">
                  {isVoiceEntry ? <Mic className="size-4" /> : <PenLine className="size-4" />}
                  {isVoiceEntry ? 'Voice Entry' : 'Written Entry'}
                </div>

                <div className="font-serif text-lg leading-8 text-stone-700">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,
                      h1: ({ children }) => (
                        <h2 className="mb-4 font-serif text-3xl font-semibold text-stone-900">
                          {children}
                        </h2>
                      ),
                      h2: ({ children }) => (
                        <h3 className="mb-3 font-serif text-2xl font-semibold text-stone-900">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => <ul className="mb-6 list-disc pl-6">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-6 list-decimal pl-6">{children}</ol>,
                      li: ({ children }) => <li className="mb-2">{children}</li>,
                    }}
                  >
                    {entry.content}
                  </ReactMarkdown>
                </div>

                <Separator className="bg-stone-200" />

                <div className="rounded-2xl bg-amber-50 p-5 text-stone-700">
                  <p className="italic">
                    <span className="font-semibold not-italic text-amber-900">Summary: </span>
                    {entry.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <EntitySection title="People" entities={people} icon="person" />
            <EntitySection title="Places" entities={places} icon="place" />
            <EntitySection title="Events & Decisions" entities={eventsAndDecisions} icon="event" />
          </aside>
        </div>

        <details className="group rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-xl font-semibold text-stone-900">
            Original Notes
            <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
          </summary>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-stone-100 p-4 font-mono text-sm leading-6 text-stone-700">
            {entry.rawInput}
          </pre>
        </details>

        <nav className="flex items-center justify-between gap-4 pb-8 text-sm font-medium">
          {previousEntry ? (
            <Link className="text-stone-600 transition-colors duration-200 hover:text-stone-900" href={`/entry/${previousEntry.id}`}>
              ← Previous Entry
            </Link>
          ) : (
            <span />
          )}
          {nextEntry ? (
            <Link className="text-stone-600 transition-colors duration-200 hover:text-stone-900" href={`/entry/${nextEntry.id}`}>
              Next Entry →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </PageTransition>
    </article>
  )
}
