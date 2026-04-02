import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-10 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-6">
          <Link href="/privacy" className="transition hover:text-[#E87D5F]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-[#E87D5F]">
            Terms of Service
          </Link>
        </div>
        <p className="mt-4">© 2026 Eventra. All rights reserved.</p>
      </div>
    </footer>
  );
}
