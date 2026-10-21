// frontend/src/components/HowItWorks.tsx
import React from 'react';
import { Search, Eye, CalendarCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onNavigate: (route: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Filter & Discover Vacancies',
      description: 'Enter your preferred location, house type (Bedsitter, 1-Bed, etc.), and price range. See exact photos and rent before visiting.',
    },
    {
      number: '02',
      icon: Eye,
      title: 'Inspect Details & Amenities',
      description: 'Review photos, amenities checklist (borehole water, WiFi, tokens), deposit requirements, and direct landlord contact numbers.',
    },
    {
      number: '03',
      icon: CalendarCheck,
      title: 'Book Free Viewing Direct',
      description: 'Pick your preferred date and time. Connect straight to the landlord with zero broker fees or middleman charges.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-neutral-900 text-white rounded-[32px] md:rounded-[48px] mx-3 md:mx-6 my-10 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-widest mb-4">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Finding a vacant home is now as easy as 1-2-3.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Say goodbye to walking for miles under the sun looking for "VACANT" signs painted on iron sheets.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-neutral-800/60 backdrop-blur-md rounded-3xl p-8 border border-neutral-700/60 flex flex-col justify-between hover:bg-neutral-800/90 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-extrabold text-neutral-600 group-hover:text-neutral-400 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => onNavigate('listings')}
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all shadow-xl cursor-pointer"
          >
            <span>Start Searching Vacancies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
