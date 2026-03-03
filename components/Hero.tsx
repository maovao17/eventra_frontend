import Image from "next/image";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-20 grid md:grid-cols-2 gap-16 items-center">
      {/* Left Side */}
      <div>
        <h1 className="text-5xl font-bold leading-tight">
          Plan Your Event.
          <br />
          Book Trusted Vendors.
          <br />
          <span className="text-[#E07A5F]">All in One Place.</span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-md">
          Eventra brings venues, photographers, caterers, and planners
          together in one seamless platform.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#E07A5F] text-white px-6 py-3 rounded-full hover:opacity-90 transition">
            Plan my Event
          </button>

          <button className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition">
            Join as Business
          </button>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="relative w-full h-[350px] rounded-3xl overflow-hidden shadow-lg">
        <Image
          src="/HeroCard.jpg"
          alt="Event"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}