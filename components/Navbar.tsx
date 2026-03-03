export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-[#E07A5F]">Eventra</h1>

      <div className="space-x-6 text-sm">
        <a href="#" className="hover:text-[#E07A5F]">
          Log in
        </a>
        <button className="bg-[#E07A5F] text-white px-5 py-2 rounded-full hover:opacity-90 transition">
          Sign up
        </button>
      </div>
    </nav>
  );
}