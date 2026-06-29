'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageTransition } from '@/components/layout/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type SearchEntry = {
  id: string
  entryDate: string
  summary: string
  mood: string | null
  moodScore: number | null
  tags: string[]
  inputType: string
  matchedOn: 'content' | 'entities' | 'content, entities'
  entities: {
    id: string
    type: string
    value: string
    context: string | null
  }[]
}

type Filter = 'All' | 'People' | 'Places' | 'Events'

const filters: Filter[] = ['All', 'People', 'Places', 'Events']

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

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-100 px-0.5 font-semibold text-stone-900">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  )
}

function hasEntityType(entry: SearchEntry, filter: Filter) {
  if (filter === 'All') return true

  const types = filter === 'People'
    ? ['person']
    : filter === 'Places'
      ? ['place', 'location']
      : ['event']

  return entry.entities.some((entity) => types.includes(entity.type.toLowerCase()))
}

function LoadingSkeletons() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="rounded-2xl border border-stone-100 bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<Filter>('All')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedQuery) {
      params.set('q', debouncedQuery)
    } else {
      params.delete('q')
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [debouncedQuery, pathname, router, searchParams])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function runSearch() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (response.status === 401) {
          toast.error('Your session expired. Please sign in again.')
          signOut({ callbackUrl: '/login' })
          return
        }

        if (!response.ok) {
          toast.error('Search failed. Please try again.')
          setResults([])
          return
        }

        const data = await response.json()
        if (!cancelled) setResults(data)
      } catch {
        toast.error('Search failed. Please try again.')
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    runSearch()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const filteredResults = useMemo(
    () => results.filter((entry) => hasEntityType(entry, activeFilter)),
    [activeFilter, results]
  )

  return (
    <PageTransition className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
          Search
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-stone-900">
          Search Memories
        </h1>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
        <Input
          autoFocus
          className="h-14 rounded-2xl border-stone-200 bg-white pl-12 text-lg shadow-sm md:text-lg"
          placeholder="Search people, places, events, feelings..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {debouncedQuery ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-stone-600">
            Found {filteredResults.length} {filteredResults.length === 1 ? 'memory' : 'memories'}
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                  activeFilter === filter
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 shadow-sm ring-1 ring-stone-200 hover:bg-stone-100'
                )}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!debouncedQuery ? (
        <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-stone-600">
              Try:{' '}
              {['Goa', 'interview', 'birthday'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="mr-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 transition-colors duration-200 hover:bg-amber-100"
                  type="button"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <LoadingSkeletons />
      ) : filteredResults.length === 0 ? (
        <Card className="rounded-2xl border border-stone-100 bg-white text-center shadow-sm">
          <CardContent className="flex flex-col items-center p-10">
            <div className="relative flex size-20 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <Search className="size-9" />
              <span className="absolute -right-1 top-2 size-4 rounded-full bg-amber-200" />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-semibold text-stone-900">
              No memories found for &apos;{debouncedQuery}&apos;
            </h2>
            <p className="mt-2 text-stone-500">
              Try a person, place, event, or feeling from your journal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((entry, index) => {
            const visibleEntities = entry.entities
              .filter((entity) =>
                ['person', 'place', 'location', 'event'].includes(entity.type.toLowerCase())
              )
              .slice(0, 4)

            return (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer"
                onClick={() => router.push(`/entry/${entry.id}`)}
              >
                <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getMoodEmoji(entry.mood, entry.moodScore)}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {format(parseISO(entry.entryDate), 'EEEE, d MMM yyyy')}
                          </p>
                          <p className="text-xs text-stone-400">
                            Matched on {entry.matchedOn}
                          </p>
                        </div>
                      </div>
                      <Badge className="rounded-full bg-amber-50 text-amber-800" variant="secondary">
                        {getMoodLabel(entry.mood)}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 leading-6 text-stone-600">
                      {highlightMatch(entry.summary, debouncedQuery)}
                    </p>

                    {visibleEntities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {visibleEntities.map((entity) => (
                          <Badge
                            key={entity.id}
                            className="rounded-full bg-stone-100 text-stone-700"
                            variant="secondary"
                          >
                            {entity.type.toLowerCase() === 'person'
                              ? '👤'
                              : ['place', 'location'].includes(entity.type.toLowerCase())
                                ? '📍'
                                : '⚡'}{' '}
                            {entity.value}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.article>
            )
          })}
        </div>
      )}
    </PageTransition>
  )
}
