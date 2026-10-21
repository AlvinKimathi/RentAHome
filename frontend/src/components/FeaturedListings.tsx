// frontend/src/components/FeaturedListings.tsx
import React from 'react';
import { MapPin, Bed, Bath, Car, ArrowRight, CheckCircle2 } from 'lucide-react';
import { House } from '../types';

interface FeaturedListingsProps {
  houses: House[];
  onSelectHouse: (id: number) => void;
  onViewAll: () => void;
}

export const FeaturedListings: React.FC<FeaturedListingsProps> = ({ houses, onSelectHouse, onViewAll }) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Available
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Featured Vacant Properties
            </h2>
            <p className="text-neutral-500 text-sm md:text-base mt-2">
              Hand-picked vacant rentals ready for immediate move-in around Nairobi.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer group"
          >
            <span>Explore All Listings ({houses.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {houses.slice(0, 6).map((house) => {
            const primaryImg = house.primary_image || (house.images && house.images[0]?.image_path) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
            
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

                  {/* Price Tag Inset */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold leading-none mb-1">
                        Monthly Rent
                      </p>
                      <p className="text-xl font-extrabold tracking-tight">
                        KES {house.rent.toLocaleString()}
                        <span className="text-xs font-normal text-neutral-300"> /mo</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium mb-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{house.location}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1 mb-2">
                      {house.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-4">
                      {house.description}
                    </p>
                  </div>

                  {/* Specs bar & Landlord */}
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

                    <span className="font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
