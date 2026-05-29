import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Users, Settings, LogOut,
  Plus, ArrowRight, Search, Upload, Loader,
  Eye, EyeOff, Trash2, RefreshCw, ChevronLeft, X, CheckCircle, Clock,
  AlertCircle, IndianRupee, Sparkles, Edit2, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Tab = 'overview' | 'requests' | 'payments' | 'users' | 'portfolio' | 'cloutclub' | 'settings';
type RequestFilter = 'all' | 'pending' | 'in_progress' | 'completed';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email?: string | null;
  plan: string;
  clout_club_price: number | null;
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
  creative_url: string;
  creative_caption?: string;
  client_message?: string;
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

interface PortfolioImage {
  id: string;
  section_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#F59E0B', label: 'Pending'     },
  in_progress: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  text: '#3B82F6', label: 'In Progress' },
  completed:   { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', text: '#10B981', label: 'Completed'   },
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const isCloutClub = plan === 'clout_club';
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-md capitalize"
      style={{
        background: isCloutClub ? 'rgba(168,85,247,0.12)' : 'rgba(99,102,241,0.08)',
        border: isCloutClub ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(99,102,241,0.2)',
        color: isCloutClub ? '#C084FC' : '#818CF8'
      }}>
      {isCloutClub ? 'Clout Club' : plan}
    </span>
  );
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatCurrency(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}
function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/portfolio/';
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

// ─── Status dropdown ────────────────────────────────────────────────────────
function StatusDropdown({ request, onUpdate }: {
  request: CreativeRequest;
  onUpdate: (id: string, status: string, creativeUrl?: string, creativeCaption?: string, clientMessage?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [creativeCaption, setCreativeCaption] = useState(request.creative_caption ?? '');
  const [clientMessage, setClientMessage] = useState(request.client_message ?? '');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const s = statusColors[request.status] ?? statusColors.pending;

  function updateDropdownPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropdownPosition({
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 146),
    });
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open]);

  async function handleStatusClick(newStatus: string) {
    setOpen(false);
    if (newStatus === 'completed') {
      setShowUpload(true);
    } else {
      await supabase.from('free_creative_requests').update({ status: newStatus }).eq('id', request.id);
      onUpdate(request.id, newStatus);
    }
  }

  async function handleFileUpload(file: File) {
    if (file.size > 20 * 1024 * 1024) { setUploadError('File too large. Max 20MB.'); return; }
    setUploading(true);
    setUploadError('');
    const ext = file.name.split('.').pop();
    const path = `${request.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('creatives').upload(path, file, { upsert: true });
    if (uploadErr) { setUploadError('Upload failed: ' + uploadErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('creatives').getPublicUrl(path);
    const creative_url = urlData.publicUrl;
    await supabase.from('free_creative_requests').update({ status: 'completed', creative_url, creative_caption: creativeCaption.trim(), client_message: clientMessage.trim() }).eq('id', request.id);
    onUpdate(request.id, 'completed', creative_url, creativeCaption.trim(), clientMessage.trim());
    setUploading(false);
    setShowUpload(false);
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => { updateDropdownPosition(); setOpen(o => !o); }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
          style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
        >
          {s.label}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
        {open && createPortal(
          <div ref={menuRef} className="fixed z-[220] rounded-xl p-1 min-w-[130px] shadow-xl"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left, background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {['pending', 'in_progress', 'completed'].map(st => {
              const sc = statusColors[st];
              return (
                <button key={st} onClick={() => handleStatusClick(st)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2"
                  style={{ color: sc.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.text }} />
                  {sc.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>
      {showUpload && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={() => !uploading && setShowUpload(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card rounded-3xl p-8" style={{ background: 'rgba(12,12,12,0.98)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => !uploading && setShowUpload(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
            <h3 className="font-heading font-bold text-white text-xl mb-1">Upload Creative</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">Upload the finished creative for <span className="text-white font-semibold">{request.brand_name}</span>.</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Creative Caption</label>
                <input type="text" value={creativeCaption} onChange={e => setCreativeCaption(e.target.value)} placeholder="e.g. Product launch creative" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Message for Client</label>
                <textarea value={clientMessage} onChange={e => setClientMessage(e.target.value)} rows={3} placeholder="Add a short note..." className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]" />
              </div>
            </div>
            <div className="border-2 border-dashed border-white/[0.12] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-white/25 transition-colors cursor-pointer mb-4"
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}>
              {uploading ? <><Loader size={24} className="animate-spin text-[#818CF8]" /><p className="text-[#9CA3AF] text-sm">Uploading...</p></> : <><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}><Upload size={20} className="text-[#818CF8]" /></div><p className="text-[#9CA3AF] text-sm text-center">Click or drag & drop the creative file</p><p className="text-[#6B7280] text-xs">Images, videos, ZIP — max 20MB</p></>}
              <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>
            {uploadError && <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3"><AlertCircle size={14} className="text-red-400 flex-shrink-0" /><span className="text-red-300 text-xs">{uploadError}</span></div>}
            <p className="text-[#6B7280] text-xs text-center mt-3">Marked as <span className="text-[#10B981] font-semibold">Completed</span> once uploaded.</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Price editor inline cell ────────────────────────────────────────────────
function PriceEditor({ userId, currentPrice, onSave }: {
  userId: string;
  currentPrice: number | null;
  onSave: (userId: string, price: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPrice ? String(currentPrice / 100) : '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function save() {
    setSaving(true);
    const parsed = value.trim() === '' ? null : Math.round(parseFloat(value) * 100);
    if (parsed !== null && (isNaN(parsed) || parsed <= 0)) { setSaving(false); return; }
    await supabase.from('profiles').update({ clout_club_price: parsed }).eq('id', userId);
    onSave(userId, parsed);
    setEditing(false);
    setSaving(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[#9CA3AF] text-xs">₹</span>
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          placeholder="amount"
          className="w-24 rounded-lg px-2.5 py-1.5 text-xs text-white bg-white/[0.06] border border-white/[0.15] focus:border-[rgba(168,85,247,0.5)] focus:outline-none"
        />
        <button onClick={save} disabled={saving} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
          {saving ? <Loader size={11} className="animate-spin text-[#10B981]" /> : <Check size={11} className="text-[#10B981]" />}
        </button>
        <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X size={11} className="text-[#9CA3AF]" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-2 group">
      {currentPrice
        ? <span className="text-sm font-mono font-semibold" style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{(currentPrice / 100).toLocaleString('en-IN')}/mo</span>
        : <span className="text-xs text-[#6B7280] italic">Set price</span>
      }
      <Edit2 size={11} className="text-[#6B7280] group-hover:text-[#A855F7] transition-colors" />
    </button>
  );
}

// ─── Main Admin component ─────────────────────────────────────────────────────
export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');
  const [userSearch, setUserSearch] = useState('');

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const sectionFileRef = useRef<HTMLInputElement>(null);

  const [managingSection, setManagingSection] = useState<PortfolioSection | null>(null);
  const [sectionImages, setSectionImages] = useState<PortfolioImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [savingCaptionId, setSavingCaptionId] = useState<string | null>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const [overviewStats, setOverviewStats] = useState({ totalUsers: 0, requestsToday: 0, totalRevenue: 0, paidUsers: 0, conversionUsers: 0 });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<CreativeRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [cloutClubUsers, setCloutClubUsers] = useState<Profile[]>([]);
  const [portfolioSections, setPortfolioSections] = useState<PortfolioSection[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [ccSearch, setCcSearch] = useState('');

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  useEffect(() => { loadOverview(); }, []);

  useEffect(() => {
    if (!thumbnailFile) { setThumbnailPreview(''); return; }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  useEffect(() => {
    if (tab === 'requests') loadRequests();
    else if (tab === 'payments') loadPayments();
    else if (tab === 'users') loadUsers();
    else if (tab === 'portfolio') { setManagingSection(null); loadPortfolio(); }
    else if (tab === 'cloutclub') loadCloutClubUsers();
  }, [tab]);

  async function loadOverview() {
    setLoadingTab(true);
    const today = new Date().toISOString().split('T')[0];
    const [{ count: totalUsers }, { count: requestsToday }, { data: paymentsData }, { data: conversionProfiles }, { data: recent }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('free_creative_requests').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('payments').select('amount').eq('status', 'captured'),
      supabase.from('profiles').select('plan'),
      supabase.from('profiles').select('id, full_name, company_name, plan, clout_club_price, created_at').order('created_at', { ascending: false }).limit(10),
    ]);
    const totalRevenue = paymentsData?.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) ?? 0;
    const customerProfiles = (conversionProfiles ?? []).filter((p: { plan: string | null }) => (p.plan ?? 'free').toLowerCase() !== 'admin');
    const paidUsers = customerProfiles.filter((p: { plan: string | null }) => (p.plan ?? 'free').toLowerCase() === 'clout_club').length;
    setOverviewStats({ totalUsers: totalUsers ?? 0, requestsToday: requestsToday ?? 0, totalRevenue, paidUsers, conversionUsers: customerProfiles.length });
    setRecentUsers(recent ?? []);
    setLoadingTab(false);
  }

  async function loadRequests() {
    setLoadingTab(true);
    const { data: rawRequests } = await supabase.from('free_creative_requests').select('*').order('created_at', { ascending: false });
    if (!rawRequests || rawRequests.length === 0) { setRequests([]); setLoadingTab(false); return; }
    const userIds = [...new Set(rawRequests.map((r: { user_id: string }) => r.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, company_name').in('id', userIds);
    const profileMap: Record<string, { full_name: string | null; company_name: string | null }> = {};
    (profiles ?? []).forEach((p: { id: string; full_name: string | null; company_name: string | null }) => { profileMap[p.id] = { full_name: p.full_name, company_name: p.company_name }; });
    setRequests(rawRequests.map((r: CreativeRequest) => ({ ...r, profiles: profileMap[r.user_id] ?? null })));
    setLoadingTab(false);
  }

  async function loadPayments() {
    setLoadingTab(true);
    const { data: rawPayments } = await supabase.from('payments').select('*').eq('status', 'captured').order('created_at', { ascending: false });
    if (!rawPayments || rawPayments.length === 0) { setPayments([]); setLoadingTab(false); return; }
    const userIds = [...new Set(rawPayments.map((p: { user_id: string }) => p.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    const profileMap: Record<string, { full_name: string | null }> = {};
    (profiles ?? []).forEach((p: { id: string; full_name: string | null }) => { profileMap[p.id] = { full_name: p.full_name }; });
    setPayments(rawPayments.map((p: Payment) => ({ ...p, profiles: profileMap[p.user_id] ?? null })));
    setLoadingTab(false);
  }

  async function loadUsers() {
    setLoadingTab(true);
    const { data } = await supabase.from('profiles').select('id, full_name, company_name, plan, clout_club_price, created_at').order('created_at', { ascending: false });
    setUsers((data as Profile[]) ?? []);
    setLoadingTab(false);
  }

  async function loadCloutClubUsers() {
    setLoadingTab(true);
    // Load all non-admin users for Clout Club management
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, plan, clout_club_price, created_at')
      .not('plan', 'eq', 'admin')
      .order('created_at', { ascending: false });
    setCloutClubUsers((data as Profile[]) ?? []);
    setLoadingTab(false);
  }

  async function loadPortfolio() {
    setLoadingTab(true);
    const { data: sections } = await supabase.from('portfolio_sections').select('*, portfolio_images(count)').order('display_order', { ascending: true });
    const mapped = (sections ?? []).map((s: { id: string; title: string; thumbnail_url: string; display_order: number; is_visible: boolean; created_at: string; portfolio_images: { count: number }[] }) => ({
      id: s.id, title: s.title, thumbnail_url: s.thumbnail_url, display_order: s.display_order, is_visible: s.is_visible, created_at: s.created_at, image_count: s.portfolio_images?.[0]?.count ?? 0,
    }));
    setPortfolioSections(mapped);
    setLoadingTab(false);
  }

  function handleRequestUpdate(id: string, status: string, creativeUrl?: string, creativeCaption?: string, clientMessage?: string) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, creative_url: creativeUrl ?? r.creative_url, creative_caption: creativeCaption ?? r.creative_caption, client_message: clientMessage ?? r.client_message } : r));
  }

  async function openImageManager(section: PortfolioSection) {
    setManagingSection(section);
    setLoadingImages(true);
    const { data } = await supabase.from('portfolio_images').select('*').eq('section_id', section.id).order('display_order', { ascending: true });
    setSectionImages((data as PortfolioImage[]) ?? []);
    setLoadingImages(false);
  }

  async function uploadImagesToSection(files: FileList) {
    if (!managingSection || files.length === 0) return;
    setUploadingImages(true);
    const newImages: PortfolioImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue;
      const ext = file.name.split('.').pop();
      const path = `images/${managingSection.id}/${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file);
      if (error) continue;
      const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
      const { data: inserted } = await supabase.from('portfolio_images').insert({ section_id: managingSection.id, image_url: urlData.publicUrl, caption: '', display_order: sectionImages.length + newImages.length }).select().single();
      if (inserted) newImages.push(inserted as PortfolioImage);
    }
    setSectionImages(prev => [...prev, ...newImages]);
    setPortfolioSections(prev => prev.map(s => s.id === managingSection.id ? { ...s, image_count: (s.image_count ?? 0) + newImages.length } : s));
    setUploadingImages(false);
    if (imageUploadRef.current) imageUploadRef.current.value = '';
  }

  async function deleteImage(img: PortfolioImage) {
    setDeletingImageId(img.id);
    const storagePath = storagePathFromUrl(img.image_url);
    if (storagePath) await supabase.storage.from('portfolio').remove([storagePath]);
    await supabase.from('portfolio_images').delete().eq('id', img.id);
    setSectionImages(prev => prev.filter(i => i.id !== img.id));
    setPortfolioSections(prev => prev.map(s => s.id === img.section_id ? { ...s, image_count: Math.max(0, (s.image_count ?? 1) - 1) } : s));
    setDeletingImageId(null);
  }

  async function saveImageCaption(id: string, caption: string) {
    setSavingCaptionId(id);
    await supabase.from('portfolio_images').update({ caption }).eq('id', id);
    setSavingCaptionId(null);
  }

  async function toggleSectionVisibility(id: string, current: boolean) {
    await supabase.from('portfolio_sections').update({ is_visible: !current }).eq('id', id);
    setPortfolioSections(prev => prev.map(s => s.id === id ? { ...s, is_visible: !current } : s));
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section and all its images?')) return;
    const { data: images } = await supabase.from('portfolio_images').select('image_url').eq('section_id', id);
    if (images) {
      const paths = images.map(img => storagePathFromUrl(img.image_url as string)).filter(Boolean) as string[];
      if (paths.length > 0) await supabase.storage.from('portfolio').remove(paths);
    }
    await supabase.from('portfolio_sections').delete().eq('id', id);
    setPortfolioSections(prev => prev.filter(s => s.id !== id));
    if (managingSection?.id === id) setManagingSection(null);
  }

  async function handleAddSection() {
    if (!newSectionName.trim()) return;
    setAddingSection(true);
    let thumbnail_url = '';
    if (thumbnailFile) {
      const ext = thumbnailFile.name.split('.').pop();
      const path = `sections/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, thumbnailFile);
      if (!uploadError) { const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path); thumbnail_url = urlData.publicUrl; }
    }
    const { data } = await supabase.from('portfolio_sections').insert({ title: newSectionName.trim(), thumbnail_url, display_order: portfolioSections.length }).select().single();
    if (data) setPortfolioSections(prev => [...prev, { ...data, image_count: 0 }]);
    setNewSectionName(''); setThumbnailFile(null); setShowAddSection(false); setAddingSection(false);
  }

  function handlePriceSaved(userId: string, price: number | null) {
    setCloutClubUsers(prev => prev.map(u => u.id === userId ? { ...u, clout_club_price: price } : u));
  }

  function exportUsersCSV() {
    const rows = [['Full Name', 'Company', 'Plan', 'Clout Club Price', 'Signed Up']];
    users.forEach(u => rows.push([u.full_name ?? '', u.company_name ?? '', u.plan, u.clout_club_price ? `₹${u.clout_club_price / 100}` : '', formatDate(u.created_at)]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  }

  const conversionRate = overviewStats.conversionUsers > 0 ? ((overviewStats.paidUsers / overviewStats.conversionUsers) * 100).toFixed(1) : '0.0';
  const filteredRequests = requestFilter === 'all' ? requests : requests.filter(r => r.status === requestFilter);
  const filteredUsers = users.filter(u => !userSearch || (u.full_name ?? '').toLowerCase().includes(userSearch.toLowerCase()) || (u.company_name ?? '').toLowerCase().includes(userSearch.toLowerCase()));
  const filteredCCUsers = cloutClubUsers.filter(u => !ccSearch || (u.full_name ?? '').toLowerCase().includes(ccSearch.toLowerCase()) || (u.company_name ?? '').toLowerCase().includes(ccSearch.toLowerCase()));
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
    { id: 'overview',   icon: LayoutDashboard, label: 'Overview'          },
    { id: 'requests',   icon: Image,           label: 'Creative Requests' },
    { id: 'payments',   icon: CreditCard,      label: 'Payments'          },
    { id: 'users',      icon: Users,           label: 'Users'             },
    { id: 'cloutclub',  icon: Sparkles,        label: 'Clout Club'        },
    { id: 'portfolio',  icon: Image,           label: 'Portfolio'         },
    { id: 'settings',   icon: Settings,        label: 'Settings'          },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/"><img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" /></Link>
          <p className="text-[10px] text-[#6B7280] mt-2 font-mono uppercase tracking-wider">Admin Panel</p>
        </div>
        <div className="h-px mx-5 bg-white/[0.06]" />
        <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            const isCC = id === 'cloutclub';
            return (
              <button key={id} onClick={() => setTab(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{ background: active ? (isCC ? 'rgba(168,85,247,0.08)' : 'rgba(99,102,241,0.08)') : 'transparent', borderLeft: active ? `2px solid ${isCC ? '#A855F7' : '#818CF8'}` : '2px solid transparent' }}>
                <Icon size={16} style={{ color: active ? (isCC ? '#A855F7' : '#818CF8') : '#9CA3AF' }} />
                <span style={active ? { background: isCC ? 'linear-gradient(135deg,#A855F7,#06B6D4)' : 'linear-gradient(135deg,#818CF8,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#D1D5DB' }}>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-5 pb-6 pt-4 border-t border-white/[0.06]">
          <p className="text-[#6B7280] text-xs mb-3 truncate">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm"><LogOut size={14} /> Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{ background: tab === id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: tab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)', color: tab === id ? '#818CF8' : '#9CA3AF' }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Overview</h2>
              <button onClick={loadOverview} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{ label: 'Total Users', value: overviewStats.totalUsers.toString() }, { label: 'Requests Today', value: overviewStats.requestsToday.toString() }, { label: 'Total Revenue', value: formatCurrency(overviewStats.totalRevenue) }, { label: 'Clout Club Rate', value: `${conversionRate}%` }].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5">
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className="font-mono font-bold text-xl gradient-text">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]"><h3 className="font-heading font-semibold text-white text-base">Recent Signups</h3></div>
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                : recentUsers.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No users yet.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={thClass}>Name</th><th className={thClass}>Company</th><th className={thClass}>Plan</th><th className={thClass}>Date</th></tr></thead><tbody>{recentUsers.map(u => (<tr key={u.id}><td className={tdClass}>{u.full_name || '—'}</td><td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td><td className={tdClass}><PlanBadge plan={u.plan} /></td><td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td></tr>))}</tbody></table></div>}
            </div>
          </div>
        )}

        {/* CREATIVE REQUESTS */}
        {tab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Creative Requests</h2>
              <button onClick={loadRequests} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'in_progress', 'completed'] as RequestFilter[]).map(f => (
                <button key={f} onClick={() => setRequestFilter(f)} className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                  style={{ background: requestFilter === f ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(59,130,246,0.2))' : 'rgba(255,255,255,0.04)', border: requestFilter === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', color: requestFilter === f ? '#D1D5DB' : '#9CA3AF' }}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                : filteredRequests.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No requests found.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr>{['User','Brand','Niche','Format','Submitted','Creative','Status'].map(h=><th key={h} className={thClass}>{h}</th>)}</tr></thead><tbody>{filteredRequests.map(r=>(<tr key={r.id}><td className={tdClass}>{r.profiles?.full_name||'—'}</td><td className={tdClass}>{r.brand_name}</td><td className={tdClass+' text-[#9CA3AF]'}>{r.niche}</td><td className={tdClass+' text-[#9CA3AF]'}>{r.ad_format}</td><td className={tdClass+' text-[#9CA3AF]'}>{formatDate(r.created_at)}</td><td className={tdClass}>{r.creative_url?<span className="flex items-center gap-1 text-xs text-[#10B981]"><CheckCircle size={12}/> Uploaded</span>:<span className="flex items-center gap-1 text-xs text-[#6B7280]"><Clock size={12}/> Pending</span>}</td><td className={tdClass}><StatusDropdown request={r} onUpdate={handleRequestUpdate}/></td></tr>))}</tbody></table></div>}
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-white text-2xl">Payments</h2>
              <button onClick={loadPayments} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{ label: 'Today', value: formatCurrency(paymentSummary.today) }, { label: 'This Week', value: formatCurrency(paymentSummary.week) }, { label: 'This Month', value: formatCurrency(paymentSummary.month) }, { label: 'All Time', value: formatCurrency(paymentSummary.allTime) }].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5"><p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p><p className="font-mono font-bold text-lg gradient-text">{s.value}</p></div>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                : payments.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No payments yet.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr>{['User','Plan','Amount','Date','Payment ID','Status'].map(h=><th key={h} className={thClass}>{h}</th>)}</tr></thead><tbody>{payments.map(p=>(<tr key={p.id}><td className={tdClass}>{p.profiles?.full_name||'—'}</td><td className={tdClass}><PlanBadge plan={p.plan}/></td><td className={tdClass+' font-mono'}>{formatCurrency(p.amount)}</td><td className={tdClass+' text-[#9CA3AF]'}>{formatDate(p.created_at)}</td><td className={tdClass+' font-mono text-[#9CA3AF] text-xs'}>{p.payment_id||'—'}</td><td className={tdClass}><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',color:'#10B981'}}>Captured</span></td></tr>))}</tbody></table></div>}
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
                <button onClick={loadUsers} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
              </div>
            </div>
            <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
              <Search size={13} className="text-[#9CA3AF]" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search name or company..." className="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1" />
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                : filteredUsers.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No users found.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr>{['Name','Company','Plan','Signed Up'].map(h=><th key={h} className={thClass}>{h}</th>)}</tr></thead><tbody>{filteredUsers.map(u=>(<tr key={u.id}><td className={tdClass}>{u.full_name||'—'}</td><td className={tdClass+' text-[#9CA3AF]'}>{u.company_name||'—'}</td><td className={tdClass}><PlanBadge plan={u.plan}/></td><td className={tdClass+' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td></tr>))}</tbody></table></div>}
            </div>
          </div>
        )}

        {/* CLOUT CLUB MANAGEMENT */}
        {tab === 'cloutclub' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-heading font-bold text-white text-2xl">Clout Club Management</h2>
                <p className="text-[#9CA3AF] text-sm mt-1">Set custom Razorpay pricing for each client. Prices are shown to the client in their dashboard.</p>
              </div>
              <button onClick={loadCloutClubUsers} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>

            {/* Info card */}
            <div className="glass-card rounded-2xl p-5" style={{ borderLeft: '3px solid #A855F7' }}>
              <div className="flex items-start gap-3">
                <IndianRupee size={16} className="text-[#A855F7] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold mb-1">How Clout Club Pricing Works</p>
                  <p className="text-[#9CA3AF] text-xs leading-relaxed">
                    Set a custom monthly price per client (in INR). Once set, the client sees the exact amount in their dashboard with a Razorpay payment button. Until you set a price, they see "Negotiable — contact us". The Razorpay link is generated using your Razorpay Payment Link or UPI QR flow — make sure to keep your Razorpay key configured in your environment.
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
              <Search size={13} className="text-[#9CA3AF]" />
              <input value={ccSearch} onChange={e => setCcSearch(e.target.value)} placeholder="Search by name or company..." className="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[#9CA3AF] text-xs font-medium mb-2">Total Free Users</p>
                <p className="font-mono font-bold text-xl gradient-text">{cloutClubUsers.filter(u => u.plan === 'free').length}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[#9CA3AF] text-xs font-medium mb-2">Clout Club Members</p>
                <p className="font-mono font-bold text-xl" style={{ background: 'linear-gradient(135deg,#A855F7,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{cloutClubUsers.filter(u => u.plan === 'clout_club').length}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <p className="text-[#9CA3AF] text-xs font-medium mb-2">Prices Set</p>
                <p className="font-mono font-bold text-xl gradient-text">{cloutClubUsers.filter(u => u.clout_club_price).length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? (
                <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#A855F7]" /></div>
              ) : filteredCCUsers.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center p-10">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={thClass}>Client</th>
                        <th className={thClass}>Company</th>
                        <th className={thClass}>Current Plan</th>
                        <th className={thClass}>Monthly Price</th>
                        <th className={thClass}>Client View</th>
                        <th className={thClass}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCCUsers.map(u => (
                        <tr key={u.id}>
                          <td className={tdClass}>
                            <div className="font-medium">{u.full_name || '—'}</div>
                          </td>
                          <td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td>
                          <td className={tdClass}><PlanBadge plan={u.plan} /></td>
                          <td className={tdClass}>
                            <PriceEditor
                              userId={u.id}
                              currentPrice={u.clout_club_price}
                              onSave={handlePriceSaved}
                            />
                          </td>
                          <td className={tdClass}>
                            {u.clout_club_price ? (
                              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                                <CheckCircle size={11} /> Shows ₹{(u.clout_club_price / 100).toLocaleString('en-IN')}/mo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}>
                                <Clock size={11} /> Shows "Negotiable"
                              </span>
                            )}
                          </td>
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
            {managingSection ? (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setManagingSection(null)} className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-white transition-colors"><ChevronLeft size={16} /> Back</button>
                  <div className="h-4 w-px bg-white/10" />
                  <h2 className="font-heading font-bold text-white text-xl">{managingSection.title}</h2>
                  <span className="text-xs text-[#6B7280] font-mono ml-auto">{sectionImages.length} image{sectionImages.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-2 border-dashed border-white/[0.10] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => imageUploadRef.current?.click()} onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length > 0) uploadImagesToSection(e.dataTransfer.files); }}>
                  {uploadingImages ? <><Loader size={22} className="animate-spin text-[#818CF8]" /><p className="text-[#9CA3AF] text-sm">Uploading...</p></> : <><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}><Upload size={18} className="text-[#818CF8]" /></div><p className="text-[#9CA3AF] text-sm text-center">Click or drag & drop images here</p><p className="text-[#6B7280] text-xs">JPG, PNG, WEBP — max 5MB each</p></>}
                  <input ref={imageUploadRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => { if (e.target.files) uploadImagesToSection(e.target.files); }} />
                </div>
                {loadingImages ? <div className="flex items-center justify-center p-16"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                  : sectionImages.length === 0 ? <div className="glass-card rounded-2xl p-10 text-center"><p className="text-[#6B7280] text-sm">No images yet.</p></div>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{sectionImages.map(img => (
                    <div key={img.id} className="glass-card rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.035)' }}>
                      <div className="relative group aspect-square" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button onClick={() => deleteImage(img)} disabled={deletingImageId === img.id} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50" style={{ background: 'rgba(239,68,68,0.9)' }}>
                            {deletingImageId === img.id ? <Loader size={14} className="animate-spin text-white" /> : <Trash2 size={14} className="text-white" />}
                          </button>
                        </div>
                      </div>
                      <div className="relative z-10 p-3 space-y-2">
                        <label className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#6B7280] uppercase tracking-[0.08em]">Caption{savingCaptionId === img.id && <Loader size={11} className="animate-spin text-[#818CF8]" />}</label>
                        <textarea value={img.caption ?? ''} onChange={e => setSectionImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))} onBlur={e => saveImageCaption(img.id, e.target.value.trim())} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.blur(); }} placeholder="Add a short caption..." rows={2} className="w-full resize-none rounded-xl px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]" />
                      </div>
                    </div>
                  ))}</div>}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-white text-2xl">Portfolio Manager</h2>
                  <button onClick={() => setShowAddSection(true)} className="btn-primary text-sm"><Plus size={14} /> Add New Section</button>
                </div>
                {loadingTab ? <div className="flex items-center justify-center p-20"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                  : portfolioSections.length === 0 ? <div className="glass-card rounded-2xl p-10 text-center"><p className="text-[#6B7280] text-sm">No portfolio sections yet.</p></div>
                  : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{portfolioSections.map(sec => (
                    <div key={sec.id} className="glass-card rounded-2xl overflow-hidden">
                      <div className="relative bg-white/[0.04] h-36 flex items-center justify-center border-b border-white/[0.06]">
                        {sec.thumbnail_url ? <img src={sec.thumbnail_url} alt={sec.title} className="w-full h-full object-cover" /> : <Image size={28} className="text-[#6B7280]" />}
                        <button onClick={() => toggleSectionVisibility(sec.id, sec.is_visible)} className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {sec.is_visible ? <Eye size={13} className="text-white/60" /> : <EyeOff size={13} className="text-white/30" />}
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading font-semibold text-white text-sm">{sec.title}</h3>
                          <span className="text-xs text-[#9CA3AF] font-mono">{sec.image_count} imgs</span>
                        </div>
                        {!sec.is_visible && <p className="text-[10px] text-[#F59E0B] mb-2 font-semibold uppercase tracking-wider">Hidden from public</p>}
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => deleteSection(sec.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}><Trash2 size={14} className="text-red-400" /></button>
                          <button onClick={() => openImageManager(sec)} className="btn-primary flex-1 justify-center text-xs py-2">Manage Images <ArrowRight size={11} /></button>
                        </div>
                      </div>
                    </div>
                  ))}</div>}
              </>
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

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => { setShowAddSection(false); setThumbnailFile(null); if (sectionFileRef.current) sectionFileRef.current.value = ''; }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card rounded-3xl p-8" style={{ background: 'rgba(12,12,12,0.98)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-white text-xl">Add New Section</h3>
              <button onClick={() => { setShowAddSection(false); setThumbnailFile(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Section Name</label>
                <input type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g. E-Commerce Ads" className={inputClass} />
              </div>
              <div className="border-2 border-dashed border-white/[0.10] rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors" onClick={() => sectionFileRef.current?.click()}>
                {thumbnailPreview ? (
                  <div className="relative aspect-video bg-white/[0.04]"><img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent"><p className="text-[#9CA3AF] text-xs">Click to change</p></div></div>
                ) : (
                  <div className="p-6 flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}><Upload size={18} className="text-[#818CF8]" /></div><p className="text-[#9CA3AF] text-sm text-center">Click to upload thumbnail</p></div>
                )}
                <input ref={sectionFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setThumbnailFile(e.target.files?.[0] ?? null)} />
              </div>
              <button onClick={handleAddSection} disabled={addingSection || !newSectionName.trim()} className="btn-primary w-full justify-center text-sm disabled:opacity-50">
                {addingSection ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                {addingSection ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
