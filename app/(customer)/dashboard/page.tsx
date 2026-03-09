import BudgetTracker from "@/components/customer/BudgetTracker";
import EventCard from "@/components/event/EventCard";

export default function DashboardPage() {

  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Hello Sarah 👋
      </h1>

      <BudgetTracker />

      <div className="grid grid-cols-3 gap-6">

        <EventCard
          title="Sarah & James Wedding"
          date="12 Dec 2026"
          progress={70}
        />

      </div>

    </div>
  );
}