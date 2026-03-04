import "@/app/globals.css";
import VendorSidebar from "@/components/vendor/VendorSidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex bg-[#F9F9F9]">
        <VendorSidebar />
        <main className="flex-1 p-10">
          {children}
        </main>
      </body>
    </html>
  );
}