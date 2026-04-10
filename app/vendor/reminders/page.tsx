"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getVendorNotifications, markVendorNotificationRead } from "@/app/lib/vendorApi";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";

type VendorNotification = {
  _id: string;
  message: string;
  type?: string;
  daysBefore?: number;
  read?: boolean;
};

export default function Reminders() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);

  const loadReminders = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    setError("");

    try {
      const response = await getVendorNotifications();
      setNotifications(Array.isArray(response) ? response : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load reminders.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReminders();
  }, [profile?.uid]);

  if (loading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load reminders."
        description={error}
        onRetry={() => void loadReminders()}
        retryLabel="Retry"
      />
    );
  }

  const unreadCount = notifications.filter((item) => !item?.read).length;

  const handleMarkRead = async (notificationId: string) => {
    if (!profile?.uid) return;

    const previous = [...notifications];
    setNotifications((current) =>
      current.map((item) => (item._id === notificationId ? { ...item, read: true } : item)),
    );

    try {
      await markVendorNotificationRead(notificationId);
      showToast('Reminder marked read', 'success');
    } catch (backendError) {
      setNotifications(previous);
      const message = backendError instanceof Error ? backendError.message : 'Could not mark reminder as read.';
      setError(message);
      showToast(message, 'error');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Notifications
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        {unreadCount > 0 ? `${unreadCount} new notification${unreadCount === 1 ? "" : "s"}` : "All caught up."}
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Upcoming milestones and automated nudges will appear here."
            />
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`theme-card p-4 flex justify-between ${notification.read ? "" : "ring-1 ring-orange-200 bg-orange-50/40"}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-medium ${notification.type === 'event-reminder' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'booking-update' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                    }`}>
                    {notification.type === 'event-reminder' ? `${notification.daysBefore || 0}d` :
                      notification.type === 'booking-update' ? '📅' : '🔔'}
                  </div>

                  <div>
                    <p className="font-medium">{notification.type?.toUpperCase()}</p>
                    <p className={`text-sm ${notification.read ? 'text-gray-500 line-through' : 'font-medium'}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => void handleMarkRead(notification._id)}
                  disabled={Boolean(notification.read)}
                  className="border px-3 py-1 rounded text-sm"
                >
                  {notification.read ? "Read" : "Mark Read"}
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
