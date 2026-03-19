import StatsCards from "@/components/vendor/StatsCards";
import RevenueChart from "@/components/vendor/RevenueChart";
import QuickActions from "@/components/vendor/QuickActions";
import UpcomingEventsTable from "@/components/vendor/UpcomingEventsTable";

export default function VendorDashboard(){
return(

<div>

<h1 className="text-3xl font-bold mb-2">
Welcome back, Anthony D&apos;Souza Catering
</h1>

<p className="text-gray-500 mb-6">
Your business is growing! You have 4 new booking requests waiting for review.
</p>

<StatsCards/>

<div className="grid grid-cols-3 gap-6">

<div className="col-span-2">
<RevenueChart/>
</div>

<QuickActions/>

</div>

<UpcomingEventsTable/>

</div>

)
}
