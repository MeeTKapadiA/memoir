import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-stone-200 bg-transparent px-2.5 py-2 text-base text-stone-900 transition-colors duration-200 outline-none placeholder:text-stone-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
