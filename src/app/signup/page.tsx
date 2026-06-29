'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react'
import { BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PageTransition } from '@/components/layout/PageTransition'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.status === 401) {
        toast.error('Your session expired. Please sign in again.')
        signOut({ callbackUrl: '/login' })
        return
      }

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error ?? 'Could not create account')
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Account created, but sign in failed')
        return
      }

      router.push('/')
    } catch {
      toast.error('Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-4 py-12">
      <PageTransition className="w-full max-w-md">
      <Card className="w-full border border-stone-100 bg-white shadow-sm hover:shadow-md">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-800">
            <BookOpen className="size-7" />
          </div>
          <div>
            <h1 className="font-serif text-5xl font-semibold tracking-tight text-stone-900">
              Memoir
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Your memories, beautifully remembered.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button className="h-10 w-full hover:bg-amber-600" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link className="font-medium text-stone-900 underline-offset-4 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      </PageTransition>
    </main>
  )
}
