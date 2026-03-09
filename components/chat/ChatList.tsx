export default function ChatList() {
  return (
    <div className="w-1/3 border-r p-4">

      <h2 className="font-semibold mb-4">
        Messages
      </h2>

      <div className="space-y-3">

        <div className="p-3 rounded-lg bg-gray-100 cursor-pointer">
          Floral Fantasies
        </div>

        <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
          Wedding Decorators
        </div>

        <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
          Music Events
        </div>

      </div>

    </div>
  );
}