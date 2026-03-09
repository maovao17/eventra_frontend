"use client";

import { useState } from "react";
import ServiceCard from "@/components/event/ServiceCard";

const defaultWeddingServices = [
  "Venue",
  "Photographer",
  "Catering",
  "Decoration",
  "Makeup Artist",
  "DJ"
];

export default function CreateEventPage() {

const [services,setServices] = useState(defaultWeddingServices);

const removeService = (service:string)=>{
 setServices(services.filter(s=>s!==service));
}

return (

<div className="max-w-6xl mx-auto p-10">

<h1 className="text-3xl font-bold mb-10">
Create Your Event
</h1>

{/* EVENT INFO */}

<div className="grid grid-cols-4 gap-4 mb-10">

<input placeholder="Event Name" className="input"/>

<input type="date" className="input"/>

<input placeholder="Location" className="input"/>

<input placeholder="Budget" className="input"/>

</div>

{/* SERVICES */}

<h2 className="text-xl font-semibold mb-4">
Services
</h2>

<div className="space-y-4">

{services.map(service=>(
<ServiceCard
key={service}
service={service}
removeService={()=>removeService(service)}
/>
))}

</div>

<button className="mt-6 text-[#E87D5F] font-semibold">
+ Add More Services
</button>

</div>
)
}