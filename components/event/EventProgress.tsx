export default function EventProgress({
  progress,
}: {
  progress: number;
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface)] p-4">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="theme-primary font-semibold">{progress}%</span>
      </div>
      <div className="theme-progress-track h-2 w-full rounded-full">
        <div
          className="h-2 rounded-full bg-[var(--primary)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="theme-muted mt-3 text-xs">
        Progress updates as services, requests, bookings, and payments move forward.
      </p>
    </div>
  );
}
