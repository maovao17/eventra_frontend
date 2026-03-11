export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-card p-6">
      {children}
    </div>
  );
}
