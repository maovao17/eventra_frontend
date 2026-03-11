import Image from "next/image";
import Link from "next/link";

export default function Topbar() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.jpeg"
          alt="Eventra"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-cover"
        />
        <h1 className="theme-primary text-xl font-bold">Eventra</h1>
      </div>

      <div className="space-x-6 text-sm">
        <Link href="/" className="theme-muted transition hover:text-[var(--primary)]">
          Home
        </Link>
      </div>
    </nav>
  );
}
