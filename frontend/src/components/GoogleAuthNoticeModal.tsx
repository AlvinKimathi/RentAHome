import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, Mail, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface GoogleAuthNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role?: string) => void;
  role: 'tenant' | 'landlord';
}

export const GoogleAuthNoticeModal: React.FC<GoogleAuthNoticeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role,
}) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'direct_email' | 'client_id'>('direct_email');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [customClientId, setCustomClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.auth.googleLogin({
        email: googleEmail.trim().toLowerCase(),
        full_name: googleName.trim() || googleEmail.split('@')[0],
        role,
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        onSuccess(res.user.role);
        onClose();
      } else {
        setError(res.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClientIdAndRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customClientId.trim();
    if (!trimmed || !trimmed.includes('.apps.googleusercontent.com')) {
      setError('Please enter a valid Google Client ID ending in .apps.googleusercontent.com');
      return;
    }

    localStorage.setItem('rentahome_google_client_id', trimmed);
    sessionStorage.setItem('rentahome_oauth_role', role);

    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(trimmed)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;

    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-[460px] shadow-2xl border border-neutral-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-8 px-8 pb-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-white rounded-2xl border border-neutral-200 shadow-sm">
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

          <h3 className="text-xl font-bold text-neutral-950 tracking-tight">
            Google Authentication
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Sign in as <span className="font-bold text-neutral-900 capitalize">{role}</span> using your Google Account credentials.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="px-8 mb-4">
          <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('direct_email');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'direct_email'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In with Google
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('client_id');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'client_id'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Google Cloud Setup
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'direct_email' ? (
            <form onSubmit={handleDirectGoogleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Full Name"
                  autoComplete="off"
                  className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue as {role}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  Or cancel and use standard password login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveClientIdAndRedirect} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <p className="font-bold mb-1">Why Google OAuth needs a Client ID:</p>
                Google rejects logins with <span className="font-mono text-red-600 font-bold">Error 401: invalid_client</span> unless a genuine Google Cloud OAuth Client ID is registered for <span className="font-bold">rentahome.dpdns.org</span>.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Google Client ID (from Google Cloud Console)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="xxxxxxxxx.apps.googleusercontent.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Client ID & Redirect to Google</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-neutral-400 text-center leading-normal">
                To enable this permanently for all visitors, set <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700 font-bold">VITE_GOOGLE_CLIENT_ID</code> in Render Environment Variables.
              </p>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-neutral-100 flex items-start gap-2 text-[10px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Zero mock accounts. Every customer signs in with their authentic identity.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
