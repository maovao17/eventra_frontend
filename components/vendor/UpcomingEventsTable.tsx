export default function UpcomingEventsTable(){
return(

<div className="theme-card p-6 mt-6">

<div className="flex justify-between mb-4">
<h2 className="text-lg font-semibold">
Upcoming Events
</h2>

<span className="theme-primary text-sm cursor-pointer">
View All Events
</span>
</div>

<table className="w-full text-sm">

<thead className="border-b theme-muted">
<tr>
<th className="py-3 text-left">Event Name</th>
<th>Client</th>
<th>Date</th>
<th>Location</th>
<th>Guests</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr className="border-b">
<td className="py-4"><b>Birthday Party</b></td>
<td>Aiden Fernandes</td>
<td>12 Dec 2025</td>
<td>Panaji, North Goa</td>
<td>120 Guests</td>
<td className="text-green-600">Confirmed</td>
</tr>

<tr className="border-b">
<td className="py-4"><b>Housewarming</b></td>
<td>Clara Pereira</td>
<td>20 Dec 2025</td>
<td>Margao, South Goa</td>
<td>45 Guests</td>
<td className="text-yellow-600">Pending Final Payment</td>
</tr>

<tr className="border-b">
<td className="py-4"><b>Baptism</b></td>
<td>Ryan Rodrigues</td>
<td>05 Jan 2026</td>
<td>Benaulim, South Goa</td>
<td>80 Guests</td>
<td className="theme-secondary">Contract Signed</td>
</tr>

<tr>
<td className="py-4"><b>Susegad Corporate Brunch</b></td>
<td>Goa Tech Hub</td>
<td>15 Jan 2026</td>
<td>Candolim</td>
<td>60 Guests</td>
<td className="text-green-600">Confirmed</td>
</tr>

</tbody>

</table>

</div>

)}
