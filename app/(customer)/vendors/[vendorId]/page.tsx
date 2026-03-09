import Image from "next/image";
import Link from "next/link";

export default function VendorProfilePage({ params }: { params: { vendorId: string } }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="relative h-80 w-full"><Image src="/HeroCard.avif" alt="Vendor" fill className="object-cover" /></div></div>
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold">Vendor profile · {params.vendorId}</h1>
        <p className="mt-2 text-slate-600">Luxury event specialists with tailored packages, on-site teams, and transparent pricing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Basic", "Premium", "Luxury"].map((tier) => <div key={tier} className="glass-card p-5"><h3 className="font-semibold">{tier}</h3><p className="mt-2 text-sm text-slate-500">Price: ₹35,000+</p><p className="text-sm text-slate-500">Duration: 6 hours</p><p className="text-sm text-slate-500">Deliverables: Setup + team</p></div>)}
      </div>
      <div className="glass-card p-6">
        <h2 className="font-semibold">Availability Calendar</h2>
        <input type="date" className="input mt-3 max-w-xs" />
        <Link href="/messages" className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm text-white">Send Request</Link>
      </div>
    </div>
  );
}
