export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-20">
      <div className="bg-[#4F7A7A] text-white rounded-3xl p-16 text-center">
        <h2 className="text-3xl font-bold">
          Ready to transform your event planning experience?
        </h2>

        <p className="mt-6 text-gray-200">
          Join thousands of happy planners today.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <button className="bg-white text-[#4F7A7A] px-6 py-3 rounded-full font-medium">
            Get Started for Free
          </button>

          <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full">
            Learn About Businesses
          </button>
        </div>
      </div>
    </section>
  );
}