'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      })

      if (response.status === 401) {
        toast.error('Your session expired. Please sign in again.')
        signOut({ callbackUrl: '/login' })
        return
      }

      if (!response.ok) {
        toast.error('Could not delete entry')
        return
      }

      toast.success('Entry deleted')
      router.push('/timeline')
      router.refresh()
    } catch {
      toast.error('Could not delete entry')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>
              This memory will be permanently removed from your journal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-red-600 text-white hover:bg-red-700"
              type="button"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
