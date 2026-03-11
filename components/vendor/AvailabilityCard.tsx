export default function AvailabilityCard(){

return(

<div className="theme-card p-6">

<h3 className="font-semibold mb-3">
Availability
</h3>

<p className="text-sm theme-muted mb-4">
Your 2026 booking slots.
</p>

<div className="flex justify-between items-center mb-3">

<div>

<p className="font-medium text-sm">
Jan 2026
</p>

<p className="text-xs theme-muted">
4 slots available
</p>

</div>

<button className="theme-primary text-sm">
Manage
</button>

</div>

<div className="flex justify-between items-center">

<div>

<p className="font-medium text-sm">
Feb 2026
</p>

<p className="text-xs theme-muted">
Fully Booked
</p>

</div>

<button className="theme-primary text-sm">
Manage
</button>

</div>

<p className="theme-primary text-sm mt-4 cursor-pointer">
Update 2026 Schedule →
</p>

</div>

)

}