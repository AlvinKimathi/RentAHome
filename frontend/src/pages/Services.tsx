// frontend/src/pages/Services.tsx
import React from 'react';
import { Home, ShieldCheck, CalendarCheck, Zap, Users, BarChart3, ArrowRight, Check } from 'lucide-react';

interface ServicesProps {
  onNavigate: (route: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const services = [
    {
      icon: Home,
      title: 'Zero-Commission Vacancy Listing',
      description: 'Landlords can post properties with high-resolution photos, exact pricing, and comprehensive amenities. Connect directly with tenants without paying high agent commission.',
      features: [
        'Unlimited property photo uploads',
        'Direct landlord phone & WhatsApp display',
        'Featured vacancy placement',
        'Edit or remove listings anytime',
      ],
    },
    {
      icon: ShieldCheck,
      title: '100% Vacancy Verification',
      description: 'Tenants no longer need to walk for hours in search of handwritten gate signs. Every house on RentAHome is checked for authentic rent, security deposit terms, and verified amenities.',
      features: [
        'Verified water and electricity arrangements',
        'Accurate room photos and floor plans',
        'Proximity markers to transit routes & CBD',
        'Zero false or expired listings',
      ],
    },
    {
      icon: CalendarCheck,
      title: 'Direct Viewing Scheduling',
      description: 'Prospective tenants can select their preferred date and time slot to view a house. The landlord receives the request immediately to confirm or reschedule.',
      features: [
        'Flexible morning & afternoon inspection slots',
        'Automated booking status tracking',
        'Tenant and landlord contact exchange',
        'Zero viewing booking fees',
      ],
    },
    {
      icon: Zap,
      title: 'Real-Time Availability Management',
      description: 'Landlords can switch listing status between "Vacant" and "Occupied" with a single click. When a house is occupied, it automatically updates across the platform.',
      features: [
        'Instant status toggle',
        'Prevents wasted tenant inspection journeys',
        'Re-list with 1 click when tenant vacates',
        'Historical inquiry logs preserved',
      ],
    },
    {
      icon: Users,
      title: 'Student & Professional Housing',
      description: 'Specialized focus on affordable bedsitters, single rooms, and 1-bedroom apartments in Ruaraka, Roysambu, Ngara, and Kasarani for students and working professionals.',
      features: [
        'Budget-friendly price filters (< KES 10,000)',
        'WiFi and borehole water indicators',
        'Gated compound security ratings',
        'Transit route accessibility notes',
      ],
    },
    {
      icon: BarChart3,
      title: 'Vacancy & Market Analytics',
      description: 'Administrators and landlords gain insights into rental demand, average pricing per neighborhood, and seasonal vacancy turnover.',
      features: [
        'Neighborhood rental rate benchmarks',
        'Demand tracking by house type',
        'Inspection conversion rates',
        'Automated reporting summaries',
      ],
    },
  ];

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-white min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-widest mb-4">
            Our Services
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            Comprehensive tools to make your rental search seamless.
          </h1>
          <p className="text-neutral-500 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            RentAHome bridges the gap between landlords and tenants with modern digital solutions designed specifically for the Kenyan urban rental market.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div
                key={idx}
                className="bg-neutral-50 rounded-3xl p-8 border border-neutral-200/80 hover:border-neutral-900 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950 mb-3 tracking-tight">
                    {svc.title}
                  </h3>
                  <p className="text-neutral-500 text-xs md:text-sm leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  <ul className="space-y-2.5 pt-4 border-t border-neutral-200/60">
                    {svc.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action bar */}
        <div className="bg-neutral-950 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Ready to find a vacant home?</h3>
            <p className="text-neutral-400 text-xs md:text-sm">Browse dozens of verified vacancies across Nairobi.</p>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>Explore Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
