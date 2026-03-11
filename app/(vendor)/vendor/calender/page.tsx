export default function Calendar(){

return(

<div>

<h1 className="text-xl font-semibold mb-6">
May 2026
</h1>

<div className="grid grid-cols-7 gap-2">

{Array.from({length:35}).map((_,i)=>(
<div
key={i}
className="theme-card h-24 flex items-center justify-center rounded"
>
{i+1}
</div>
))}

</div>

</div>

)
}