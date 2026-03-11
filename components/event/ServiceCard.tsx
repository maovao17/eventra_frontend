"use client";

import { motion } from "framer-motion";

type ServiceCardProps = {
service: string
removeService: () => void
}

export default function ServiceCard({service,removeService}:ServiceCardProps){

return(

<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
className="theme-card flex items-center justify-between p-5"
>

<div>

<h3 className="font-semibold">
{service}
</h3>

<p className="theme-muted text-sm">
Select vendors for this service
</p>

</div>

<div className="flex gap-4">

<button className="theme-button px-4 py-2">
Find Vendors
</button>

<button
onClick={removeService}
className="text-red-500"
>
Remove
</button>

</div>

</motion.div>

)
}
