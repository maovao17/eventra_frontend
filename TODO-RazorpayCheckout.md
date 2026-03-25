# Razorpay Checkout Frontend Integration TODO

## Goal:
Replace mock payments with real Razorpay checkout on vendor bookedClientDetails 'Awaiting Payment' → 'Pay Now' button.

## Steps:
- [ ] 1. Update lib/payment.ts - replace createMockOrder with real /payments/create-order API
- [ ] 2. Add verifyPayment to lib/payment.ts or vendorApi.ts
- [ ] 3. In bookedClientDetails/page.tsx - add handlePayNow using openRazorpayCheckout on accepted status
- [ ] 4. Backend: Add /payments/verify endpoint (signature verification)
- [ ] 5. Test full flow
- [ ] 6. Complete

## Files:
Primary: eventra_frontend/app/(vendor)/vendor/bookedClientDetails/page.tsx
lib/payment.ts (has Razorpay utils)
Backend needs /payments/verify POST
