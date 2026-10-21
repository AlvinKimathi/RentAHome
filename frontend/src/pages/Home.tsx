// frontend/src/pages/Home.tsx
import React from 'react';
import { Hero } from '../components/Hero';
import { FeaturedListings } from '../components/FeaturedListings';
import { HowItWorks } from '../components/HowItWorks';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { CTASection } from '../components/CTASection';
import { House } from '../types';

interface HomeProps {
  houses: House[];
  onSelectHouse: (id: number) => void;
  onNavigate: (route: string) => void;
  onSearch: (filters: { q?: string; location?: string; house_type?: string }) => void;
}

export const Home: React.FC<HomeProps> = ({
  houses,
  onSelectHouse,
  onNavigate,
  onSearch,
}) => {
  return (
    <div>
      <Hero onSearch={onSearch} />
      <FeaturedListings
        houses={houses}
        onSelectHouse={onSelectHouse}
        onViewAll={() => onNavigate('listings')}
      />
      <HowItWorks onNavigate={onNavigate} />
      <WhyChooseUs />
      <CTASection onNavigate={onNavigate} />
    </div>
  );
};
