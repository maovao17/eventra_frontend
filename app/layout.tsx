import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { EventProvider } from "@/context/EventContext"
import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <EventProvider>
            {children}
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
