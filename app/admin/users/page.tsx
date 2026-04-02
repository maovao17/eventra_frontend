"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import Card from "@/components/ui/Card";
import { Search, User } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const res = await apiFetch("/admin/users");
      if (res?.error) {
        setError(res.message);
      } else {
        setUsers(Array.isArray(res) ? res : []);
      }
      setLoading(false);
    };
    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
            </div>
          </Card>
        ))}
      </div>
      {users.length === 0 && (
        <Card>
          <div className="p-12 text-center theme-muted">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
