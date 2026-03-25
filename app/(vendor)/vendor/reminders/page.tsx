"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getVendorNotifications, markVendorNotificationRead } from "@/app/lib/vendorApi";

type VendorNotification = {
  _id: string;
  message: string;
  daysBefore?: number;
  read?: boolean;
};

export default function Reminders() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);

  useEffect(() => {
    const loadReminders = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      setError("");

      await apiFetch("/notifications/run-reminders", { method: "POST" });

      const response = await getVendorNotifications();
      if (response?.error) {
        setError(response.message || "Failed to load reminders.");
        setLoading(false);
        return;
      }

      setNotifications(Array.isArray(response) ? response : []);
      setLoading(false);
    };

    void loadReminders();
  }, [profile?.uid]);

  if (loading) {
    return <p>Loading reminders...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const handleMarkRead = async (notificationId: string) => {
    if (!profile?.uid) return;

    const previous = [...notifications];
    setNotifications((current) =>
      current.map((item) => (item._id === notificationId ? { ...item, read: true } : item)),
    );

    const response = await markVendorNotificationRead(notificationId);
    if (response?.error) {
      setNotifications(previous);
      setError(response.message || "Could not mark reminder as read.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Upcoming Milestones
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {notifications.length === 0 ? (
            <div className="theme-card p-4">
              No reminders yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id} className="theme-card p-4 flex justify-between">
                <div className="flex gap-4">
                  <div className="bg-green-100 w-10 h-10 flex items-center justify-center rounded">
                    {notification.daysBefore ? `${notification.daysBefore}d` : "•"}
                  </div>

                  <p>{notification.message} {notification.read ? "(Read)" : ""}</p>
                </div>

                <button
                  onClick={() => void handleMarkRead(notification._id)}
                  className="border px-3 py-1 rounded text-sm"
                >
                  Details
                </button>
              </div>
            ))
          )}
        </div>

        <div className="theme-card p-5 rounded-lg shadow">
          <h3 className="font-semibold mb-3">
            Automation Panel
          </h3>

          <label className="flex justify-between mb-2">
            SMS Reminders
            <input type="checkbox" defaultChecked />
          </label>

          <label className="flex justify-between">
            Email Alerts
            <input type="checkbox" defaultChecked />
          </label>
        </div>
      </div>
    </div>
  );
}
