// frontend/src/pages/ListYourHome.tsx
import React, { useState } from 'react';
import { Home, Camera, DollarSign, FileText, CheckCircle, ArrowLeft, ArrowRight, Upload, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ListYourHomeProps {
  onSuccess: (houseId: number) => void;
  onRequireLogin: () => void;
  onBack: () => void;
}

export const ListYourHome: React.FC<ListYourHomeProps> = ({
  onSuccess,
  onRequireLogin,
  onBack,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [title, setTitle] = useState('');
  const [houseType, setHouseType] = useState('1 Bedroom');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);
  const [parking, setParking] = useState(false);

  // Photos
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Pricing & Amenities
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Borehole Water 24/7',
    'Security Guard',
    'Token Electricity Meter',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableAmenities = [
    'High-speed WiFi',
    'Borehole Water 24/7',
    'Security Guard',
    'CCTV Surveillance',
    'Token Electricity Meter',
    'Private Balcony',
    'Elevator Access',
    'Full Backup Generator',
    'Perimeter Electric Fence',
    'Garbage Collection Included',
    'Instant Shower Heater',
    'Swimming Pool Access',
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setError(null);
      try {
        const res = await api.houses.uploadImage(file);
        if (res.success && res.url) {
          setImageUrls([...imageUrls, res.url]);
        }
      } catch (err: any) {
        setError(err.message || 'Image upload failed. You can also paste an image URL directly.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!user) {
      onRequireLogin();
      return;
    }

    if (user.role !== 'landlord' && user.role !== 'admin') {
      setError('Only landlord accounts can publish listings. Please switch to a landlord account or register as a landlord.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.houses.create({
        title,
        house_type: houseType,
        location,
        description,
        beds,
        baths,
        parking: parking ? 1 : 0,
        rent: parseFloat(rent),
        deposit: deposit ? parseFloat(deposit) : parseFloat(rent),
        amenities: selectedAmenities.join(', '),
        images: imageUrls,
      });

      if (res.success && res.house_id) {
        onSuccess(res.house_id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish house listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = title.trim() && location.trim() && description.trim();
  const canProceedStep2 = imageUrls.length > 0;
  const canProceedStep3 = parseFloat(rent) > 0;

  if (!user || user.role === 'tenant') {
    return (
      <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="max-w-[560px] w-full mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-950 mb-3 tracking-tight">
              Landlords & Admins Only
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-8">
              Posting vacant rental properties is strictly reserved for verified landlords and property administrators.
              {!user
                ? ' Please sign in with a landlord account to post a vacancy.'
                : ' You are currently signed in as a Tenant. Switch to or register a Landlord account to advertise vacancies.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onRequireLogin}
                className="px-6 py-3.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
              >
                {!user ? 'Sign In as Landlord' : 'Sign in as Landlord'}
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Return to Homes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        {/* Back and Title */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Go Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Post a Vacant Rental House
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Advertise your vacant property directly to thousands of tenants in Nairobi.
          </p>
        </div>

        {/* Wizard Steps Header */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
          {[
            { step: 1, title: 'Details', icon: Home },
            { step: 2, title: 'Photos', icon: Camera },
            { step: 3, title: 'Pricing', icon: DollarSign },
            { step: 4, title: 'Review', icon: FileText },
          ].map((s) => {
            const Icon = s.icon;
            const isPassed = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                    : isPassed
                    ? 'bg-white text-emerald-700 border-emerald-200'
                    : 'bg-white/60 text-neutral-400 border-neutral-200'
                }`}
              >
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-white text-black'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isPassed ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                    Step {s.step}
                  </p>
                  <p className="text-xs font-bold truncate">{s.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wizard Step Body */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-neutral-200 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-600 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-950">Property Details</h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern 1 Bedroom Apartment - Ruaraka"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    House Type *
                  </label>
                  <select
                    value={houseType}
                    onChange={(e) => setHouseType(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Bedsitter">Bedsitter</option>
                    <option value="1 Bedroom">1 Bedroom</option>
                    <option value="2 Bedroom">2 Bedroom</option>
                    <option value="3 Bedroom">3 Bedroom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Location & Neighborhood *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ruaraka, Thika Road, Nairobi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={beds}
                    onChange={(e) => setBeds(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={baths}
                    onChange={(e) => setBaths(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Parking Available?
                  </label>
                  <button
                    type="button"
                    onClick={() => setParking(!parking)}
                    className={`w-full py-3 px-4 rounded-2xl text-sm font-bold border transition-colors cursor-pointer ${
                      parking
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {parking ? 'Yes, Included' : 'No Parking'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the house layout, room sizes, floor type, natural lighting, distance to campus or main road..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>Continue to Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Photos & Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-950">Property Photos & Media</h3>
              <p className="text-xs text-neutral-500">
                Upload photos of your house or provide image URLs. Listings with photos receive 4x more viewing inquiries.
              </p>

              {/* Upload box */}
              <div className="p-8 border-2 border-dashed border-neutral-300 rounded-3xl text-center bg-neutral-50 hover:bg-neutral-100/60 transition-colors relative">
                <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-neutral-800 mb-1">
                  Upload property photo from your computer
                </p>
                <p className="text-xs text-neutral-500 mb-4">PNG, JPG, or WebP up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="px-5 py-2 bg-neutral-900 text-white rounded-full text-xs font-bold pointer-events-none"
                >
                  {isUploading ? 'Uploading...' : 'Browse Local Files'}
                </button>
              </div>

              {/* Paste image URL fallback */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Or Paste an Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-2xl hover:bg-neutral-800 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Images preview gallery */}
              <div>
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                  Selected Photos ({imageUrls.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 group">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[9px] font-bold uppercase">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageUrl(idx)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>Continue to Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Amenities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-950">Pricing & Amenities</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Monthly Rent (KES) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 16000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Refundable Security Deposit (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="Leave empty if equal to 1 month rent"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                  Select Available Amenities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {availableAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-3 rounded-2xl text-xs font-semibold text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep3}
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>Review & Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-950">Review Your Listing Summary</h3>
              <p className="text-xs text-neutral-500">
                Please double check all information before publishing your vacant rental house.
              </p>

              <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {houseType}
                    </span>
                    <h4 className="text-lg font-extrabold text-neutral-950">{title}</h4>
                    <p className="text-xs text-neutral-500">{location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-neutral-950">
                      KES {parseFloat(rent).toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500 block">/ month</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-200/60 text-center text-xs">
                  <div>
                    <span className="text-neutral-400 block">Bedrooms</span>
                    <span className="font-bold text-neutral-900">{beds}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Bathrooms</span>
                    <span className="font-bold text-neutral-900">{baths}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Parking</span>
                    <span className="font-bold text-neutral-900">{parking ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-neutral-700 block mb-1">Description</span>
                  <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">{description}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-neutral-700 block mb-1.5">Selected Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAmenities.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-neutral-700 block mb-1.5">Photos ({imageUrls.length})</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                </div>
              </div>

              {!user && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                  You are not currently signed in. Clicking Publish will redirect you to authenticate as a Landlord.
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePublish}
                  className="px-10 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Vacancy Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
