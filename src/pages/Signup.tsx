import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[var(--ink-dim)] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-accent/50 focus:bg-white/[0.07]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)', backgroundImage: 'radial-gradient(circle, rgb(var(--white-rgb) / 0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10" style={{ background: 'var(--bg-elev)' }}>
          <div className="mb-8">
            <Link to="/">
              <img src="/logo.png" alt="CloutKart" className="h-9 w-auto object-contain mb-6 opacity-80" />
            </Link>
            <h2 className="font-heading font-bold text-3xl gradient-text mb-1">Get Started Free</h2>
            <p className="text-ink-muted text-sm">Your first creative is free. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className={inputClass}
              required
            />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-ink-muted text-xs mt-2">
              Your first creative is free. No credit card required.
            </p>
          </form>

          <p className="text-center text-ink-dim text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
