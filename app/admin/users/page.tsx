"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/app/lib/api";
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import { Search, Trash2 } from "lucide-react";

type AppUser = {
  _id?: string;
  userId?: string;
  name?: string;
  role?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
  createdAt?: string;
};

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/admin/users");
      setUsers(Array.isArray(res) ? res : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load users.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const removeUser = async (userId: string) => {
    if (!confirm("Remove this user? This cannot be undone.")) return;
    setDeletingId(userId);
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers(current => current.filter(u => String(u._id || u.userId) !== userId));
      showToast("User removed.", "success");
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not remove user.", "error");
    } finally {
      setDeletingId("");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phoneNumber || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalUsers = users.length;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = users.filter(u => u.createdAt && new Date(u.createdAt) >= startOfMonth).length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return "—"; }
  };

  const statusColor = (status?: string, role?: string) => {
    if (role === "admin") return "bg-purple-100 text-purple-700";
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-amber-100 text-amber-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const statusLabel = (status?: string, role?: string) => {
    if (role === "admin") return "Admin";
    if (status === "approved") return "Active";
    if (status === "pending") return "Pending";
    if (status === "rejected") return "Rejected";
    return status || "Active";
  };

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-1" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load users."
        description="Retry to fetch all registered accounts."
        onRetry={() => void loadUsers()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Administration</h1>
        <p className="theme-muted text-sm mt-1">
          Manage your ecosystem of event organisers and platform partners. Review registrations, update permissions, and monitor activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs theme-muted uppercase tracking-widest font-medium">Total Users</p>
          <p className="text-4xl font-bold mt-2">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs theme-muted uppercase tracking-widest font-medium">New This Month</p>
          <p className="text-4xl font-bold mt-2 text-[var(--primary)]">+{newThisMonth}</p>
        </div>
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs theme-muted uppercase tracking-widest font-medium">Active Now</p>
          <p className="text-4xl font-bold mt-2">{users.filter(u => u.status === "approved" || u.role === "admin").length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="theme-card flex items-center gap-3 rounded-xl px-4 py-3">
        <Search size={16} className="theme-muted shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search organisers by name, email, or ID..."
          className="flex-1 outline-none bg-transparent text-sm"
        />
      </div>

      {/* Table */}
      <div className="theme-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-[var(--surface)]">
              <th className="py-3 px-5 text-left text-xs font-semibold theme-muted uppercase tracking-wide">Organiser Name</th>
              <th className="py-3 px-5 text-left text-xs font-semibold theme-muted uppercase tracking-wide">Email / Phone</th>
              <th className="py-3 px-5 text-left text-xs font-semibold theme-muted uppercase tracking-wide">Registration Date</th>
              <th className="py-3 px-5 text-left text-xs font-semibold theme-muted uppercase tracking-wide">Status</th>
              <th className="py-3 px-5 text-left text-xs font-semibold theme-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center theme-muted text-sm">
                  {search ? "No users match your search." : "No users registered yet."}
                </td>
              </tr>
            ) : (
              filtered.map(user => {
                const id = String(user._id || user.userId || "");
                return (
                  <tr key={id} className="border-b last:border-0 hover:bg-[var(--surface)] transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-xs font-semibold text-[var(--primary)] shrink-0">
                          {(user.name?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "Unknown"}</p>
                          <p className="text-xs theme-muted capitalize">{user.role || "customer"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 theme-muted">
                      {user.email || user.phoneNumber || "—"}
                    </td>
                    <td className="py-3 px-5 theme-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(user.status, user.role)}`}>
                        {statusLabel(user.status, user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <button
                        type="button"
                        onClick={() => void removeUser(id)}
                        disabled={deletingId === id}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="Remove user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
