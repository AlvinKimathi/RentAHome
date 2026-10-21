// frontend/src/components/Hero.tsx
import React, { useState } from 'react';
import { Search, MapPin, Home, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onSearch: (filters: { q?: string; location?: string; house_type?: string }) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const popularTypes = ['All', 'Bedsitter', 'Single Room', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      q: searchTerm,
      location: selectedLocation,
      house_type: selectedType === 'All' ? undefined : selectedType,
    });
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-neutral-200/50 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Top Tag Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Broker Commission • 100% Verified Vacancies</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.08] mb-6">
            Find your ideal vacant house without the stress.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Stop walking door-to-door searching for handwritten vacant signs. Connect directly with verified landlords across Nairobi.
          </p>
        </div>

        {/* Interactive Search Bar Widget */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-4 md:p-6 mb-12">
          {/* Quick House Type Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1 pr-2">
              Type:
            </span>
            {popularTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Form Inputs */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Keyword */}
            <div className="md:col-span-5 relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200/80 px-4 py-3 focus-within:border-neutral-900 transition-colors">
              <Search className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search amenities, keywords..."
                className="w-full bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            {/* Location Selector */}
            <div className="md:col-span-4 relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200/80 px-4 py-3 focus-within:border-neutral-900 transition-colors">
              <MapPin className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="">All Locations in Nairobi</option>
                <option value="Ruaraka">Ruaraka / Thika Road</option>
                <option value="Roysambu">Roysambu / TRM</option>
                <option value="Ngara">Ngara / Parklands</option>
                <option value="Kasarani">Kasarani / Clay City</option>
                <option value="Kilimani">Kilimani / Yaya</option>
                <option value="Westlands">Westlands</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-full min-h-[48px] bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Find Vacancies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Feature Trust Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4 border-t border-neutral-200/60">
          <div className="flex items-center justify-center gap-3 text-neutral-700">
            <CheckCircle2 className="w-5 h-5 text-neutral-900 flex-shrink-0" />
            <span className="text-sm font-semibold">Zero Broker Markup</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-neutral-700">
            <Clock className="w-5 h-5 text-neutral-900 flex-shrink-0" />
            <span className="text-sm font-semibold">Real-Time Vacancy Updates</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-neutral-700">
            <Home className="w-5 h-5 text-neutral-900 flex-shrink-0" />
            <span className="text-sm font-semibold">Direct Landlord Contact</span>
          </div>
        </div>
      </div>
    </section>
  );
};
