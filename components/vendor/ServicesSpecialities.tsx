export default function ServicesSpecialities(){

const services=[
"Traditional Goan Buffet",
"Live Seafood Counter",
"Wedding Banquets",
"Corporate Lunch"
]

return(

<div className="theme-card p-6">

<h3 className="font-semibold mb-1">
Services & Specialities
</h3>

<p className="text-sm theme-muted mb-4">
List the specific types of services you can provide for events.
</p>

<div className="flex flex-wrap gap-2 mb-4">

{services.map((s,i)=>(
<span
key={i}
className="theme-surface text-sm px-3 py-1 rounded-full"
>
{s}
</span>
))}

<button className="border border-[var(--primary)] theme-primary px-3 py-1 rounded-full text-sm">
+ Add Service
</button>

</div>

<div className="theme-surface border rounded-md p-3 text-xs theme-muted">

Highlighting specific services helps our AI match you with the right customers.
We suggest adding at least 5 services to increase your visibility by up to 40%.

</div>

</div>

)

}