'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'
import { Loader2, Mic } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageTransition } from '@/components/layout/PageTransition'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { cn } from '@/lib/utils'

const processingMessages = [
  'Reflecting on your day...',
  'Extracting memories...',
  'Writing your entry...',
  'Almost there...',
]

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3h7.8M12 15.5 7.7 21M8.6 10.2 4.2 3.9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

export default function NewEntryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('write')
  const [writtenText, setWrittenText] = useState('')
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const {
    transcript,
    isListening,
    isSupported,
    start,
    stop,
    reset,
    setTranscript,
  } = useSpeechRecognition()

  const rawInput = activeTab === 'voice' ? transcript : writtenText
  const inputType = activeTab === 'voice' ? 'voice' : 'text'
  const canGenerate = rawInput.trim().length >= 20 && !loading

  const characterCount = useMemo(() => rawInput.length, [rawInput])

  useEffect(() => {
    if (!loading) {
      setMessageIndex(0)
      return
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % processingMessages.length)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [loading])

  useEffect(() => {
    if (!isListening) return

    const timeout = window.setTimeout(() => {
      stop()
      toast.info('Recording stopped after 5 minutes.')
    }, 5 * 60 * 1000)

    return () => window.clearTimeout(timeout)
  }, [isListening, stop])

  async function handleGenerate() {
    if (!canGenerate) return

    setLoading(true)

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawInput.trim(),
          inputType,
          entryDate,
        }),
      })

      if (response.status === 401) {
        toast.error('Your session expired. Please sign in again.')
        signOut({ callbackUrl: '/login' })
        return
      }

      if (!response.ok) {
        toast.error('AI processing failed. Please try again.')
        return
      }

      const data = await response.json()
      router.push('/entry/' + data.id)
    } catch {
      toast.error('AI processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function toggleListening() {
    if (isListening) {
      stop()
      return
    }

    start()
  }

  return (
    <PageTransition className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Capture a memory
          </p>
          <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-stone-900">
            New Entry
          </h1>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium text-stone-600">
          Entry date
          <input
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-stone-900 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-3 focus:ring-amber-100"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
        </label>
      </header>

      <Card className="rounded-2xl border border-stone-100 bg-white shadow-sm">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 h-10 w-full bg-stone-100 p-1 sm:w-fit">
              <TabsTrigger className="h-8 px-5" value="write">
                Write
              </TabsTrigger>
              <TabsTrigger className="h-8 px-5" value="voice">
                Voice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write">
              <div className="relative">
                <Textarea
                  className="min-h-[500px] resize-none border-none bg-amber-50/30 p-6 font-serif text-lg leading-8 text-stone-700 shadow-none focus-visible:ring-0 md:text-lg"
                  placeholder="What happened today? Who did you meet? How are you feeling? What decisions did you make?"
                  value={writtenText}
                  onChange={(event) => setWrittenText(event.target.value)}
                />
                <p
                  className={cn(
                    'absolute bottom-0 right-0 rounded-tl-lg bg-white/90 px-2 py-1 text-xs font-medium',
                    writtenText.trim().length < 20 ? 'text-red-500' : 'text-green-600'
                  )}
                >
                  {writtenText.length} characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="voice">
              {!isSupported ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <ChromeIcon className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Voice recording requires Chrome or Edge</p>
                    <p className="mt-1 text-amber-800">
                      Switch browsers or use the Write tab to create your entry.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5 py-8">
                  <button
                    className={cn(
                      'relative flex size-20 items-center justify-center rounded-full bg-stone-800 text-white shadow-lg transition-colors duration-200 hover:bg-stone-700',
                      isListening && 'bg-red-500 hover:bg-red-500'
                    )}
                    type="button"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-40" />
                    ) : null}
                    <Mic className="relative size-8" />
                  </button>
                  <p className="text-sm font-medium text-stone-600">
                    {isListening ? 'Recording... tap to stop' : 'Tap to start recording'}
                  </p>
                  {isListening ? (
                    <p className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                      Tap to stop
                    </p>
                  ) : null}

                  <div className="w-full space-y-3">
                    <Textarea
                      className="max-h-[320px] min-h-[220px] resize-none overflow-y-auto rounded-2xl border-stone-200 bg-stone-50 text-base leading-7"
                      placeholder="Your live transcript will appear here..."
                      value={transcript}
                      onChange={(event) => setTranscript(event.target.value)}
                    />
                    <div className="flex justify-between text-xs">
                      <span className={transcript.trim().length < 20 ? 'text-red-500' : 'text-green-600'}>
                        {transcript.length} characters
                      </span>
                      <Button type="button" variant="outline" onClick={reset}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-8 border-t border-stone-200 bg-stone-50/95 px-8 py-4 backdrop-blur">
        {loading ? (
          <p className="mb-3 text-center text-sm font-medium text-amber-700">
            {processingMessages[messageIndex]}
          </p>
        ) : null}
        <Button
          className="h-12 w-full bg-amber-500 text-base font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
          type="button"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating Entry
            </>
          ) : (
            'Generate Entry'
          )}
        </Button>
        {!loading && rawInput.trim().length > 0 && rawInput.trim().length < 20 ? (
          <p className="mt-2 text-center text-xs text-stone-500">
            Write at least 20 characters to generate an entry.
          </p>
        ) : null}
      </div>
    </PageTransition>
  )
}
