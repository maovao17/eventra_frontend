import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";

export default function MessagesPage() {
  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow">

      <ChatList />

      <ChatWindow />

    </div>
  );
}