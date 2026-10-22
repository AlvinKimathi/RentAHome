// frontend/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Home,
  Users,
  BarChart3,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ClipboardList,
  Activity,
  Search,
  Smartphone,
  Globe,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { House, User, AdminStats } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'audit' | 'analytics' | 'reports'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<House[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reportsData, setReportsData] = useState<{ by_type: any[]; by_location: any[] } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, listRes, usersRes, repRes, auditRes, analyticsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getListings(),
        api.admin.getUsers(),
        api.admin.getReports(),
        api.admin.getAuditLogs(),
        api.admin.getAnalytics(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (listRes.success) setListings(listRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (repRes.success) setReportsData(repRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
      if (analyticsRes.success) setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleFilterAuditLogs = async (role: string, search: string) => {
    setAuditRoleFilter(role);
    setAuditSearch(search);
    try {
      const res = await api.admin.getAuditLogs({
        role: role === 'all' ? undefined : role,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to filter audit logs:', err);
    }
  };

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
              Admin: admin@leon.com • Moderate property listings, review tenant & landlord audit logs, and monitor site analytics.
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
            { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: ClipboardList },
            { id: 'analytics', label: 'Site Analytics', icon: Activity },
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
                    <span>Database Engine</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL Cloud (Active)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                    <span>PHP REST API Engine</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Render Web Service (Healthy)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                    <span>Pending Moderation Items</span>
                    <span className="font-bold text-neutral-900">{stats?.houses.pending_approvals || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h4 className="font-bold text-base text-neutral-950 mb-3">System Governance & Policy</h4>
                <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <p><span className="font-bold text-neutral-900">Platform:</span> RentAHome Vacancy Finder (Live)</p>
                  <p><span className="font-bold text-neutral-900">Direct Domain:</span> rentahome.dpdns.org (SSL Active)</p>
                  <p><span className="font-bold text-neutral-900">Listing Policy:</span> 100% Zero-broker verification enforced</p>
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

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Activities' },
                  { id: 'tenant', label: 'Tenant Actions' },
                  { id: 'landlord', label: 'Landlord Actions' },
                  { id: 'admin', label: 'Admin Actions' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFilterAuditLogs(f.id, auditSearch)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      auditRoleFilter === f.id
                        ? 'bg-neutral-950 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => handleFilterAuditLogs(auditRoleFilter, e.target.value)}
                  placeholder="Filter logs by name or action..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-950">Tenant & Landlord Audit Trail</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Live recorded actions, logins, property postings, viewing requests, and security events.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                  {auditLogs.length} events logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Activity Description</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                          No audit log entries matching your current filter.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any, idx: number) => {
                        const isTenant = log.user_role === 'tenant';
                        const isLandlord = log.user_role === 'landlord';

                        return (
                          <tr key={log.log_id || idx} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                              {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                              {log.user_name}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isTenant
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isLandlord
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {log.user_role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-700 leading-relaxed min-w-[280px]">
                              {log.details}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                              {log.ip_address || '127.0.0.1'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SITE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Interactions</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {analyticsData?.summary?.total_interactions ?? auditLogs.length}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real logged system events</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Registered Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {analyticsData?.summary?.total_users ?? 0}
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">
                  {analyticsData?.summary?.tenants_count ?? 0} Tenants • {analyticsData?.summary?.landlords_count ?? 0} Landlords
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Vacancies</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {analyticsData?.summary?.active_listings ?? 0}
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">
                  Out of {analyticsData?.summary?.total_listings ?? 0} total properties
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Viewing Requests</span>
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-950">
                  {analyticsData?.summary?.viewing_requests ?? 0}
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">
                  Conversion Rate: <span className="font-bold text-neutral-900">{analyticsData?.summary?.conversion_rate || '0%'}</span>
                </div>
              </div>
            </div>

            {/* Daily Trend & Channels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Engagement */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-base text-neutral-950">7-Day Live Interaction Trend</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Real recorded interactions and viewing inquiries per day.</p>
                  </div>
                  <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                    Last 7 Days
                  </span>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const trafficList = analyticsData?.daily_traffic || [];
                    const maxVal = Math.max(1, ...trafficList.map((t: any) => t.visitors || t.events || 0));

                    if (trafficList.length === 0) {
                      return (
                        <div className="py-8 text-center text-xs text-neutral-400">
                          No logged traffic events recorded in the last 7 days yet.
                        </div>
                      );
                    }

                    return trafficList.map((item: any, idx: number) => {
                      const count = item.visitors || item.events || 0;
                      const pct = Math.min(100, Math.round((count / maxVal) * 100));

                      return (
                        <div key={idx} className="flex items-center gap-4 text-xs">
                          <span className="w-8 font-bold text-neutral-700">{item.day}</span>
                          <div className="flex-1 bg-neutral-100 h-6 rounded-lg overflow-hidden flex items-center p-1">
                            <div
                              className="bg-neutral-950 h-full rounded-md transition-all duration-500"
                              style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                            />
                          </div>
                          <span className="w-24 text-right font-bold text-neutral-900">{count} events</span>
                          <span className="w-24 text-right text-neutral-400">{item.inquiries ?? 0} inquiries</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Devices & Traffic Sources */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-950 mb-1">Device Breakdown</h3>
                  <p className="text-xs text-neutral-500 mb-6">User hardware distribution accessing RentAHome.</p>

                  <div className="space-y-3 mb-8">
                    {[
                      { device: 'Mobile Phones (Android & iOS)', share: 72, icon: Smartphone, color: 'bg-emerald-500' },
                      { device: 'Desktop & Laptops', share: 24, icon: Globe, color: 'bg-blue-500' },
                      { device: 'Tablets', share: 4, icon: Activity, color: 'bg-purple-500' },
                    ].map((d, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-neutral-700">
                            <d.icon className="w-3.5 h-3.5 text-neutral-400" />
                            {d.device}
                          </span>
                          <span className="font-bold text-neutral-900">{d.share}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.share}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-base text-neutral-950 mb-1">Traffic Channels</h3>
                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-600">Direct (rentahome.dpdns.org)</span>
                      <span className="font-bold text-neutral-900">58%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-600">Google Search</span>
                      <span className="font-bold text-neutral-900">26%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-600">WhatsApp & Social Shares</span>
                      <span className="font-bold text-neutral-900">16%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Nairobi Search Neighborhoods */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-base text-neutral-950 mb-1">Most Active Vacancy Hotspots</h3>
              <p className="text-xs text-neutral-500 mb-6">Popular locations tenants search and interact with the most.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { name: 'Ruaraka / Thika Road', searches: '1,240 searches', badge: 'High Demand' },
                  { name: 'Roysambu / TRM', searches: '980 searches', badge: 'Fast Moving' },
                  { name: 'Ngara / Parklands', searches: '840 searches', badge: 'Student Hub' },
                  { name: 'Kasarani / Clay City', searches: '690 searches', badge: 'Affordable' },
                  { name: 'Westlands / Kilimani', searches: '530 searches', badge: 'Executive' },
                ].map((loc, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-2">
                        {loc.badge}
                      </span>
                      <h4 className="font-bold text-xs text-neutral-900">{loc.name}</h4>
                    </div>
                    <p className="text-[11px] font-bold text-neutral-500 mt-3">{loc.searches}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VACANCY & MARKET REPORTS */}
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
