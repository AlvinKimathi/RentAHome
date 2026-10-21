// frontend/src/pages/TenantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { Booking } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TenantDashboardProps {
  onSelectHouse: (id: number) => void;
  onNavigateExplore: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  onSelectHouse,
  onNavigateExplore,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.bookings.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load tenant bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Tenant Viewing Hub
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
              My Viewing Appointments
            </h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">
              Track your scheduled property inspections and landlord confirmations.
            </p>
          </div>

          <button
            onClick={onNavigateExplore}
            className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors cursor-pointer w-fit"
          >
            <Home className="w-4 h-4" />
            <span>Search More Houses</span>
          </button>
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Total Inquiries
            </span>
            <span className="text-3xl font-extrabold text-neutral-950">{bookings.length}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Confirmed Viewings
            </span>
            <span className="text-3xl font-extrabold text-emerald-700">{confirmedCount}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Pending Landlord Response
            </span>
            <span className="text-3xl font-extrabold text-amber-600">{pendingCount}</span>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="p-16 text-center text-xs text-neutral-400">Loading your viewing schedule...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-neutral-900 mb-1">No Viewing Requests Yet</h3>
            <p className="text-xs text-neutral-500 mb-5">
              You haven't requested any house viewings. Browse available vacant houses and schedule a visit directly with the landlord.
            </p>
            <button
              onClick={onNavigateExplore}
              className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold hover:bg-neutral-800 cursor-pointer"
            >
              Explore Vacant Houses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cleanPhone = (booking.landlord_phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={booking.booking_id}
                  className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    {booking.house_image && (
                      <img
                        src={booking.house_image}
                        alt=""
                        className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 bg-neutral-100 hidden sm:block"
                      />
                    )}

                    <div className="space-y-1.5">
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
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-neutral-950 hover:underline cursor-pointer"
                          onClick={() => onSelectHouse(booking.house_id)}>
                        {booking.house_title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{booking.house_location}</span>
                        {booking.house_rent && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <span className="font-bold text-neutral-900">KES {booking.house_rent.toLocaleString()}/mo</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-neutral-700 pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Date: {booking.booking_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Time: {booking.booking_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Landlord Contact & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Landlord / Caretaker
                      </span>
                      <p className="font-extrabold text-sm text-neutral-900">{booking.landlord_name}</p>
                      {booking.landlord_phone && (
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <a
                            href={`tel:${booking.landlord_phone}`}
                            className="hover:text-black font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {booking.landlord_phone}
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectHouse(booking.house_id)}
                      className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View House Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
