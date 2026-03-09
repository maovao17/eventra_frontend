import Sidebar from "@/components/customer/CustomerSidebar";
import Topbar from "@/components/customer/CustomerTopbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />

        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}