'use client'

import { useEffect } from 'react'

import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6">
      <PageTransition className="max-w-md rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-4xl font-semibold text-stone-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-stone-600">
          Memoir hit an unexpected error. Refresh the page and try again.
        </p>
        <Button className="mt-6 bg-amber-500 text-white hover:bg-amber-600" onClick={reset}>
          Refresh
        </Button>
      </PageTransition>
    </main>
  )
}
