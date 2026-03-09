export default function VendorDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Business Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Requests</p><p className="text-2xl font-bold">14</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Accepted</p><p className="text-2xl font-bold">9</p></div>
        <div className="glass-card p-5"><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold">₹2.3L</p></div>
      </div>
    </div>
  );
}
