"use client";

import VendorCard from "@/components/customer/VendorCard";

const vendors=[{name:"Royal Decor",price:"₹25k",rating:"4.7"},
{name:"Dream Catering",price:"₹40k",rating:"4.5"}]

export default function Vendors(){

return(

<div className="max-w-7xl mx-auto py-16">

<h1 className="text-3xl font-bold mb-10">
Discover Vendors
</h1>

<div className="grid md:grid-cols-3 gap-8">

{vendors.map((v,i)=>(
<VendorCard key={i} {...v}/>
))}

</div>

</div>
)
}