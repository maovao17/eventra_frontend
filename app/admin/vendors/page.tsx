"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { apiFetch, API_URL } from '@/app/lib/api';
import { X, MapPin, Briefcase, Star, Package, Images } from 'lucide-react';

const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const resolveImage = (path?: string) => {
  if (!path) return "/placeholder-avatar.jpg";
  if (path.startsWith("http")) return path;
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

type VendorFull = {
  _id: string;
  businessName?: string;
  userId: string;
  isApproved: boolean;
  profileCompleted: boolean;
  status?: string;
  description?: string;
  category?: string[];
  location?: { city?: string; area?: string; address?: string };
  experience?: string;
  profileImage?: string;
  portfolio?: Array<{ url: string; caption?: string }>;
  packages?: Array<{ name: string; price: number; description?: string; servicesIncluded?: string[] }>;
  isVerified?: boolean;
};

export default function AdminVendorsPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<VendorFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorFull | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    void fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await apiFetch('/vendors/all');
      setVendors(data || []);
    } catch {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const openVendorProfile = async (vendor: VendorFull) => {
    setSelectedVendor(vendor);
    setLoadingProfile(true);
    try {
      const full = await apiFetch(`/vendors/${vendor._id}`);
      if (full) setSelectedVendor(full as VendorFull);
    } catch {
      // use the list data as fallback
    } finally {
      setLoadingProfile(false);
    }
  };

  const approveVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/approve/${id}`, { method: 'PATCH' });
      void fetchVendors();
      if (selectedVendor?._id === id) {
        setSelectedVendor(prev => prev ? { ...prev, isApproved: true, status: 'approved' } : null);
      }
    } catch {
      setError('Approve failed');
    } finally {
      setActingId('');
    }
  };

  const rejectVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/reject/${id}`, { method: 'PATCH' });
      void fetchVendors();
      if (selectedVendor?._id === id) {
        setSelectedVendor(prev => prev ? { ...prev, isApproved: false, status: 'rejected' } : null);
      }
    } catch {
      setError('Reject failed');
    } finally {
      setActingId('');
    }
  };

  if (profile?.role !== 'admin') return <div>Access denied</div>;
  if (loading) return <Spinner />;

  const pendingVendors = vendors.filter(v => !v.isApproved && v.profileCompleted && v.status !== 'rejected');
  const approvedVendors = vendors.filter(v => v.isApproved);
  const rejectedVendors = vendors.filter(v => v.status === 'rejected' && !v.isApproved);

  const VendorRow = ({ vendor, showStatus }: { vendor: VendorFull; showStatus?: 'approved' | 'rejected' }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
      <button
        type="button"
        onClick={() => void openVendorProfile(vendor)}
        className="font-medium text-sm text-left hover:text-[var(--primary)] transition-colors underline-offset-2 hover:underline"
      >
        {vendor.businessName || 'Unnamed'}
      </button>
      <div className="flex items-center gap-2">
        {showStatus === 'approved' && (
          <span className="text-xs text-green-600 font-medium">Approved</span>
        )}
        {showStatus === 'rejected' && (
          <>
            <span className="text-xs text-red-600 font-medium">Rejected</span>
            <button
              onClick={() => void approveVendor(vendor._id)}
              disabled={actingId === vendor._id}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs disabled:opacity-50"
            >
              Re-approve
            </button>
          </>
        )}
        {!showStatus && (
          <>
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
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 h-full">
      {/* Left: vendor lists */}
      <div className="flex-1 space-y-6 min-w-0">
        <h1 className="text-3xl font-bold">Vendors</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title={`Pending Approval (${pendingVendors.length})`}>
            <div className="space-y-1">
              {pendingVendors.map(vendor => (
                <VendorRow key={vendor._id} vendor={vendor} />
              ))}
              {pendingVendors.length === 0 && (
                <p className="text-sm theme-muted px-3">No pending vendors</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title={`Approved Vendors (${approvedVendors.length})`}>
            <div className="space-y-1">
              {approvedVendors.map(vendor => (
                <VendorRow key={vendor._id} vendor={vendor} showStatus="approved" />
              ))}
              {approvedVendors.length === 0 && (
                <p className="text-sm theme-muted px-3">No approved vendors</p>
              )}
            </div>
          </DashboardCard>
        </div>

        {rejectedVendors.length > 0 && (
          <DashboardCard title={`Rejected Vendors (${rejectedVendors.length})`}>
            <div className="space-y-1">
              {rejectedVendors.map(vendor => (
                <VendorRow key={vendor._id} vendor={vendor} showStatus="rejected" />
              ))}
            </div>
          </DashboardCard>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Right: vendor profile panel */}
      {selectedVendor && (
        <div className="w-[420px] shrink-0 theme-card rounded-2xl p-6 overflow-y-auto max-h-[calc(100vh-120px)] sticky top-0 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{selectedVendor.businessName || 'Unnamed Vendor'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  selectedVendor.isApproved
                    ? 'bg-green-100 text-green-700'
                    : selectedVendor.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedVendor.isApproved ? 'Approved' : selectedVendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
                {selectedVendor.isVerified && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Verified</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVendor(null)}
              className="p-1 rounded-full hover:bg-[var(--surface)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {loadingProfile ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <>
              {/* Profile image */}
              <img
                src={resolveImage(selectedVendor.profileImage)}
                alt={selectedVendor.businessName || 'Vendor'}
                className="w-full h-44 object-cover rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
              />

              {/* Description */}
              {selectedVendor.description && (
                <p className="text-sm theme-muted leading-relaxed">{selectedVendor.description}</p>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm">
                {selectedVendor.category && selectedVendor.category.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-[var(--primary)] shrink-0" />
                    <span>{selectedVendor.category.join(', ')}</span>
                  </div>
                )}
                {selectedVendor.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--primary)] shrink-0" />
                    <span>
                      {[selectedVendor.location.area, selectedVendor.location.city, selectedVendor.location.address]
                        .filter(Boolean).join(', ') || 'Location not set'}
                    </span>
                  </div>
                )}
                {selectedVendor.experience && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[var(--primary)] shrink-0" />
                    <span>{selectedVendor.experience} experience</span>
                  </div>
                )}
              </div>

              {/* Packages */}
              {selectedVendor.packages && selectedVendor.packages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-[var(--primary)]" />
                    <p className="text-sm font-semibold">Packages</p>
                  </div>
                  <div className="space-y-2">
                    {selectedVendor.packages.map((pkg, i) => (
                      <div key={i} className="theme-surface rounded-xl p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-[var(--primary)] font-semibold">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                        </div>
                        {pkg.description && <p className="theme-muted text-xs mt-1">{pkg.description}</p>}
                        {pkg.servicesIncluded && pkg.servicesIncluded.length > 0 && (
                          <p className="text-xs theme-muted mt-1">{pkg.servicesIncluded.join(' · ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedVendor.portfolio && selectedVendor.portfolio.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Images size={14} className="text-[var(--primary)]" />
                    <p className="text-sm font-semibold">Portfolio ({selectedVendor.portfolio.length})</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVendor.portfolio.map((img, i) => (
                      <img
                        key={i}
                        src={resolveImage(img.url)}
                        alt={img.caption || `Portfolio ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!selectedVendor.isApproved && selectedVendor.status !== 'rejected' && (
                <div className="flex gap-3 pt-2 border-t">
                  <button
                    onClick={() => void approveVendor(selectedVendor._id)}
                    disabled={actingId === selectedVendor._id}
                    className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    {actingId === selectedVendor._id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => void rejectVendor(selectedVendor._id)}
                    disabled={actingId === selectedVendor._id}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    {actingId === selectedVendor._id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
              {selectedVendor.status === 'rejected' && (
                <button
                  onClick={() => void approveVendor(selectedVendor._id)}
                  disabled={actingId === selectedVendor._id}
                  className="w-full py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  Re-approve
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
