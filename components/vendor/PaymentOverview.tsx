export default function PaymentOverview(){
return(

<div className="theme-card p-6">

<h2 className="font-semibold mb-4">
Payment Overview
</h2>

<div className="space-y-2 text-sm">

<div className="flex justify-between">
<span>Total Budget</span>
<span className="font-medium">₹45,000</span>
</div>

<div className="flex justify-between">
<span>Paid Amount</span>
<span>₹15,000</span>
</div>

<div className="flex justify-between text-red-500 font-medium">
<span>Remaining Balance</span>
<span>₹30,000</span>
</div>

</div>

<hr className="my-4"/>

<div className="border rounded-lg p-3 flex justify-between text-sm mb-2">
Advance Received
<span>₹15,000</span>
</div>

<div className="border rounded-lg p-3 flex justify-between text-sm">
Event Day Final
<span>₹30,000</span>
</div>

<button className="w-full border mt-4 py-2 rounded-lg">
Download Invoice PDF
</button>

</div>

)
}