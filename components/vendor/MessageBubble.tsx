interface Props{
text:string
time:string
own?:boolean
}

export default function MessageBubble({text,time,own}:Props){

return(

<div className={`flex ${own ? "justify-end" : "justify-start"}`}>

<div className={`max-w-md p-4 rounded-xl text-sm
${own ? "bg-[var(--primary)] text-white" : "theme-card border"}`}>

<p>{text}</p>

<p className={`text-xs mt-2 ${own ? "text-white/80" : "theme-muted"}`}>
{time}
</p>

</div>

</div>

)

}