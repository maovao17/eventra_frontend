import ProfileHero from "@/components/vendor/ProfileHero"
import BasicInfo from "@/components/vendor/BasicInfo"
import ContactDetails from "@/components/vendor/ContactDetails"
import ServicesSpecialities from "@/components/vendor/ServicesSpecialities"
import AvailabilityCard from "@/components/vendor/AvailabilityCard"
import PortfolioGallery from "@/components/vendor/PortfolioGallery"
import VerifiedVendor from "@/components/vendor/VerifiedVendor"

export default function BusinessProfile(){

return(

<div className="space-y-6">

{/* PAGE TITLE */}

<div className="flex justify-between items-center">

<div>

<h1 className="text-2xl font-semibold">
Business Profile
</h1>

<p className="text-gray-500 text-sm">
Manage your brand identity, services, and operational settings in Goa.
</p>

</div>

<div className="flex gap-3">

<button className="border px-4 py-2 rounded-md text-sm">
Discard Changes
</button>

<button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm">
Save Profile
</button>

</div>

</div>

<ProfileHero/>

{/* MAIN GRID */}

<div className="grid grid-cols-3 gap-6">

<div className="col-span-2 space-y-6">

<BasicInfo/>
<ServicesSpecialities/>
<PortfolioGallery/>

</div>

<div className="space-y-6">

<ContactDetails/>
<AvailabilityCard/>
<VerifiedVendor/>

</div>

</div>

{/* FOOTER ACTION */}

<div className="flex justify-end gap-3">

<button className="border px-5 py-2 rounded-md">
Discard All Changes
</button>

<button className="bg-orange-500 text-white px-5 py-2 rounded-md">
Save Business Profile
</button>

</div>

</div>

)

}