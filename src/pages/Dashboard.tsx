import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Settings, LogOut, ArrowRight,
  Download, Clock, CheckCircle, Loader, ChevronRight, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Tab = 'overview' | 'creative' | 'plan' | 'settings';
type CreativeStatus = 'none' | 'pending' | 'in_progress' | 'ready';

const planFeatures = {
  free: ['1 free creative', '48h delivery', 'Basic formats'],
  starter: ['5 creatives/mo', '48h delivery', 'All formats', 'Revisions'],
  growth: ['20 creatives/mo', '24h delivery', 'All formats', 'Unlimited revisions', 'Strategist'],
  scale: ['Unlimited creatives', 'Priority delivery', 'All formats + landing pages', 'Dedicated team'],
};

const upgradePlans = [
  { id: 'starter', name: 'Starter', price: '₹4,999/mo', features: planFeatures.starter },
  { id: 'growth', name: 'Growth', price: '₹9,999/mo', features: planFeatures.growth },
  { id: 'scale', name: 'Scale', price: '₹19,999/mo', features: planFeatures.scale },
];

const timelineSteps = ['Submitted', 'In Review', 'In Production', 'Ready to Download'];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [creativeStatus] = useState<CreativeStatus>('none');
  const [showForm, setShowForm] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ fullName: user?.user_metadata?.full_name ?? '', company: '', phone: '' });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.updateUser({ data: { full_name: settingsForm.fullName } });
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const userPlan = 'Free Plan';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:bg-white/[0.07]";
  const labelClass = "block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em] font-heading";

  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'creative', icon: Image, label: 'My Creative' },
    { id: 'plan', icon: CreditCard, label: 'My Plan' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const StatusPill = ({ status }: { status: CreativeStatus }) => {
    const map = {
      none: null,
      pending: { label: 'Pending', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
      in_progress: { label: 'In Progress', color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6' },
      ready: { label: 'Ready', color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
    };
    const s = map[status];
    if (!s) return null;
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.color, border: `1px solid ${s.border}`, color: s.text }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/">
            <img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" />
          </Link>
        </div>
        <div className="h-px mx-5 bg-white/[0.06]" />

        <nav className="flex-1 px-3 pt-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{
                  color: active ? 'transparent' : '#D1D5DB',
                  background: active ? 'rgba(168,85,247,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #A855F7' : '2px solid transparent',
                  backgroundClip: active ? undefined : undefined,
                }}
              >
                <Icon size={16} style={{ color: active ? '#A855F7' : '#9CA3AF' }} />
                <span style={active ? { background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="px-5 pb-6 pt-4 border-t border-white/[0.06]">
          <p className="text-[#6B7280] text-xs mb-3 truncate">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm">
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                background: tab === id ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                border: tab === id ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: tab === id ? '#A855F7' : '#9CA3AF',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6" style={{ borderLeft: '3px solid #A855F7' }}>
              <h2 className="font-heading font-bold text-white text-xl mb-1">Welcome back, {userName}</h2>
              <p className="text-[#9CA3AF] text-sm">Here's what's happening with your account.</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-1">Your Free Creative</p>
                  <h3 className="font-heading font-semibold text-white">Free Creative Request</h3>
                </div>
                <StatusPill status={creativeStatus === 'none' ? 'pending' : creativeStatus} />
              </div>
              {creativeStatus === 'ready' ? (
                <button className="btn-primary text-sm">
                  <Download size={14} />
                  Download Now
                  <ArrowRight size={14} />
                </button>
              ) : (
                <p className="text-[#6B7280] text-sm">Request a free creative from the My Creative tab.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Creatives Requested', value: '0' },
                { label: 'Current Plan', value: userPlan },
                { label: 'Member Since', value: memberSince },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-2xl p-5">
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className="font-mono font-bold text-lg gradient-text">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-heading font-semibold text-sm">Free Plan</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">Upgrade for more creatives</p>
              </div>
              <button onClick={() => setTab('plan')} className="flex items-center gap-1 text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Upgrade <ChevronRight size={14} style={{ color: '#A855F7' }} />
              </button>
            </div>
          </div>
        )}

        {/* MY CREATIVE */}
        {tab === 'creative' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">My Creative</h2>

            {creativeStatus === 'none' && !showForm && (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <Image size={24} className="text-[#A855F7]" />
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">No creative requested yet</h3>
                <p className="text-[#9CA3AF] text-sm mb-6 max-w-sm">You haven't requested your free creative yet. It takes 2 minutes and delivers in 48 hours.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                  Request Free Creative
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {(creativeStatus === 'none' && showForm) && (
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-white text-lg mb-6">Free Creative Request</h3>
                <form className="space-y-4">
                  <div>
                    <label className={labelClass}>Brand Name</label>
                    <input type="text" placeholder="Your brand name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Industry / Niche</label>
                    <input type="text" placeholder="e.g. Fashion, SaaS, Food" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ad Format</label>
                    <select className={inputClass} style={{ appearance: 'none' }}>
                      <option value="" style={{ background: '#111' }}>Select format</option>
                      <option style={{ background: '#111' }}>Static</option>
                      <option style={{ background: '#111' }}>Video</option>
                      <option style={{ background: '#111' }}>UGC</option>
                      <option style={{ background: '#111' }}>Story</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Brief Description</label>
                    <textarea rows={4} placeholder="Describe your product, target audience, and what you want to convey..." className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Reference URL (optional)</label>
                    <input type="url" placeholder="https://..." className={inputClass} />
                  </div>
                  <button type="submit" className="btn-primary text-sm">
                    Submit Request
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            )}

            {creativeStatus !== 'none' && (
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-white text-lg mb-8">Creative Status</h3>
                <div className="relative flex flex-col gap-0">
                  {timelineSteps.map((step, i) => {
                    const statusMap: Record<CreativeStatus, number> = { none: -1, pending: 0, in_progress: 2, ready: 3 };
                    const activeStep = statusMap[creativeStatus];
                    const done = i <= activeStep;
                    const active = i === activeStep;
                    return (
                      <div key={step} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: done ? 'linear-gradient(135deg,#A855F7,#3B82F6)' : 'rgba(255,255,255,0.05)',
                              border: done ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            }}>
                            {done ? <CheckCircle size={14} className="text-white" /> : <Clock size={14} className="text-[#6B7280]" />}
                          </div>
                          {i < timelineSteps.length - 1 && (
                            <div className="w-px flex-1 mt-1" style={{ height: 24, background: done ? 'linear-gradient(#A855F7,#3B82F6)' : 'rgba(255,255,255,0.06)' }} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`font-heading font-semibold text-sm ${active ? '' : done ? 'text-white' : 'text-[#6B7280]'}`}
                            style={active ? { background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
                            {step}
                          </p>
                          {active && <Loader size={12} className="mt-1 text-[#A855F7] animate-spin" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY PLAN */}
        {tab === 'plan' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">My Plan</h2>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Current Plan</p>
                  <h3 className="font-heading font-bold text-white text-xl">{userPlan}</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>Active</span>
              </div>
              <div className="space-y-2">
                {planFeatures.free.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#D1D5DB]">
                    <span className="text-[#A855F7] text-xs">✦</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {upgradePlans.map((plan) => (
                <div key={plan.id} className="glass-card rounded-2xl p-6 flex flex-col">
                  <h3 className="font-heading font-bold text-white text-lg mb-1">{plan.name}</h3>
                  <p className="font-mono text-[#9CA3AF] text-sm mb-4">{plan.price}</p>
                  <div className="space-y-2 flex-1 mb-5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                        <span className="text-[#A855F7]">✦</span> {f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary w-full justify-center text-sm">
                    Upgrade to {plan.name} <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-heading font-bold text-white text-2xl">Settings</h2>
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={settingsForm.fullName}
                    onChange={e => setSettingsForm(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    type="text"
                    value={settingsForm.company}
                    onChange={e => setSettingsForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="Your company"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 00000 00000"
                    className={inputClass}
                  />
                </div>
                <button type="submit" className="btn-primary text-sm">
                  Save Changes <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
