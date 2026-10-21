// frontend/src/components/ForgotPasswordModal.tsx
import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.auth.forgotPassword(email.trim());
      if (res.success) {
        setDevCodeHint(res.code || null);
        if (res.code) {
          setCode(res.code); // Pre-fill for ease of testing!
        }
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !newPassword) {
      setError('Please provide both the 6-digit verification code and a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.resetPassword({
        email: email.trim(),
        code: code.trim(),
        new_password: newPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess(email.trim());
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please verify the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 relative p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-950 tracking-tight">
            {step === 1 ? 'Reset Your Password' : 'Set New Password'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {step === 1
              ? 'Enter your registered email address and we will generate a 6-digit recovery code.'
              : `Enter the verification code sent for ${email}.`}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && !successMsg && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-3 focus-within:border-neutral-900 transition-colors">
                <Mail className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="e.g. tenant@leon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending Code...' : 'Request Reset Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password */}
        {step === 2 && !successMsg && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            {/* Developer/Demo Hint */}
            {devCodeHint && (
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-2xl text-xs text-neutral-800 flex items-center justify-between">
                <span>Verification Code: <strong className="font-mono text-sm tracking-widest">{devCodeHint}</strong></span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                6-Digit Recovery Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-center text-sm font-bold tracking-widest text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-full border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-2 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
