export default function Stats() {
  return (
    <section className="border-t border-b border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 text-center gap-8">
        <StatItem number="150+" label="Vendor Categories" />
        <StatItem number="1k" label="Successful Events" />
        <StatItem number="4.9/5" label="User Rating" />
        <StatItem number="1M+" label="Payments Secured" />
      </div>
    </section>
  );
}

function StatItem({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div>
      <h3 className="text-2xl font-bold">{number}</h3>
      <p className="text-gray-500 text-sm mt-2 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}