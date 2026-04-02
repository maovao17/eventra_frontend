"use client"

import { ErrorState } from "@/components/ui/PageState"

export default function CustomerError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="We couldn't load your customer workspace."
      description="Retry to continue planning your event."
      onRetry={reset}
      retryLabel="Retry"
    />
  )
}
