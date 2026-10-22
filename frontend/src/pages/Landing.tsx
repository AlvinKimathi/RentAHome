// frontend/src/pages/Landing.tsx
import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Home,
  CheckCircle2,
  Sparkles,
  Building2,
  CalendarCheck,
  Search,
  MapPin,
  XCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { GoogleSignInModal } from '../components/GoogleSignInModal';

interface LandingProps {
  onSuccess: (role?: string) => void;
  onExploreVacancies: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  onSuccess,
  onExploreVacancies,
}) => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>('tenant');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
        setError('Please fill in all registration fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.auth.register({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: selectedRole,
        });

        if (res.success && res.token && res.user) {
          login(res.token, res.user);
          onSuccess(res.user.role);
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.auth.login({
          email: email.trim(),
          password,
        });

        if (res.success && res.token && res.user) {
          login(res.token, res.user);
          onSuccess(res.user.role);
        }
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setIsGoogleModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-neutral-900 relative">
      {/* Full-page continuous backdrop with the modern skyscraper wallpaper */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/landing-wallpaper.jpg')" }}
      />

      {/* Calibrated light gradient overlay: lets the skyscrapers shine through clearly while keeping dark text 100% readable */}
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-white/80 via-white/50 to-white/25 pointer-events-none" />

      <div className="relative z-10">
        {/* 1. HERO SECTION WITH INTEGRATED AUTH CARD */}
        <section className="pt-28 md:pt-36 pb-20 md:pb-28 border-b border-neutral-200/60">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Narrative & Value Proposition */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold tracking-wide shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>The Direct Rental Vacancy Network</span>
                </div>

                {/* Headline - Solid Black */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-[1.08]">
                  Find & Fill Vacant Rentals Directly.
                  <span className="block text-black font-extrabold mt-1">
                    Zero Brokers. Zero Guesswork.
                  </span>
                </h1>

                {/* Sub-copy - Solid Black */}
                <p className="text-black font-bold text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  RentAHome eliminates the chaos of walking under the sun searching for handwritten &ldquo;To Let&rdquo; signs on street walls. We connect tenants directly with verified landlords and property administrators across Kenya with real-time vacancy updates and free viewing appointments.
                </p>

                {/* Key Value Metrics - 2 Balanced Banners in Crisp Black */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto lg:mx-0 pt-1">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-sm text-center">
                    <span className="block text-xl sm:text-2xl font-extrabold text-black">0%</span>
                    <span className="text-[11px] sm:text-xs text-black font-extrabold">Broker Fee</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-sm text-center">
                    <span className="block text-xl sm:text-2xl font-extrabold text-black">100%</span>
                    <span className="text-[11px] sm:text-xs text-black font-extrabold">Verified Units</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={onExploreVacancies}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Vacancies as Guest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('about-section')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold text-sm border border-neutral-300 transition-all cursor-pointer shadow-sm"
                  >
                    How RentAHome Works
                  </button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-black pt-1 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    No Sign-in required to browse
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Instant inspection bookings
                  </span>
                </div>
              </div>

            {/* Right Column: Premium Auth Portal Card */}
            <div className="lg:col-span-5" id="auth-portal">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-2xl relative">
                
                {/* Brand Monogram */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                      R
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-950 leading-tight">
                        RentAHome Portal
                      </h2>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Tenants • Landlords • Control Panel
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Portal
                  </span>
                </div>

                {/* Tab Switcher: Sign In vs Create Account */}
                <div className="flex bg-neutral-100 p-1 rounded-2xl mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      !isSignUp ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSignUp ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Sign In with Google Option */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </button>

                  <div className="relative my-3.5 flex items-center justify-center">
                    <div className="w-full border-t border-neutral-200" />
                    <span className="absolute bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      or with email
                    </span>
                  </div>
                </div>

                {/* Error notification */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Sign Up Role Selector */}
                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        I am registering as:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('tenant')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedRole === 'tenant'
                              ? 'bg-neutral-950 border-neutral-950 text-white'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Tenant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('landlord')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedRole === 'landlord'
                              ? 'bg-neutral-950 border-neutral-950 text-white'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Landlord</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Full Name */}
                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Leon Whitaker"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        Phone Number (WhatsApp Active)
                      </label>
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                        <input
                          type="tel"
                          required
                          placeholder="+254 7..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                        Password
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-950 font-semibold cursor-pointer transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                      <Lock className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                        <Lock className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In to Portal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SECTION: WHAT RENTAHOME IS ABOUT & THE PROBLEM IT SOLVES */}
      <section className="py-20 md:py-24 bg-white/85 backdrop-blur-md border-b border-neutral-200/80" id="about-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5 text-neutral-900" />
              <span>The RentAHome Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              Why We Built RentAHome
            </h2>
            <p className="text-black font-semibold text-sm sm:text-base mt-3 leading-relaxed">
              Finding a house or renting out an apartment in Kenya has historically been frustrating, opaque, and expensive. Here is how we transform the entire experience.
            </p>
          </div>

          {/* Comparison Cards: The Old Way vs The RentAHome Way */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* The Old Way */}
            <div className="bg-red-50/70 rounded-3xl p-8 border border-red-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-5">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                The Old Way (Manual & Frustrating)
              </h3>
              <p className="text-black font-semibold text-xs sm:text-sm mb-6 leading-relaxed">
                Walking for hours under the hot sun hunting for faded &ldquo;VACANT&rdquo; or &ldquo;TO LET&rdquo; signs scribbled on perimeter walls and telephone posts.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-black font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Unregulated Brokers:</strong> Demanding upfront &ldquo;viewing fees&rdquo; for houses that don&rsquo;t match the description or are already occupied.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Zero Visuals:</strong> No photos or room dimensions before traveling across town and wasting transport money.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Landlord Inefficiency:</strong> Houses stay vacant for weeks while waiting for passersby to notice signposts.</span>
                </li>
              </ul>
            </div>

            {/* The RentAHome Way */}
            <div className="bg-emerald-50/70 rounded-3xl p-8 border border-emerald-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                The RentAHome Way (Direct & Digital)
              </h3>
              <p className="text-black font-semibold text-xs sm:text-sm mb-6 leading-relaxed">
                A verified online network where verified landlords publish active vacancies with real interior photos, exact rents, and one-click inspection scheduling.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-black font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>0% Broker Fee:</strong> Direct contact between tenants and property owners via WhatsApp and direct call.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>HD Gallery & Amenities:</strong> Inspect bedrooms, bathrooms, water supply, and security before stepping foot outside.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Live Vacancy Switch:</strong> Landlords toggle &ldquo;Vacant&rdquo; to &ldquo;Occupied&rdquo; with 1 tap, keeping the database 100% current.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTION: ONE PLATFORM, THREE EMPOWERED ROLES */}
      <section className="py-20 md:py-24 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-200/80 text-black text-xs font-bold uppercase tracking-wider mb-3">
              Role Workflows
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              Designed for Tenants, Landlords &amp; Control Panel
            </h2>
            <p className="text-black font-semibold text-sm sm:text-base mt-3">
              Explore how each user role experiences RentAHome with purpose-built features and tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Role 1: Tenants */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center mb-6">
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Tenant Experience
                </span>
                <h3 className="text-xl font-bold text-black mb-3">
                  Find &amp; Book Free Viewings
                </h3>
                <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed mb-6">
                  Browse by neighborhood, filter by your monthly budget, view interior images, and book physical property viewings without paying a single cent to middlemen.
                </p>
                <ul className="space-y-2.5 text-xs text-black font-bold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Real-time vacancy status check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct WhatsApp chat with property owners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Personal viewing schedule dashboard</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onExploreVacancies}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Browse Vacant Units</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Role 2: Landlords */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Landlord Management
                </span>
                <h3 className="text-xl font-bold text-black mb-3">
                  List Vacancies &amp; Fill in Days
                </h3>
                <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed mb-6">
                  Post available houses in under 2 minutes. Upload multi-room photos, set rent and deposit, and toggle status to &ldquo;Occupied&rdquo; immediately when rented out.
                </p>
                <ul className="space-y-2.5 text-xs text-black font-bold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>2-Minute fast vacancy posting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>1-Tap &ldquo;Vacant&rdquo; to &ldquo;Occupied&rdquo; toggle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Receive and confirm tenant inspection requests</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => scrollToSection('auth-portal')}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Post a Property</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Role 3: Administrators */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                  Control Panel Oversight
                </span>
                <h3 className="text-xl font-bold text-black mb-3">
                  Control Panel &amp; Governance
                </h3>
                <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed mb-6">
                  System administrators verify landlord listings, moderate suspicious activities, analyze rental supply across suburbs, and ensure platform integrity.
                </p>
                <ul className="space-y-2.5 text-xs text-black font-bold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Approve, moderate, or remove listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Active user accounts &amp; safety moderation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Vacancy distribution &amp; analytics reports</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => scrollToSection('auth-portal')}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Control Panel Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="py-20 md:py-24 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              Rent or List in 3 Steps
            </h2>
            <p className="text-black font-semibold text-sm mt-2">
              From finding a vacant unit to getting the keys, the process is streamlined and free of middlemen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white font-extrabold flex items-center justify-center mx-auto mb-5 text-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-black mb-2">
                Discover or Post
              </h3>
              <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed">
                Filter by price, neighborhood, and room type, or post your vacant room in two minutes with high-resolution photos.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white font-extrabold flex items-center justify-center mx-auto mb-5 text-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-black mb-2">
                Direct Appointment &amp; Chat
              </h3>
              <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed">
                Book a viewing appointment through the system or click to chat directly with the landlord on WhatsApp for directions.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white font-extrabold flex items-center justify-center mx-auto mb-5 text-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-black mb-2">
                Move In Confidently
              </h3>
              <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed">
                Inspect the property in person, agree on terms with no broker markups, and move into your new home with complete peace of mind.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-20 bg-neutral-950/95 text-white backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to find your next home?
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Join hundreds of tenants and landlords connecting directly on RentAHome every single day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onExploreVacancies}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-neutral-950 font-bold text-sm tracking-wide hover:bg-neutral-100 transition-all shadow-lg cursor-pointer"
            >
              Browse All Vacant Units
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('auth-portal')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 border border-neutral-800 text-white font-bold text-sm tracking-wide hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Sign In or Register
            </button>
          </div>
        </div>
      </section>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={(resetEmail) => {
          setEmail(resetEmail);
          setError(null);
        }}
      />

      {/* Google Sign-In Interactive Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(role) => onSuccess(role)}
        initialRole={selectedRole}
      />
    </div>
  );
};
