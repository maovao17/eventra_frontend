"use client";

import { useSearchParams } from "next/navigation";
import VendorCard from "@/components/customer/VendorCard";
import { vendors } from "@/app/lib/mock-data";

export default function VendorsPage() {
  const params = useSearchParams();
  const service = params.get("service");

  const filtered = service ? vendors.filter((vendor) => vendor.service.toLowerCase().includes(service.toLowerCase())) : vendors;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-3xl font-bold">Vendor Discovery</h1>
      <div className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4">
        <input className="input" placeholder="Price range" />
        <input className="input" placeholder="Rating 4.5+" />
        <input className="input" placeholder="Location" />
        <input className="input" type="date" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((vendor, index) => <VendorCard key={vendor.id} {...vendor} index={index} />)}</div>
    </div>
  );
}
