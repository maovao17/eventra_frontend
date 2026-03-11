export default function ClientProfile(){
return(

<div className="theme-card p-6">

<h2 className="theme-primary text-sm font-semibold mb-3">
CLIENT PROFILE
</h2>

<div className="flex items-center gap-3 mb-4">

<div className="bg-[var(--primary-light)] theme-primary w-10 h-10 flex items-center justify-center rounded-full">
AF
</div>

<div>
<p className="font-semibold">Aiden Fernandes</p>
<p className="text-xs theme-muted">Regular Customer</p>
</div>

</div>

<div className="text-sm space-y-2">

<p>Contact: +91 98765 43210</p>
<p>Email: aiden@gmail.com</p>
<p>Last Booking: 20 May 2025</p>

</div>

<p className="theme-primary text-sm mt-3">
View Booking History
</p>

</div>

)
}