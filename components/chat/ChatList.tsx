export default function ChatList() {
  return (
    <div className="theme-card w-1/3 rounded-r-none border-y-0 border-l-0 p-4 shadow-none">

      <h2 className="font-semibold mb-4">
        Messages
      </h2>

      <div className="space-y-3">

        <div className="theme-surface cursor-pointer rounded-lg p-3 text-[var(--primary)]">
          Floral Fantasies
        </div>

        <div className="cursor-pointer rounded-lg p-3 transition hover:bg-[var(--surface)]">
          Wedding Decorators
        </div>

        <div className="cursor-pointer rounded-lg p-3 transition hover:bg-[var(--surface)]">
          Music Events
        </div>

      </div>

    </div>
  );
}
