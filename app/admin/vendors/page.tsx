"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { apiFetch } from '@/app/lib/api';

type Vendor = {
  _id: string;
  businessName: string;
  userId: string;
  isApproved: boolean;
  profileCompleted: boolean;
  status?: string;
};

export default function AdminVendorsPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await apiFetch('/vendors/all');
      setVendors(data || []);
    } catch (err) {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/approve/${id}`, { method: 'PATCH' });
      fetchVendors();
    } catch (err) {
      setError('Approve failed');
    } finally {
      setActingId('');
    }
  };

  const rejectVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/reject/${id}`, { method: 'PATCH' });
      fetchVendors();
    } catch (err) {
      setError('Reject failed');
    } finally {
      setActingId('');
    }
  };

  if (profile?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) return <Spinner />;

  const pendingVendors = vendors.filter(v => !v.isApproved && v.profileCompleted && v.status !== 'rejected');
  const approvedVendors = vendors.filter(v => v.isApproved);
  const rejectedVendors = vendors.filter(v => v.status === 'rejected' && !v.isApproved);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendors</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title={`Pending Approval (${pendingVendors.length})`}>
          <div className="space-y-3">
            {pendingVendors.map(vendor => (
              <div key={vendor._id} className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium text-sm">{vendor.businessName || 'Unnamed'}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => void approveVendor(vendor._id)}
                    disabled={actingId === vendor._id}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
                  >
                    {actingId === vendor._id ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => void rejectVendor(vendor._id)}
                    disabled={actingId === vendor._id}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
                  >
                    {actingId === vendor._id ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
            {pendingVendors.length === 0 && <p className="text-sm theme-muted">No pending vendors</p>}
          </div>
        </DashboardCard>

        <DashboardCard title={`Approved Vendors (${approvedVendors.length})`}>
          <div className="space-y-2">
            {approvedVendors.map(vendor => (
              <div key={vendor._id} className="flex items-center justify-between p-2 text-sm border-b">
                <span>{vendor.businessName || 'Unnamed'}</span>
                <span className="text-xs text-green-600 font-medium">Approved</span>
              </div>
            ))}
            {approvedVendors.length === 0 && <p className="text-sm theme-muted">No approved vendors</p>}
          </div>
        </DashboardCard>
      </div>

      {rejectedVendors.length > 0 && (
        <DashboardCard title={`Rejected Vendors (${rejectedVendors.length})`}>
          <div className="space-y-2">
            {rejectedVendors.map(vendor => (
              <div key={vendor._id} className="flex items-center justify-between p-2 text-sm border-b">
                <span>{vendor.businessName || 'Unnamed'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Rejected</span>
                  <button
                    onClick={() => void approveVendor(vendor._id)}
                    disabled={actingId === vendor._id}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs disabled:opacity-50"
                  >
                    Re-approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

