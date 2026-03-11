import { ShieldCheck } from "lucide-react"

export default function VerifiedVendor(){

return(

<div className="bg-[var(--primary-light)] border border-[var(--primary-light)] rounded-xl p-6">

<div className="flex items-center gap-2 mb-2">

<ShieldCheck className="theme-primary"/>

<h3 className="font-semibold">
Verified Vendor
</h3>

</div>

<p className="text-sm theme-muted mb-4">
Your business has been verified by the Eventra team. This badge improves your search ranking by 15%.
</p>

<button className="border px-4 py-2 rounded-md text-sm">
View Documents
</button>

</div>

)

}