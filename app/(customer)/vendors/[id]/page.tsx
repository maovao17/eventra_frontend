export default function VendorProfile() {
  return (
    <div className="space-y-6">

      <img
        src="/vendors/vendor1.jpg"
        className="w-full h-64 object-cover rounded-xl"
      />

      <h1 className="text-3xl font-bold">
        Velvet & Vine Productions
      </h1>

      <p className="text-gray-600">
        Professional wedding decorators with over 10 years of experience.
      </p>

      <button className="bg-[#E87D5F] text-white px-6 py-3 rounded-full">
        Send Request
      </button>

    </div>
  );
}