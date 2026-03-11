import Image from "next/image"
import { MapPin } from "lucide-react"

export default function ProfileHero(){

return(

<div className="theme-card overflow-hidden">

<div className="relative h-48">

<Image
src="/eventra_photos/buffet.jpg"
alt="Business cover"
fill
className="object-cover"
/>

<div className="absolute inset-0 bg-black/20"></div>

</div>

<div className="flex items-center gap-5 p-6">

<div className="-mt-16 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
<Image
src="/eventra_photos/party5.jpg"
alt="Vendor profile"
width={96}
height={96}
className="h-24 w-24 object-cover"
/>
</div>

<div>

<h2 className="text-xl font-semibold">
Anthony D&apos;Souza Catering
</h2>

<div className="flex items-center gap-3 text-sm mt-1">

<span className="theme-primary font-medium">
Premium Vendor
</span>

<span className="flex items-center gap-1 theme-muted">
<MapPin size={14}/>
Panaji, Goa
</span>

</div>

</div>

</div>

</div>

)
}
