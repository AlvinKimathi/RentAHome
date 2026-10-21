// frontend/src/pages/PropertyDetails.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Car, ShieldCheck, Check, Calendar, Phone, Mail, MessageCircle, AlertCircle, Share2 } from 'lucide-react';
import { House } from '../types';
import { api } from '../services/api';
import { BookingModal } from '../components/BookingModal';

interface PropertyDetailsProps {
  houseId: number;
  onBack: () => void;
  onRequireLogin: () => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  houseId,
  onBack,
  onRequireLogin,
}) => {
  const [house, setHouse] = useState<House | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.houses.getById(houseId);
        if (res.success && res.data) {
          setHouse(res.data);
          const initialImg = (res.data.images && res.data.images[0]?.image_path) || res.data.primary_image || '';
          setSelectedImage(initialImg);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [houseId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="h-96 bg-neutral-200 animate-pulse rounded-3xl mb-8" />
        <div className="h-10 bg-neutral-200 animate-pulse rounded-xl w-1/2 mb-4" />
        <div className="h-6 bg-neutral-200 animate-pulse rounded-xl w-1/4 mb-8" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="pt-36 pb-24 text-center max-w-lg mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Property Not Found</h2>
        <p className="text-sm text-neutral-500 mb-6">This property listing may have been removed or is no longer available.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const galleryImages = house.images && house.images.length > 0
    ? house.images.map((img) => img.image_path)
    : [house.primary_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'];

  const cleanPhone = (house.landlord_phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-white min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Listings</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Listing'}</span>
          </button>
        </div>

        {/* Gallery Section */}
        <div className="mb-10 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-100 shadow-md">
            <img
              src={selectedImage || galleryImages[0]}
              alt={house.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Status & Type Overlays */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                house.status === 'Vacant'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-800 text-white'
              }`}>
                {house.status}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/95 text-neutral-900 shadow-md backdrop-blur-md">
                {house.house_type}
              </span>
            </div>
          </div>

          {/* Thumbnails row */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-24 h-16 md:w-32 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-neutral-950 shadow-md scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Property Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Location Header */}
            <div>
              <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>{house.location}</span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-400">Posted {new Date(house.date_posted).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight mb-3">
                {house.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Property Listing
                </div>
              </div>
            </div>

            {/* Key Specs Card */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-5 bg-neutral-50 rounded-3xl border border-neutral-200/80">
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Bed className="w-5 h-5 text-neutral-600 mb-1" />
                <span className="text-xs text-neutral-400 font-semibold uppercase">Bedrooms</span>
                <span className="text-sm font-bold text-neutral-900">{house.beds}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Bath className="w-5 h-5 text-neutral-600 mb-1" />
                <span className="text-xs text-neutral-400 font-semibold uppercase">Bathrooms</span>
                <span className="text-sm font-bold text-neutral-900">{house.baths}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Car className="w-5 h-5 text-neutral-600 mb-1" />
                <span className="text-xs text-neutral-400 font-semibold uppercase">Parking</span>
                <span className="text-sm font-bold text-neutral-900">{house.parking ? 'Yes (Reserved)' : 'Street / None'}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 col-span-3 sm:col-span-1">
                <span className="text-xs text-neutral-400 font-semibold uppercase mb-1">Type</span>
                <span className="text-sm font-bold text-neutral-900">{house.house_type}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-neutral-950 mb-3">
                About this Property
              </h3>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {house.description}
              </p>
            </div>

            {/* Amenities Section */}
            <div>
              <h3 className="text-lg font-bold text-neutral-950 mb-3">
                Amenities & Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {house.amenities_list.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs font-semibold text-neutral-800"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Action Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-xl space-y-6">
              {/* Rent Price */}
              <div className="pb-6 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Monthly Rent
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                    KES {house.rent.toLocaleString()}
                  </span>
                  <span className="text-neutral-500 text-sm">/ month</span>
                </div>
                {house.deposit > 0 && (
                  <p className="text-xs text-neutral-500 mt-2 font-medium">
                    Refundable Deposit: <span className="font-bold text-neutral-800">KES {house.deposit.toLocaleString()}</span>
                  </p>
                )}
              </div>

              {/* Primary Action Button: Request Viewing */}
              <div>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request a Free Viewing</span>
                </button>
                <p className="text-[11px] text-center text-neutral-400 mt-2 font-medium">
                  Direct appointment with the landlord • No broker fees
                </p>
              </div>

              {/* Landlord Contact Box */}
              <div className="pt-6 border-t border-neutral-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Listed by Landlord
                    </span>
                    <h4 className="font-extrabold text-sm text-neutral-900">
                      {house.landlord_name || 'Verified Property Manager'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-full text-[10px] font-bold">
                    Direct Contact
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Call Landlord */}
                  {house.landlord_phone && (
                    <a
                      href={`tel:${house.landlord_phone}`}
                      className="w-full py-2.5 px-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Call {house.landlord_phone}</span>
                    </a>
                  )}

                  {/* WhatsApp Landlord */}
                  {house.landlord_phone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I saw your listing for ${house.title} on RentAHome. Is it still vacant?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  {/* Email Landlord */}
                  {house.landlord_email && (
                    <a
                      href={`mailto:${house.landlord_email}?subject=${encodeURIComponent(`Inquiry on ${house.title}`)}`}
                      className="w-full py-2 px-4 text-center block text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Email: {house.landlord_email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        house={house}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {}}
        onRequireLogin={onRequireLogin}
      />
    </div>
  );
};
