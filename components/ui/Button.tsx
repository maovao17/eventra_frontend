export default function Button({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button className="bg-[#E87D5F] text-white px-6 py-3 rounded-full hover:opacity-90 transition">
      {children}
    </button>
  );
}