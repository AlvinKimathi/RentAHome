// frontend/src/components/Footer.tsx
import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative z-20 bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand & Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-base">
                R
              </div>
              <span className="font-bold text-xl tracking-tight">RentAHome</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-sm">
              Kenya's modern rental house vacancy finder platform connecting prospective tenants directly with verified landlords across Nairobi with zero broker commissions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors cursor-pointer">
                  About RentAHome
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Explore Homes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('listings')} className="hover:text-white transition-colors cursor-pointer">
                  Vacant Listings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">
                  Platform Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('list-your-home')} className="hover:text-white transition-colors cursor-pointer">
                  List Your House
                </button>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Portals & Access
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors cursor-pointer">
                  Tenant Login
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors cursor-pointer">
                  Landlord Register
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landlord-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Landlord Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tenant-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  My Viewing Bookings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Control Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>support@rentahome.co.ke</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <a href="tel:+254718608582" className="hover:text-white transition-colors">+254 718 608582</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 RentAHome Vacancy Finder. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => onNavigate('contact')} className="hover:text-neutral-400 transition-colors cursor-pointer">
              Contact
            </button>
            <button onClick={() => onNavigate('services')} className="hover:text-neutral-400 transition-colors cursor-pointer">
              Services
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
