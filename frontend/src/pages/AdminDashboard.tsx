// frontend/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Shield, Home, Users, BarChart3, CheckCircle2, XCircle, Trash2, UserCheck, UserX, RefreshCw, AlertCircle } from 'lucide-react';
import { House, User, AdminStats } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'reports'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<House[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reportsData, setReportsData] = useState<{ by_type: any[]; by_location: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, listRes, usersRes, repRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getListings(),
        api.admin.getUsers(),
        api.admin.getReports(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (listRes.success) setListings(listRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (repRes.success) setReportsData(repRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleModerate = async (houseId: number, approval: 'approved' | 'rejected') => {
    try {
      const res = await api.admin.moderateListing(houseId, approval);
      if (res.success) {
        setNotice(res.message);
        setTimeout(() => setNotice(null), 3000);
        setListings(
          listings.map((h) =>
            h.house_id === houseId ? { ...h, approval_status: approval } : h
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Moderation action failed.');
    }
  };

  const handleDeleteListing = async (houseId: number) => {
    if (!window.confirm('Delete this listing permanently from the system?')) return;
    try {
      const res = await api.houses.delete(houseId);
      if (res.success) {
        setNotice('Listing deleted by Admin.');
        setTimeout(() => setNotice(null), 3000);
        setListings(listings.filter((h) => h.house_id !== houseId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleToggleUser = async (userId: number) => {
    try {
      const res = await api.admin.toggleUser(userId);
      if (res.success) {
        setNotice(res.message);
        setTimeout(() => setNotice(null), 3000);
        setUsersList(
          usersList.map((u) =>
            u.user_id === userId ? { ...u, is_active: res.is_active } : u
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              System Control Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Control Panel
            </h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">
              Admin: admin@leon.com • Moderate property listings, manage platform users, and review vacancy reports.
            </p>
          </div>

          <button
            onClick={fetchAllAdminData}
            title="Refresh All"
            className="p-3 bg-white border border-neutral-200 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600 w-fit"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback notice */}
        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Platform Stats', icon: Shield },
            { id: 'listings', label: `Listings & Moderation (${listings.length})`, icon: Home },
            { id: 'users', label: `Users (${usersList.length})`, icon: Users },
            { id: 'reports', label: 'Vacancy & Market Reports', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Total Houses</span>
                <span className="text-2xl md:text-3xl font-extrabold text-neutral-950">{stats?.houses.total || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Vacant</span>
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-700">{stats?.houses.vacant || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Occupied</span>
                <span className="text-2xl md:text-3xl font-extrabold text-neutral-800">{stats?.houses.occupied || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Landlords</span>
                <span className="text-2xl md:text-3xl font-extrabold text-blue-700">{stats?.users.landlords || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">Tenants</span>
                <span className="text-2xl md:text-3xl font-extrabold text-purple-700">{stats?.users.tenants || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">Total Bookings</span>
                <span className="text-2xl md:text-3xl font-extrabold text-amber-600">{stats?.bookings.total || 0}</span>
              </div>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h4 className="font-bold text-base text-neutral-950 mb-3">System Health & Verification</h4>
                <div className="space-y-3 text-xs text-neutral-600">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                    <span>Database Connection</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> MariaDB Active (Port 3306)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                    <span>PHP REST API Engine</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Running (Port 8000)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                    <span>Pending Moderation Items</span>
                    <span className="font-bold text-neutral-900">{stats?.houses.pending_approvals || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h4 className="font-bold text-base text-neutral-950 mb-3">System Policies</h4>
                <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <p><span className="font-bold text-neutral-900">Platform:</span> RentAHome Vacancy Finder</p>
                  <p><span className="font-bold text-neutral-900">Listing Policy:</span> 100% Zero-broker verification enforced</p>
                  <p><span className="font-bold text-neutral-900">Coverage:</span> Nairobi Residential Estates & Suburbs</p>
                  <p><span className="font-bold text-neutral-900">Security:</span> Password hashing & role token validation</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LISTINGS MODERATION */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-950">Property Listings Directory</h3>
              <p className="text-xs text-neutral-500">Approve, reject, or remove any property listing on the platform.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Landlord</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Rent (KES)</th>
                    <th className="py-3 px-4">Vacancy Status</th>
                    <th className="py-3 px-4">Approval</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                  {listings.map((house) => (
                    <tr key={house.house_id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-950 max-w-xs truncate">
                        {house.title}
                        <span className="block text-[11px] font-normal text-neutral-500 truncate">{house.location}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 block">{house.landlord_name}</span>
                        <span className="text-[11px] text-neutral-400">{house.landlord_phone}</span>
                      </td>
                      <td className="py-3.5 px-4">{house.house_type}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-950">
                        {house.rent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          house.status === 'Vacant' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {house.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          house.approval_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : house.approval_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {house.approval_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {house.approval_status !== 'approved' && (
                            <button
                              onClick={() => handleModerate(house.house_id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {house.approval_status !== 'rejected' && (
                            <button
                              onClick={() => handleModerate(house.house_id, 'rejected')}
                              className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteListing(house.house_id)}
                            title="Delete Listing"
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-950">Platform User Directory</h3>
              <p className="text-xs text-neutral-500">Manage registered landlords, tenants, and system administrators.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                  {usersList.map((usr) => (
                    <tr key={usr.user_id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-950">
                        {usr.full_name}
                        <span className="block text-[11px] font-normal text-neutral-400">{usr.email}</span>
                      </td>
                      <td className="py-3.5 px-4">{usr.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          usr.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : usr.role === 'landlord'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          usr.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {usr.is_active === 1 ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">
                        {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {usr.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(usr.user_id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              usr.is_active === 1
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {usr.is_active === 1 ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* By House Type */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-base text-neutral-950 mb-1">Vacancy Breakdown by House Type</h3>
              <p className="text-xs text-neutral-500 mb-4">Summary of total listings, vacancies, and average rent per category.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">House Type</th>
                      <th className="py-2.5 px-3">Total Listings</th>
                      <th className="py-2.5 px-3">Vacant</th>
                      <th className="py-2.5 px-3">Occupied</th>
                      <th className="py-2.5 px-3">Average Monthly Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(reportsData?.by_type || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-3 px-3 font-bold text-neutral-950">{row.house_type}</td>
                        <td className="py-3 px-3">{row.total}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">{row.vacant_count}</td>
                        <td className="py-3 px-3 text-neutral-500">{row.occupied_count}</td>
                        <td className="py-3 px-3 font-bold">KES {parseFloat(row.average_rent).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Location */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-base text-neutral-950 mb-1">Vacancy Breakdown by Location / Neighborhood</h3>
              <p className="text-xs text-neutral-500 mb-4">Geographic distribution of vacancies across Nairobi.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Total Listings</th>
                      <th className="py-2.5 px-3">Vacant</th>
                      <th className="py-2.5 px-3">Occupied</th>
                      <th className="py-2.5 px-3">Average Monthly Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(reportsData?.by_location || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-3 px-3 font-bold text-neutral-950">{row.location}</td>
                        <td className="py-3 px-3">{row.total}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">{row.vacant_count}</td>
                        <td className="py-3 px-3 text-neutral-500">{row.occupied_count}</td>
                        <td className="py-3 px-3 font-bold">KES {parseFloat(row.average_rent).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
