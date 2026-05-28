import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

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
      const isAdmin = data.user?.email?.endsWith('@clout-kart.com') ?? false;
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:bg-white/[0.07]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10" style={{ background: 'rgba(12,12,12,0.97)' }}>
          <div className="mb-8">
            <Link to="/">
              <img src="/logo.png" alt="CloutKart" className="h-9 w-auto object-contain mb-6 opacity-80" />
            </Link>
            <h2 className="font-heading font-bold text-3xl gradient-text mb-1">Welcome Back</h2>
            <p className="text-[#9CA3AF] text-sm">Log in to your CloutKart account.</p>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">
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

          <p className="text-center text-[#6B7280] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#9CA3AF] hover:text-white transition-colors underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
