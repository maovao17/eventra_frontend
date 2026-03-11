"use client";

import { CalendarDays, House, Users } from "lucide-react";

export default function Dashboard() {

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between items-start mb-10">

        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="theme-primary">Anna Mathews</span>
          </h1>

          <p className="theme-muted mt-2">
            Here&apos;s what&apos;s happening in your event management ecosystem today.
            Everything looks premium and on track.
          </p>
        </div>

        <button className="theme-button px-6 py-2">
          + New Announcement
        </button>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="theme-card relative p-6">

          <div className="w-10 h-10 bg-[var(--primary-light)] theme-primary flex items-center justify-center rounded-full mb-4">
            <House size={18} />
          </div>

          <p className="theme-muted">Total Vendors</p>
          <h2 className="text-3xl font-bold">1,000</h2>

        </div>


        <div className="theme-card relative p-6">

          <div className="w-10 h-10 bg-[var(--primary-light)] theme-primary flex items-center justify-center rounded-full mb-4">
            <Users size={18} />
          </div>

          <p className="theme-muted">Total Users</p>
          <h2 className="text-3xl font-bold">856</h2>

        </div>


        <div className="theme-card relative p-6">

          <div className="w-10 h-10 bg-[var(--primary-light)] theme-primary flex items-center justify-center rounded-full mb-4">
            <CalendarDays size={18} />
          </div>

          <p className="theme-muted">Total Events</p>
          <h2 className="text-3xl font-bold">3,420</h2>

        </div>

      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">

        {/* Activity Table */}
        <div className="col-span-2 theme-card p-6">

          <h2 className="font-semibold mb-4">
            Recent Event Activity
          </h2>

          <table className="w-full text-sm">

            <thead className="theme-muted border-b">
              <tr>
                <th className="text-left py-2">Event Name</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Revenue</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="py-3">Reuben&apos;s 1st Birth</td>
                <td>Luxe Events</td>
                <td className="text-green-600">confirmed</td>
                <td>Rs 12,400</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Tech Summit</td>
                <td>Innovate Hub</td>
                <td className="text-yellow-500">pending</td>
                <td>Rs 18,200</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Garden Wedding</td>
                <td>Bella Marquee</td>
                <td className="text-green-600">confirmed</td>
                <td>Rs 5,500</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Art Expo</td>
                <td>Metropolis Gallery</td>
                <td className="text-red-400">cancelled</td>
                <td>NIL</td>
              </tr>

              <tr>
                <td className="py-3">Charity Auction</td>
                <td>Foundation Plus</td>
                <td className="text-green-600">confirmed</td>
                <td>Rs15,000</td>
              </tr>

              

            </tbody>

          </table>

        </div>


        {/* Quote Card */}
        <div className="theme-card flex items-center justify-left text-left p-10">

          <div className="border-l-4 border-[var(--primary)] pl-6">

            <h2 className="text-3xl font-bold theme-primary leading-relaxed">

              Turning <br />
              plans <br />
              into <br />
              performance.

            </h2>

          </div>

        </div>

      </div>

    </div>
  );
}
