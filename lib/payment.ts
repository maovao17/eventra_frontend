"use client"

import { apiFetch } from '@/app/lib/api';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
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
export const RAZORPAY_TEST_KEY = 'rzp_test_1DP5mmOlF5G5ag';

export const createRazorpayOrder = async (amount: number) => {
  const response = await apiFetch('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  
  if (response?.error) {
    throw new Error(response.message || 'Failed to create order');
  }
  
  return {
    orderId: response.orderId,
    amount: response.amount,
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
  customerName,
  customerPhone,
  onSuccess,
  onDismiss,
}: {
  amount: number;
  customerName?: string;
  customerPhone?: string;
  onSuccess: (response: Record<string, string> & { orderId: string }) => void;
  onDismiss?: () => void;
}) => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded || !window.Razorpay) {
    throw new Error('Unable to load Razorpay right now.');
  }

  const order = await createRazorpayOrder(amount);
  const razorpay = new window.Razorpay({
    key: RAZORPAY_TEST_KEY,
    amount: order.amount,
    currency: order.currency,
    name: 'Eventra',
    description: 'Event booking payment',
    handler: async (response) => {
      try {
        const verifyResponse = await apiFetch('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        
        if (verifyResponse?.error) {
          throw new Error(verifyResponse.message || 'Payment verification failed');
        }
        
        onSuccess({ ...response, orderId: order.orderId });
      } catch (error) {
        console.error('Payment verification error:', error);
        alert('Payment verification failed. Please contact support.');
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
      color: '#E87D5F',
    },
  });

  razorpay.open();
};

