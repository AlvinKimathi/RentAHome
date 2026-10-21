// frontend/src/pages/Listings.tsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, RotateCcw, Bed, Bath, Car, ArrowUpDown } from 'lucide-react';
import { House } from '../types';
import { api } from '../services/api';

interface ListingsProps {
  initialFilters?: { q?: string; location?: string; house_type?: string };
  onSelectHouse: (id: number) => void;
}

export const Listings: React.FC<ListingsProps> = ({ initialFilters, onSelectHouse }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialFilters?.q || '');
  const [selectedLocation, setSelectedLocation] = useState(initialFilters?.location || '');
  const [selectedType, setSelectedType] = useState(initialFilters?.house_type || 'All');
  const [minRent, setMinRent] = useState<string>('');
  const [maxRent, setMaxRent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Vacant');
  const [sortBy, setSortBy] = useState<string>('newest');

  const houseTypes = ['All', 'Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

  const fetchHouses = async () => {
    setIsLoading(true);
    try {
      const res = await api.houses.getAll({
        q: searchQuery,
        location: selectedLocation,
        house_type: selectedType,
        min_rent: minRent ? parseFloat(minRent) : undefined,
        max_rent: maxRent ? parseFloat(maxRent) : undefined,
        status: selectedStatus,
        sort: sortBy,
      });
      if (res.success) {
        setHouses(res.data);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [selectedLocation, selectedType, selectedStatus, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHouses();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedType('All');
    setMinRent('');
    setMaxRent('');
    setSelectedStatus('Vacant');
    setSortBy('newest');
  };

  return (
    <div className="pt-28 md:pt-36 pb-20 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Vacant Rental Properties
          </h1>
          <p className="text-neutral-500 text-sm md:text-base mt-2">
            Explore authentic vacant listings in Nairobi. Filter by price, location, or house type.
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-neutral-200/80 shadow-sm mb-10">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Top row: search + location + sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="lg:col-span-5 relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-2.5">
                <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords, amenities, title..."
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              {/* Location */}
              <div className="lg:col-span-4 relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer"
                >
                  <option value="">All Locations in Nairobi</option>
                  <option value="Ruaraka">Ruaraka / Thika Road</option>
                  <option value="Roysambu">Roysambu / TRM</option>
                  <option value="Ngara">Ngara / Parklands</option>
                  <option value="Kasarani">Kasarani / Clay City</option>
                  <option value="Kilimani">Kilimani</option>
                  <option value="Westlands">Westlands</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-3 relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-2.5">
                <ArrowUpDown className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>
            </div>

            {/* Second row: House Type pills + Price range + Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
              {/* Type pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto scrollbar-none pb-2 lg:pb-0">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Type:
                </span>
                {houseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedType === type
                        ? 'bg-neutral-950 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Price range and buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-end">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min KES"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                  <span className="text-neutral-400">-</span>
                  <input
                    type="number"
                    placeholder="Max KES"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset Filters"
                  className="p-2 text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Active Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-neutral-700">
            Showing <span className="text-neutral-950 font-extrabold">{houses.length}</span> properties
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Availability:</span>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'Vacant' ? 'All' : 'Vacant')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'Vacant'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {selectedStatus === 'Vacant' ? 'Vacant Only' : 'Show All (incl. Occupied)'}
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200 max-w-lg mx-auto my-12">
            <Filter className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Properties Found</h3>
            <p className="text-neutral-500 text-sm mb-6">
              No vacant properties matched your selected criteria. Try adjusting your price range or clearing filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((house) => {
              const primaryImg = house.primary_image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
              return (
                <div
                  key={house.house_id}
                  onClick={() => onSelectHouse(house.house_id)}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      src={primaryImg}
                      alt={house.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Status & Type Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                        house.status === 'Vacant'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-800 text-white'
                      }`}>
                        {house.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-neutral-900 shadow-sm">
                        {house.house_type}
                      </span>
                    </div>

                    {/* Rent Price */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold leading-none mb-1">
                        Monthly Rent
                      </p>
                      <p className="text-xl font-extrabold tracking-tight">
                        KES {house.rent.toLocaleString()}
                        <span className="text-xs font-normal text-neutral-300"> /mo</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium mb-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{house.location}</span>
                      </div>

                      <h3 className="font-bold text-lg text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1 mb-2">
                        {house.title}
                      </h3>

                      <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-4">
                        {house.description}
                      </p>
                    </div>

                    {/* Specs bar & details action */}
                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-600 text-xs font-medium">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-neutral-400" />
                          <span>{house.beds} {house.beds === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4 text-neutral-400" />
                          <span>{house.baths} {house.baths === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                        {house.parking ? (
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4 text-neutral-400" />
                            <span>Parking</span>
                          </div>
                        ) : null}
                      </div>

                      <span className="font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                        View &rarr;
                      </span>
                    </div>
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
