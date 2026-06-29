import { Skeleton } from '@/components/ui/skeleton'

export default function EntryLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] px-8 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <Skeleton className="h-16 w-64" />
          <div className="mt-5 flex gap-3">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
            <Skeleton className="h-8 w-32 rounded-full" />
            <div className="mt-8 space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
