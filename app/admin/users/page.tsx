"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

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

  useEffect(() => {
    void loadUsers();
  }, []);

  const removeUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => String(user._id || user.userId) !== String(userId)));
      showToast("User removed.", "success");
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not remove user.", "error");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) return <PageCardSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load users."
        description="Retry to fetch customer and vendor accounts."
        onRetry={() => void loadUsers()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Users List</h1>
      <p className="theme-muted mb-8">Manage all customer and vendor accounts.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user._id || user.userId}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-full flex items-center justify-center text-lg font-semibold text-[var(--primary)]">
                  {user.name?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{user.name || 'Unknown'}</h3>
                  <p className="text-sm theme-muted">{user.role || 'customer'}</p>
                </div>
              </div>
              <p className="text-sm theme-muted mb-4">{user.phoneNumber || user.email}</p>
              <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                ID: {user._id || user.userId}
              </div>
              <button
                type="button"
                onClick={() => void removeUser(String(user._id || user.userId))}
                disabled={deletingId === String(user._id || user.userId)}
                className="mt-4 rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
              >
                {deletingId === String(user._id || user.userId) ? "Removing..." : "Remove User"}
              </button>
            </div>
          </Card>
        ))}
      </div>
      {users.length === 0 && (
        <EmptyState
          title="No users found"
          description="Users will appear here after they sign up for Eventra."
          secondaryAction={
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="rounded-full border px-5 py-2 text-sm font-medium"
            >
              Retry
            </button>
          }
        />
      )}
    </div>
  );
}
