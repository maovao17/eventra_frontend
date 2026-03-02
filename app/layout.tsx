import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f1ec] text-gray-900">
        {children}
      </body>
    </html>
  );
}