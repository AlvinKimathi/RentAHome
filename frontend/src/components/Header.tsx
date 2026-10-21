// frontend/src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Calendar, PlusCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', route: 'landing' },
    { label: 'Explore Homes', route: 'home' },
    { label: 'Listings', route: 'listings' },
    { label: 'Services', route: 'services' },
    { label: 'How It Works', route: 'how-it-works' },
    { label: 'Post Vacancy', route: 'list-your-home' },
  ];

  return (
    <header className="fixed z-50 left-0 right-0 top-0 transition-all duration-300">
      <div
        className={`mx-3 md:mx-6 lg:mx-auto max-w-[1280px] transition-all duration-300 ${
          isScrolled
            ? 'mt-3 bg-neutral-900/90 text-white backdrop-blur-xl rounded-[22px] shadow-2xl py-3 px-6 border border-neutral-800'
            : 'mt-0 bg-transparent text-neutral-900 py-5 px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate(user ? 'home' : 'landing')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
              isScrolled ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              R
            </div>
            <div>
              <span className="font-bold text-xl md:text-2xl tracking-tight block leading-none">
                RentAHome
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold block leading-none mt-1 ${
                isScrolled ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Vacancy Finder
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`text-sm font-semibold transition-all relative py-1 cursor-pointer focus:outline-none ${
                    isScrolled
                      ? isActive
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-white'
                      : isActive
                      ? 'text-black font-bold'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full ${
                        isScrolled ? 'bg-white' : 'bg-black'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isScrolled
                      ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                      : 'bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{user.full_name.split(' ')[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-purple-600 text-white'
                      : user.role === 'landlord'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {user.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'landlord' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('landlord-dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                        Landlord Dashboard
                      </button>
                    )}

                    {user.role === 'tenant' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('tenant-dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        My Viewings
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Control Panel
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('list-your-home');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-neutral-500" />
                      Post a House
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        onNavigate('landing');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('landing')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isScrolled
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-black'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-black'}`} />
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-neutral-700/30 mt-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold hover:opacity-70 transition-opacity"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-neutral-700/30 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="py-1 text-xs opacity-80">
                    Signed in as <span className="font-bold">{user.full_name}</span> ({user.role})
                  </div>
                  {user.role === 'landlord' && (
                    <button
                      onClick={() => {
                        onNavigate('landlord-dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-sm py-1.5 font-semibold"
                    >
                      Landlord Dashboard
                    </button>
                  )}
                  {user.role === 'tenant' && (
                    <button
                      onClick={() => {
                        onNavigate('tenant-dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-sm py-1.5 font-semibold"
                    >
                      My Viewings
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin-dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-sm py-1.5 font-semibold text-purple-600"
                    >
                      Control Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      onNavigate('landing');
                    }}
                    className="text-left text-sm py-1.5 font-semibold text-red-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('landing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
