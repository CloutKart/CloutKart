import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Users, Settings, LogOut,
  Plus, ArrowRight, Search, Filter, ChevronDown, Upload, Loader,
  Eye, EyeOff, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Tab = 'overview' | 'requests' | 'payments' | 'users' | 'portfolio' | 'settings';
type RequestFilter = 'all' | 'pending' | 'in_progress' | 'completed';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  plan: string;
  created_at: string;
}

interface CreativeRequest {
  id: string;
  user_id: string;
  brand_name: string;
  niche: string;
  ad_format: string;
  description: string;
  status: string;
  created_at: string;
  profiles: { full_name: string | null; company_name: string | null } | null;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  plan: string;
  status: string;
  payment_id: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

interface PortfolioSection {
  id: string;
  title: string;
  thumbnail_url: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  image_count?: number;
}

const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#F59E0B', label: 'Pending' },
  in_progress: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', text: '#3B82F6', label: 'In Progress' },
  completed: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#10B981', label: 'Completed' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusColors[status] ?? statusColors.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {s.label}
    </span>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => (
  <span className="text-xs font-semibold px-2 py-0.5 rounded-md capitalize" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>
    {plan}
  </span>
);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real data
  const [overviewStats, setOverviewStats] = useState({ totalUsers: 0, requestsToday: 0, totalRevenue: 0, paidUsers: 0 });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<CreativeRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [portfolioSections, setPortfolioSections] = useState<PortfolioSection[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Load overview on mount
  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (tab === 'requests') loadRequests();
    else if (tab === 'payments') loadPayments();
    else if (tab === 'users') loadUsers();
    else if (tab === 'portfolio') loadPortfolio();
  }, [tab]);

  async function loadOverview() {
    setLoadingTab(true);
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalUsers },
      { count: requestsToday },
      { data: paymentsData },
      { count: paidUsers },
      { data: recent },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('free_creative_requests').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('payments').select('amount').eq('status', 'captured'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('plan', 'free'),
      supabase.from('profiles').select('id, full_name, company_name, plan, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalRevenue = paymentsData?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
    setOverviewStats({ totalUsers: totalUsers ?? 0, requestsToday: requestsToday ?? 0, totalRevenue, paidUsers: paidUsers ?? 0 });
    setRecentUsers(recent ?? []);
    setLoadingTab(false);
  }

  async function loadRequests() {
    setLoadingTab(true);
    const { data } = await supabase
      .from('free_creative_requests')
      .select('*, profiles(full_name, company_name)')
      .order('created_at', { ascending: false });
    setRequests((data as CreativeRequest[]) ?? []);
    setLoadingTab(false);
  }

  async function loadPayments() {
    setLoadingTab(true);
    const { data } = await supabase
      .from('payments')
      .select('*, profiles(full_name)')
      .eq('status', 'captured')
      .order('created_at', { ascending: false });
    setPayments((data as Payment[]) ?? []);
    setLoadingTab(false);
  }

  async function loadUsers() {
    setLoadingTab(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, plan, created_at')
      .order('created_at', { ascending: false });
    setUsers((data as Profile[]) ?? []);
    setLoadingTab(false);
  }

  async function loadPortfolio() {
    setLoadingTab(true);
    const { data: sections } = await supabase
      .from('portfolio_sections')
      .select('*, portfolio_images(count)')
      .order('display_order', { ascending: true });

    const mapped = (sections ?? []).map((s: { id: string; title: string; thumbnail_url: string; display_order: number; is_visible: boolean; created_at: string; portfolio_images: { count: number }[] }) => ({
      id: s.id,
      title: s.title,
      thumbnail_url: s.thumbnail_url,
      display_order: s.display_order,
      is_visible: s.is_visible,
      created_at: s.created_at,
      image_count: s.portfolio_images?.[0]?.count ?? 0,
    }));
    setPortfolioSections(mapped);
    setLoadingTab(false);
  }

  async function updateRequestStatus(id: string, newStatus: string) {
    await supabase.from('free_creative_requests').update({ status: newStatus }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  }

  async function toggleSectionVisibility(id: string, current: boolean) {
    await supabase.from('portfolio_sections').update({ is_visible: !current }).eq('id', id);
    setPortfolioSections(prev => prev.map(s => s.id === id ? { ...s, is_visible: !current } : s));
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section and all its images?')) return;
    const { data: images } = await supabase.from('portfolio_images').select('image_url').eq('section_id', id);
    if (images) {
      const paths = images.map(img => {
        const url = img.image_url as string;
        const marker = '/storage/v1/object/public/portfolio/';
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      }).filter(Boolean) as string[];
      if (paths.length > 0) await supabase.storage.from('portfolio').remove(paths);
    }
    await supabase.from('portfolio_sections').delete().eq('id', id);
    setPortfolioSections(prev => prev.filter(s => s.id !== id));
  }

  async function handleAddSection() {
    if (!newSectionName.trim()) return;
    setAddingSection(true);
    let thumbnail_url = '';
    if (thumbnailFile) {
      const ext = thumbnailFile.name.split('.').pop();
      const path = `sections/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, thumbnailFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
        thumbnail_url = urlData.publicUrl;
      }
    }
    const { data } = await supabase
      .from('portfolio_sections')
      .insert({ title: newSectionName.trim(), thumbnail_url, display_order: portfolioSections.length })
      .select()
      .single();
    if (data) {
      setPortfolioSections(prev => [...prev, { ...data, image_count: 0 }]);
    }
    setNewSectionName('');
    setThumbnailFile(null);
    setShowAddSection(false);
    setAddingSection(false);
  }

  function exportUsersCSV() {
    const rows = [['Full Name', 'Company', 'Plan', 'Signed Up']];
    users.forEach(u => rows.push([u.full_name ?? '', u.company_name ?? '', u.plan, formatDate(u.created_at)]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
  }

  const conversionRate = overviewStats.totalUsers > 0
    ? ((overviewStats.paidUsers / overviewStats.totalUsers) * 100).toFixed(1)
    : '0.0';

  const filteredRequests = requestFilter === 'all' ? requests : requests.filter(r => r.status === requestFilter);
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || (u.full_name ?? '').toLowerCase().includes(userSearch.toLowerCase()) || (u.company_name ?? '').toLowerCase().includes(userSearch.toLowerCase());
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const paymentSummary = {
    today: payments.filter(p => p.created_at.startsWith(new Date().toISOString().split('T')[0])).reduce((s, p) => s + p.amount, 0),
    week: (() => { const d = new Date(); d.setDate(d.getDate() - 7); return payments.filter(p => new Date(p.created_at) >= d).reduce((s, p) => s + p.amount, 0); })(),
    month: (() => { const d = new Date(); d.setDate(1); return payments.filter(p => new Date(p.created_at) >= d).reduce((s, p) => s + p.amount, 0); })(),
    allTime: payments.reduce((s, p) => s + p.amount, 0),
  };

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]";
  const thClass = "text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-4 py-3";
  const tdClass = "px-4 py-3 text-sm text-[#D1D5DB] border-t border-white/[0.04]";

  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'requests', icon: Image, label: 'Creative Requests' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'portfolio', icon: Image, label: 'Portfolio' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/">
            <img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" />
          </Link>
          <p className="text-[10px] text-[#6B7280] mt-2 font-mono uppercase tracking-wider">Admin Panel</p>
        </div>
        <div className="h-px mx-5 bg-white/[0.06]" />
        <nav className="flex-1 px-3 pt-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #818CF8' : '2px solid transparent',
                }}
              >
                <Icon size={16} style={{ color: active ? '#818CF8' : '#9CA3AF' }} />
                <span style={active ? { background: 'linear-gradient(135deg,#818CF8,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#D1D5DB' }}>
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
                background: tab === id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                border: tab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: tab === id ? '#818CF8' : '#9CA3AF',
              }}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Overview</h2>
              <button onClick={loadOverview} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: overviewStats.totalUsers.toString() },
                { label: 'Requests Today', value: overviewStats.requestsToday.toString() },
                { label: 'Total Revenue', value: formatCurrency(overviewStats.totalRevenue) },
                { label: 'Conversion Rate', value: `${conversionRate}%` },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5">
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className="font-mono font-bold text-xl gradient-text">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h3 className="font-heading font-semibold text-white text-base">Recent Signups</h3>
              </div>
              {loadingTab ? (
                <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
              ) : recentUsers.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center p-10">No users yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={thClass}>Name</th>
                        <th className={thClass}>Company</th>
                        <th className={thClass}>Plan</th>
                        <th className={thClass}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(u => (
                        <tr key={u.id}>
                          <td className={tdClass}>{u.full_name || '—'}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td>
                          <td className={tdClass}><PlanBadge plan={u.plan} /></td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATIVE REQUESTS */}
        {tab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Creative Requests</h2>
              <button onClick={loadRequests} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'in_progress', 'completed'] as RequestFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setRequestFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                  style={{
                    background: requestFilter === f ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(59,130,246,0.2))' : 'rgba(255,255,255,0.04)',
                    border: requestFilter === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: requestFilter === f ? '#D1D5DB' : '#9CA3AF',
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? (
                <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
              ) : filteredRequests.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center p-10">No requests found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['User', 'Brand', 'Niche', 'Format', 'Submitted', 'Status'].map(h => <th key={h} className={thClass}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.id}>
                          <td className={tdClass}>{r.profiles?.full_name || '—'}</td>
                          <td className={tdClass}>{r.brand_name}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{r.niche}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{r.ad_format}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(r.created_at)}</td>
                          <td className={tdClass}>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={r.status} />
                              <div className="relative group">
                                <button className="flex items-center gap-0.5 text-[#6B7280] hover:text-white transition-colors">
                                  <ChevronDown size={12} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:flex group-focus-within:flex flex-col gap-0.5 glass-card rounded-xl p-1 min-w-[120px] border border-white/[0.08]" style={{ background: 'rgba(12,12,12,0.98)' }}>
                                  {['pending', 'in_progress', 'completed'].map(s => (
                                    <button key={s} onClick={() => updateRequestStatus(r.id, s)} className="text-left px-3 py-2 text-xs rounded-lg hover:bg-white/[0.06] capitalize transition-colors text-[#D1D5DB]">
                                      {s.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Payments</h2>
              <button onClick={loadPayments} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: formatCurrency(paymentSummary.today) },
                { label: 'This Week', value: formatCurrency(paymentSummary.week) },
                { label: 'This Month', value: formatCurrency(paymentSummary.month) },
                { label: 'All Time', value: formatCurrency(paymentSummary.allTime) },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5">
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className="font-mono font-bold text-lg gradient-text">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? (
                <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
              ) : payments.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center p-10">No payments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['User', 'Plan', 'Amount', 'Date', 'Payment ID', 'Status'].map(h => <th key={h} className={thClass}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td className={tdClass}>{p.profiles?.full_name || '—'}</td>
                          <td className={tdClass}><PlanBadge plan={p.plan} /></td>
                          <td className={tdClass + ' font-mono'}>{formatCurrency(p.amount)}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(p.created_at)}</td>
                          <td className={tdClass + ' font-mono text-[#9CA3AF] text-xs'}>{p.payment_id || '—'}</td>
                          <td className={tdClass}>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                              Captured
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Users</h2>
              <div className="flex items-center gap-2">
                <button onClick={exportUsersCSV} className="btn-secondary text-xs py-2 px-3">Export CSV</button>
                <button onClick={loadUsers} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
                <Search size={13} className="text-[#9CA3AF]" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search name or company..."
                  className="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                <Filter size={13} className="text-[#9CA3AF]" />
                <select
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className="bg-transparent text-sm text-[#D1D5DB] focus:outline-none"
                  style={{ appearance: 'none' }}
                >
                  <option value="all" style={{ background: '#111' }}>All Plans</option>
                  <option value="free" style={{ background: '#111' }}>Free</option>
                  <option value="starter" style={{ background: '#111' }}>Starter</option>
                  <option value="growth" style={{ background: '#111' }}>Growth</option>
                  <option value="scale" style={{ background: '#111' }}>Scale</option>
                </select>
              </div>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? (
                <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center p-10">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['Name', 'Company', 'Plan', 'Signed Up'].map(h => <th key={h} className={thClass}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td className={tdClass}>{u.full_name || '—'}</td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td>
                          <td className={tdClass}><PlanBadge plan={u.plan} /></td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {tab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Portfolio Manager</h2>
              <button onClick={() => setShowAddSection(true)} className="btn-primary text-sm">
                <Plus size={14} /> Add New Section
              </button>
            </div>

            {loadingTab ? (
              <div className="flex items-center justify-center p-20"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
            ) : portfolioSections.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <p className="text-[#6B7280] text-sm">No portfolio sections yet. Add your first section above.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioSections.map(sec => (
                  <div key={sec.id} className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative bg-white/[0.04] h-32 flex items-center justify-center border-b border-white/[0.06]">
                      {sec.thumbnail_url ? (
                        <img src={sec.thumbnail_url} alt={sec.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image size={28} className="text-[#6B7280]" />
                      )}
                      <button
                        onClick={() => toggleSectionVisibility(sec.id, sec.is_visible)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                        title={sec.is_visible ? 'Hide section' : 'Show section'}
                      >
                        {sec.is_visible ? <Eye size={13} className="text-white/60" /> : <EyeOff size={13} className="text-white/30" />}
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading font-semibold text-white text-sm">{sec.title}</h3>
                        <span className="text-xs text-[#9CA3AF] font-mono">{sec.image_count} imgs</span>
                      </div>
                      {!sec.is_visible && (
                        <p className="text-[10px] text-[#F59E0B] mb-2 font-semibold uppercase tracking-wider">Hidden from public</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteSection(sec.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                        <button className="btn-primary flex-1 justify-center text-xs py-2">
                          Manage <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddSection && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowAddSection(false)}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="relative w-full max-w-md glass-card rounded-3xl p-8" style={{ background: 'rgba(12,12,12,0.98)' }} onClick={e => e.stopPropagation()}>
                  <h3 className="font-heading font-bold text-white text-xl mb-6">Add New Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Section Name</label>
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={e => setNewSectionName(e.target.value)}
                        placeholder="e.g. E-Commerce Ads"
                        className={inputClass}
                      />
                    </div>
                    <div
                      className="border-2 border-dashed border-white/[0.10] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-white/20 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Upload size={18} className="text-[#818CF8]" />
                      </div>
                      <p className="text-[#9CA3AF] text-sm text-center">
                        {thumbnailFile ? thumbnailFile.name : 'Click or drag & drop thumbnail'}
                      </p>
                      <p className="text-[#6B7280] text-xs">JPG, PNG, WEBP — max 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => setThumbnailFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                    <button
                      onClick={handleAddSection}
                      disabled={addingSection || !newSectionName.trim()}
                      className="btn-primary w-full justify-center text-sm disabled:opacity-50"
                    >
                      {addingSection ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                      {addingSection ? 'Creating...' : 'Create Section'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-heading font-bold text-white text-2xl">Settings</h2>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-[#9CA3AF] text-sm">Admin account: <span className="text-white">{user?.email}</span></p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
