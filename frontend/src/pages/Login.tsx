// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, ShieldCheck, Home, CalendarCheck, BarChart3, CheckCircle2, Sparkles, Building2, Users2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

interface LoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateHome }) => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>('tenant');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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
          onSuccess();
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
          onSuccess();
        }
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    sessionStorage.setItem('rentahome_oauth_role', selectedRole);

    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '104829104812-rentahome.apps.googleusercontent.com';
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;

    // Direct browser redirect to Google OAuth 2.0 authentication server
    window.location.href = authUrl;
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-neutral-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Top Back Navigation */}
        <div className="mb-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Section of Landing Page */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            <span>Welcome to RentAHome Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            {isSignUp ? 'Create your RentAHome account' : 'Sign in to RentAHome'}
          </h1>
          <p className="text-neutral-500 text-sm md:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Direct connections between tenants, landlords, and property administrators. No handwritten signs, no broker markups, and verified vacancies.
          </p>
        </div>

        {/* Central Auth Card */}
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-2xl relative mb-20">
          {/* Brand Monogram */}
          <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white font-extrabold flex items-center justify-center mx-auto mb-5 text-lg shadow-md">
            R
          </div>

          {/* Tab Toggle: Sign In / Create Account */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl mb-6">
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

          {/* Google Sign In Option */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-50"
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

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                or with email
              </span>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Sign Up Role Selector */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('tenant')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                  <UserIcon className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
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
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                  <Phone className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
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
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                <Mail className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
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
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                  <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
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
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* SECTION: WHAT RENTAHOME IS ABOUT */}
        <div className="pt-12 border-t border-neutral-200">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
              About RentAHome
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
              One Unified Platform for All Three Roles.
            </h2>
            <p className="text-neutral-500 text-sm md:text-base mt-3">
              Learn how RentAHome simplifies house hunting and property management for tenants, landlords, and administrators.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Card 1: For Tenants */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold mb-6">
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Tenant Experience
                </span>
                <h3 className="text-xl font-bold text-neutral-950 mb-3">
                  Find & Inspect Vacant Homes
                </h3>
                <p className="text-neutral-500 text-xs leading-relaxed mb-6">
                  Say goodbye to walking miles searching for "VACANT" signs painted on walls. Inspect photos, amenities, and exact rent before requesting a visit.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>0% Broker Commissions & Free Viewings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct Landlord WhatsApp & Phone Contact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Filter by Location, Price, & House Type</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: For Landlords */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  Landlord Management
                </span>
                <h3 className="text-xl font-bold text-neutral-950 mb-3">
                  List Vacancies & Fill Faster
                </h3>
                <p className="text-neutral-500 text-xs leading-relaxed mb-6">
                  Publish vacant properties in under two minutes with multiple photos, amenities, and pricing. Receive direct tenant inspection appointments.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1-Tap "Vacant" to "Occupied" Toggle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Manage Viewing Inquiries in Real Time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct Tenant Screening & Contact Log</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3: For Admins */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                  Platform Oversight
                </span>
                <h3 className="text-xl font-bold text-neutral-950 mb-3">
                  Control Panel & Reports
                </h3>
                <p className="text-neutral-500 text-xs leading-relaxed mb-6">
                  Platform administrators maintain listing authenticity, moderate property listings, manage user accounts, and generate vacancy distribution reports.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Approve, Reject, or Remove Listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Active User Management & Safety Controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Vacancy Analytics by Type & Suburb</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};
