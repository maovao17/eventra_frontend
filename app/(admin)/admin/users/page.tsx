"use client";

import { Mail, Pencil, Search, Trash2, User } from "lucide-react";

const users = [
  {
    name: "Alisha D'Souza",
    id: "001",
    email: "alishad@gmail.com",
    date: "Oct 12, 2023",
    status: "Active",
  },
  {
    name: "Elena Rodriguez",
    id: "002",
    email: "elenarod@gmail.com",
    date: "Nov 05, 2023",
    status: "Active",
  },
  {
    name: "Aaron D'Souza",
    id: "003",
    email: "aarroonn@gmail.com",
    date: "Dec 20, 2023",
    status: "Pending",
  },
  {
    name: "Kiara Fernandes",
    id: "004",
    email: "kiaraferns@gmail.com",
    date: "Jan 15, 2024",
    status: "Active",
  },
  {
    name: "Adrian D'Costa",
    id: "005",
    email: "adrian31@gmail.com",
    date: "Feb 02, 2024",
    status: "Inactive",
  },
  
  {
    name: "Alisha D'Souza",
    id: "001",
    email: "alishad@gmail.com",
    date: "Oct 12, 2023",
    status: "Active",
  },
  {
    name: "Elena Rodriguez",
    id: "002",
    email: "elenarod@gmail.com",
    date: "Nov 05, 2023",
    status: "Active",
  },
  {
    name: "Aaron D'Souza",
    id: "003",
    email: "aarroonn@gmail.com",
    date: "Dec 20, 2023",
    status: "Pending",
  },
  {
    name: "Kiara Fernandes",
    id: "004",
    email: "kiaraferns@gmail.com",
    date: "Jan 15, 2024",
    status: "Active",
  },
  {
    name: "Adrian D'Costa",
    id: "005",
    email: "adrian31@gmail.com",
    date: "Feb 02, 2024",
    status: "Inactive",
  },

  {
    name: "Maria Fernandes",
    id: "006",
    email: "mariaf@gmail.com",
    date: "Feb 10, 2024",
    status: "Active",
  },
  {
    name: "Rohan Naik",
    id: "007",
    email: "rohannaik@gmail.com",
    date: "Feb 18, 2024",
    status: "Active",
  },
  {
    name: "Aisha Khan",
    id: "008",
    email: "aishakhan@gmail.com",
    date: "Feb 25, 2024",
    status: "Pending",
  },
  {
    name: "Dev Patel",
    id: "009",
    email: "devpatel@gmail.com",
    date: "Mar 01, 2024",
    status: "Active",
  },
  {
    name: "Sophia D'Silva",
    id: "010",
    email: "sophiads@gmail.com",
    date: "Mar 05, 2024",
    status: "Inactive",
  },
  {
    name: "Daniel Fernandes",
    id: "011",
    email: "danferns@gmail.com",
    date: "Mar 10, 2024",
    status: "Active",
  },
  {
    name: "Lucas Pereira",
    id: "012",
    email: "lucasp@gmail.com",
    date: "Mar 14, 2024",
    status: "Active",
  },
  {
    name: "Anjali Sharma",
    id: "013",
    email: "anjalisharma@gmail.com",
    date: "Mar 20, 2024",
    status: "Pending",
  },
  {
    name: "Michael D'Costa",
    id: "014",
    email: "michaeldc@gmail.com",
    date: "Mar 25, 2024",
    status: "Active",
  },
  {
    name: "Priya Nair",
    id: "015",
    email: "priyanair@gmail.com",
    date: "Apr 02, 2024",
    status: "Inactive",
  },
  {
    name: "Jason Fernandes",
    id: "016",
    email: "jasonf@gmail.com",
    date: "Apr 08, 2024",
    status: "Active",
  },
  {
    name: "Ritika Kapoor",
    id: "017",
    email: "ritikak@gmail.com",
    date: "Apr 15, 2024",
    status: "Active",
  },
  {
    name: "Neil Rodrigues",
    id: "018",
    email: "neilr@gmail.com",
    date: "Apr 22, 2024",
    status: "Pending",
  },
  {
    name: "Simran Kaur",
    id: "019",
    email: "simrank@gmail.com",
    date: "Apr 30, 2024",
    status: "Active",
  },
  {
    name: "Arjun Mehta",
    id: "020",
    email: "arjunm@gmail.com",
    date: "May 05, 2024",
    status: "Active",
  },
  {
    name: "Zara Ali",
    id: "021",
    email: "zaraali@gmail.com",
    date: "May 10, 2024",
    status: "Inactive",
  },
  {
    name: "Kevin D'Souza",
    id: "022",
    email: "kevin.ds@gmail.com",
    date: "May 15, 2024",
    status: "Active",
  },
  {
    name: "Pooja Verma",
    id: "023",
    email: "poojav@gmail.com",
    date: "May 20, 2024",
    status: "Pending",
  },
  {
    name: "Ryan Fernandes",
    id: "024",
    email: "ryanf@gmail.com",
    date: "May 25, 2024",
    status: "Active",
  },
  {
    name: "Sneha Joshi",
    id: "025",
    email: "snehaj@gmail.com",
    date: "Jun 01, 2024",
    status: "Active",
  },

];

export default function Users() {
  return (
    <div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-1">
        User Administration
      </h1>

      <p className="theme-muted mb-6">
        Manage your ecosystem of event organizers and platform partners.
        Review registrations, update permissions, and monitor activity.
      </p>


      {/* Stats */}
      <div className="theme-card p-6 flex justify-between mb-6">

        <div>
          <p className="theme-muted text-sm">TOTAL USERS</p>
          <h2 className="text-2xl font-bold">854</h2>
        </div>

        <div>
          <p className="theme-muted text-sm">NEW THIS MONTH</p>
          <h2 className="text-2xl font-bold theme-primary">+42</h2>
        </div>

        <div>
          <p className="theme-muted text-sm">ACTIVE NOW</p>
          <h2 className="text-2xl font-bold">156</h2>
        </div>

      </div>


      {/* Search */}
      <div className="theme-card p-3 flex items-center gap-3 mb-6">

        <Search size={18} className="theme-muted" />

        <input
          placeholder="Search organizers by name, email, or ID..."
          className="w-full outline-none"
        />

      </div>


      {/* Table */}
      <div className="theme-card overflow-hidden">

        <table className="w-full">

          <thead className="theme-muted text-sm border-b">

            <tr>
              <th className="text-left py-4 px-6">ORGANIZER NAME</th>
              <th className="text-left">EMAIL ADDRESS</th>
              <th className="text-left">REGISTRATION DATE</th>
              <th className="text-left">STATUS</th>
              <th className="text-left">ACTIONS</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user, index) => (

              <tr
                key={index}
                className="border-b hover:bg-[var(--background)]"
              >

                {/* Name */}
                <td className="py-4 px-6 flex items-center gap-3">

                  <div className="w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center">

                    <User size={18} className="theme-primary" />

                  </div>

                  <div>

                    <p className="font-medium">
                      {user.name}
                    </p>

                    <p className="theme-muted text-sm">
                      ID: {user.id}
                    </p>

                  </div>

                </td>


                {/* Email */}
                <td className="theme-muted">
                  {user.email}
                </td>


                {/* Date */}
                <td className="theme-muted">
                  {user.date}
                </td>


                {/* Status */}
                <td>

                  <span
                    className={`px-3 py-1 text-sm rounded-full
                    ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : user.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "theme-surface theme-muted"
                    }`}
                  >
                    {user.status}
                  </span>

                </td>


                {/* Actions */}
                <td className="flex gap-3">

                  <button className="p-2 border rounded-lg hover:bg-[var(--surface)]">

                    <Mail size={16} />

                  </button>

                  <button className="p-2 border rounded-lg hover:bg-[var(--surface)]">

                    <Pencil size={16} />

                  </button>

                  <button className="p-2 border rounded-lg hover:bg-[var(--surface)]">

                    <Trash2 size={16} />

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
