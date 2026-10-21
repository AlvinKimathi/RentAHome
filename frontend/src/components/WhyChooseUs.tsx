// frontend/src/components/WhyChooseUs.tsx
import React from 'react';
import { DollarSign, ShieldCheck, PhoneCall, Zap } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: DollarSign,
      title: 'Zero Broker Commission',
      description: 'Tenants avoid paying thousands in broker registration and viewing fees. Landlords advertise directly with no intermediary commission.',
    },
    {
      icon: ShieldCheck,
      title: '100% Verified Vacancies',
      description: 'Every house posted includes verified photos, authentic monthly rent in KES, exact deposit terms, and genuine amenities.',
    },
    {
      icon: PhoneCall,
      title: 'Direct Landlord Contacts',
      description: 'Get direct phone numbers, WhatsApp links, and viewing scheduling tools without relying on arbitrary caretakers.',
    },
    {
      icon: Zap,
      title: 'Real-Time Availability',
      description: 'Once a tenant moves in, landlords mark properties as Occupied with one tap, keeping search results fresh and reliable.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50 border-y border-neutral-200/60">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
            Why Choose RentAHome
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Built to fix the rental housing search problem.
          </h2>
          <p className="text-neutral-500 text-sm md:text-base mt-3">
            Designed to bridge information gaps between tenants seeking accommodation and property owners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-neutral-950 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
