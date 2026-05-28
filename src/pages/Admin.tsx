import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Users, Settings, LogOut,
  Plus, ArrowRight, Search, Filter, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'requests' | 'payments' | 'users' | 'portfolio' | 'settings';
type RequestFilter = 'all' | 'pending' | 'in_progress' | 'completed';

const mockUsers = [
  { name: 'Arjun Sharma', email: 'arjun@example.com', plan: 'Growth', signed: '12 May 2026' },
  { name: 'Priya Nair', email: 'priya@example.com', plan: 'Free', signed: '20 May 2026' },
  { name: 'Rahul Gupta', email: 'rahul@example.com', plan: 'Starter', signed: '24 May 2026' },
  { name: 'Sneha Iyer', email: 'sneha@example.com', plan: 'Free', signed: '25 May 2026' },
];

const mockRequests = [
  { user: 'Arjun Sharma', brand: 'FreshBrew', niche: 'Food & Bev', format: 'Static', submitted: '12 May', status: 'completed' },
  { user: 'Priya Nair', brand: 'StyleHive', niche: 'Fashion', format: 'Video', submitted: '20 May', status: 'in_progress' },
  { user: 'Rahul Gupta', brand: 'TechPulse', niche: 'SaaS', format: 'UGC', submitted: '24 May', status: 'pending' },
];

const mockPayments = [
  { user: 'Arjun Sharma', plan: 'Growth', amount: '₹9,999', date: '1 May', paymentId: 'rzp_1Abc', status: 'Success' },
  { user: 'Rahul Gupta', plan: 'Starter', amount: '₹4,999', date: '24 May', paymentId: 'rzp_2Xyz', status: 'Success' },
];

const mockPortfolioSections = [
  { title: 'E-Commerce Ads', count: 12 },
  { title: 'SaaS Creatives', count: 8 },
  { title: 'Fashion & Lifestyle', count: 15 },
];

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
  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}>
    {plan}
  </span>
);

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'requests', icon: Image, label: 'Creative Requests' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'portfolio', icon: Image, label: 'Portfolio' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const filteredRequests = requestFilter === 'all' ? mockRequests : mockRequests.filter(r => r.status === requestFilter);
  const filteredUsers = mockUsers.filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)]";
  const thClass = "text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-4 py-3";
  const tdClass = "px-4 py-3 text-sm text-[#D1D5DB] border-t border-white/[0.04]";

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
                  background: active ? 'rgba(168,85,247,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #A855F7' : '2px solid transparent',
                }}
              >
                <Icon size={16} style={{ color: active ? '#A855F7' : '#9CA3AF' }} />
                <span style={active ? { background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#D1D5DB' }}>
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
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: '247' },
                { label: 'Free Creative Requests', value: '89' },
                { label: 'Total Revenue', value: '₹4,12,000' },
                { label: 'Conversion Rate', value: '36%' },
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Email</th>
                      <th className={thClass}>Plan</th>
                      <th className={thClass}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.slice(0, 4).map((u) => (
                      <tr key={u.email}>
                        <td className={tdClass}>{u.name}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{u.email}</td>
                        <td className={tdClass}><PlanBadge plan={u.plan} /></td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{u.signed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CREATIVE REQUESTS */}
        {tab === 'requests' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">Creative Requests</h2>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'in_progress', 'completed'] as RequestFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setRequestFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                  style={{
                    background: requestFilter === f ? 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(59,130,246,0.2))' : 'rgba(255,255,255,0.04)',
                    border: requestFilter === f ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: requestFilter === f ? '#D1D5DB' : '#9CA3AF',
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['User', 'Brand', 'Niche', 'Format', 'Submitted', 'Status'].map(h => (
                        <th key={h} className={thClass}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r, i) => (
                      <tr key={i}>
                        <td className={tdClass}>{r.user}</td>
                        <td className={tdClass}>{r.brand}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{r.niche}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{r.format}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{r.submitted}</td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.status} />
                            <ChevronDown size={12} className="text-[#6B7280]" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">Payments</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                <Filter size={13} className="text-[#9CA3AF]" />
                <select className="bg-transparent text-sm text-[#D1D5DB] focus:outline-none" style={{ appearance: 'none' }}>
                  <option style={{ background: '#111' }}>All Plans</option>
                  <option style={{ background: '#111' }}>Starter</option>
                  <option style={{ background: '#111' }}>Growth</option>
                  <option style={{ background: '#111' }}>Scale</option>
                </select>
              </div>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['User', 'Plan', 'Amount', 'Date', 'Payment ID', 'Status'].map(h => (
                        <th key={h} className={thClass}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.map((p, i) => (
                      <tr key={i}>
                        <td className={tdClass}>{p.user}</td>
                        <td className={tdClass}><PlanBadge plan={p.plan} /></td>
                        <td className={tdClass + ' font-mono'}>{p.amount}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{p.date}</td>
                        <td className={tdClass + ' font-mono text-[#9CA3AF] text-xs'}>{p.paymentId}</td>
                        <td className={tdClass}>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">Users</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
                <Search size={13} className="text-[#9CA3AF]" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                <Filter size={13} className="text-[#9CA3AF]" />
                <select className="bg-transparent text-sm text-[#D1D5DB] focus:outline-none" style={{ appearance: 'none' }}>
                  <option style={{ background: '#111' }}>All Plans</option>
                  <option style={{ background: '#111' }}>Free</option>
                  <option style={{ background: '#111' }}>Starter</option>
                  <option style={{ background: '#111' }}>Growth</option>
                  <option style={{ background: '#111' }}>Scale</option>
                </select>
              </div>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Plan', 'Signed Up'].map(h => <th key={h} className={thClass}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.email}>
                        <td className={tdClass}>{u.name}</td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{u.email}</td>
                        <td className={tdClass}><PlanBadge plan={u.plan} /></td>
                        <td className={tdClass + ' text-[#9CA3AF]'}>{u.signed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPortfolioSections.map((sec) => (
                <div key={sec.title} className="glass-card rounded-2xl overflow-hidden">
                  <div className="relative bg-white/[0.04] h-32 flex items-center justify-center border-b border-white/[0.06]">
                    <div className="absolute top-3 left-3 w-5 h-5 flex items-center justify-center cursor-grab opacity-40 hover:opacity-80">
                      <span className="text-white text-xs">⠿</span>
                    </div>
                    <Image size={28} className="text-[#6B7280]" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading font-semibold text-white text-sm">{sec.title}</h3>
                      <span className="text-xs text-[#9CA3AF] font-mono">{sec.count} imgs</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary flex-1 justify-center text-xs py-2">Change Thumbnail</button>
                      <button className="btn-primary flex-1 justify-center text-xs py-2">
                        Manage <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                    <div className="border-2 border-dashed border-white/[0.10] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-white/20 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)' }}>
                        <Upload size={18} className="text-[#A855F7]" />
                      </div>
                      <p className="text-[#9CA3AF] text-sm text-center">Click or drag & drop</p>
                      <p className="text-[#6B7280] text-xs">JPG, PNG, WEBP — max 5MB</p>
                    </div>
                    <button onClick={() => setShowAddSection(false)} className="btn-primary w-full justify-center text-sm">
                      Create Section <ArrowRight size={14} />
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
