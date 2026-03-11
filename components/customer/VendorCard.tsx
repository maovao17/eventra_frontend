import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Vendor = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  responseTime: string;
};

export default function VendorCard({
  vendor,
  requested,
  onRequest,
}: {
  vendor: Vendor;
  requested?: boolean;
  onRequest?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      className="theme-card overflow-hidden transition hover:shadow-lg"
    >
        <div className="relative h-44">
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            className="rounded-t-xl object-cover"
          />
        </div>

        <div className="p-4 space-y-2">

          <h3 className="font-semibold">
            {vendor.name}
          </h3>

          <p className="theme-muted text-sm">
            {vendor.category}
          </p>

          <p className="theme-muted text-xs">
            {vendor.responseTime}
          </p>

          <div className="flex justify-between items-center">

            <span className="theme-primary font-bold">
              ₹{vendor.price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href={`/vendors/${vendor.id}`}
              className="flex-1 rounded-xl border px-4 py-2 text-center text-sm"
            >
              View Profile
            </Link>

            <button
              type="button"
              onClick={onRequest}
              className={`flex-1 rounded-xl px-4 py-2 text-sm ${
                requested ? "bg-[var(--primary-light)] text-[var(--primary)]" : "theme-button"
              }`}
            >
              {requested ? "Request Sent" : "Send Request"}
            </button>
          </div>
        </div>
    </motion.div>
  );
}
