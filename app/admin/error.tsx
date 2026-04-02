"use client"

import { ErrorState } from "@/components/ui/PageState"

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="We couldn't load the admin workspace."
      description="Retry to continue reviewing vendors, users, bookings, or payments."
      onRetry={reset}
      retryLabel="Retry"
    />
  )
}
