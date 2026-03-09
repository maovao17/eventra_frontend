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

      <div className="w-full bg-gray-200 h-2 rounded-full">

        <div
          className="bg-[#E87D5F] h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>

      </div>

    </div>
  );
}