'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PageTransition } from '@/components/layout/PageTransition'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      toast.error('Invalid email or password')
      return
    }

    router.push('/')
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
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button className="h-10 w-full hover:bg-amber-600" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-5 rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-600">
            <p className="font-medium text-stone-800">Demo credentials</p>
            <p className="mt-1">demo@memoir.app / demo123</p>
          </div>

          <p className="mt-6 text-center text-sm text-stone-600">
            New to Memoir?{' '}
            <Link className="font-medium text-stone-900 underline-offset-4 hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
      </PageTransition>
    </main>
  )
}
