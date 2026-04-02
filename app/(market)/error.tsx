"use client"

import { ErrorState } from "@/components/ui/PageState"

export default function MarketError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <ErrorState
        title="We couldn't load this page."
        description="Retry to continue signing in or exploring Eventra."
        onRetry={reset}
        retryLabel="Retry"
      />
    </div>
  )
}
