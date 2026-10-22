// frontend/src/components/GoogleSignInModal.tsx
import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role?: string) => void;
  initialRole?: 'tenant' | 'landlord';
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'tenant',
}) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>(initialRole);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (email: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.googleLogin({
        email: email.trim().toLowerCase(),
        full_name: name.trim(),
        role: selectedRole,
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        onSuccess(res.user.role);
        onClose();
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    if (!customName.trim()) {
      setError('Please enter your full name as it appears on Google.');
      return;
    }
    handleSelectAccount(customEmail, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl border border-neutral-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="pt-8 px-8 pb-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
            Sign in with Google
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Choose an account to continue to <span className="font-bold text-neutral-800">RentAHome</span>
          </p>
        </div>

        {/* Role Selector */}
        <div className="px-8 mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            Sign In As:
          </label>
          <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedRole('tenant')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'tenant'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('landlord')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'landlord'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Landlord
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Account Chooser */}
        <div className="px-8 pb-6">
          {!isCustomMode ? (
            <div className="space-y-2">
              {/* Account Option 1 */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectAccount('alvin.kimathi@gmail.com', 'Alvin Kimathi')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    AK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Alvin Kimathi</p>
                    <p className="text-[11px] text-neutral-500">alvin.kimathi@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Account Option 2 */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectAccount('leon.whitaker@gmail.com', 'Leon Whitaker')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                    LW
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Leon Whitaker</p>
                    <p className="text-[11px] text-neutral-500">leon.whitaker@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-800">Use another Google account</p>
                  <p className="text-[11px] text-neutral-400">Enter your Gmail address & name</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {isLoading ? 'Verifying...' : 'Sign In with Google'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-neutral-100 flex items-start gap-2 text-[10px] text-neutral-400 leading-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Google verifies your identity securely. RentAHome only receives your name and email to establish your verified tenant or landlord profile.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
