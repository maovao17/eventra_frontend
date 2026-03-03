export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <h3 className="text-[#E07A5F] font-bold mb-4">Eventra</h3>
          <p className="text-gray-600">
            Simplifying the art of celebration.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={["Vendor Discovery", "Event Planner", "Templates"]}
        />

        <FooterColumn
          title="Company"
          links={["About Us", "Careers", "Contact"]}
        />

        <FooterColumn
          title="Resources"
          links={["Help Center", "Privacy Policy"]}
        />
      </div>

      <p className="text-center text-gray-500 text-xs mt-10">
        © 2026 Eventra. All rights reserved.
      </p>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2 text-gray-600">
        {links.map((link, index) => (
          <li key={index} className="hover:text-[#E07A5F] cursor-pointer">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}