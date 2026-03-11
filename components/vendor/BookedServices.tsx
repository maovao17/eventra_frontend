export default function BookedServices(){
return(

<div className="theme-card p-6">

<h2 className="font-semibold text-lg mb-4">
Booked Services
</h2>

<div className="theme-surface border rounded-lg p-3 text-sm mb-4">
Note: Client requested extra spicy peri-peri fish for appetizers.
</div>

<table className="w-full text-sm">

<thead className="border-b theme-muted">
<tr>
<th className="text-left py-3">Service Item</th>
<th>Quantity</th>
<th>Price</th>
</tr>
</thead>

<tbody>

<tr className="border-b">
<td className="py-4">Traditional Goan Buffet</td>
<td>80 Guests</td>
<td className="theme-primary">₹32,000</td>
</tr>

<tr className="border-b">
<td className="py-4">Seafood Appetizer Platter</td>
<td>12 Plates</td>
<td className="theme-primary">₹8,400</td>
</tr>

<tr>
<td className="py-4">Custom Fondant Birthday Cake</td>
<td>5kg</td>
<td className="theme-primary">₹4,600</td>
</tr>

</tbody>

</table>

<div className="flex justify-between mt-4 text-sm">

<p className="theme-muted">
Last modification by Vendor at 10:15 AM
</p>

<button className="theme-primary">
+ Add Extra Service
</button>

</div>

</div>

)
}