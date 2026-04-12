"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import { apiFetch, API_URL } from '@/app/lib/api';
import { Search, MapPin, Phone, Mail, X, Briefcase, Star, Package, Images } from 'lucide-react';

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
  phone?: string;
  email?: string;
};

const SERVICE_CATEGORIES = ["Catering", "Decoration", "Photography", "Entertainment", "Florist", "Production"];

export default function AdminVendorsPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<VendorFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorFull | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [view, setView] = useState<'all' | 'pending'>('all');

  useEffect(() => { void fetchVendors(); }, []);

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

  const openProfile = async (vendor: VendorFull) => {
    setSelectedVendor(vendor);
    setLoadingProfile(true);
    try {
      const full = await apiFetch(`/vendors/${vendor._id}`);
      if (full) setSelectedVendor(full as VendorFull);
    } catch { /* use list data */ } finally {
      setLoadingProfile(false);
    }
  };

  const approveVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/approve/${id}`, { method: 'PATCH' });
      void fetchVendors();
      if (selectedVendor?._id === id)
        setSelectedVendor(prev => prev ? { ...prev, isApproved: true, status: 'approved' } : null);
    } catch { setError('Approve failed'); } finally { setActingId(''); }
  };

  const rejectVendor = async (id: string) => {
    setActingId(id);
    try {
      await apiFetch(`/vendors/reject/${id}`, { method: 'PATCH' });
      void fetchVendors();
      if (selectedVendor?._id === id)
        setSelectedVendor(prev => prev ? { ...prev, isApproved: false, status: 'rejected' } : null);
    } catch { setError('Reject failed'); } finally { setActingId(''); }
  };

  const pendingVendors = vendors.filter(v => !v.isApproved && v.profileCompleted && v.status !== 'rejected');

  const filteredVendors = useMemo(() => {
    let list = view === 'pending' ? pendingVendors : vendors.filter(v => v.profileCompleted);
    if (selectedCategory) {
      list = list.filter(v =>
        (v.category || []).some(c => c.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.businessName || '').toLowerCase().includes(q) ||
        (v.location?.city || '').toLowerCase().includes(q) ||
        (v.location?.area || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [vendors, view, selectedCategory, search]);

  if (profile?.role !== 'admin') return <div>Access denied</div>;
  if (loading) return <Spinner />;

  return (
    <div className="flex gap-6 min-h-0">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendor Management</h1>
            <p className="theme-muted text-sm mt-1">Review, filter, and organise your network of event partners.</p>
          </div>
          <button
            onClick={() => setView(v => v === 'pending' ? 'all' : 'pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              view === 'pending'
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--primary)] text-[var(--primary)]'
            }`}
          >
            {view === 'pending'
              ? `Pending Vendors (${pendingVendors.length})`
              : `⏳ Pending Vendors (${pendingVendors.length})`}
          </button>
        </div>

        {/* Pending Verification section (shown when view === 'pending') */}
        {view === 'pending' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vendor Verification</h2>
            <p className="theme-muted text-sm mb-6">Review and approve vendors before they appear in Vendor Management.</p>
            {pendingVendors.length === 0 ? (
              <div className="theme-card p-8 text-center rounded-2xl">
                <p className="theme-muted">No vendors pending verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingVendors.map(vendor => (
                  <div key={vendor._id} className="theme-card rounded-2xl overflow-hidden">
                    <div className="relative h-40">
                      <img
                        src={resolveImage(vendor.profileImage || vendor.portfolio?.[0]?.url)}
                        alt={vendor.businessName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                      />
                      <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                        Pending Verification
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-semibold">{vendor.businessName || 'Unnamed'}</p>
                      {vendor.location && (
                        <p className="text-xs theme-muted flex items-center gap-1">
                          <MapPin size={12} />
                          {[vendor.location.area, vendor.location.city].filter(Boolean).join(', ') || 'Location not set'}
                        </p>
                      )}
                      {vendor.category && vendor.category.length > 0 && (
                        <p className="text-xs theme-muted">{vendor.category.join(' · ')}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => void approveVendor(vendor._id)}
                          disabled={actingId === vendor._id}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {actingId === vendor._id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => void rejectVendor(vendor._id)}
                          disabled={actingId === vendor._id}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {actingId === vendor._id ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All vendors section */}
        {view === 'all' && (
          <>
            {/* Search */}
            <div className="theme-card flex items-center gap-3 rounded-xl px-4 py-3">
              <Search size={16} className="theme-muted shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors by name, service, or location..."
                className="flex-1 outline-none bg-transparent text-sm"
              />
            </div>

            <div className="flex gap-6">
              {/* Category sidebar */}
              <div className="w-48 shrink-0">
                <p className="text-sm font-semibold mb-3">Service Category</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="accent-[var(--primary)]"
                    />
                    All
                  </label>
                  {SERVICE_CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="accent-[var(--primary)]"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Vendor cards */}
              <div className="flex-1 min-w-0">
                <p className="text-sm theme-muted mb-4">
                  Available Vendors <span className="font-medium text-[var(--text-main)]">(Showing {filteredVendors.length} results)</span>
                </p>

                {filteredVendors.length === 0 ? (
                  <div className="theme-card p-8 text-center rounded-2xl">
                    <p className="theme-muted">No vendors found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVendors.map(vendor => (
                      <div key={vendor._id} className="theme-card rounded-2xl overflow-hidden">
                        <div
                          className="relative h-40 cursor-pointer"
                          onClick={() => void openProfile(vendor)}
                        >
                          <img
                            src={resolveImage(vendor.profileImage || vendor.portfolio?.[0]?.url)}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                          />
                          {vendor.category && vendor.category[0] && (
                            <span className="absolute top-2 left-2 bg-[var(--primary)] text-white text-xs font-medium px-2 py-1 rounded-full">
                              {vendor.category[0]}
                            </span>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <button
                            type="button"
                            onClick={() => void openProfile(vendor)}
                            className="font-semibold text-left hover:text-[var(--primary)] transition-colors"
                          >
                            {vendor.businessName || 'Unnamed'}
                          </button>
                          {vendor.location && (
                            <p className="text-xs theme-muted flex items-center gap-1">
                              <MapPin size={11} />
                              {[vendor.location.area, vendor.location.city].filter(Boolean).join(', ') || 'Location not set'}
                            </p>
                          )}
                          {vendor.email && (
                            <p className="text-xs theme-muted flex items-center gap-1">
                              <Mail size={11} />
                              {vendor.email}
                            </p>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => void openProfile(vendor)}
                              className="flex-1 py-1.5 border rounded-lg text-xs font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                            >
                              View
                            </button>
                            {vendor.isApproved ? (
                              <button
                                onClick={() => void rejectVendor(vendor._id)}
                                disabled={actingId === vendor._id}
                                className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                              >
                                {actingId === vendor._id ? '...' : 'Revoke'}
                              </button>
                            ) : (
                              <button
                                onClick={() => void approveVendor(vendor._id)}
                                disabled={actingId === vendor._id}
                                className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                              >
                                {actingId === vendor._id ? '...' : 'Approve'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Profile panel */}
      {selectedVendor && (
        <div className="w-[380px] shrink-0 theme-card rounded-2xl p-6 overflow-y-auto max-h-[calc(100vh-120px)] sticky top-0 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{selectedVendor.businessName || 'Unnamed'}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                selectedVendor.isApproved ? 'bg-green-100 text-green-700'
                : selectedVendor.status === 'rejected' ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedVendor.isApproved ? 'Approved' : selectedVendor.status === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            </div>
            <button type="button" onClick={() => setSelectedVendor(null)} className="p-1 rounded-full hover:bg-[var(--surface)]">
              <X size={18} />
            </button>
          </div>

          {loadingProfile ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <>
              <img
                src={resolveImage(selectedVendor.profileImage)}
                alt={selectedVendor.businessName}
                className="w-full h-40 object-cover rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
              />

              {selectedVendor.description && (
                <p className="text-sm theme-muted leading-relaxed">{selectedVendor.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {selectedVendor.category && selectedVendor.category.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-[var(--primary)] shrink-0" />
                    <span>{selectedVendor.category.join(', ')}</span>
                  </div>
                )}
                {selectedVendor.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[var(--primary)] shrink-0" />
                    <span>{[selectedVendor.location.area, selectedVendor.location.city].filter(Boolean).join(', ') || 'Not set'}</span>
                  </div>
                )}
                {selectedVendor.experience && (
                  <div className="flex items-center gap-2">
                    <Star size={13} className="text-[var(--primary)] shrink-0" />
                    <span>{selectedVendor.experience} experience</span>
                  </div>
                )}
                {selectedVendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[var(--primary)] shrink-0" />
                    <span className="break-all">{selectedVendor.email}</span>
                  </div>
                )}
              </div>

              {selectedVendor.packages && selectedVendor.packages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={13} className="text-[var(--primary)]" />
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVendor.portfolio && selectedVendor.portfolio.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Images size={13} className="text-[var(--primary)]" />
                    <p className="text-sm font-semibold">Portfolio ({selectedVendor.portfolio.length})</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVendor.portfolio.map((img, i) => (
                      <img key={i} src={resolveImage(img.url)} alt={`Portfolio ${i + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                {!selectedVendor.isApproved && selectedVendor.status !== 'rejected' && (
                  <>
                    <button onClick={() => void approveVendor(selectedVendor._id)} disabled={actingId === selectedVendor._id}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                      {actingId === selectedVendor._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button onClick={() => void rejectVendor(selectedVendor._id)} disabled={actingId === selectedVendor._id}
                      className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                      {actingId === selectedVendor._id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
                {selectedVendor.isApproved && (
                  <button onClick={() => void rejectVendor(selectedVendor._id)} disabled={actingId === selectedVendor._id}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                    Revoke Approval
                  </button>
                )}
                {selectedVendor.status === 'rejected' && !selectedVendor.isApproved && (
                  <button onClick={() => void approveVendor(selectedVendor._id)} disabled={actingId === selectedVendor._id}
                    className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                    Re-approve
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
