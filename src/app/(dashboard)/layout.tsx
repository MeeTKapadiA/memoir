import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { Sidebar } from '@/components/layout/Sidebar'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Sidebar user={session.user} />
      <main className="ml-[260px] h-screen overflow-y-auto bg-[#FAFAF7]">
        {children}
      </main>
    </div>
  )
}
