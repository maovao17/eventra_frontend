import EventProgress from "./EventProgress";

export default function EventCard({
  title,
  date,
  progress,
}: {
  title: string;
  date: string;
  progress: number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">

      <h3 className="font-semibold text-lg">
        {title}
      </h3>

      <p className="text-gray-500 text-sm">
        Event Date: {date}
      </p>

      <EventProgress progress={progress} />

    </div>
  );
}