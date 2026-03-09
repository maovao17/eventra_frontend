"use client";

import { motion } from "framer-motion";

export default function ServiceCard({service,removeService}:any){

return(

<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
className="bg-white shadow-md p-5 rounded-xl flex justify-between items-center"
>

<div>

<h3 className="font-semibold">
{service}
</h3>

<p className="text-sm text-gray-500">
Select vendors for this service
</p>

</div>

<div className="flex gap-4">

<button className="px-4 py-2 bg-[#E87D5F] text-white rounded-full">
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