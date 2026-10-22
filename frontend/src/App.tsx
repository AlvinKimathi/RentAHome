// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { PropertyDetails } from './pages/PropertyDetails';
import { ListYourHome } from './pages/ListYourHome';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { TenantDashboard } from './pages/TenantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { House } from './types';
import { api } from './services/api';

function AppContent() {
  const { user, login } = useAuth();
  // The first thing visitors see is the Landing Page
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('geta_auth_token');
    return token ? 'home' : 'landing';
  });
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [featuredHouses, setFeaturedHouses] = useState<House[]>([]);
  const [searchFilters, setSearchFilters] = useState<{ q?: string; location?: string; house_type?: string }>({});

  const loadFeatured = async () => {
    try {
      const res = await api.houses.getAll({ status: 'Vacant' });
      if (res.success) {
        setFeaturedHouses(res.data);
      }
    } catch (err) {
      console.error('Failed to load featured houses:', err);
    }
  };

  useEffect(() => {
    loadFeatured();

    // Handle Google OAuth callback from accounts.google.com
    const hash = window.location.hash;
    const search = window.location.search;
    let idToken: string | null = null;
    let accessToken: string | null = null;

    if (hash && (hash.includes('id_token=') || hash.includes('access_token='))) {
      const params = new URLSearchParams(hash.substring(1));
      idToken = params.get('id_token');
      accessToken = params.get('access_token');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (search && (search.includes('id_token=') || search.includes('access_token='))) {
      const params = new URLSearchParams(search);
      idToken = params.get('id_token');
      accessToken = params.get('access_token');
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (idToken || accessToken) {
      const role = (sessionStorage.getItem('rentahome_oauth_role') as 'tenant' | 'landlord') || 'tenant';
      sessionStorage.removeItem('rentahome_oauth_role');

      api.auth.googleLogin({
        id_token: idToken || undefined,
        access_token: accessToken || undefined,
        role,
      })
        .then((res) => {
          if (res.success && res.token && res.user) {
            login(res.token, res.user);
            handleAuthSuccess(res.user.role);
          }
        })
        .catch((err) => {
          console.error('Google OAuth verification failed:', err);
        });
    }
  }, []);

  const navigateTo = (route: string, houseId?: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (houseId !== undefined) {
      setSelectedHouseId(houseId);
    }
    setCurrentRoute(route);
  };

  const handleHeroSearch = (filters: { q?: string; location?: string; house_type?: string }) => {
    setSearchFilters(filters);
    navigateTo('listings');
  };

  const handleAuthSuccess = (role?: string) => {
    loadFeatured();
    if (role === 'admin') {
      navigateTo('admin-dashboard');
    } else if (role === 'landlord') {
      navigateTo('landlord-dashboard');
    } else {
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-['Urbanist'] selection:bg-neutral-900 selection:text-white">
      <Header onNavigate={navigateTo} currentRoute={currentRoute} />

      <main className="flex-1">
        {/* Landing Page is the primary entry point */}
        {(currentRoute === 'landing' || currentRoute === 'login') && (
          <Landing
            onSuccess={handleAuthSuccess}
            onExploreVacancies={() => navigateTo('listings')}
          />
        )}

        {currentRoute === 'home' && (
          <Home
            houses={featuredHouses}
            onSelectHouse={(id) => navigateTo('property-details', id)}
            onNavigate={navigateTo}
            onSearch={handleHeroSearch}
          />
        )}

        {currentRoute === 'listings' && (
          <Listings
            initialFilters={searchFilters}
            onSelectHouse={(id) => navigateTo('property-details', id)}
          />
        )}

        {currentRoute === 'property-details' && selectedHouseId && (
          <PropertyDetails
            houseId={selectedHouseId}
            onBack={() => navigateTo('listings')}
            onRequireLogin={() => navigateTo('landing')}
          />
        )}

        {currentRoute === 'list-your-home' && (
          <ListYourHome
            onSuccess={(newId) => {
              loadFeatured();
              navigateTo('property-details', newId);
            }}
            onRequireLogin={() => navigateTo('landing')}
            onBack={() => navigateTo('home')}
          />
        )}

        {currentRoute === 'services' && (
          <Services onNavigate={navigateTo} />
        )}

        {currentRoute === 'how-it-works' && (
          <div className="pt-20">
            <Home
              houses={featuredHouses}
              onSelectHouse={(id) => navigateTo('property-details', id)}
              onNavigate={navigateTo}
              onSearch={handleHeroSearch}
            />
          </div>
        )}

        {currentRoute === 'contact' && (
          <Contact />
        )}

        {currentRoute === 'landlord-dashboard' && (
          user && (user.role === 'landlord' || user.role === 'admin') ? (
            <LandlordDashboard
              onNavigatePost={() => navigateTo('list-your-home')}
              onSelectHouse={(id) => navigateTo('property-details', id)}
            />
          ) : (
            <Landing
              onSuccess={handleAuthSuccess}
              onExploreVacancies={() => navigateTo('listings')}
            />
          )
        )}

        {currentRoute === 'tenant-dashboard' && (
          user ? (
            <TenantDashboard
              onSelectHouse={(id) => navigateTo('property-details', id)}
              onNavigateExplore={() => navigateTo('listings')}
            />
          ) : (
            <Landing
              onSuccess={handleAuthSuccess}
              onExploreVacancies={() => navigateTo('listings')}
            />
          )
        )}

        {currentRoute === 'admin-dashboard' && (
          user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Landing
              onSuccess={handleAuthSuccess}
              onExploreVacancies={() => navigateTo('listings')}
            />
          )
        )}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
