"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import DashboardCard from '@/components/dashboard/DashboardCard';

type Vendor = {
  _id: string;
  businessName: string;
  userId: string;
  isApproved: boolean;
  profileCompleted: boolean;
};

export default function AdminVendorsPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/vendors/all');
      const data = await res.json();
      setVendors(data || []);
    } catch (err) {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id: string) => {
    try {
      const res = await fetch(`/vendors/approve/${id}`, { method: 'PATCH' });
      if (res.ok) {
        fetchVendors();
      }
    } catch (err) {
      setError('Approve failed');
    }
  };

  if (profile?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) return <Spinner />;

  const pendingVendors = vendors.filter(v => !v.isApproved && v.profileCompleted);
  const approvedVendors = vendors.filter(v => v.isApproved);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendors</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Pending Approval">
          <div className="space-y-3">
            {pendingVendors.map(vendor => (
              <div key={vendor._id} className="flex justify-between items-center p-3 bg-muted rounded">
                <span>{vendor.businessName}</span>
                <button 
                  onClick={() => approveVendor(vendor._id)}
                  className="px-4 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Approve
                </button>
              </div>
            ))}
            {pendingVendors.length === 0 && <p>No pending vendors</p>}
          </div>
        </DashboardCard>

        <DashboardCard title="Approved Vendors">
          <div className="space-y-2">
            {approvedVendors.map(vendor => (
              <div key={vendor._id} className="p-2 text-sm border-b">
                {vendor.businessName}
              </div>
            ))}
            {approvedVendors.length === 0 && <p>No approved vendors</p>}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

