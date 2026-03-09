"use client";

const chats = ["Velvet & Vine", "Lumiere Studios", "Spice Route Catering"];

export default function ChatList() {
  return <aside className="w-full border-r border-slate-200 bg-white p-4 md:w-80"><h2 className="font-semibold">Conversations</h2><div className="mt-4 space-y-2">{chats.map((chat, i)=><button key={chat} className={`w-full rounded-xl p-3 text-left text-sm ${i===0?"bg-orange-50 text-orange-700":"hover:bg-slate-100"}`}>{chat}<span className="ml-2 rounded-full bg-orange-500 px-1.5 text-[10px] text-white">{i===0?2:0}</span></button>)}</div></aside>;
}
