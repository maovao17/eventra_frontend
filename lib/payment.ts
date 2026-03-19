"use client"

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void
    }
  }
}

export type MockOrder = {
  id: string
  amount: number
  currency: string
  receipt: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  handler: (response: Record<string, string>) => void
  modal?: {
    ondismiss?: () => void
  }
  prefill?: {
    name?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
}

const RAZORPAY_SCRIPT_ID = "eventra-razorpay-sdk"
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js"
export const RAZORPAY_TEST_KEY = "rzp_test_1DP5mmOlF5G5ag"

export const createMockOrder = async (amount: number): Promise<MockOrder> => ({
  id: `order_${Date.now()}`,
  amount: Math.round(amount * 100),
  currency: "INR",
  receipt: `eventra_receipt_${Date.now()}`,
})

export const loadRazorpayScript = async () => {
  if (typeof window === "undefined") return false
  if (window.Razorpay) return true

  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID)
  if (existingScript) return true

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script")
    script.id = RAZORPAY_SCRIPT_ID
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const openRazorpayCheckout = async ({
  amount,
  customerName,
  customerPhone,
  onSuccess,
  onDismiss,
}: {
  amount: number
  customerName?: string
  customerPhone?: string
  onSuccess: (response: Record<string, string> & { orderId: string }) => void
  onDismiss?: () => void
}) => {
  const scriptLoaded = await loadRazorpayScript()

  if (!scriptLoaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay right now.")
  }

  const mockOrder = await createMockOrder(amount)
  const razorpay = new window.Razorpay({
    key: RAZORPAY_TEST_KEY,
    amount: mockOrder.amount,
    currency: mockOrder.currency,
    name: "Eventra",
    description: "Event booking payment",
    handler: (response) => onSuccess({ ...response, orderId: mockOrder.id }),
    modal: {
      ondismiss: onDismiss,
    },
    prefill: {
      name: customerName,
      contact: customerPhone,
    },
    notes: {
      orderReference: mockOrder.id,
      receipt: mockOrder.receipt,
    },
    theme: {
      color: "#E87D5F",
    },
  })

  razorpay.open()
}
