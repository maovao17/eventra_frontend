export default function Home() {
  return (
    <main className="bg-[#f6f1ec] text-gray-900">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6">
        <h1 className="text-xl font-bold text-orange-500">Eventra</h1>

        <div className="space-x-6 text-sm">
          <a href="#" className="hover:text-orange-500">Log in</a>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 items-center px-10 py-20 gap-10">

        {/* Left Text */}
        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Plan Your Event.
            <br />
            Book Trusted Vendors.
            <br />
            <span className="text-orange-500">All in One Place.</span>
          </h2>

          <p className="mt-6 text-gray-600 max-w-md">
            Eventra streamlines everything from wedding dreams to corporate summits.
            Discovery, booking, and payments—simplified.
          </p>

          <div className="mt-8 space-x-4">
            <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition">
              Plan an Event
            </button>
            <button className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition">
              Join as Business
            </button>
          </div>
        </div>

        {/* Right Mock Card */}
        <div className="bg-white shadow-xl rounded-2xl p-10">
          <p className="text-gray-400">Vendor Booking Interface Preview</p>
        </div>

      </section>

    </main>
  );
}