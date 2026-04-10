"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";

type Notification = {
  _id: string;
  message: string;
  type?: string;
  daysBefore?: number;
  read?: boolean;
  createdAt?: string;
};

export default function CustomerNotifications() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/notifications?userId=${profile.uid}`);
        const data = (response as { data?: Notification[] } | null)?.data ?? response;
        setNotifications(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load notifications.";
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, [profile?.uid]);

  const handleMarkRead = async (notificationId: string) => {
    if (!profile?.uid) return;

    const previous = [...notifications];
    setNotifications((current) =>
      current.map((item) => (item._id === notificationId ? { ...item, read: true } : item)),
    );

    try {
      await apiFetch(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      showToast('Notification marked as read', 'success');
    } catch (backendError) {
      setNotifications(previous);
      const message = backendError instanceof Error ? backendError.message : 'Could not mark notification as read.';
      setError(message);
      showToast(message, 'error');
    }
  };

  if (loading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load notifications."
        description={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Notifications ({unreadCount})
      </h1>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You'll receive updates about bookings, vendor responses, and event reminders here."
          />
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className="theme-card p-4">
              <div className="flex gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold ${
                  notification.type === 'event-reminder' ? 'bg-blue-100 text-blue-800' :
                  notification.type === 'booking-update' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {notification.type === 'event-reminder' ? '⏰' :
                   notification.type === 'booking-update' ? '📋' : '🔔'}
                </div>

                <div className="flex-1">
                  <p className={`font-medium ${notification.read ? 'text-gray-500' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>

                {!notification.read && (
                  <button
                    onClick={() => void handleMarkRead(notification._id)}
                    className="ml-auto px-3 py-1 rounded-sm text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
