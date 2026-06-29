'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageTransition } from '@/components/layout/PageTransition'
import { cn } from '@/lib/utils'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const starterPrompts = [
  'When did I first meet Priya?',
  'What was I worried about last month?',
  'What big decisions have I made this year?',
  'When did I visit Goa?',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-2 animate-bounce rounded-full bg-stone-400"
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingEntries, setCheckingEntries] = useState(true)
  const [hasEntries, setHasEntries] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function checkEntries() {
      try {
        const response = await fetch('/api/entries')
        if (response.status === 401) {
          toast.error('Your session expired. Please sign in again.')
          signOut({ callbackUrl: '/login' })
          return
        }

        if (!response.ok) {
          toast.error('Could not load your memories.')
          return
        }

        const data = await response.json()
        if (!cancelled) setHasEntries(Array.isArray(data) && data.length > 0)
      } catch {
        toast.error('Could not load your memories.')
      } finally {
        if (!cancelled) setCheckingEntries(false)
      }
    }

    checkEntries()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(messageContent = input) {
    const content = messageContent.trim()
    if (!content || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (response.status === 401) {
        toast.error('Your session expired. Please sign in again.')
        signOut({ callbackUrl: '/login' })
        return
      }

      if (!response.ok) {
        toast.error('Memory chat failed. Please try again.')
        return
      }

      const data = await response.json()
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Memory chat failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage()
  }

  return (
    <PageTransition className="flex h-screen flex-col bg-[#FAFAF7]">
      <header className="border-b border-stone-200 bg-stone-50 px-8 py-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
          Memory Chat
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-900">
          Chat with your Memories
        </h1>
        <p className="mt-2 text-stone-500">Ask anything about your past</p>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6 pb-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          {!checkingEntries && !hasEntries ? (
            <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <BookOpen className="size-7" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-semibold text-stone-900">
                Start journaling first!
              </h2>
              <p className="mt-3 text-stone-600">
                You need at least one entry before chatting with your memories.
              </p>
              <Link
                className="mt-6 inline-flex rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
                href="/new"
              >
                Write your first entry
              </Link>
            </div>
          ) : messages.length === 0 ? (
            <div className="grid gap-4 pt-8 sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-2xl border border-stone-100 bg-white p-5 text-left text-stone-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  type="button"
                  onClick={() => setInput(prompt)}
                >
                  <BookOpen className="mb-4 size-5 text-amber-700" />
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' ? (
                <div className="flex max-w-[78%] items-start gap-3">
                  <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-700 shadow-sm">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-2 text-sm leading-6 text-white shadow-sm">
                  {message.content}
                </div>
              )}
            </div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="flex max-w-[78%] items-start gap-3">
                <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <BookOpen className="size-5" />
                </div>
                <TypingIndicator />
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-[260px] right-0 border-t border-stone-200 bg-stone-50/95 px-8 py-4 backdrop-blur">
        <form className="mx-auto flex max-w-4xl gap-3" onSubmit={handleSubmit}>
          <Input
            className="h-12 rounded-2xl border-stone-200 bg-white px-4 text-base shadow-sm md:text-base"
            placeholder="Ask about your memories..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading || !hasEntries}
          />
          <Button
            className="h-12 gap-2 rounded-2xl bg-amber-500 px-5 text-white transition-colors duration-200 hover:bg-amber-600"
            type="submit"
            disabled={!input.trim() || loading || !hasEntries}
          >
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </PageTransition>
  )
}
