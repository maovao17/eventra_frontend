export default function Reminders() {

const events = [
{title:"Goa Beach Wedding - Royal Sands",days:1},
{title:"Birthday Party",days:3},
{title:"Engagement",days:3},
{title:"Roe Ceremony",days:5},
{title:"Wedding",days:7}
]

return(

<div>

<h1 className="text-xl font-semibold mb-6">
Upcoming Milestones
</h1>

<div className="grid grid-cols-3 gap-6">

<div className="col-span-2 space-y-4">

{events.map((e,i)=>(
<div key={i} className="theme-card p-4 flex justify-between">

<div className="flex gap-4">

<div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded">
{e.days}d
</div>

<p>{e.title}</p>

</div>

<button className="border px-3 py-1 rounded text-sm">
Details
</button>

</div>
))}

</div>

<div className="theme-card p-5 rounded-lg shadow">

<h3 className="font-semibold mb-3">
Automation Panel
</h3>

<label className="flex justify-between mb-2">
SMS Reminders
<input type="checkbox"/>
</label>

<label className="flex justify-between">
Email Alerts
<input type="checkbox"/>
</label>

</div>

</div>

</div>

)
}