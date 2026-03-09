export default function BudgetTracker() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="font-semibold mb-4">
        Budget Overview
      </h2>

      <div className="flex justify-between text-sm mb-2">
        <span>Spent</span>
        <span>₹40,000</span>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded-full">

        <div className="bg-[#E87D5F] h-3 rounded-full w-2/3"></div>

      </div>

      <p className="text-sm mt-2">d
        Remaining ₹20,000
      </p>

    </div>
  );
}