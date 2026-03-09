"use client";

import { motion } from "framer-motion";

const messages = [
  { from: "vendor", text: "We can lock your date for 12 Dec.", time: "10:18 AM" },
  { from: "customer", text: "Great, sharing event details now.", time: "10:20 AM" },
];

export default function ChatWindow() {
  return (
    <section className="flex flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white p-4 font-semibold">Velvet & Vine · typing...</header>
      <div className="flex-1 space-y-3 overflow-y-auto p-6">{messages.map((message, index) => <motion.div key={index} initial={{ opacity: 0, x: message.from === "customer" ? 16 : -16 }} animate={{ opacity: 1, x: 0 }} className={`max-w-sm rounded-2xl p-3 text-sm ${message.from === "customer" ? "ml-auto bg-orange-500 text-white" : "bg-white"}`}>{message.text}<p className={`mt-1 text-[10px] ${message.from === "customer" ? "text-orange-100" : "text-slate-400"}`}>{message.time}</p></motion.div>)}</div>
      <div className="border-t border-slate-200 bg-white p-4"><div className="flex gap-2"><input className="input" placeholder="Type a message..." /><button className="rounded-xl bg-slate-900 px-4 text-sm text-white">Send</button></div></div>
    </section>
  );
}
