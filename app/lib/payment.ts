export * from "@/lib/payment";
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const startPayment = async (options: any) => {
  const res = await loadRazorpay();

  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  const paymentObject = new (window as any).Razorpay(options);
  paymentObject.open();
};