"use client";

import DashboardContainer from '@/components/dashboard/DashboardContainer';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useVendorData } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VendorDashboardPage() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { vendorProfile, loadingProfile, dashboard, loadingDashboard, refreshVendorProfile } = useVendorData();

  if (!profile?.uid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please login as vendor.</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    await refreshVendorProfile();
  };

  const isProfileIncomplete = !loadingProfile && vendorProfile?.profileCompleted === false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your events and business.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loadingProfile || loadingDashboard}
            className="btn-secondary"
          >
            {loadingProfile ? <Spinner /> : 'Refresh'}
          </button>
        </div>
      </div>

      {isProfileIncomplete && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
            <div>
              <p className="font-medium text-orange-900">Complete your business profile</p>
              <p className="text-sm text-orange-700">Add your services to start receiving bookings.</p>
            </div>
            <Link 
              href="/vendor/businessProfile" 
              className="ml-auto theme-button text-sm font-medium"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {(loadingProfile || loadingDashboard) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-muted/50 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded mt-3 w-1/2" />
              <div className="h-3 bg-muted rounded w-1/2 mt-2" />
            </div>
          ))}
        </div>
      ) : (
<DashboardContainer title={''} subtitle={''}>
          <DashboardGrid>
            <DashboardCard title="Total Bookings">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{dashboard?.totalBookings || 0}</div>
                <p className="text-2xs text-muted-foreground">Bookings this month</p>
                {dashboard?.totalBookings > 0 ? (
                  <p className="text-2xs text-green-600 font-medium">+12%</p>
                ) : (
                  <p className="text-2xs text-muted-foreground">No data yet</p>
                )}
              </div>
            </DashboardCard>
            <DashboardCard title="Revenue">
              <div className="space-y-1">
                <div className="text-2xl font-bold">₹{(dashboard?.revenue || 0).toLocaleString()}</div>
                <p className="text-2xs text-muted-foreground">This month</p>
                {dashboard?.revenue > 0 ? (
                  <p className="text-2xs text-green-600 font-medium">+28%</p>
                ) : (
                  <p className="text-2xs text-muted-foreground">No data yet</p>
                )}
              </div>
            </DashboardCard>
            <DashboardCard title="Pending Requests">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{dashboard?.pendingBookings || 0}</div>
                <p className="text-2xs text-muted-foreground">Awaiting response</p>
                {dashboard?.pendingBookings > 0 ? (
                  <p className="text-2xs text-amber-600 font-medium">-2%</p>
                ) : (
                  <p className="text-2xs text-muted-foreground">No data yet</p>
                )}
              </div>
            </DashboardCard>
            <DashboardCard title="Ratings">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{(dashboard?.averageRating || 0).toFixed(1)}</div>
                <p className="text-2xs text-muted-foreground">Average rating</p>
                {dashboard?.averageRating > 0 ? (
                  <p className="text-2xs text-green-600 font-medium">+0.3</p>
                ) : (
                  <p className="text-2xs text-muted-foreground">—</p>
                )}
              </div>
            </DashboardCard>
          </DashboardGrid>

          {dashboard?.recentBookings?.length > 0 && (
            <div className="mt-8 p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {dashboard.recentBookings.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{booking.eventName || 'Event'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : booking.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DashboardContainer>
      )}
    </div>
  );
}

