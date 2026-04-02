"use client"

import Link from "next/link"
import Spinner from "@/components/ui/Spinner"
import Skeleton from "@/components/ui/Skeleton"

type PageShellProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageIntroSkeleton() {
  return (
    <div className="max-w-3xl space-y-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-12 w-72 max-w-full" />
      <Skeleton className="h-5 w-full max-w-2xl" />
    </div>
  )
}

export function PageCardSkeleton({
  count = 3,
  className = "md:grid-cols-3",
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`grid gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="theme-card p-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="mt-5 h-6 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-6 h-10 w-32 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function RouteLoadingState() {
  return (
    <div className="space-y-8">
      <PageIntroSkeleton />
      <div className="theme-card flex items-center justify-between gap-6 p-6">
        <Spinner size="lg" label="Loading workspace" />
        <div className="hidden flex-1 gap-3 md:grid md:grid-cols-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <PageCardSkeleton />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryAction,
}: {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  secondaryAction?: React.ReactNode
}) {
  return (
    <div className="theme-card border-dashed p-10 text-center">
      <div className="mx-auto max-w-xl">
        <p className="theme-primary text-xs font-semibold uppercase tracking-[0.24em]">
          Nothing Here Yet
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
        <p className="theme-muted mt-3 text-sm">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && actionHref ? (
            <Link href={actionHref} className="theme-button">
              {actionLabel}
            </Link>
          ) : null}
          {secondaryAction}
        </div>
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try Again",
}: {
  title: string
  description: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div className="theme-card border border-red-100 bg-red-50/80 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Something Went Wrong
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-red-950">{title}</h2>
      <p className="mt-3 text-sm text-red-800">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}

export function ProtectedLayoutLoading({
  title,
  subtitle,
}: PageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="theme-card w-full max-w-2xl p-8">
        <p className="theme-primary text-xs font-semibold uppercase tracking-[0.24em]">
          Eventra
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        {subtitle ? <p className="theme-muted mt-3">{subtitle}</p> : null}
        <div className="mt-6 flex items-center gap-4">
          <Spinner size="lg" label="Checking access" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
