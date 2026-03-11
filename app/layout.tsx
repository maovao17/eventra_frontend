import "./globals.css"
import { EventProvider } from "@/context/EventContext"
import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EventProvider>
          {children}
        </EventProvider>
      </body>
    </html>
  )
}
