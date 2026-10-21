// frontend/src/components/CTASection.tsx
import React from 'react';
import { ArrowRight, PlusCircle, Search } from 'lucide-react';

interface CTASectionProps {
  onNavigate: (route: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="bg-neutral-950 text-white rounded-3xl md:rounded-[40px] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Join Kenya's Vacancy Network
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Are you a landlord with vacant houses?
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Post your property in under 2 minutes. Receive direct booking requests from verified tenants looking to move in immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('list-your-home')}
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your Vacancy</span>
            </button>
            <button
              onClick={() => onNavigate('listings')}
              className="px-8 py-4 rounded-full bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-700"
            >
              <Search className="w-4 h-4" />
              <span>Browse Vacancies</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
