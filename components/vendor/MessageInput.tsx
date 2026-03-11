"use client"

import { Paperclip, Smile, Send } from "lucide-react"

export default function MessageInput(){

return(

<div className="border-t p-4 theme-card">

<div className="flex items-center gap-3 theme-surface px-4 py-2 rounded-full">

<Paperclip size={18} className="theme-muted"/>

<input
placeholder="Type your message here..."
className="flex-1 bg-transparent outline-none text-sm"
/>

<Smile size={18} className="theme-muted"/>

<button className="theme-primary">

<Send size={18}/>

</button>

</div>

<p className="text-xs theme-muted text-center mt-2">
Secure messaging via end-to-end encryption
</p>

</div>

)

}