import { useState } from 'react';
import { X, ArrowRight, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
}

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
        const isAdmin = data.user?.email?.endsWith('@clout-kart.com') ?? false;
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:bg-white/[0.07]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-card rounded-3xl p-8"
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
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
            <p className="text-[#9CA3AF] text-sm">Your first creative is free. No credit card required.</p>
          )}
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">
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

        <p className="text-center text-[#6B7280] text-sm mt-5">
          {mode === 'signup' ? (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[#9CA3AF] hover:text-white transition-colors underline underline-offset-2">
                Log in
              </button>
            </>
          ) : (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-[#9CA3AF] hover:text-white transition-colors underline underline-offset-2">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
