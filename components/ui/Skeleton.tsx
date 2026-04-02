"use client"

type SkeletonProps = {
  className?: string
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-2xl bg-[rgba(31,41,55,0.08)] ${className}`} />
}
