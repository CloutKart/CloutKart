import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Settings, LogOut, ArrowRight,
  Download, Clock, CheckCircle, Loader, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Tab = 'overview' | 'creative' | 'plan' | 'settings';

interface CreativeRequest {
  id: string;
  brand_name: string;
  niche: string;
  ad_format: string;
  description: string;
  reference_url: string;
  status: string;
  creative_url: string;
  created_at: string;
}

const planFeatures = {
  free: ['1 free creative', '48h delivery', 'Basic formats'],
};

const cloutClubFeatures = [
  'Recurring monthly creative production',
  'Priority turnaround for active campaigns',
  'Caption, hook, and visual direction support',
  'Fresh ad concepts built around your winning message',
];

const timelineSteps = ['Submitted', 'In Review', 'In Production', 'Ready to Download'];

const statusToStep: Record<string, number> = { pending: 0, in_progress: 2, completed: 3 };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [creativeRequest, setCreativeRequest] = useState<CreativeRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ brandName: '', niche: '', adFormat: '', description: '', referenceUrl: '' });
  const [settingsForm, setSettingsForm] = useState({ fullName: user?.user_metadata?.full_name ?? '', company: '', phone: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('free_creative_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setCreativeRequest(data);
        setLoadingRequest(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, company_name, phone')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettingsForm({
            fullName: data.full_name ?? user?.user_metadata?.full_name ?? '',
            company: data.company_name ?? '',
            phone: data.phone ?? '',
          });
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitError('');
  };

  const handleSubmitCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: inserted, error: insertError } = await supabase
        .from('free_creative_requests')
        .insert({
          user_id: user.id,
          brand_name: form.brandName,
          niche: form.niche,
          ad_format: form.adFormat,
          description: form.description,
          reference_url: form.referenceUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Fire email notification but don't let it block or break the form submission
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`${supabaseUrl}/functions/v1/send-creative-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            brandName: form.brandName,
            niche: form.niche,
            adFormat: form.adFormat,
            description: form.description,
            referenceUrl: form.referenceUrl,
          }),
        });
      } catch (emailErr) {
        console.warn('Email notification failed (non-critical):', emailErr);
      }

      setCreativeRequest(inserted);
      setShowForm(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsSaving(true);
    await supabase.auth.updateUser({ data: { full_name: settingsForm.fullName } });
    await supabase.from('profiles').update({
      full_name: settingsForm.fullName,
      company_name: settingsForm.company,
      phone: settingsForm.phone,
    }).eq('id', user.id);
    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:bg-white/[0.07]";
  const labelClass = "block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em] font-heading";

  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'creative', icon: Image, label: 'My Creative' },
    { id: 'plan', icon: CreditCard, label: 'My Plan' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const activeStep = creativeRequest ? (statusToStep[creativeRequest.status] ?? 0) : -1;
  const creativeUrl = creativeRequest?.creative_url ?? '';
  const creativeIsImage = /\.(apng|avif|gif|jpe?g|png|webp)(\?.*)?$/i.test(creativeUrl);

  return (
    <div className="min-h-screen flex" style={{ background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/"><img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" /></Link>
        </div>
        <div className="h-px mx-5 bg-white/[0.06]" />
        <nav className="flex-1 px-3 pt-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{ background: active ? 'rgba(168,85,247,0.08)' : 'transparent', borderLeft: active ? '2px solid #A855F7' : '2px solid transparent' }}>
                <Icon size={16} style={{ color: active ? '#A855F7' : '#9CA3AF' }} />
                <span style={active ? { background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#D1D5DB' }}>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-5 pb-6 pt-4 border-t border-white/[0.06]">
          <p className="text-[#6B7280] text-xs mb-3 truncate">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{ background: tab === id ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)', border: tab === id ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)', color: tab === id ? '#A855F7' : '#9CA3AF' }}>
              <Icon size={13} />{label}
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
                  <h3 className="font-heading font-semibold text-white">{creativeRequest ? creativeRequest.brand_name : 'Free Creative Request'}</h3>
                </div>
                {creativeRequest && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: creativeRequest.status === 'completed' ? 'rgba(16,185,129,0.1)' : creativeRequest.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${creativeRequest.status === 'completed' ? 'rgba(16,185,129,0.25)' : creativeRequest.status === 'in_progress' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`, color: creativeRequest.status === 'completed' ? '#10B981' : creativeRequest.status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>
                    {creativeRequest.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {creativeRequest?.status === 'completed' ? (
                <a href={creativeRequest.creative_url || "#"} target="_blank" rel="noopener noreferrer" download className="btn-primary text-sm"><Download size={14} />Download Now<ArrowRight size={14} /></a>
              ) : !creativeRequest && !loadingRequest ? (
                <button onClick={() => setTab('creative')} className="btn-primary text-sm">Request Free Creative <ArrowRight size={14} /></button>
              ) : (
                <p className="text-[#6B7280] text-sm">{loadingRequest ? 'Loading...' : 'Your creative is being worked on.'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Creatives Requested', value: creativeRequest ? '1' : '0' },
                { label: 'Current Plan', value: 'Free Plan' },
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
            {loadingRequest && (
              <div className="glass-card rounded-2xl p-10 flex items-center justify-center">
                <Loader size={20} className="animate-spin text-[#A855F7]" />
              </div>
            )}
            {!loadingRequest && !creativeRequest && !showForm && (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <Image size={24} className="text-[#A855F7]" />
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">No creative requested yet</h3>
                <p className="text-[#9CA3AF] text-sm mb-6 max-w-sm">You haven't requested your free creative yet. It takes 2 minutes and delivers in 48 hours.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Request Free Creative<ArrowRight size={14} /></button>
              </div>
            )}
            {!loadingRequest && !creativeRequest && showForm && (
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-white text-lg mb-6">Free Creative Request</h3>
                <form onSubmit={handleSubmitCreative} className="space-y-4">
                  <div>
                    <label className={labelClass}>Brand Name</label>
                    <input type="text" name="brandName" value={form.brandName} onChange={handleFormChange} placeholder="Your brand name" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Industry / Niche</label>
                    <input type="text" name="niche" value={form.niche} onChange={handleFormChange} placeholder="e.g. Fashion, SaaS, Food" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Ad Format</label>
                    <select name="adFormat" value={form.adFormat} onChange={handleFormChange} className={inputClass} style={{ appearance: 'none' }} required>
                      <option value="" style={{ background: '#111' }}>Select format</option>
                      <option style={{ background: '#111' }}>Static</option>
                      <option style={{ background: '#111' }}>Video</option>
                      <option style={{ background: '#111' }}>UGC</option>
                      <option style={{ background: '#111' }}>Story</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Brief Description</label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} rows={4} placeholder="Describe your product, target audience, and what you want to convey..." className={`${inputClass} resize-none`} required />
                  </div>
                  <div>
                    <label className={labelClass}>Reference URL (optional)</label>
                    <input type="url" name="referenceUrl" value={form.referenceUrl} onChange={handleFormChange} placeholder="https://..." className={inputClass} />
                  </div>
                  {submitError && (
                    <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-xs">{submitError}</span>
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>
            )}
            {!loadingRequest && creativeRequest && (
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="font-heading font-semibold text-white text-lg">{creativeRequest.brand_name}</h3>
                    <p className="text-[#9CA3AF] text-sm mt-1">{creativeRequest.niche} · {creativeRequest.ad_format}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
                    style={{ background: creativeRequest.status === 'completed' ? 'rgba(16,185,129,0.1)' : creativeRequest.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${creativeRequest.status === 'completed' ? 'rgba(16,185,129,0.25)' : creativeRequest.status === 'in_progress' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`, color: creativeRequest.status === 'completed' ? '#10B981' : creativeRequest.status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>
                    {creativeRequest.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] gap-8 items-start">
                  <div className="relative flex flex-col gap-0">
                    {timelineSteps.map((step, i) => {
                      const done = i <= activeStep;
                      const active = i === activeStep;
                      return (
                        <div key={step} className="flex items-start gap-4 pb-6 last:pb-0">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ background: done ? 'linear-gradient(135deg,#A855F7,#3B82F6)' : 'rgba(255,255,255,0.05)', border: done ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
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
                            {active && creativeRequest.status !== 'completed' && <Loader size={12} className="mt-1 text-[#A855F7] animate-spin" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.035)' }}>
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">Creative Preview</p>
                      {creativeRequest.status === 'completed' && <span className="text-[11px] font-semibold text-[#10B981]">Ready</span>}
                    </div>
                    <div className="min-h-[280px] sm:min-h-[360px] flex items-center justify-center p-4">
                      {creativeRequest.status === 'completed' && creativeUrl ? (
                        creativeIsImage ? (
                          <a href={creativeUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                            <img src={creativeUrl} alt={`${creativeRequest.brand_name} creative preview`} className="w-full max-h-[520px] object-contain rounded-xl" />
                          </a>
                        ) : (
                          <div className="text-center max-w-xs mx-auto">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.24)' }}>
                              <Download size={22} className="text-[#A855F7]" />
                            </div>
                            <p className="text-white font-heading font-semibold text-sm mb-1">Preview unavailable</p>
                            <p className="text-[#9CA3AF] text-xs leading-relaxed">This creative file is ready, but it cannot be previewed inline.</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center max-w-xs mx-auto">
                          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <Image size={22} className="text-[#6B7280]" />
                          </div>
                          <p className="text-white font-heading font-semibold text-sm mb-1">Preview appears here</p>
                          <p className="text-[#9CA3AF] text-xs leading-relaxed">Your completed creative will show here before download.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {creativeRequest.status === 'completed' && (
                  <a href={creativeRequest.creative_url || "#"} target="_blank" rel="noopener noreferrer" download className="btn-primary text-sm mt-6"><Download size={14} />Download Creative<ArrowRight size={14} /></a>
                )}
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
                  <h3 className="font-heading font-bold text-white text-xl">Free Plan</h3>
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
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.22)' }}>
                    <Sparkles size={13} className="text-[#A855F7]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C084FC]">Coming soon</span>
                  </div>
                  <h3 className="font-heading font-bold text-white text-2xl mb-2">Clout Club</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    A subscription service for brands that need a steady stream of performance creatives without rebuilding the brief every time.
                  </p>
                </div>
                <div className="rounded-2xl px-4 py-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[#6B7280] text-[10px] uppercase tracking-widest mb-1">Status</p>
                  <p className="text-white font-heading font-semibold text-sm">Coming Soon</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-7">
                {cloutClubFeatures.map(f => (
                  <div key={f} className="flex items-start gap-3 text-sm text-[#D1D5DB] rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[#A855F7] text-xs mt-0.5 flex-shrink-0">✦</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
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
                  <input type="text" value={settingsForm.fullName} onChange={e => setSettingsForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input type="text" value={settingsForm.company} onChange={e => setSettingsForm(p => ({ ...p, company: e.target.value }))} placeholder="Your company" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 00000 00000" className={inputClass} />
                </div>
                <button type="submit" disabled={settingsSaving} className="btn-primary text-sm disabled:opacity-50">
                  {settingsSaving ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  {settingsSaved ? 'Saved!' : settingsSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
