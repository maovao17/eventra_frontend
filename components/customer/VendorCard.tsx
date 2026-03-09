import Link from "next/link";

export default function VendorCard() {
  return (
    <Link href="/vendors/1">

      <div className="bg-white rounded-xl shadow hover:shadow-lg transition">

        <img
          src="/vendors/vendor1.jpg"
          className="h-40 w-full object-cover rounded-t-xl"
        />

        <div className="p-4 space-y-2">

          <h3 className="font-semibold">
            Velvet & Vine Productions
          </h3>

          <p className="text-sm text-gray-500">
            Wedding Decor
          </p>

          <div className="flex justify-between items-center">

            <span className="text-[#E87D5F] font-bold">
              ₹85,000
            </span>

            <button className="bg-[#E87D5F] text-white px-4 py-1 rounded-full text-sm">
              View
            </button>

          </div>

        </div>

      </div>

    </Link>
  );
}