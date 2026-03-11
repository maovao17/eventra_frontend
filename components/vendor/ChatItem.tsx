interface Props{
name:string
event:string
time:string
active?:boolean
unread?:number
}

export default function ChatItem({
name,event,time,active,unread
}:Props){

return(

<div className={`flex items-center justify-between px-5 py-4 border-b cursor-pointer
${active ? "bg-[var(--primary-light)] border-l-4 border-[var(--primary)]" : ""}`}>

<div className="flex gap-3">

<img
src="/avatar.png"
className="w-10 h-10 rounded-full"
/>

<div>

<p className="font-medium text-sm">
{name}
</p>

<p className="text-xs theme-muted">
{event}
</p>

</div>

</div>

<div className="text-right">

<p className="text-xs theme-muted">
{time}
</p>

{unread && (
<span className="bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
{unread}
</span>
)}

</div>

</div>

)

}