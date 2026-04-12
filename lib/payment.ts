"use client"

import { apiFetch } from '@/app/lib/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: Record<string, string>) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
};

const RAZORPAY_SCRIPT_ID = 'eventra-razorpay-sdk';
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
export const PLATFORM_FEE = 0;
export const RAZORPAY_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || '';

export const createRazorpayOrder = async (bookingId: string) => {
  const response = await apiFetch('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });

  return {
    orderId: (response as any).orderId,
    amount: (response as any).amount,
    currency: 'INR' as const,
  };
};

export const loadRazorpayScript = async () => {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
  if (existingScript) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async ({
  amount,
  bookingId,
  customerName,
  customerPhone,
  onSuccess,
  onDismiss,
  onError,
}: {
  amount: number;
  bookingId: string;
  customerName?: string;
  customerPhone?: string;
  onSuccess: (response: Record<string, string> & { orderId: string; paymentId?: string }) => void;
  onDismiss?: () => void;
  onError?: (message: string) => void;
}) => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded || !window.Razorpay) {
    throw new Error('Unable to load Razorpay right now.');
  }

  if (!RAZORPAY_PUBLIC_KEY) {
    throw new Error('Razorpay is not configured for this environment.');
  }

  const order = await createRazorpayOrder(bookingId);
  const razorpay = new window.Razorpay({
    key: RAZORPAY_PUBLIC_KEY,
    amount: order.amount,
    currency: order.currency,
    name: 'Eventra',
    description: 'Event booking payment',
    handler: async (response: Record<string, string>) => {
      try {
        const verifyResponse = await apiFetch('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
            amount,
          }),
        });

        if (!(verifyResponse as { success?: boolean })?.success) {
          throw new Error('Payment verification failed.');
        }

        onSuccess({
          ...response,
          orderId: order.orderId,
          paymentId: (verifyResponse as any).paymentId,
        });
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : 'Payment verification failed. Please contact support.',
        );
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
      bookingId,
    },
    theme: {
      color: '#E87D5F',
    },
  });

  razorpay.open();
};
