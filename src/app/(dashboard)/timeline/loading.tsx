import { EntrySkeleton } from '@/components/journal/EntrySkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function TimelineLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-80" />
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <Skeleton className="mx-auto mb-5 h-8 w-48" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <EntrySkeleton />
        <EntrySkeleton />
        <EntrySkeleton />
      </div>
    </div>
  )
}
