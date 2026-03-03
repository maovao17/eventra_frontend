export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm text-gray-500 uppercase">Platform Features</p>
        <h2 className="text-3xl font-bold mt-3">
          Everything You Need for the Perfect Day
        </h2>
        <p className="text-gray-600 mt-4">
          We handle logistics and vendor management so you can focus
          on enjoying your event.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <FeatureCard
          title="Compare Vendors"
          description="Browse verified portfolios and compare quotes."
        />
        <FeatureCard
          title="Secure Payments"
          description="Pay safely with secure escrow protection."
        />
        <FeatureCard
          title="Easy Communication"
          description="Centralized hub for chats and contracts."
        />
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600 mt-4 text-sm">{description}</p>
      <p className="mt-6 text-[#E07A5F] text-sm font-medium cursor-pointer">
        Learn more →
      </p>
    </div>
  );
}