"use client"

import { Filter } from "lucide-react"

export default function FilterBar(){

return(

<div className="flex items-center gap-3">

<button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm">

<Filter size={16}/>

Filter: All

</button>

<button className="border px-4 py-2 rounded-md text-sm">

Export CSV

</button>

</div>

)

}