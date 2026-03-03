import "./globals.css";

export const metadata = {
  title: "Eventra",
  description: "Plan your perfect event",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F6F1EC] text-gray-900">
        {children}
      </body>
    </html>
  );
}