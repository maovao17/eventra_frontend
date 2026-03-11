export default function EventProgress({
  progress,
}: {
  progress: number;
}) {
  return (
    <div>

      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>

      <div className="theme-progress-track h-2 w-full rounded-full">

        <div
          className="h-2 rounded-full bg-[var(--primary)]"
          style={{ width: `${progress}%` }}
        ></div>

      </div>

    </div>
  );
}
