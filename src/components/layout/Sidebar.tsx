'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Home,
  LogOut,
  MessageCircle,
  PenLine,
  Search,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SidebarUser = {
  name?: string | null
  email?: string | null
}

const navItems = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/timeline', label: 'Timeline', icon: Calendar },
  { href: '/search', label: 'Search Memories', icon: Search },
  { href: '/chat', label: 'Chat with Memories', icon: MessageCircle },
]

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const displayName = user.name || 'Memoir User'
  const email = user.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[260px] flex-col bg-[#1C1917] px-4 py-6 text-white">
      <Link className="mb-8 flex items-center gap-3 px-2" href="/">
        <div className="flex size-10 items-center justify-center rounded-xl bg-stone-800 text-amber-400">
          <BookOpen className="size-5" />
        </div>
        <span className="font-serif text-3xl font-semibold tracking-tight">
          Memoir
        </span>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              className="relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium text-stone-200 transition-colors duration-200 hover:bg-stone-800 hover:text-white"
              href={item.href}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-stone-700"
                  transition={{ duration: 0.2 }}
                />
              ) : null}
              <Icon className="relative z-10 size-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}

        <Link
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-amber-600',
            pathname === '/new' && 'bg-amber-600'
          )}
          href="/new"
        >
          <PenLine className="size-4" />
          New Entry
        </Link>
      </nav>

      <div className="mt-auto border-t border-stone-800 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="bg-stone-700">
            <AvatarFallback className="bg-stone-700 font-semibold text-white">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            <p className="truncate text-xs text-stone-400">{email}</p>
          </div>
        </div>
        <Button
          className="w-full justify-start gap-2 text-stone-300 transition-colors duration-200 hover:bg-stone-800 hover:text-white"
          type="button"
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="size-4" />
          Log Out
        </Button>
      </div>
    </aside>
  )
}
