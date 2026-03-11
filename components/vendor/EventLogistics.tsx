import { Calendar, Clock, Users, MapPin } from "lucide-react";

export default function EventLogistics(){
return(

<div className="theme-card p-6">

<h2 className="font-semibold text-lg mb-4">
Event Logistics
</h2>

<div className="grid grid-cols-3 gap-4 mb-4">

<div className="border p-4 rounded-lg flex items-center gap-3">
<Calendar size={18}/>
<div>
<p className="text-xs theme-muted">Scheduled Date</p>
<p className="font-medium">12 December 2026</p>
</div>
</div>

<div className="border p-4 rounded-lg flex items-center gap-3">
<Clock size={18}/>
<div>
<p className="text-xs theme-muted">Time Slot</p>
<p className="font-medium">19:00 – 23:00</p>
</div>
</div>

<div className="border p-4 rounded-lg flex items-center gap-3">
<Users size={18}/>
<div>
<p className="text-xs theme-muted">Guest Count</p>
<p className="font-medium">80 Expected</p>
</div>
</div>

</div>

<div className="border rounded-lg p-4 mb-4">

<div className="flex items-center gap-2 theme-muted mb-2">
<MapPin size={16}/>
Sea Breeze Resort, Miramar, Panaji Goa
</div>

<div className="theme-progress-track h-40 rounded-lg flex items-center justify-center">
View on Google Maps
</div>

</div>

</div>

)
}