import Link from 'next/link'
import { BookOpen } from 'lucide-react'

import { PageTransition } from '@/components/layout/PageTransition'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6">
      <PageTransition className="max-w-md rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <BookOpen className="size-7" />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-semibold text-stone-900">
          Page not found
        </h1>
        <p className="mt-3 text-stone-600">
          This memory may have moved, or the page does not exist.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          href="/"
        >
          Back to Today
        </Link>
      </PageTransition>
    </main>
  )
}
