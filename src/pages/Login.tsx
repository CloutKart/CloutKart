import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isAdminUser } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(isAdminUser(data.user) ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[var(--ink-dim)] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-accent/50 focus:bg-white/[0.07]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)', backgroundImage: 'radial-gradient(circle, rgb(var(--white-rgb) / 0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <div className="w-full max-w-md">
        <div className="relative glass-card rounded-3xl p-8 sm:p-10" style={{ background: 'var(--bg-elev)' }}>
          <Link
            to="/"
            className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 transition-all"
          >
            <X size={15} />
          </Link>
          <div className="mb-8">
            <Link to="/">
              <img src="/logo.png" alt="CloutKart" className="h-9 w-auto object-contain mb-6 opacity-80" />
            </Link>
            <h2 className="font-heading font-bold text-3xl gradient-text mb-1">Welcome Back</h2>
            <p className="text-ink-muted text-sm">Log in to your CloutKart account.</p>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 mb-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/[0.08]"
            style={{ background: 'rgb(var(--white-rgb) / 0.05)', border: '1px solid rgb(var(--white-rgb) / 0.10)' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-ink-dim text-xs">or continue with email</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className={inputClass}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
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

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-ink-muted hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-ink-dim text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
