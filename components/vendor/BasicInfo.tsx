export default function BasicInfo(){

return(

<div className="theme-card p-6">

<h3 className="font-semibold mb-1">
Basic Information
</h3>

<p className="text-sm theme-muted mb-4">
General details about your business entity.
</p>

<div className="grid grid-cols-2 gap-4">

<Input label="Business Name" value="Anthony D'Souza Catering"/>
<Input label="Owner Full Name" value="Anthony D'Souza"/>
<Input label="Business Category"/>
<Input label="Years of Experience" value="12"/>

</div>

<div className="mt-4">

<label className="text-sm theme-muted">
About the Business
</label>

<textarea
rows={3}
className="border rounded-md w-full p-3 mt-1 text-sm"
defaultValue="Leading the Goan culinary scene since 2013, we specialize in authentic traditional buffets and modern fusion cuisine for intimate celebrations and large-scale weddings across North and South Goa."
/>

</div>

</div>

)

}

function Input({label,value}:{label:string,value?:string}){

return(

<div>

<label className="text-sm theme-muted">
{label}
</label>

<input
defaultValue={value}
className="border rounded-md w-full p-2 mt-1 text-sm"
/>

</div>

)

}