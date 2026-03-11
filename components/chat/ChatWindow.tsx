export default function ChatWindow() {
  return (
    <div className="flex flex-col flex-1">

      <div className="theme-border border-b p-4 font-semibold">
        Floral Fantasies
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">

        <div className="theme-surface w-fit rounded-lg p-3">
          Hello! How can we help with your event?
        </div>

        <div className="ml-auto w-fit rounded-lg bg-[var(--primary)] p-3 text-white">
          I need decoration for a wedding.
        </div>

      </div>

      <div className="theme-border flex gap-3 border-t p-4">

        <input
          type="text"
          placeholder="Type a message..."
          className="input flex-1 px-4 py-2"
        />

        <button className="theme-button rounded-lg px-6">
          Send
        </button>

      </div>

    </div>
  );
}
