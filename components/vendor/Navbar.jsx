import { Search, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <div className="theme-card border-b px-6 py-3 flex items-center justify-between">

      <div className="flex items-center theme-surface px-3 py-2 rounded w-96">
        <Search size={16} className="mr-2"/>
        <input
          className="bg-transparent outline-none w-full text-sm"
          placeholder="Search bookings, clients, or services..."
        />
      </div>

      <div className="flex items-center gap-6">

        <Bell size={20}/>

        <div className="flex items-center gap-2">
          <img
            src="/avatar.png"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">Anthony D&apos;Souza</p>
            <p className="text-xs theme-muted">Catering Vendor</p>
          </div>
        </div>

      </div>
    </div>
  );
}
