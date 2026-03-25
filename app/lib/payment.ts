import { apiFetch } from "@/app/lib/api";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_ID = "eventra-razorpay-sdk";
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

// 🔑 Replace with YOUR Razorpay KEY_ID
export const RAZORPAY_TEST_KEY = "rzp_live_SUkyhQ6cfElysR";

// ----------------------------------
// LOAD SCRIPT
// ----------------------------------
export const loadRazorpayScript = async () => {
  if (typeof window === "undefined") return false;

  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// ----------------------------------
// CREATE ORDER (CALL BACKEND)
// ----------------------------------
export const createRazorpayOrder = async (amount: number) => {
  const response = await apiFetch("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  if (response?.error) {
    throw new Error(response.message || "Failed to create order");
  }

  return {
    orderId: response.orderId,
    amount: response.amount,
    currency: "INR",
  };
};

// ----------------------------------
// OPEN CHECKOUT
// ----------------------------------
export const openRazorpayCheckout = async ({
  amount,
  customerName,
  customerPhone,
  bookingId,
  onSuccess,
  onDismiss,
}: {
  amount: number;
  customerName: string;
  customerPhone: string;
  bookingId: string;
  onSuccess: (data: any) => void;
  onDismiss?: () => void;
}) => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded || !window.Razorpay) {
    throw new Error("Razorpay SDK failed to load");
  }

  const order = await createRazorpayOrder(amount);

  const razorpay = new window.Razorpay({
    key: RAZORPAY_TEST_KEY,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,

    name: "Eventra",
    description: "Event booking payment",

    handler: async (response: any) => {
      try {
        const verifyResponse = await apiFetch("/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId
          }),
        });

        if (!verifyResponse || verifyResponse.error || verifyResponse.success === false) {
          throw new Error("Payment verification failed");
        }

        onSuccess(response);
      } catch (error) {
        console.error("Payment verification failed:", error);
        alert("Payment failed. Please try again.");
      }
    },

    modal: {
      ondismiss: onDismiss,
    },

    prefill: {
      name: customerName,
      contact: customerPhone,
    },

    notes: {
      orderReference: order.orderId,
    },

    theme: {
      color: "#E87D5F",
    },
  });

  razorpay.open();
};