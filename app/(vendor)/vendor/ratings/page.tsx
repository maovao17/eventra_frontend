export default function Ratings(){

return(

<div>

<h1 className="text-2xl font-semibold mb-6">
Reputation Dashboard
</h1>

<div className="grid grid-cols-3 gap-6">

<div className="col-span-2">

<div className="theme-card mb-4 p-6">

<h2 className="text-4xl font-bold theme-primary">
4.8
</h2>

<p className="theme-muted">
Average Rating (1206)
</p>

</div>

<div className="theme-card p-6">

<h3 className="font-medium">
Sarah D&apos;Souza
</h3>

<p className="theme-muted text-sm">
The decor was absolutely stunning!
</p>

</div>

</div>

<div className="theme-card p-6">

<h3 className="font-semibold mb-4">
Rating Distribution
</h3>

<p>5 ★ 85%</p>
<p>4 ★ 10%</p>
<p>3 ★ 5%</p>

</div>

</div>

</div>

)
}
