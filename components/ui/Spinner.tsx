"use client"

type SpinnerProps = {
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
}

export default function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}: SpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block animate-spin rounded-full border-[var(--primary-light)] border-t-[var(--primary)] ${sizeClasses[size]}`}
      />
      <span className="text-sm theme-muted">{label}</span>
    </div>
  )
}
