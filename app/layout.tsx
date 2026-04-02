import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { EventProvider } from "@/context/EventContext"
import { ToastProvider } from "@/context/ToastContext"
import { VendorProvider } from "@/context/VendorContext"
import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <VendorProvider>
              <EventProvider>
                {children}
              </EventProvider>
            </VendorProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
