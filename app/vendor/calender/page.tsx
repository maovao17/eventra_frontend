"use client"

import { useEffect, useMemo, useState } from "react"
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useAuth } from "@/context/AuthContext"
import { getVendorMe, updateVendorAvailability } from "@/app/lib/vendorApi"
import { useToast } from "@/context/ToastContext"

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10)

export default function Calendar(){
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [startHour, setStartHour] = useState("09:00")
  const [endHour, setEndHour] = useState("18:00")

  const today = useMemo(() => new Date(), [])
  const currentMonthLabel = useMemo(
    () => today.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [today],
  )

  useEffect(() => {
    const loadAvailability = async () => {
      if (!profile?.uid) return

      setLoading(true)
      try {
        const response = await getVendorMe()
        const nextBlocked = Array.isArray(response?.availability?.blockedDates)
          ? response.availability.blockedDates.map((value: string) => String(value).slice(0, 10))
          : []
        const nextBooked = Array.isArray(response?.availability?.bookedDates)
          ? response.availability.bookedDates.map((value: string) => String(value).slice(0, 10))
          : []

        setBlockedDates(nextBlocked)
        setBookedDates(nextBooked)
        setStartHour(response?.availability?.workingHours?.start || "09:00")
        setEndHour(response?.availability?.workingHours?.end || "18:00")
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Could not load availability"
        setError(message)
        showToast(message, "error")
      } finally {
        setLoading(false)
      }
    }

    void loadAvailability()
  }, [profile?.uid])

  const monthDays = useMemo(() => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const leadingBlanks = firstDay.getDay()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    const result: Array<{ day: number | null; date: string | null }> = []

    for (let i = 0; i < leadingBlanks; i += 1) {
      result.push({ day: null, date: null })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), day)
      result.push({ day, date: toIsoDate(date) })
    }

    while (result.length < 35) {
      result.push({ day: null, date: null })
    }

    return result.slice(0, 35)
  }, [today])

  const toggleBlockedDate = (date: string | null) => {
    if (!date) return
    if (bookedDates.includes(date)) return

    setBlockedDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date],
    )
  }

  const saveAvailability = async () => {
    if (!profile?.uid) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updateVendorAvailability({
        blockedDates,
        workingHours: {
          start: startHour,
          end: endHour,
        },
      })
      setSuccess("Availability updated")
      showToast("Availability updated.", "success")
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save availability"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageCardSkeleton count={2} className="md:grid-cols-1" />
  }

  if (error && !blockedDates.length && !bookedDates.length) {
    return (
      <ErrorState
        title="We couldn't load availability."
        description={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    )
  }

return(

<div className="space-y-4">

<h1 className="text-xl font-semibold mb-2">
{currentMonthLabel}
</h1>

<div className="flex gap-3 items-center">
<input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="border rounded-md px-2 py-1" />
<input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className="border rounded-md px-2 py-1" />
<button onClick={() => void saveAvailability()} className="border px-3 py-1 rounded-md" disabled={saving}>
{saving ? "Saving..." : "Save Availability"}
</button>
</div>

<p className="theme-muted text-sm">
Booked dates are blocked automatically and cannot be edited here.
</p>

{error && <p className="text-red-500 text-sm">{error}</p>}
{success && <p className="text-green-600 text-sm">{success}</p>}

<div className="grid grid-cols-7 gap-2">

{monthDays.map((entry, i)=>(
<div
key={`${entry.date || "empty"}-${i}`}
onClick={() => toggleBlockedDate(entry.date)}
className={`theme-card h-24 flex items-center justify-center rounded ${
  entry.date && bookedDates.includes(entry.date)
    ? "bg-[var(--primary)] text-white"
    : entry.date && blockedDates.includes(entry.date)
      ? "border-2 border-red-400"
      : ""
}`}
>
{entry.day ?? ""}
</div>
))}

</div>

<div className="flex gap-6 text-sm">
<div className="flex items-center gap-2">
<span className="inline-block h-3 w-3 rounded-full border-2 border-red-400" />
<span>Blocked</span>
</div>
<div className="flex items-center gap-2">
<span className="inline-block h-3 w-3 rounded-full bg-[var(--primary)]" />
<span>Booked automatically</span>
</div>
</div>

</div>

)
}
