"use client"

import {
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react"

interface Props {
  name: string
  event: string
  date: string
  location: string
  guests: number
  price: string
  avatar: string
  status: "pending" | "accepted" | "rejected"
  bookingId?: string
  onAccept?: () => void
  onDecline?: () => void
  onDetails?: () => void
  onChat?: () => void
  disabled?: boolean
}

export default function BookingCard({
  name,
  event,
  date,
  location,
  guests,
  price,
  avatar,
  status,
  bookingId,
  onAccept,
  onDecline,
  onDetails,
  onChat,
  disabled,
}: Props) {
  return (
    <div className="theme-card p-5 flex items-center justify-between shadow-sm">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-[var(--text-main)]">
            {name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="theme-surface text-xs px-2 py-1 rounded-full">
              {event}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === "accepted"
                ? "bg-[var(--primary-light)] text-[var(--primary)]"
                : status === "rejected"
                  ? "bg-red-50 text-red-500"
                  : "theme-surface theme-muted"
            }`}>
              {status === "accepted" ? "Accepted" : status === "rejected" ? "Rejected" : "Pending"}
            </span>
          </div>
          <div className="flex gap-6 text-sm theme-muted mt-2">
            <div className="flex items-center gap-1">
              <Calendar size={14}/>
              {date}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14}/>
              {location}
            </div>
            <div className="flex items-center gap-1">
              <Users size={14}/>
              {guests} Guests
            </div>
          </div>
        </div>
      </div>

      {/* PRICE */}
      <div className="text-lg font-semibold text-[var(--text-main)]">
        {price}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3">
        {onAccept && status !== "accepted" && (
          <button 
            onClick={onAccept} 
            disabled={disabled}
            className="flex items-center gap-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm"
          >
            <CheckCircle size={16}/>
            Accept
          </button>
        )}
        {onDecline && status !== "rejected" && (
          <button 
            onClick={onDecline}
            disabled={disabled}
            className="flex items-center gap-2 text-red-500 border hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-md text-sm"
          >
            <XCircle size={16}/>
            Reject
          </button>
        )}
        {onDetails && (
          <button 
            onClick={onDetails}
            disabled={disabled}
            className="flex items-center gap-2 border hover:bg-gray-50 disabled:opacity-50 px-4 py-2 rounded-md text-sm theme-muted"
          >
            <Eye size={16}/>
            Details
          </button>
        )}
        {status === "accepted" && onChat && bookingId && (
          <button 
            onClick={onChat}
            disabled={disabled}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            <MessageCircle size={16}/>
            Chat
          </button>
        )}
      </div>
    </div>
  )
}
