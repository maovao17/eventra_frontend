export default function PaymentsPage() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Checkout Summary
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <div className="flex justify-between">
          <span>Photography</span>
          <span>₹15,000</span>
        </div>

        <div className="flex justify-between">
          <span>Decor</span>
          <span>₹25,000</span>
        </div>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹40,000</span>
        </div>

        <button className="bg-[#E87D5F] text-white px-6 py-3 rounded-full">
          Pay Now
        </button>

      </div>

    </div>
  );
}