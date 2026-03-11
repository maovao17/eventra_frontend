import { Phone, Video, Info } from "lucide-react"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"

export default function ChatWindow(){

return(

<div className="flex flex-col h-full">

{/* CHAT HEADER */}

<div className="flex items-center justify-between p-4 border-b">

<div className="flex items-center gap-3">

<img
src="/avatar.png"
className="w-10 h-10 rounded-full"
/>

<div>

<p className="font-medium">
Aiden Fernandes
</p>

<p className="text-xs theme-muted">
Panaji • 80 Guests
</p>

</div>

</div>

<div className="flex gap-4 theme-muted">

<Phone size={18}/>
<Video size={18}/>
<Info size={18}/>

</div>

</div>


{/* CHAT MESSAGES */}

<div className="flex-1 overflow-y-auto p-6 space-y-4 theme-surface">

<MessageBubble
text="Hello Anthony, I was reviewing the catering options for Aiden's birthday party in Panaji."
time="10:15 AM"
/>

<MessageBubble
text="Hi Aiden! Great to hear from you. We have several packages perfect for a 10th birthday."
time="10:30 AM"
own
/>

<MessageBubble
text="We definitely want some traditional elements like Fish Recheado."
time="10:45 AM"
/>

<MessageBubble
text="Perfect choice. I've drafted a custom menu that blends both."
time="11:00 AM"
own
/>

</div>


{/* MESSAGE INPUT */}

<MessageInput/>

</div>

)

}