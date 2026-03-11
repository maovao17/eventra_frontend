import { Mail, Phone, Globe, MapPin } from "lucide-react"
import type { ReactNode } from "react"

export default function ContactCard(){

return(

<div className="theme-card p-6 space-y-4">

<h3 className="font-semibold">
Contact Details
</h3>

<Field icon={<Mail size={16}/>} text="anthony.catering@example.com"/>
<Field icon={<Phone size={16}/>} text="+91 98212 3456"/>
<Field icon={<Globe size={16}/>} text="www.yourbiz.com"/>
<Field icon={<MapPin size={16}/>} text="Panaji, Goa"/>

</div>

)

}

function Field({icon,text}:{icon: ReactNode,text:string}){

return(

<div className="flex items-center gap-2 text-sm theme-muted">

{icon}

{text}

</div>

)

}
