"use client";

import { Mail, MapPin, Phone, Search } from "lucide-react";

const vendors = [
  {
    name: "Spice & Sol Catering",
    category: "Catering",
    location: "Anjuna Bardez Goa",
    phone: "+91 9864690245",
    email: "spicesol@gmail.com",
    image: "/eventra_photos/culinary.jpg",
  },
  {
    name: "Ivory Orchid Goa",
    category: "Florist",
    location: "Calangute Bardez Goa",
    phone: "+91 9563429045",
    email: "ivoryorchid@gmail.com",
    image: "/eventra_photos/floral6.jpg",
  },
  {
    name: "Coastal Lights Co.",
    category: "Production",
    location: "Porvorim Bardez Goa",
    phone: "+91 7809456329",
    email: "coastallights@gmail.com",
    image: "/eventra_photos/event4.jpg",
  },
  {
    name: "Golden Hour Photography",
    category: "Photography",
    location: "Cansaulim, Mormugao Goa",
    phone: "+91 9754329067",
    email: "goldenhr@gmail.com",
    image: "/eventra_photos/photographer.jpg",
  },
  {
    name: "Palm & Petals Decor",
    category: "Decoration",
    location: "Raia, Salcete Goa",
    phone: "+91 9642903640",
    email: "pandpdecor@gmail.com",
    image: "/eventra_photos/floral10.jpg",
  },
  {
    name: "The K Connexions",
    category: "Entertainment",
    location: "Panaji, Tiswadi Goa",
    phone: "+91 9210832945",
    email: "kconnexions@gmail.com",
    image: "/eventra_photos/party5.jpg",
  },
];

export default function Vendors() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-1">
        Vendor Management
      </h1>

      <p className="theme-muted mb-6">
        Review, filter, and organize your network of event partners.
      </p>

      {/* Search */}
      <div className="theme-card p-3 flex items-center gap-3 mb-8">
        <Search size={18} className="theme-muted" />
        <input
          placeholder="Search vendors by name, service, or location..."
          className="w-full outline-none"
        />
      </div>

      <div className="grid grid-cols-4 gap-6">

        {/* Filter */}
        <div className="theme-card p-6 h-fit">

          <h3 className="font-semibold mb-4">
            Service Category
          </h3>

          <div className="space-y-3 text-sm">

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Catering
              </span>
              <span className="theme-primary">24</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Decoration
              </span>
              <span className="theme-primary">18</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Photography
              </span>
              <span className="theme-primary">12</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Music & DJ
              </span>
              <span className="theme-primary">9</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Venues
              </span>
              <span className="theme-primary">31</span>
            </label>

          </div>

        </div>


        {/* Vendor Cards */}
        <div className="col-span-3">

          <h2 className="font-semibold mb-4">
            Available Vendors
            <span className="theme-muted text-sm ml-2">
              (Showing {vendors.length} results)
            </span>
          </h2>

          <div className="grid grid-cols-3 gap-6">

            {vendors.map((vendor, index) => (

              <div
                key={index}
                className="theme-card p-5"
              >

                <img
                  src={vendor.image}
                  className="rounded-lg mb-4 h-32 w-full object-cover"
                />

                <span className="text-xs bg-[var(--primary-light)] theme-primary px-3 py-1 rounded-full">
                  {vendor.category}
                </span>

                <h3 className="font-semibold mt-3">
                  {vendor.name}
                </h3>

                <p className="theme-muted text-sm flex items-center gap-2 mt-2">
                  <MapPin size={16} /> {vendor.location}
                </p>

                <p className="theme-muted text-sm flex items-center gap-2">
                  <Phone size={16} /> {vendor.phone}
                </p>

                <p className="theme-muted text-sm flex items-center gap-2">
                  <Mail size={16} /> {vendor.email}
                </p>

                <div className="flex gap-3 mt-4">

                  <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm">
                    Edit
                  </button>

                  <button className="border px-4 py-2 rounded-lg text-sm theme-muted">
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
