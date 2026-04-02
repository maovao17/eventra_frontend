"use client"

import { ErrorState } from "@/components/ui/PageState"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 md:p-10">
      <ErrorState
        title="We couldn't load this screen."
        description="Please retry. If the issue continues, refresh the page and try again."
        onRetry={reset}
        retryLabel="Retry"
      />
    </div>
  )
}
