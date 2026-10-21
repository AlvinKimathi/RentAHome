// frontend/src/components/BookingModal.tsx
import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { House } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface BookingModalProps {
  house: House;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRequireLogin: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  house,
  isOpen,
  onClose,
  onSuccess,
  onRequireLogin,
}) => {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireLogin();
      return;
    }

    if (!bookingDate) {
      setError('Please select a viewing date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.bookings.create({
        house_id: house.house_id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        message: message || `Hello, I am interested in viewing this ${house.house_type} in ${house.location}.`,
      });

      if (res.success) {
        setIsDone(true);
        setTimeout(() => {
          setIsDone(false);
          onSuccess();
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h3 className="font-extrabold text-lg text-neutral-900">
              Request House Viewing
            </h3>
            <p className="text-xs text-neutral-500 truncate max-w-xs">
              {house.title} • KES {house.rent.toLocaleString()}/mo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isDone ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900 mb-2">
              Viewing Request Sent!
            </h4>
            <p className="text-sm text-neutral-600 mb-4">
              The landlord has received your schedule request for {bookingDate} at {bookingTime}. You can track this in your Tenant Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                You need to be signed in as a tenant to book a viewing. You will be redirected to log in or create an account.
              </div>
            )}

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Preferred Viewing Date
              </label>
              <div className="relative flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5">
                <Calendar className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type="date"
                  min={minDate}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm font-semibold text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Time slot selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Preferred Time of Day
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10:00 AM', '02:00 PM', '04:30 PM'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingTime(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      bookingTime === slot
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message to landlord */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Message / Inquiries for Landlord (Optional)
              </label>
              <div className="relative bg-neutral-50 border border-neutral-200 rounded-2xl p-3">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. When will the house be ready for move-in? Is water available 24/7?"
                  className="w-full bg-transparent text-xs text-neutral-900 focus:outline-none placeholder:text-neutral-400 resize-none"
                />
              </div>
            </div>

            {/* Direct Landlord Contact Preview */}
            <div className="p-3 bg-neutral-100 rounded-2xl text-xs text-neutral-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900 block">Landlord: {house.landlord_name}</span>
                <span>Phone: {house.landlord_phone}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-neutral-200 rounded-full text-neutral-700">
                Verified
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Request...' : user ? 'Confirm Viewing Request' : 'Sign In to Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
