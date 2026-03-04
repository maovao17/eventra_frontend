import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-[#E87D5F]">Eventra</h1>

      <div className="space-x-6 text-sm">
        <Link href="/login" className="hover:text-[#E87D5F]">
          Log in
        </Link>

        <Link
          href="/signup"
          className="bg-[#E87D5F] text-white px-5 py-2 rounded-full hover:opacity-90 transition"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}