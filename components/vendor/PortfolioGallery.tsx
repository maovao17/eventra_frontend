import { Plus } from "lucide-react"

export default function PortfolioGallery(){

const imgs=[
"/eventra_photos/culinary.jpg",
"/eventra_photos/gala1.jpg",
"/eventra_photos/party4.jpg",
"/eventra_photos/event5.jpg"
]

return(

<div className="theme-card p-6">

<h3 className="font-semibold mb-1">
Portfolio Gallery
</h3>

<p className="text-sm theme-muted mb-4">
Upload high-quality photos from your events to showcase your work.
</p>

<div className="grid grid-cols-5 gap-3">

{imgs.map((img,i)=>(
<img
key={i}
src={img}
alt={`Portfolio ${i + 1}`}
className="h-24 w-full object-cover rounded-md"
/>
))}

<div className="border-2 border-dashed rounded-md flex items-center justify-center h-24">

<div className="text-center theme-muted text-sm">

<Plus className="mx-auto mb-1"/>
Add Photo

</div>

</div>

</div>

</div>

)

}
