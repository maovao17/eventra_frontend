function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold">{number}</h3>
      <p className="text-gray-500 text-sm mt-1 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="border-t border-b border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <Stat number="150+" label="Vendor Categories" />
        <Stat number="1k+" label="Successful Events" />
        <Stat number="4.9/5" label="User Rating" />
        <Stat number="₹1M+" label="Payments Secured" />
      </div>
    </section>
  );
}