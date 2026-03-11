import { Calendar, Users, IndianRupee, Star } from "lucide-react";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-6">

      <div className="theme-card p-5 flex justify-between">
        <div>
          <p className="text-sm theme-muted">Total Events This Month</p>
          <h2 className="text-2xl font-bold">18</h2>
        </div>
        <Calendar className="theme-secondary" />
      </div>

      <div className="theme-card p-5 flex justify-between">
        <div>
          <p className="text-sm theme-muted">Pending Requests</p>
          <h2 className="text-2xl font-bold">04</h2>
        </div>
        <Users className="theme-primary" />
      </div>

      <div className="theme-card p-5 flex justify-between">
        <div>
          <p className="text-sm theme-muted">Monthly Revenue</p>
          <h2 className="text-2xl font-bold">₹95,000</h2>
        </div>
        <IndianRupee className="text-green-500" />
      </div>

      <div className="theme-card p-5 flex justify-between">
        <div>
          <p className="text-sm theme-muted">Average Rating</p>
          <h2 className="text-2xl font-bold">4.8 / 5</h2>
        </div>
        <Star className="text-yellow-500" />
      </div>

    </div>
  );
}
