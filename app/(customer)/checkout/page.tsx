export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="glass-card space-y-3 p-6">
        <h2 className="font-semibold">Payment Summary</h2>
        <div className="text-sm text-slate-600"><p>Photographer ₹20,000</p><p>Catering ₹35,000</p><p>Decoration ₹15,000</p></div>
        <p className="border-t border-slate-200 pt-3 text-lg font-semibold">Total ₹70,000</p>
        <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm text-white">Pay Deposit</button>
      </div>
    </div>
  );
}
