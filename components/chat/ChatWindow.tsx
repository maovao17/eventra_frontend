export default function ChatWindow() {
  return (
    <div className="flex flex-col flex-1">

      <div className="border-b p-4 font-semibold">
        Floral Fantasies
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">

        <div className="bg-gray-100 p-3 rounded-lg w-fit">
          Hello! How can we help with your event?
        </div>

        <div className="bg-[#E87D5F] text-white p-3 rounded-lg w-fit ml-auto">
          I need decoration for a wedding.
        </div>

      </div>

      <div className="p-4 border-t flex gap-3">

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2"
        />

        <button className="bg-[#E87D5F] text-white px-6 rounded-lg">
          Send
        </button>

      </div>

    </div>
  );
}