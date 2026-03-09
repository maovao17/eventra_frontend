export default function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{label}</span>;
}
