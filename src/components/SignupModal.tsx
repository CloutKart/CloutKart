import { useState } from 'react';
import { X, ArrowRight, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isAdminUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function SignupModal({ open, onClose, defaultMode = 'signup' }: Props) {
  const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const navigate = useNavigate();

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName } },
        });
        if (error) throw error;
        onClose();
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        onClose();
        navigate(isAdminUser(data.user) ? '/admin' : '/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[var(--ink-dim)] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-accent/50 focus:bg-white/[0.07]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-card rounded-3xl p-8"
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgb(var(--white-rgb) / 0.1)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 transition-all"
        >
          <X size={15} />
        </button>

        <div className="mb-7">
          <img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain mb-5 opacity-80" />
          <h2 className="font-heading font-bold text-2xl gradient-text mb-1">
            {mode === 'signup' ? 'Get Started Free' : 'Welcome Back'}
          </h2>
          {mode === 'signup' && (
            <p className="text-ink-muted text-sm">Your first creative is free. No credit card required.</p>
          )}
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-ink-body text-sm font-medium transition-all duration-200 mb-4"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-ink-dim text-xs">or continue with email</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className={inputClass}
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className={inputClass}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`${inputClass} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-dim hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-ink-muted hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-xs">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-ink-dim text-sm mt-5">
          {mode === 'signup' ? (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
                Log in
              </button>
            </>
          ) : (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
