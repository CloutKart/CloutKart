import { useState } from 'react';
import { ArrowRight, Loader, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[var(--ink-dim)] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-accent/50 focus:bg-white/[0.07]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)', backgroundImage: 'radial-gradient(circle, rgb(var(--white-rgb) / 0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10" style={{ background: 'var(--bg-elev)' }}>
          <div className="mb-8">
            <Link to="/">
              <img src="/logo.png" alt="CloutKart" className="h-9 w-auto object-contain mb-6 opacity-80" />
            </Link>
            <h2 className="font-heading font-bold text-3xl gradient-text mb-1">Reset Password</h2>
            <p className="text-ink-muted text-sm">Enter your email to receive a reset link.</p>
          </div>

          {sent ? (
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgb(var(--accent-rgb) / 0.1)', border: '1px solid rgb(var(--accent-rgb) / 0.2)' }}>
                <Mail size={20} className="text-brand-cyan" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">Check your inbox</h3>
              <p className="text-ink-muted text-sm">We sent a password reset link to <span className="text-white">{email}</span>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address"
                className={inputClass}
                required
              />

              {error && (
                <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-xs">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-ink-dim text-sm mt-6">
            <Link to="/login" className="text-ink-muted hover:text-white transition-colors underline underline-offset-2">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
