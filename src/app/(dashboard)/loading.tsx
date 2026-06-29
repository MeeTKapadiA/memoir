import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#FAFAF7]">
      <Loader2 className="size-8 animate-spin text-stone-500" />
    </div>
  )
}
