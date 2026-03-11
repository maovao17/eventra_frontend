"use client"

import { useState } from "react"
import BookingCard from "@/components/vendor/BookingCard"
import FilterBar from "@/components/vendor/FilterBar"

type BookingStatus = "pending" | "accepted" | "declined"

interface Booking {
  name: string
  event: string
  date: string
  location: string
  guests: number
  price: string
  avatar: string
  status: BookingStatus
}

const initialBookings: Booking[] = [
  {
    name: "John D'silva",
    event: "50th Birthday Party",
    date: "12 Dec 2025",
    location: "Panaji, North Goa",
    guests: 80,
    price: "₹45,000",
    avatar: "/eventra_photos/wedding8.jpg",
    status: "pending",
  },
  {
    name: "Nerissa Noronha",
    event: "Roce Ceremony",
    date: "15 Feb 2026",
    location: "Margao, South Goa",
    guests: 150,
    price: "₹80,000",
    avatar: "/eventra_photos/wedding2.jpg",
    status: "pending",
  },
  {
    name: "Clara Pereira",
    event: "Housewarming",
    date: "20 Dec 2025",
    location: "Benaulim, South Goa",
    guests: 45,
    price: "₹25,000",
    avatar: "/eventra_photos/party2.jpg",
    status: "pending",
  },
  {
    name: "Ryan Rodrigues",
    event: "Baptism Lunch",
    date: "05 Jan 2026",
    location: "Old Goa",
    guests: 60,
    price: "₹35,000",
    avatar: "/eventra_photos/bday4.jpg",
    status: "pending",
  },
  {
    name: "Shania Gonsalves",
    event: "Engagement Ceremony",
    date: "22 May 2026",
    location: "Calangute, North Goa",
    guests: 120,
    price: "₹95,000",
    avatar: "/eventra_photos/gala2.jpg",
    status: "pending",
  },
]

export default function BookingRequests() {
const [bookings, setBookings] = useState(initialBookings)

const updateBookingStatus = (index: number, status: BookingStatus) => {
  setBookings((current) =>
    current.map((booking, bookingIndex) =>
      bookingIndex === index ? { ...booking, status } : booking
    )
  )
}

return (

<div className="space-y-6">

{/* PAGE HEADER */}

<div className="flex justify-between items-center">

<div>
<h1 className="text-2xl font-semibold">
Booking Requests
</h1>

<p className="text-gray-500 text-sm">
You have <span className="text-orange-500 font-medium">5 new leads</span> for the 2025–2026 seasons.
</p>
</div>

<FilterBar />

</div>


{/* BOOKING LIST */}

<div className="space-y-5">

{bookings.map((b,i)=>(
<BookingCard
key={i}
{...b}
onAccept={() => updateBookingStatus(i, "accepted")}
onDecline={() => updateBookingStatus(i, "declined")}
/>
))}

</div>


{/* SEASONAL INSIGHTS */}

<div className="bg-orange-50 border border-orange-200 rounded-lg p-5">

<h3 className="text-orange-600 font-semibold mb-2">
Seasonal Insights
</h3>

<p className="text-sm text-gray-600">

Most upcoming requests are concentrated in the **December 2025**
festive peak. We are also seeing a **20% increase in early bookings**
for the **Feb–May 2026 wedding season**.

Ensure your **Packages** are updated to reflect next year’s pricing.

</p>

</div>

</div>

)
}
