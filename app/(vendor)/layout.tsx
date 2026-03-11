import VendorSidebar from "@/components/vendor/VendorSidebar copy";
import VendorTopbar from "@/components/vendor/VendorTopbar copy";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--background)]">

      <VendorSidebar />

      <div className="flex flex-col flex-1">

        <VendorTopbar />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}