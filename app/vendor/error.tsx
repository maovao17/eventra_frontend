"use client"

import { ErrorState } from "@/components/ui/PageState"

export default function VendorError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="We couldn't load your vendor workspace."
      description="Retry to get back to bookings, messages, and profile updates."
      onRetry={reset}
      retryLabel="Retry"
    />
  )
}
