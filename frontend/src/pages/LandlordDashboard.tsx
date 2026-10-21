// frontend/src/pages/LandlordDashboard.tsx
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Home, Calendar, PlusCircle, Trash2, CheckCircle2, XCircle, Clock, Phone, Mail, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { House, Booking } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LandlordDashboardProps {
  onNavigatePost: () => void;
  onSelectHouse: (id: number) => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  onNavigatePost,
  onSelectHouse,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [listings, setListings] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listRes, bookRes] = await Promise.all([
        api.houses.getMyListings(),
        api.bookings.getLandlordBookings(),
      ]);

      if (listRes.success) setListings(listRes.data);
      if (bookRes.success) setBookings(bookRes.data);
    } catch (err) {
      console.error('Failed to load landlord dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (houseId: number) => {
    try {
      const res = await api.houses.toggleStatus(houseId);
      if (res.success) {
        setActionMessage(res.message);
        setTimeout(() => setActionMessage(null), 3000);
        setListings(
          listings.map((h) =>
            h.house_id === houseId ? { ...h, status: res.status } : h
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteListing = async (houseId: number) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.houses.delete(houseId);
      if (res.success) {
        setActionMessage('Listing deleted successfully.');
        setTimeout(() => setActionMessage(null), 3000);
        setListings(listings.filter((h) => h.house_id !== houseId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleUpdateBooking = async (bookingId: number, status: 'confirmed' | 'declined' | 'completed') => {
    try {
      const res = await api.bookings.updateStatus(bookingId, status);
      if (res.success) {
        setActionMessage(`Viewing request marked as ${status}.`);
        setTimeout(() => setActionMessage(null), 3000);
        setBookings(
          bookings.map((b) =>
            b.booking_id === bookingId ? { ...b, status } : b
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  const vacantCount = listings.filter((h) => h.status === 'Vacant').length;
  const occupiedCount = listings.filter((h) => h.status === 'Occupied').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Top welcome & post action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Landlord Management Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">
              Manage your rental properties, update availability instantly, and review prospective tenant viewing requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-3 bg-white border border-neutral-200 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigatePost}
              className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </button>
          </div>
        </div>

        {/* Action alert message */}
        {actionMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Total Properties
            </span>
            <span className="text-3xl font-extrabold text-neutral-950">{listings.length}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Vacant (Listed)
            </span>
            <span className="text-3xl font-extrabold text-emerald-700">{vacantCount}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Occupied Houses
            </span>
            <span className="text-3xl font-extrabold text-neutral-800">{occupiedCount}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Pending Viewings
            </span>
            <span className="text-3xl font-extrabold text-amber-600">{pendingBookingsCount}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-200 mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>My Property Listings ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Viewing Inquiries ({bookings.length})</span>
            {pendingBookingsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingBookingsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          <div>
            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading your properties...</div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto">
                <Home className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-neutral-900 mb-1">No Properties Listed Yet</h3>
                <p className="text-xs text-neutral-500 mb-5">
                  You have not posted any rental houses yet. Start advertising your vacancies to prospective tenants.
                </p>
                <button
                  onClick={onNavigatePost}
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Post Your First Vacancy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((house) => {
                  const primaryImg = house.primary_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
                  const isVacant = house.status === 'Vacant';

                  return (
                    <div
                      key={house.house_id}
                      className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Status badge */}
                        <div className="relative aspect-[16/10] bg-neutral-100">
                          <img src={primaryImg} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                isVacant ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-white'
                              }`}
                            >
                              {house.status}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-neutral-800">
                              {house.house_type}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-5">
                          <h4 className="font-bold text-base text-neutral-950 mb-1 line-clamp-1">
                            {house.title}
                          </h4>
                          <p className="text-xs text-neutral-500 mb-3">{house.location}</p>

                          <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-neutral-100">
                            <span className="text-lg font-extrabold text-neutral-950">
                              KES {house.rent.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/mo</span>
                            </span>
                            <span className="text-[11px] font-semibold text-neutral-500">
                              Deposit: KES {house.deposit.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-500 flex justify-between">
                            <span>{house.beds} Beds • {house.baths} Baths</span>
                            <span className="text-neutral-700 font-semibold">{house.total_images || 1} photos</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls bar */}
                      <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(house.house_id)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                            isVacant
                              ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {isVacant ? 'Mark as Occupied' : 'Mark as Vacant'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectHouse(house.house_id)}
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteListing(house.house_id)}
                          title="Delete Listing"
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-neutral-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIEWING BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading viewing inquiries...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-neutral-900 mb-1">No Inquiries Yet</h3>
                <p className="text-xs text-neutral-500">
                  When prospective tenants request to view your properties, their schedule requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const cleanPhone = (booking.tenant_phone || '').replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={booking.booking_id}
                      className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <span className="text-xs text-neutral-400">
                            Requested {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-neutral-950">
                          {booking.house_title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs font-semibold text-neutral-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span>Viewing Date: {booking.booking_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <span>Time: {booking.booking_time}</span>
                          </div>
                        </div>

                        {booking.message && (
                          <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 max-w-xl">
                            "{booking.message}"
                          </p>
                        )}
                      </div>

                      {/* Tenant contact info & actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                            Prospective Tenant
                          </span>
                          <p className="font-extrabold text-sm text-neutral-900">{booking.tenant_name}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                            {booking.tenant_phone && (
                              <a
                                href={`tel:${booking.tenant_phone}`}
                                className="hover:text-black font-semibold flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {booking.tenant_phone}
                              </a>
                            )}
                            {booking.tenant_phone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                              >
                                <MessageCircle className="w-3 h-3" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status update buttons */}
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateBooking(booking.booking_id, 'confirmed')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Accept Viewing
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateBooking(booking.booking_id, 'declined')}
                                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBooking(booking.booking_id, 'completed')}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
