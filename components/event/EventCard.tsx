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
    <div className="theme-card space-y-4 p-6">

      <h3 className="font-semibold text-lg">
        {title}
      </h3>

      <p className="theme-muted text-sm">
        Event Date: {date}
      </p>

      <EventProgress progress={progress} />

    </div>
  );
}
