import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";

export default function MessagesPage() {
  return <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-slate-200"><ChatList /><ChatWindow /></div>;
}
