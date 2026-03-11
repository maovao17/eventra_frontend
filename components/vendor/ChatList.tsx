"use client"

import { Search, Filter } from "lucide-react"
import ChatItem from "./ChatItem"

export default function ChatList(){

return(

<div className="h-full flex flex-col">

{/* HEADER */}

<div className="p-5 border-b">

<h2 className="text-lg font-semibold">
Messages
</h2>

<div className="flex items-center gap-2 mt-3 theme-surface px-3 py-2 rounded-md">

<Search size={16} className="theme-muted"/>

<input
placeholder="Search chats..."
className="bg-transparent outline-none text-sm w-full"
/>

</div>

</div>


{/* CHAT LIST */}

<div className="flex-1 overflow-y-auto">

<ChatItem
name="Aiden Fernandes"
event="Aiden's 10th Birthday Party"
time="2:45 PM"
active
/>

<ChatItem
name="Clara Pereira"
event="Pereira Housewarming"
time="11:20 AM"
unread={2}
/>

<ChatItem
name="Ryan Rodrigues"
event="Baptism Lunch"
time="Yesterday"
/>

<ChatItem
name="Maria D'Souza"
event="Golden Wedding Anniversary"
time="Nov 28"
/>

</div>

</div>

)

}