export default function Button({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button className="theme-button px-6 py-3">
      {children}
    </button>
  );
}
