import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Users, Settings, LogOut,
  Plus, ArrowRight, Search, Upload, Loader,
  Eye, EyeOff, Trash2, RefreshCw, ChevronLeft, X, CheckCircle, Clock,
  AlertCircle, IndianRupee, Sparkles, Edit2, Check, MessageSquare,
  Send, Star, TrendingUp, Target, Copy, ChevronDown, ExternalLink,
  Radio, Activity, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NotificationBell } from '../components/NotificationBell';
import { usePushNotifications } from '../hooks/usePushNotifications';

type Tab = 'overview' | 'requests' | 'payments' | 'users' | 'portfolio' | 'cloutclub' | 'messages' | 'settings' | 'leads';
type RequestFilter = 'all' | 'pending' | 'in_progress' | 'completed';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email?: string | null;
  plan: string;
  clout_club_price: number | null;
  created_at: string;
  subscription_expires_at?: string | null;
}

interface ApprovedVision {
  creativeVibe: { label: string; description: string };
  visualDirection: string;
  productColors?: Array<{ name: string; hex: string }>;
  vibeColors?: Array<{ name: string; hex: string }>;
  vibeColorRationale?: string;
  colorStory?: Array<{ name: string; hex: string }>; // legacy fallback
  hook: string;
  adCaption: string;
  whatWeWillCreate: string[];
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
  creative_urls?: string[];
  creative_caption?: string;
  client_message?: string;
  approved_vision?: ApprovedVision | null;
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
  instagram_handle: string;
  instagram_link: string;
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

interface Message {
  id: string;
  user_id: string;
  sender_id: string;
  is_from_admin: boolean;
  content: string;
  type: 'chat' | 'feedback';
  creative_request_id?: string | null;
  is_read: boolean;
  created_at: string;
}

interface LeadResult {
  name: string;
  compositeScore: number;
  scoreBreakdown: {
    creativeVolumeNeed: number;
    capacityGap: number;
    budgetReadiness: number;
    growthStageFit: number;
  };
  whyTheyNeedUs: string;
  scoreRationale: string;
  targetProfile: string;
  whereToFindThem?: string;
  outreachAngle?: string;
  greenFlags?: string[];
  redFlags?: string[];
  outreachMessage?: string;
  // Real contact data from Outscraper
  phone?: string | null;
  website?: string | null;
  instagramHandle?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
}

interface DiscoverResponse {
  leads: LeadResult[];
  source?: 'google_places' | 'ai_archetypes';
}

interface Lead {
  id: string;
  brand_name: string;
  business_name: string | null;
  niche: string | null;
  platform: string | null;
  score: number | null;
  contact_info: string | null;
  status: string;
  notes: string | null;
  outreach_used: string | null;
  created_at: string;
}

interface LeadContact {
  id: string;
  lead_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  instagram_handle: string | null;
  notes: string | null;
  created_at: string;
}

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  selftext: string;
  score: number;
  numComments: number;
  author: string;
  createdUtc: number;
  permalink: string;
  isSelf: boolean;
}

const leadStatusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  prospect:  { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', text: '#818CF8',  label: 'Prospect'  },
  contacted: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', text: '#F59E0B',  label: 'Contacted' },
  responded: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', text: '#3B82F6',  label: 'Responded' },
  converted: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', text: '#10B981', label: 'Converted' },
  lost:      { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   text: '#F87171',  label: 'Lost'      },
};

const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#F59E0B', label: 'Pending'     },
  in_progress: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  text: '#3B82F6', label: 'In Progress' },
  completed:   { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', text: '#10B981', label: 'Completed'   },
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const isCC = plan === 'clout_club';
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-md capitalize"
      style={{ background: isCC ? 'rgba(168,85,247,0.12)' : 'rgba(99,102,241,0.08)', border: isCC ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(99,102,241,0.2)', color: isCC ? '#C084FC' : '#818CF8' }}>
      {isCC ? 'Clout Club' : plan}
    </span>
  );
};

// ─── CustomSelect — dark-themed replacement for native <select> ──────────────
interface SelectOption { value: string; label: string }
const CustomSelect = memo(function CustomSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: SelectOption[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white bg-white/[0.05] border border-white/[0.10] focus:outline-none transition-colors"
        style={{ borderColor: open ? 'rgba(99,102,241,0.5)' : undefined }}>
        <span className={selected ? 'text-white' : 'text-[#6B7280]'}>{selected?.label ?? placeholder ?? 'Select…'}</span>
        <ChevronDown size={12} className="text-[#6B7280] flex-shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && createPortal(
        <div ref={menuRef} className="fixed z-[220] rounded-xl p-1 shadow-2xl overflow-y-auto"
          style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: 220, background: 'rgba(14,12,28,0.98)', border: '1px solid rgba(99,102,241,0.2)' }}>
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: opt.value === value ? '#818CF8' : '#D1D5DB', background: opt.value === value ? 'rgba(99,102,241,0.12)' : 'transparent' }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
});

// Assassin's Creed Brotherhood emblem — hood tip + swept wings + triangular inner opening
function AssassinIcon({ size = 16, style, className }: { size?: number | string; style?: React.CSSProperties; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="
        M12 1.5 L13.8 5.5 L22 8 L16.2 11.2 L14.2 22.5 L12 20.8 L9.8 22.5 L7.8 11.2 L2 8 L10.2 5.5 Z
        M12 7 L10.6 11 L13.4 11 Z
      " />
    </svg>
  );
}

const ScoreBar = memo(function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F87171';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-6 text-right flex-shrink-0" style={{ color }}>{value}</span>
    </div>
  );
});

const LeadStatusDropdown = memo(function LeadStatusDropdown({ lead, onUpdate }: {
  lead: Lead;
  onUpdate: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, flipUp: false });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sc = leadStatusColors[lead.status] ?? leadStatusColors.prospect;

  // Approximate menu height: 5 options × 32px + 8px padding
  const MENU_H = 168;

  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const flipUp = window.innerHeight - rect.bottom < MENU_H + 8;
      setPos({
        top: flipUp ? rect.top - MENU_H - 4 : rect.bottom + 4,
        left: rect.left,
        flipUp,
      });
    }
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
        {sc.label} <ChevronDown size={9} style={{ transform: pos.flipUp && open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && createPortal(
        <div ref={menuRef} className="fixed z-[220] rounded-xl p-1 min-w-[130px] shadow-xl"
          style={{ top: pos.top, left: pos.left, background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {Object.entries(leadStatusColors).map(([status, colors]) => (
            <button key={status} onClick={() => { onUpdate(lead.id, status); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2"
              style={{ color: colors.text }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.text }} />
              {colors.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
});

// ── DiscoverLeadCard — memo so it doesn't re-render on parent form changes ────
const DiscoverLeadCard = memo(function DiscoverLeadCard({
  lead, onSave,
}: {
  lead: LeadResult;
  onSave: (lead: LeadResult) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scoreColor = lead.compositeScore >= 8 ? '#10B981' : lead.compositeScore >= 5 ? '#F59E0B' : '#F87171';

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(p => (p === id ? null : p)), 1800);
    } catch { /* silent */ }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-4 flex items-start justify-between gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-white font-heading font-bold text-base">{lead.name}</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">Fit analysis for CloutKart</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-mono font-bold text-2xl leading-none" style={{ color: scoreColor }}>{lead.compositeScore}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">/ 10</p>
          </div>
          <button onClick={() => onSave(lead)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8' }}>
            <Plus size={11} /> Save
          </button>
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Score Breakdown</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              ['Creative Volume Need', lead.scoreBreakdown.creativeVolumeNeed],
              ['Capacity Gap', lead.scoreBreakdown.capacityGap],
              ['Budget Readiness', lead.scoreBreakdown.budgetReadiness],
              ['Growth Stage Fit', lead.scoreBreakdown.growthStageFit],
            ] as [string, number][]).map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] text-[#9CA3AF] mb-1">{label}</p>
                <ScoreBar value={val} />
              </div>
            ))}
          </div>
        </div>
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Why They Need CloutKart</p>
          <p className="text-[#D1D5DB] text-sm leading-relaxed">{lead.whyTheyNeedUs}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Score Rationale</p>
          <p className="text-[#9CA3AF] text-xs leading-relaxed italic">{lead.scoreRationale}</p>
        </div>
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Target Profile</p>
            <p className="text-[#D1D5DB] text-xs leading-relaxed">{lead.targetProfile}</p>
          </div>
          {lead.whereToFindThem && (
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Where to Find Them</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.whereToFindThem.split(/\s+/).map((token, i) =>
                  token.startsWith('#') ? (
                    <a key={i}
                      href={`https://www.instagram.com/explore/tags/${token.slice(1)}/`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors"
                      style={{ background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}
                    >{token}</a>
                  ) : token ? (
                    <span key={i} className="text-[#9CA3AF] text-[11px]">{token}</span>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
        {lead.outreachAngle && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <Send size={12} className="text-[#818CF8] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[#818CF8] uppercase tracking-widest mb-0.5">Outreach Angle</p>
              <p className="text-[#C4C4E0] text-xs leading-relaxed">{lead.outreachAngle}</p>
            </div>
          </div>
        )}
        {(lead.phone || lead.website || lead.instagramHandle || lead.address) && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Contact Info</p>
            <div className="space-y-1.5">
              {lead.phone && (
                <div className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase w-16 flex-shrink-0">Phone</span>
                    <span className="text-[#D1D5DB] text-xs">{lead.phone}</span>
                  </div>
                  <button onClick={() => copy(lead.phone!, 'ph')} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: copiedId === 'ph' ? '#10B981' : '#6B7280' }}>
                    <Copy size={11} />
                  </button>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase w-16 flex-shrink-0">Website</span>
                    <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer"
                      className="text-[#818CF8] text-xs hover:underline truncate max-w-[180px]">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </div>
                  <button onClick={() => copy(lead.website!, 'web')} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: copiedId === 'web' ? '#10B981' : '#6B7280' }}>
                    <Copy size={11} />
                  </button>
                </div>
              )}
              {lead.instagramHandle && (
                <div className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase w-16 flex-shrink-0">Instagram</span>
                    <a href={lead.instagramHandle} target="_blank" rel="noopener noreferrer"
                      className="text-[#818CF8] text-xs hover:underline truncate max-w-[180px]">{lead.instagramHandle.replace('https://www.instagram.com/', '@').replace(/\/$/, '')}</a>
                  </div>
                  <button onClick={() => copy(lead.instagramHandle!, 'ig')} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: copiedId === 'ig' ? '#10B981' : '#6B7280' }}>
                    <Copy size={11} />
                  </button>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase w-16 flex-shrink-0">Location</span>
                  <span className="text-[#9CA3AF] text-xs">{lead.address}</span>
                </div>
              )}
              {lead.googleMapsUrl && (
                <a href={lead.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1" style={{ color: '#10B981' }}>
                  View on Google Maps →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ── KanbanCard — single lead card in the Mission Log Kanban board ─────────────
const KanbanCard = memo(function KanbanCard({ lead, onStatusUpdate, onNotesUpdate, onViewContacts, onDelete }: {
  lead: Lead;
  onStatusUpdate: (id: string, status: string) => void;
  onNotesUpdate: (id: string, notes: string) => void;
  onViewContacts: (lead: Lead) => void;
  onDelete: (id: string) => void;
}) {
  const scoreColor = lead.score !== null ? (lead.score >= 8 ? '#10B981' : lead.score >= 5 ? '#F59E0B' : '#F87171') : '#6B7280';
  return (
    <div className="rounded-xl p-3 space-y-2.5 group" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">{lead.brand_name}</p>
          {lead.business_name && <p className="text-[#6B7280] text-[10px] mt-0.5 truncate">{lead.business_name}</p>}
        </div>
        {lead.score !== null && (
          <span className="font-mono text-sm font-bold flex-shrink-0" style={{ color: scoreColor }}>{lead.score}</span>
        )}
      </div>
      {(lead.niche || lead.platform) && (
        <p className="text-[#6B7280] text-[11px] capitalize">
          {[lead.niche, lead.platform?.replace('_', ' ')].filter(Boolean).join(' · ')}
        </p>
      )}
      <input
        defaultValue={lead.notes ?? ''}
        onBlur={e => onNotesUpdate(lead.id, e.target.value)}
        placeholder="Add notes…"
        className="w-full bg-transparent text-[11px] text-[#9CA3AF] placeholder-[#4B5563] focus:outline-none focus:text-white transition-colors"
      />
      <div className="flex items-center justify-between pt-0.5">
        <LeadStatusDropdown lead={lead} onUpdate={onStatusUpdate} />
        <div className="flex items-center gap-1">
          <button onClick={() => onViewContacts(lead)} title="View contacts"
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
            <Users size={11} />
          </button>
          <a
            href={`https://www.facebook.com/ads/library/?ad_type=all&country=ALL&q=${encodeURIComponent(lead.brand_name)}&search_type=keyword_unordered`}
            target="_blank" rel="noopener noreferrer"
            title="Check Meta Ad Library"
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(24,119,242,0.1)', color: '#60A5FA' }}>
            <ExternalLink size={11} />
          </a>
          <button onClick={() => onDelete(lead.id)} title="Delete"
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171' }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
});

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
function subDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

function getGreeting(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}`;
}

// ─── Vision Modal ────────────────────────────────────────────────────────────
function VisionModal({ vision, brandName, onClose }: { vision: ApprovedVision; brandName: string; onClose: () => void }) {
  const sectionLabel = "text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.12em] mb-2 block";
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(12,8,24,0.98)', border: '1px solid rgba(168,85,247,0.25)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between border-b z-10"
          style={{ borderColor: 'rgba(168,85,247,0.15)', background: 'rgba(12,8,24,0.98)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#C084FC]" />
            <div>
              <h3 className="font-heading font-bold text-white text-base">Approved Vision</h3>
              <p className="text-[#9CA3AF] text-xs">{brandName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
              <Sparkles size={9} />
              Pixie · AI Creative Intelligence
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Creative Vibe */}
          <div>
            <span className={sectionLabel}>Creative Vibe</span>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#C084FC' }}>
                {vision.creativeVibe.label}
              </span>
              <p className="text-[#D1D5DB] text-sm leading-relaxed">{vision.creativeVibe.description}</p>
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Visual Direction */}
          <div>
            <span className={sectionLabel}>Visual Direction</span>
            <p className="text-[#D1D5DB] text-sm leading-relaxed">{vision.visualDirection}</p>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Product Colors */}
          <div>
            <span className={sectionLabel}>Product Colors</span>
            <div className="flex gap-4 flex-wrap">
              {(vision.productColors ?? vision.colorStory ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0" style={{ background: c.hex }} />
                  <div>
                    <p className="text-[#E5E7EB] text-xs font-medium">{c.name}</p>
                    <p className="text-[#6B7280] text-[10px] font-mono">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(vision.vibeColors ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={sectionLabel} style={{ marginBottom: 0 }}>Vibe Colors</span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
                  Campaign Atmosphere
                </span>
              </div>
              <div className="flex gap-4 flex-wrap mb-2">
                {(vision.vibeColors ?? []).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0" style={{ background: c.hex }} />
                    <div>
                      <p className="text-[#E5E7EB] text-xs font-medium">{c.name}</p>
                      <p className="text-[#6B7280] text-[10px] font-mono">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
              {vision.vibeColorRationale && (
                <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgba(192,132,252,0.7)' }}>
                  {vision.vibeColorRationale}
                </p>
              )}
            </div>
          )}

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Hook */}
          <div>
            <span className={sectionLabel}>Hook</span>
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}>
              <p className="text-white font-heading font-bold text-base leading-snug">{vision.hook}</p>
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Ad Caption */}
          <div>
            <span className={sectionLabel}>Ad Caption</span>
            <p className="text-[#D1D5DB] text-sm leading-relaxed">{vision.adCaption}</p>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* What We Will Create */}
          <div>
            <span className={sectionLabel}>What We Will Create</span>
            <div className="space-y-2">
              {vision.whatWeWillCreate.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                  <p className="text-[#D1D5DB] text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Status dropdown ────────────────────────────────────────────────────────
interface StagedFile { url: string; storagePath: string; fileName: string; }

function isImageFileName(name: string) { return /\.(apng|avif|gif|jpe?g|png|webp)$/i.test(name); }
function isVideoFileName(name: string) { return /\.(mp4|mov|webm|avi|m4v|mkv|ogv)$/i.test(name); }

function FileThumb({ file, onRemove }: { file: StagedFile; onRemove: () => void }) {
  const isImg = isImageFileName(file.fileName);
  const isVid = isVideoFileName(file.fileName);
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.10] bg-white/[0.04] flex flex-col" style={{ width: 120, flexShrink: 0 }}>
      <div className="relative w-full" style={{ height: 80 }}>
        {isImg ? (
          <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
        ) : isVid ? (
          <video src={file.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload size={22} className="text-[#818CF8] opacity-60" />
          </div>
        )}
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X size={10} className="text-white" />
        </button>
      </div>
      <p className="text-[#9CA3AF] text-[10px] px-2 py-1.5 truncate">{file.fileName}</p>
    </div>
  );
}

function StatusDropdown({ request, onUpdate }: {
  request: CreativeRequest;
  onUpdate: (id: string, status: string, creativeUrl?: string, creativeCaption?: string, clientMessage?: string, creativeUrls?: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [stagingFile, setStagingFile] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [creativeCaption, setCreativeCaption] = useState(request.creative_caption ?? '');
  const [clientMessage, setClientMessage] = useState(request.client_message ?? '');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const s = statusColors[request.status] ?? statusColors.pending;

  function updateDropdownPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropdownPosition({ top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 146) });
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => { window.removeEventListener('resize', updateDropdownPosition); window.removeEventListener('scroll', updateDropdownPosition, true); };
  }, [open]);

  async function handleStatusClick(newStatus: string) {
    setOpen(false);
    if (newStatus === 'completed') { setStagedFiles([]); setUploadError(''); setShowUpload(true); return; }
    await supabase.from('free_creative_requests').update({ status: newStatus }).eq('id', request.id);
    onUpdate(request.id, newStatus);
  }

  async function stageFile(file: File) {
    if (file.size > 20 * 1024 * 1024) { setUploadError('File too large. Max 20MB.'); return; }
    setStagingFile(true); setUploadError('');
    const ext = file.name.split('.').pop();
    const path = `${request.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('creatives').upload(path, file, { upsert: true });
    if (error) { setUploadError('Upload failed: ' + error.message); setStagingFile(false); return; }
    const { data: urlData } = supabase.storage.from('creatives').getPublicUrl(path);
    setStagedFiles(prev => [...prev, { url: urlData.publicUrl, storagePath: path, fileName: file.name }]);
    setStagingFile(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function removeStagedFile(idx: number) {
    const f = stagedFiles[idx];
    await supabase.storage.from('creatives').remove([f.storagePath]);
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function confirmAndPost() {
    if (stagedFiles.length === 0) { setUploadError('Please add at least one file.'); return; }
    setConfirming(true);
    const urls = stagedFiles.map(f => f.url);
    const { error } = await supabase.from('free_creative_requests').update({
      status: 'completed',
      creative_url: urls[0],
      creative_urls: urls,
      creative_caption: creativeCaption.trim(),
      client_message: clientMessage.trim(),
    }).eq('id', request.id);
    if (error) {
      setUploadError(`DB update failed: ${error.message}`);
      setConfirming(false);
      return;
    }
    onUpdate(request.id, 'completed', urls[0], creativeCaption.trim(), clientMessage.trim(), urls);
    setConfirming(false);
    setShowUpload(false);
    setStagedFiles([]);
  }

  function closeModal() {
    if (stagingFile || confirming) return;
    setShowUpload(false);
    setStagedFiles([]);
    setUploadError('');
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button ref={buttonRef} onClick={() => { updateDropdownPosition(); setOpen(o => !o); }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
          style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
          {s.label}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
        {open && createPortal(
          <div ref={menuRef} className="fixed z-[220] rounded-xl p-1 min-w-[130px] shadow-xl"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left, background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['pending', 'in_progress', 'completed'] as const).map(st => {
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
          </div>, document.body
        )}
      </div>

      {showUpload && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-8 max-h-[92vh] overflow-y-auto" style={{ background: 'rgba(12,12,12,0.98)' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
            <h3 className="font-heading font-bold text-white text-xl mb-1">Upload Creatives</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">Add one or more files for <span className="text-white font-semibold">{request.brand_name}</span>. Review before posting.</p>

            {/* Caption + message */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Creative Caption</label>
                <input type="text" value={creativeCaption} onChange={e => setCreativeCaption(e.target.value)} placeholder="e.g. Product launch creative" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Message for Client</label>
                <textarea value={clientMessage} onChange={e => setClientMessage(e.target.value)} rows={2} placeholder="Add a short note..." className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]" />
              </div>
            </div>

            {/* Staged files preview */}
            {stagedFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2">
                  Files to post ({stagedFiles.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                  {stagedFiles.map((f, idx) => (
                    <FileThumb key={idx} file={f} onRemove={() => removeStagedFile(idx)} />
                  ))}
                </div>
              </div>
            )}

            {/* Drop zone */}
            <div
              className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer mb-4"
              style={{ borderColor: stagingFile ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)' }}
              onClick={() => !stagingFile && fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && !stagingFile) stageFile(f); }}>
              {stagingFile ? (
                <><Loader size={22} className="animate-spin text-[#818CF8]" /><p className="text-[#9CA3AF] text-sm">Uploading file…</p></>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Upload size={18} className="text-[#818CF8]" />
                  </div>
                  <p className="text-[#9CA3AF] text-sm text-center">{stagedFiles.length > 0 ? 'Add another file' : 'Click or drag & drop a file'}</p>
                  <p className="text-[#6B7280] text-xs">Images, videos, ZIP — max 20MB each</p>
                </>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) stageFile(f); }} />
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3 mb-4">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-xs">{uploadError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={confirmAndPost}
                disabled={stagedFiles.length === 0 || confirming || stagingFile}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: stagedFiles.length > 0 && !confirming && !stagingFile ? 'linear-gradient(135deg,rgba(99,102,241,0.9),rgba(59,130,246,0.9))' : 'rgba(255,255,255,0.06)',
                  color: stagedFiles.length > 0 && !confirming && !stagingFile ? '#fff' : '#6B7280',
                  cursor: stagedFiles.length === 0 || confirming || stagingFile ? 'not-allowed' : 'pointer',
                }}>
                {confirming ? <><Loader size={14} className="animate-spin" />Posting…</> : <><CheckCircle size={14} />Post {stagedFiles.length > 0 ? `${stagedFiles.length} Creative${stagedFiles.length > 1 ? 's' : ''}` : 'Creatives'}</>}
              </button>
              <button
                onClick={closeModal}
                disabled={stagingFile || confirming}
                className="px-5 py-3 rounded-2xl text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  );
}

// ─── Price editor ────────────────────────────────────────────────────────────
function PriceEditor({ userId, currentPrice, onSave }: {
  userId: string; currentPrice: number | null;
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
    onSave(userId, parsed); setEditing(false); setSaving(false);
  }

  if (editing) return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#9CA3AF] text-xs">₹</span>
      <input ref={inputRef} type="number" value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        placeholder="amount" className="w-24 rounded-lg px-2.5 py-1.5 text-xs text-white bg-white/[0.06] border border-white/[0.15] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
      <button onClick={save} disabled={saving} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
        {saving ? <Loader size={11} className="animate-spin text-[#10B981]" /> : <Check size={11} className="text-[#10B981]" />}
      </button>
      <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <X size={11} className="text-[#9CA3AF]" />
      </button>
    </div>
  );

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

// ─── Subscription expiry editor ──────────────────────────────────────────────
function ExpiryEditor({ userId, currentExpiry, onSave }: {
  userId: string; currentExpiry: string | null;
  onSave: (userId: string, expiry: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentExpiry ? currentExpiry.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function save() {
    setSaving(true);
    const newExpiry = value ? new Date(value + 'T23:59:59Z').toISOString() : null;
    await supabase.from('profiles').update({ subscription_expires_at: newExpiry }).eq('id', userId);
    onSave(userId, newExpiry); setEditing(false); setSaving(false);
  }

  if (editing) return (
    <div className="flex items-center gap-1.5">
      <input ref={inputRef} type="date" value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        className="rounded-lg px-2 py-1.5 text-xs text-white bg-white/[0.06] border border-white/[0.15] focus:border-[rgba(168,85,247,0.5)] focus:outline-none"
        style={{ colorScheme: 'dark', width: 120 }} />
      <button onClick={save} disabled={saving} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
        {saving ? <Loader size={11} className="animate-spin text-[#10B981]" /> : <Check size={11} className="text-[#10B981]" />}
      </button>
      <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <X size={11} className="text-[#9CA3AF]" />
      </button>
    </div>
  );

  const d = currentExpiry ? subDaysLeft(currentExpiry) : null;
  return (
    <button onClick={() => { setValue(currentExpiry ? currentExpiry.split('T')[0] : ''); setEditing(true); }} className="flex items-center gap-2 group">
      <div className="flex flex-col gap-0.5 items-start">
        {currentExpiry ? (
          <>
            <span className="text-xs font-mono" style={{ color: d !== null && d <= 0 ? '#F87171' : d !== null && d <= 7 ? '#F59E0B' : '#D1D5DB' }}>
              {new Date(currentExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: d !== null && d <= 0 ? '#F87171' : d !== null && d <= 7 ? '#F59E0B' : '#10B981' }}>
              {d !== null && d <= 0 ? 'Expired' : `${d}d left`}
            </span>
          </>
        ) : (
          <span className="text-xs text-[#6B7280] italic">Set date</span>
        )}
      </div>
      <Edit2 size={11} className="text-[#6B7280] group-hover:text-[#A855F7] transition-colors flex-shrink-0" />
    </button>
  );
}

// ─── Constants (outside component to avoid recreation on every render) ────────
const DISCOVER_DEFAULTS = {
  local:  { niche: '', city: '', stage: 'early_0_1yr',   geography: 'india', platform: 'instagram_dm', budget: 'lt_50k',  followers: '0_5k',   funding: 'bootstrapped', runningAds: 'no_ads',      creativeSetup: 'founder_diy', painPoint: 'cant_afford_agency', employeeRange: '1-10' },
  growth: { niche: '', city: '', stage: 'growing_1_3yr', geography: 'india', platform: 'instagram_dm', budget: '50k_2l', followers: '5k_25k', funding: 'bootstrapped', runningAds: 'inconsistent', creativeSetup: 'founder_diy', painPoint: 'ads_not_converting',  employeeRange: '1-10' },
} as const;
const DEFAULT_SCORE_FORM    = { brandName: '', brandUrl: '', niche: '', platform: 'instagram_dm' };
const DEFAULT_ADD_LEAD_FORM = { brand_name: '', business_name: '', niche: '', platform: 'instagram_dm', score: '', contact_info: '', status: 'prospect', notes: '', outreach_used: '' };
const DEFAULT_CONTACT_FORM  = { name: '', role: '', email: '', phone: '', linkedin_url: '', instagram_handle: '', notes: '' };

// ─── Main Admin component ─────────────────────────────────────────────────────
export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  usePushNotifications(user?.id ?? null, true);
  const [tab, setTab] = useState<Tab>('overview');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');
  const [userSearch, setUserSearch] = useState('');

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionHandle, setNewSectionHandle] = useState('');
  const [newSectionLink, setNewSectionLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const sectionFileRef = useRef<HTMLInputElement>(null);

  const [igEditId, setIgEditId] = useState<string | null>(null);
  const [igEditHandle, setIgEditHandle] = useState('');
  const [igEditLink, setIgEditLink] = useState('');
  const [savingIg, setSavingIg] = useState(false);

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
  const [visionRequest, setVisionRequest] = useState<CreativeRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [cloutClubUsers, setCloutClubUsers] = useState<Profile[]>([]);
  const [portfolioSections, setPortfolioSections] = useState<PortfolioSection[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [ccSearch, setCcSearch] = useState('');
  const [adminProfile, setAdminProfile] = useState<{ full_name: string | null } | null>(null);

  // Messages state
  const [msgUsers, setMsgUsers] = useState<Profile[]>([]);
  const [selectedMsgUser, setSelectedMsgUser] = useState<Profile | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [userCreatives, setUserCreatives] = useState<CreativeRequest[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [msgFilter, setMsgFilter] = useState<'all' | 'chat' | 'feedback'>('all');
  const [msgSearch, setMsgSearch] = useState('');
  const [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Ref so the realtime handler always sees the latest selected user without re-subscribing
  const selectedMsgUserRef = useRef<Profile | null>(null);

  // Lead Agent state
  const [discoverMode, setDiscoverMode] = useState<'local' | 'growth'>('local');
  const [discoverForm, setDiscoverForm] = useState({ ...DISCOVER_DEFAULTS.local });
  const [discovering, setDiscovering] = useState(false);
  const [discoverResults, setDiscoverResults] = useState<LeadResult[]>([]);
  const [discoverSource, setDiscoverSource] = useState<'google_places' | 'ai_archetypes' | null>(null);
  const [discoverError, setDiscoverError] = useState('');

  const [scoreForm, setScoreForm] = useState({ ...DEFAULT_SCORE_FORM });
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<LeadResult | null>(null);
  const [scoreError, setScoreError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [addLeadForm, setAddLeadForm] = useState({ ...DEFAULT_ADD_LEAD_FORM });
  const [savingLead, setSavingLead] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Lead contacts state
  const [contactsLead, setContactsLead] = useState<Lead | null>(null);
  const [leadContacts, setLeadContacts] = useState<LeadContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [fetchingContacts, setFetchingContacts] = useState(false);
  const [hunterDomain, setHunterDomain] = useState('');
  const [contactForm, setContactForm] = useState({ ...DEFAULT_CONTACT_FORM });
  const [showAddContact, setShowAddContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Social Listening state
  const [leadsSubTab, setLeadsSubTab] = useState<'operations' | 'listening'>('operations');
  const [redditSubreddits, setRedditSubreddits] = useState<string[]>(['ecommerce', 'smallbusiness']);
  const [redditKeywords, setRedditKeywords] = useState('marketing agency OR social media manager OR creative agency');
  const [redditTimeframe, setRedditTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [redditResults, setRedditResults] = useState<RedditPost[]>([]);
  const [searchingReddit, setSearchingReddit] = useState(false);
  const [redditError, setRedditError] = useState('');
  const [igAuditForm, setIgAuditForm] = useState({ handle: '', followers: '', lastPostDays: '', postsPerWeek: '', avgLikes: '' });
  const [igAuditScore, setIgAuditScore] = useState<{ score: number; signals: string[]; verdict: string } | null>(null);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  useEffect(() => { loadOverview(); loadAdminProfile(); }, []);

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
    else if (tab === 'messages') loadMessageUsers();
    else if (tab === 'leads') loadLeads();
    else if (tab === 'overview') loadOverview();
  }, [tab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  // Keep ref in sync so the realtime handler always sees current selection
  useEffect(() => {
    selectedMsgUserRef.current = selectedMsgUser;
  }, [selectedMsgUser]);

  // Real-time subscription for the Messages tab — subscribe once, stays alive while on tab
  useEffect(() => {
    if (tab !== 'messages') return;
    const channel = supabase.channel('admin-messages-rt')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const incoming = payload.new as Message;

        // If this message belongs to the open thread, append it (deduplicated)
        if (selectedMsgUserRef.current?.id === incoming.user_id) {
          setThreadMessages(prev =>
            prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }

        // Increment unread badge for client messages — unless admin is already viewing that thread
        if (!incoming.is_from_admin) {
          if (selectedMsgUserRef.current?.id === incoming.user_id) {
            // Admin is actively viewing this thread, mark it read immediately
            supabase.from('messages').update({ is_read: true }).eq('id', incoming.id);
          } else {
            setUnreadByUser(prev => ({
              ...prev,
              [incoming.user_id]: (prev[incoming.user_id] ?? 0) + 1,
            }));
          }
          // Ensure this user appears in the member list
          setMsgUsers(prev =>
            prev.some(u => u.id === incoming.user_id) ? prev : prev
            // Full profile fetch happens on loadMessageUsers; just keep existing list for now
          );
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab]);

  async function loadAdminProfile() {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    setAdminProfile(data);
  }

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
    const { data } = await supabase.from('profiles').select('id, full_name, company_name, plan, clout_club_price, created_at, subscription_expires_at').not('plan', 'eq', 'admin').order('created_at', { ascending: false });
    setCloutClubUsers((data as Profile[]) ?? []);
    setLoadingTab(false);
  }

  async function loadPortfolio() {
    setLoadingTab(true);
    const { data: sections } = await supabase.from('portfolio_sections').select('*, portfolio_images(count)').order('display_order', { ascending: true });
    const mapped = (sections ?? []).map((s: { id: string; title: string; thumbnail_url: string; instagram_handle: string; instagram_link: string; display_order: number; is_visible: boolean; created_at: string; portfolio_images: { count: number }[] }) => ({
      id: s.id, title: s.title, thumbnail_url: s.thumbnail_url, instagram_handle: s.instagram_handle ?? '', instagram_link: s.instagram_link ?? '', display_order: s.display_order, is_visible: s.is_visible, created_at: s.created_at, image_count: s.portfolio_images?.[0]?.count ?? 0,
    }));
    setPortfolioSections(mapped);
    setLoadingTab(false);
  }

  async function loadMessageUsers() {
    setLoadingTab(true);
    // Load CC users who have sent messages
    const { data: msgs } = await supabase.from('messages').select('user_id, is_read, is_from_admin').order('created_at', { ascending: false });
    if (!msgs || msgs.length === 0) { setMsgUsers([]); setLoadingTab(false); return; }

    const userIds = [...new Set((msgs as { user_id: string }[]).map(m => m.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, company_name, plan, clout_club_price, created_at').in('id', userIds);

    // Count unread (client messages not yet replied = is_from_admin=false is what admin needs to read)
    const unread: Record<string, number> = {};
    (msgs as { user_id: string; is_read: boolean; is_from_admin: boolean }[]).forEach(m => {
      if (!m.is_from_admin && !m.is_read) {
        unread[m.user_id] = (unread[m.user_id] ?? 0) + 1;
      }
    });

    setUnreadByUser(unread);
    setMsgUsers((profiles as Profile[]) ?? []);
    setLoadingTab(false);
  }

  async function openThread(u: Profile) {
    setSelectedMsgUser(u);
    setLoadingThread(true);
    const [{ data: msgs }, { data: creatives }] = await Promise.all([
      supabase.from('messages').select('*').eq('user_id', u.id).order('created_at', { ascending: true }),
      supabase.from('free_creative_requests').select('*').eq('user_id', u.id),
    ]);
    setThreadMessages((msgs as Message[]) ?? []);
    setUserCreatives((creatives as CreativeRequest[]) ?? []);
    setLoadingThread(false);

    // Mark client messages as read
    await supabase.from('messages').update({ is_read: true }).eq('user_id', u.id).eq('is_from_admin', false);
    setUnreadByUser(prev => ({ ...prev, [u.id]: 0 }));
  }

  async function sendReply() {
    if (!replyText.trim() || !selectedMsgUser || !user) return;
    setSendingReply(true);
    setReplyError('');
    const { data: inserted, error } = await supabase.from('messages').insert({
      user_id: selectedMsgUser.id,
      sender_id: user.id,
      is_from_admin: true,
      content: replyText.trim(),
      type: 'chat',
    }).select().single();
    if (error) {
      console.error('Reply error:', error.message, error.code);
      setReplyError(error.code === '42P01'
        ? 'Messages table not found — run the migration in Supabase SQL Editor first.'
        : `Failed to send: ${error.message}`);
    } else if (inserted) {
      setThreadMessages(prev => [...prev, inserted as Message]);
      setReplyText('');
    }
    setSendingReply(false);
  }

  function handleRequestUpdate(id: string, status: string, creativeUrl?: string, creativeCaption?: string, clientMessage?: string, creativeUrls?: string[]) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, creative_url: creativeUrl ?? r.creative_url, creative_urls: creativeUrls ?? r.creative_urls, creative_caption: creativeCaption ?? r.creative_caption, client_message: clientMessage ?? r.client_message } : r));
  }

  async function openImageManager(section: PortfolioSection) {
    setManagingSection(section); setLoadingImages(true);
    const { data } = await supabase.from('portfolio_images').select('*').eq('section_id', section.id).order('display_order', { ascending: true });
    setSectionImages((data as PortfolioImage[]) ?? []); setLoadingImages(false);
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
    const { data } = await supabase.from('portfolio_sections').insert({
      title: newSectionName.trim(),
      thumbnail_url,
      instagram_handle: newSectionHandle.trim(),
      instagram_link: newSectionLink.trim(),
      display_order: portfolioSections.length,
    }).select().single();
    if (data) setPortfolioSections(prev => [...prev, { ...data, instagram_handle: data.instagram_handle ?? '', instagram_link: data.instagram_link ?? '', image_count: 0 }]);
    setNewSectionName(''); setNewSectionHandle(''); setNewSectionLink(''); setThumbnailFile(null); setShowAddSection(false); setAddingSection(false);
  }

  async function saveInstagramInfo(id: string, handle: string, link: string) {
    setSavingIg(true);
    await supabase.from('portfolio_sections').update({ instagram_handle: handle.trim(), instagram_link: link.trim() }).eq('id', id);
    setPortfolioSections(prev => prev.map(s => s.id === id ? { ...s, instagram_handle: handle.trim(), instagram_link: link.trim() } : s));
    setSavingIg(false);
    setIgEditId(null);
  }

  function handlePriceSaved(userId: string, price: number | null) {
    setCloutClubUsers(prev => prev.map(u => u.id === userId ? { ...u, clout_club_price: price } : u));
  }

  function handleExpirySaved(userId: string, expiry: string | null) {
    setCloutClubUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_expires_at: expiry } : u));
  }

  function exportUsersCSV() {
    const rows = [['Full Name', 'Company', 'Plan', 'Clout Club Price', 'Signed Up']];
    users.forEach(u => rows.push([u.full_name ?? '', u.company_name ?? '', u.plan, u.clout_club_price ? `₹${u.clout_club_price / 100}` : '', formatDate(u.created_at)]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  }

  // ── Lead Agent functions ────────────────────────────────────────────────────
  async function discoverLeads() {
    setDiscovering(true);
    setDiscoverError('');
    setDiscoverResults([]);
    const labelMap: Record<string, string> = {
      growing_1_3yr: 'Growing (1–3 yr)', early_0_1yr: 'Early (0–1 yr)', scaling_3_5yr: 'Scaling (3–5 yr)',
      instagram_dm: 'Instagram DM', whatsapp: 'WhatsApp', email: 'Email', linkedin: 'LinkedIn',
      '50k_2l': '₹50K–2L', 'lt_50k': '<₹50K', '2l_10l': '₹2L–10L', 'gt_10l': '₹10L+',
      '5k_25k': '5K–25K', '0_5k': '0–5K', '25k_100k': '25K–100K', 'gt_100k': '100K+',
      bootstrapped: 'Bootstrapped', angel: 'Angel-funded', seed: 'Seed', series_a: 'Series A+',
      inconsistent: 'Running but inconsistent', no_ads: 'No (organic only)', just_started: 'Just started', scaling: 'Actively scaling ads',
      founder_diy: 'Founder does it themselves', canva: 'Canva/DIY', freelancers: 'Freelancers', small_team: 'Small in-house team',
      cant_afford_agency: "Can't afford a full agency", too_busy: 'Too busy to create content', inconsistent_look: 'Inconsistent brand look', ads_not_converting: 'Ads not converting',
    };
    const f = discoverForm;
    const payload = {
      mode: 'discover',
      targetMode: discoverMode,
      niche: f.niche,
      stage: labelMap[f.stage] ?? f.stage,
      geography: f.geography,
      platform: labelMap[f.platform] ?? f.platform,
      budget: labelMap[f.budget] ?? f.budget,
      followers: labelMap[f.followers] ?? f.followers,
      funding: labelMap[f.funding] ?? f.funding,
      runningAds: labelMap[f.runningAds] ?? f.runningAds,
      creativeSetup: labelMap[f.creativeSetup] ?? f.creativeSetup,
      painPoint: labelMap[f.painPoint] ?? f.painPoint,
      employeeRange: f.employeeRange,
      city: f.city?.trim() || undefined,
    };
    try {
      const { data, error } = await supabase.functions.invoke('lead-agent', { body: payload });
      if (error) throw new Error(error.message);
      const response = data as DiscoverResponse;
      const results = response?.leads ?? [];
      setDiscoverResults(results);
      setDiscoverSource(response?.source ?? 'ai_archetypes');
      if (results.length === 0) setDiscoverError('No leads generated. Try different criteria.');
    } catch (e) {
      setDiscoverError((e as Error).message || 'Discovery failed. Try again.');
    }
    setDiscovering(false);
  }

  async function scoreBrand() {
    if (!scoreForm.brandName.trim()) return;
    setScoring(true);
    setScoreError('');
    setScoreResult(null);
    const platformLabel: Record<string, string> = { instagram_dm: 'Instagram DM', whatsapp: 'WhatsApp', email: 'Email', linkedin: 'LinkedIn' };
    try {
      const { data, error } = await supabase.functions.invoke('lead-agent', {
        body: {
          mode: 'score',
          brandName: scoreForm.brandName.trim(),
          brandUrl: scoreForm.brandUrl.trim() || undefined,
          niche: scoreForm.niche.trim() || undefined,
          platform: platformLabel[scoreForm.platform] ?? scoreForm.platform,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setScoreResult(data);
    } catch (e) {
      setScoreError((e as Error).message || 'Scoring failed. Try again.');
    }
    setScoring(false);
  }

  async function loadLeads() {
    setLoadingLeads(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoadingLeads(false);
  }

  async function saveLead() {
    if (!addLeadForm.brand_name.trim()) return;
    setSavingLead(true);
    const payload = {
      brand_name: addLeadForm.brand_name.trim(),
      business_name: addLeadForm.business_name.trim() || null,
      niche: addLeadForm.niche.trim() || null,
      platform: addLeadForm.platform || null,
      score: addLeadForm.score !== '' ? parseFloat(addLeadForm.score) : null,
      contact_info: addLeadForm.contact_info.trim() || null,
      status: addLeadForm.status,
      notes: addLeadForm.notes.trim() || null,
      outreach_used: addLeadForm.outreach_used.trim() || null,
    };
    const { data } = await supabase.from('leads').insert(payload).select().single();
    if (data) setLeads(prev => [data as Lead, ...prev]);
    setAddLeadForm({ ...DEFAULT_ADD_LEAD_FORM });
    setShowAddLead(false);
    setSavingLead(false);
  }

  const updateLeadStatus = useCallback(async (id: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    await supabase.from('leads').update({ status }).eq('id', id);
  }, []);

  const updateLeadNotes = useCallback(async (id: string, notes: string) => {
    await supabase.from('leads').update({ notes: notes.trim() || null }).eq('id', id);
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    await supabase.from('leads').delete().eq('id', id);
  }, []);

  function exportLeadsCSV() {
    const rows = [['Brand Name', 'Business Name', 'Niche', 'Platform', 'Score', 'Status', 'Contact Info', 'Notes', 'Date']];
    leads.forEach(l => rows.push([
      l.brand_name,
      l.business_name ?? '',
      l.niche ?? '',
      l.platform?.replace('_', ' ') ?? '',
      l.score !== null ? String(l.score) : '',
      l.status,
      l.contact_info ?? '',
      l.notes ?? '',
      formatDate(l.created_at),
    ]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  function exportDiscoverCSV() {
    if (discoverResults.length === 0) return;
    const rows = [['Name', 'Composite Score', 'Creative Volume Need', 'Capacity Gap', 'Budget Readiness', 'Growth Stage Fit', 'Why They Need Us', 'Score Rationale', 'Target Profile', 'Where to Find Them', 'Outreach Angle']];
    discoverResults.forEach(r => rows.push([
      r.name,
      String(r.compositeScore),
      String(r.scoreBreakdown.creativeVolumeNeed),
      String(r.scoreBreakdown.capacityGap),
      String(r.scoreBreakdown.budgetReadiness),
      String(r.scoreBreakdown.growthStageFit),
      r.whyTheyNeedUs,
      r.scoreRationale,
      r.targetProfile,
      r.whereToFindThem ?? '',
      r.outreachAngle ?? '',
    ]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `discover-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const openAddLeadFromResult = useCallback(function openAddLeadFromResult(result: LeadResult) {
    const platformMap: Record<string, string> = { 'Instagram DM': 'instagram_dm', 'WhatsApp': 'whatsapp', 'Email': 'email', 'LinkedIn': 'linkedin' };
    setAddLeadForm({
      ...DEFAULT_ADD_LEAD_FORM,
      brand_name: result.name,
      score: result.compositeScore.toString(),
      outreach_used: result.outreachMessage ?? result.outreachAngle ?? '',
      contact_info: result.phone ?? result.website ?? result.instagramHandle ?? '',
    });
    setShowAddLead(true);
    // Normalize platform hint from result if available
    if (result.outreachAngle) {
      for (const [label, val] of Object.entries(platformMap)) {
        if (result.outreachAngle.toLowerCase().includes(label.toLowerCase())) {
          setAddLeadForm(prev => ({ ...prev, platform: val }));
          break;
        }
      }
    }
  }, []);

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1800);
    } catch { /* silent */ }
  }

  // ── Lead contacts functions ─────────────────────────────────────────────────
  const openContactsModal = useCallback(async function openContactsModal(lead: Lead) {
    setContactsLead(lead);
    setShowAddContact(false);
    setContactForm({ ...DEFAULT_CONTACT_FORM });
    setHunterDomain('');
    setLoadingContacts(true);
    const { data } = await supabase
      .from('lead_contacts')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true });
    setLeadContacts((data as LeadContact[]) ?? []);
    setLoadingContacts(false);
  }, []);

  async function fetchContactsFromHunter() {
    if (!contactsLead || !hunterDomain.trim()) return;
    setFetchingContacts(true);
    try {
      const domain = hunterDomain.trim().replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      const { data, error } = await supabase.functions.invoke('lead-agent', {
        body: { mode: 'fetch_contacts', domain },
      });
      if (error) throw new Error(error.message);
      const fetched: Array<{ name: string; role: string | null; email: string | null; phone: string | null; linkedin_url: string | null; instagram_handle: string | null }> = data?.contacts ?? [];
      if (fetched.length === 0) { setFetchingContacts(false); return; }
      const toInsert = fetched.map(c => ({ lead_id: contactsLead.id, ...c, notes: null }));
      const { data: inserted } = await supabase.from('lead_contacts').insert(toInsert).select();
      if (inserted) setLeadContacts(prev => [...prev, ...(inserted as LeadContact[])]);
      setHunterDomain('');
    } catch { /* silent */ }
    setFetchingContacts(false);
  }

  async function saveContact() {
    if (!contactsLead || !contactForm.name.trim()) return;
    setSavingContact(true);
    const payload = {
      lead_id: contactsLead.id,
      name: contactForm.name.trim(),
      role: contactForm.role.trim() || null,
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      linkedin_url: contactForm.linkedin_url.trim() || null,
      instagram_handle: contactForm.instagram_handle.trim() || null,
      notes: contactForm.notes.trim() || null,
    };
    const { data } = await supabase.from('lead_contacts').insert(payload).select().single();
    if (data) setLeadContacts(prev => [...prev, data as LeadContact]);
    setContactForm({ ...DEFAULT_CONTACT_FORM });
    setShowAddContact(false);
    setSavingContact(false);
  }

  async function deleteContact(id: string) {
    setDeletingContactId(id);
    await supabase.from('lead_contacts').delete().eq('id', id);
    setLeadContacts(prev => prev.filter(c => c.id !== id));
    setDeletingContactId(null);
  }

  async function searchReddit() {
    if (!redditKeywords.trim() || redditSubreddits.length === 0) return;
    setSearchingReddit(true);
    setRedditError('');
    setRedditResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('lead-agent', {
        body: { mode: 'reddit_search', subreddits: redditSubreddits, keywords: redditKeywords.trim(), timeframe: redditTimeframe },
      });
      if (error) throw new Error(error.message);
      if (data?.error) { setRedditError(data.error); setSearchingReddit(false); return; }
      setRedditResults(data?.posts ?? []);
      if ((data?.posts ?? []).length === 0) setRedditError('No matching posts found. Try different keywords or a wider timeframe.');
    } catch (e) {
      setRedditError((e as Error).message || 'Reddit search failed');
    }
    setSearchingReddit(false);
  }

  function calcIgAuditScore() {
    const followers = parseInt(igAuditForm.followers) || 0;
    const lastPostDays = parseInt(igAuditForm.lastPostDays) || 0;
    const postsPerWeek = parseFloat(igAuditForm.postsPerWeek) || 0;
    const avgLikes = parseInt(igAuditForm.avgLikes) || 0;
    let score = 0;
    const signals: string[] = [];
    if (followers >= 1000 && followers <= 50000) { score += 3; signals.push('Follower count in the ideal sweet spot (1K–50K indie brand)'); }
    else if (followers < 1000) { score += 2; signals.push('Very early stage — high creative need'); }
    else { score += 1; }
    if (lastPostDays > 30) { score += 4; signals.push(`Last post was ${lastPostDays}d ago — neglected presence`); }
    else if (lastPostDays > 14) { score += 3; signals.push('Posting infrequently — low creative investment'); }
    else if (lastPostDays > 7) { score += 2; signals.push('Inconsistent posting cadence'); }
    else { score += 1; }
    if (postsPerWeek < 1) { score += 3; signals.push('Less than 1 post/week — abandoned social presence'); }
    else if (postsPerWeek <= 2) { score += 2; signals.push('Below-average posting frequency'); }
    else { score += 1; }
    const engRate = followers > 0 ? (avgLikes / followers) * 100 : 0;
    if (engRate > 0 && engRate < 1 && followers > 1000) { score += 2; signals.push(`${engRate.toFixed(1)}% engagement rate — poor content resonance`); }
    else if (engRate >= 3) { score += 1; signals.push('Decent engagement — creative quality may still be the bottleneck'); }
    const normalized = Math.min(10, Math.round((score / 12) * 100) / 10);
    const verdict = normalized >= 7 ? 'High Intent — reach out now' : normalized >= 4 ? 'Medium Intent — worth monitoring' : 'Low Intent — not ready yet';
    setIgAuditScore({ score: normalized, signals, verdict });
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
  const filteredThread = msgFilter === 'all' ? threadMessages : threadMessages.filter(m => m.type === msgFilter);
  const filteredMsgUsers = msgUsers.filter(u => !msgSearch || (u.full_name ?? '').toLowerCase().includes(msgSearch.toLowerCase()) || (u.company_name ?? '').toLowerCase().includes(msgSearch.toLowerCase()));
  const totalUnread = Object.values(unreadByUser).reduce((a, b) => a + b, 0);

  const adminName = adminProfile?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Founder';

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)]";
  const thClass = "text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-4 py-3";
  const tdClass = "px-4 py-3 text-sm text-[#D1D5DB] border-t border-white/[0.04]";

  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview',   icon: LayoutDashboard, label: 'Overview'          },
    { id: 'requests',   icon: Image,           label: 'Creative Requests' },
    { id: 'payments',   icon: CreditCard,      label: 'Payments'          },
    { id: 'users',      icon: Users,           label: 'Users'             },
    { id: 'cloutclub',  icon: Sparkles,        label: 'Clout Club'        },
    { id: 'messages',   icon: MessageSquare,   label: 'Messages'          },
    { id: 'leads',      icon: AssassinIcon,    label: 'Ezio'              },
    { id: 'portfolio',  icon: Image,           label: 'Portfolio'         },
    { id: 'settings',   icon: Settings,        label: 'Settings'          },
  ];

  return (
    <div className="min-h-screen flex"
      style={{ background: '#060610', backgroundImage: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '100% 100%, 28px 28px' }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r"
        style={{ background: 'linear-gradient(180deg, rgba(8,8,22,0.98) 0%, rgba(6,6,16,0.98) 100%)', borderColor: 'rgba(99,102,241,0.12)' }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/"><img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" /></Link>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
            <p className="text-[10px] text-[#818CF8] font-mono uppercase tracking-wider">Founder Panel</p>
          </div>
        </div>
        <div className="h-px mx-5" style={{ background: 'rgba(99,102,241,0.15)' }} />
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            const isCC = id === 'cloutclub';
            const isMsg = id === 'messages';
            return (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{ background: active ? (isCC ? 'rgba(168,85,247,0.1)' : 'rgba(99,102,241,0.1)') : 'transparent', borderLeft: active ? `2px solid ${isCC ? '#A855F7' : '#818CF8'}` : '2px solid transparent' }}>
                <div className="relative">
                  <Icon size={16} style={{ color: active ? (isCC ? '#A855F7' : '#818CF8') : '#9CA3AF' }} />
                  {isMsg && totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                      style={{ background: '#EF4444', color: '#fff' }}>{totalUnread > 9 ? '9+' : totalUnread}</span>
                  )}
                </div>
                <span style={active ? { background: isCC ? 'linear-gradient(135deg,#A855F7,#06B6D4)' : 'linear-gradient(135deg,#818CF8,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#D1D5DB' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="px-5 pb-6 pt-4 border-t" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
          <p className="text-[#6B7280] text-xs mb-3 truncate">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm"><LogOut size={14} /> Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Notification bell — desktop top right */}
        <div className="hidden md:flex justify-end mb-6">
          {user && <NotificationBell isAdmin={true} userId={user.id} />}
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                style={{ background: tab === id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: tab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)', color: tab === id ? '#818CF8' : '#9CA3AF' }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          {user && <div className="flex-shrink-0"><NotificationBell isAdmin={true} userId={user.id} /></div>}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Founder welcome */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(8,8,28,0.95), rgba(14,10,35,0.9))', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-15"
                  style={{ background: 'radial-gradient(circle, #6366F1, transparent)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-20 w-32 h-32 opacity-10"
                  style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', transform: 'translateY(40%)' }} />
              </div>
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={12} className="text-[#818CF8]" fill="#818CF8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: 'linear-gradient(135deg,#818CF8,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Founder Dashboard
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-white text-2xl mb-1">{getGreeting(adminName)}</h2>
                  <p className="text-[#9CA3AF] text-sm" style={{ color: '#94A3B8' }}>Here's your business at a glance.</p>
                </div>
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <TrendingUp size={20} className="text-[#818CF8]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-white text-lg">Key Metrics</h3>
              <button onClick={loadOverview} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: overviewStats.totalUsers.toString(), color: '#818CF8' },
                { label: 'Requests Today', value: overviewStats.requestsToday.toString(), color: '#06B6D4' },
                { label: 'Total Revenue', value: formatCurrency(overviewStats.totalRevenue), color: '#10B981' },
                { label: 'Clout Club Rate', value: `${conversionRate}%`, color: '#A855F7' },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5 relative overflow-hidden"
                  style={{ border: `1px solid ${s.color}22` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full"
                    style={{ background: `radial-gradient(circle, ${s.color}, transparent)`, transform: 'translate(30%, -30%)' }} />
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className="font-mono font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                <h3 className="font-heading font-semibold text-white text-base">Recent Signups</h3>
              </div>
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                : recentUsers.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No users yet.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={thClass}>Name</th><th className={thClass}>Company</th><th className={thClass}>Plan</th><th className={thClass}>Date</th></tr></thead><tbody>{recentUsers.map(u => (<tr key={u.id}><td className={tdClass}>{u.full_name || '—'}</td><td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td><td className={tdClass}><PlanBadge plan={u.plan} /></td><td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td></tr>))}</tbody></table></div>}
            </div>
          </div>
        )}

        {/* ── CREATIVE REQUESTS ─────────────────────────────────────────────── */}
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
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr>{['User','Brand','Niche','Format','Submitted','Vision','Creative','Status'].map(h=><th key={h} className={thClass}>{h}</th>)}</tr></thead><tbody>{filteredRequests.map(r=>(<tr key={r.id}><td className={tdClass}>{r.profiles?.full_name||'—'}</td><td className={tdClass}>{r.brand_name}</td><td className={tdClass+' text-[#9CA3AF]'}>{r.niche}</td><td className={tdClass+' text-[#9CA3AF]'}>{r.ad_format}</td><td className={tdClass+' text-[#9CA3AF]'}>{formatDate(r.created_at)}</td><td className={tdClass}>{r.approved_vision?<button onClick={()=>setVisionRequest(r)} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all" style={{background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.25)',color:'#C084FC'}}><Eye size={11}/>View</button>:<span className="text-[#6B7280] text-xs">—</span>}</td><td className={tdClass}>{r.creative_url?<span className="flex items-center gap-1 text-xs text-[#10B981]"><CheckCircle size={12}/> Uploaded</span>:<span className="flex items-center gap-1 text-xs text-[#6B7280]"><Clock size={12}/> Pending</span>}</td><td className={tdClass}><StatusDropdown request={r} onUpdate={handleRequestUpdate}/></td></tr>))}</tbody></table></div>}
              {visionRequest?.approved_vision && <VisionModal vision={visionRequest.approved_vision} brandName={visionRequest.brand_name} onClose={()=>setVisionRequest(null)}/>}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ──────────────────────────────────────────────────────── */}
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

        {/* ── USERS ─────────────────────────────────────────────────────────── */}
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

        {/* ── CLOUT CLUB MANAGEMENT ─────────────────────────────────────────── */}
        {tab === 'cloutclub' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-heading font-bold text-white text-2xl">Clout Club Management</h2>
                <p className="text-[#9CA3AF] text-sm mt-1">Set custom Razorpay pricing for each client.</p>
              </div>
              <button onClick={loadCloutClubUsers} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>
            <div className="glass-card rounded-2xl p-5" style={{ borderLeft: '3px solid #A855F7' }}>
              <div className="flex items-start gap-3">
                <IndianRupee size={16} className="text-[#A855F7] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold mb-1">How Clout Club Pricing Works</p>
                  <p className="text-[#9CA3AF] text-xs leading-relaxed">Set a custom monthly price per client (in INR). Once set, the client sees the exact amount with a Razorpay payment button. Until you set a price, they see "Negotiable — contact us".</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
              <Search size={13} className="text-[#9CA3AF]" />
              <input value={ccSearch} onChange={e => setCcSearch(e.target.value)} placeholder="Search by name or company..." className="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5"><p className="text-[#9CA3AF] text-xs font-medium mb-2">Total Free Users</p><p className="font-mono font-bold text-xl gradient-text">{cloutClubUsers.filter(u => u.plan === 'free').length}</p></div>
              <div className="glass-card rounded-2xl p-5"><p className="text-[#9CA3AF] text-xs font-medium mb-2">Clout Club Members</p><p className="font-mono font-bold text-xl" style={{ background: 'linear-gradient(135deg,#A855F7,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{cloutClubUsers.filter(u => u.plan === 'clout_club').length}</p></div>
              <div className="glass-card rounded-2xl p-5"><p className="text-[#9CA3AF] text-xs font-medium mb-2">Prices Set</p><p className="font-mono font-bold text-xl gradient-text">{cloutClubUsers.filter(u => u.clout_club_price).length}</p></div>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {loadingTab ? <div className="flex items-center justify-center p-10"><Loader size={20} className="animate-spin text-[#A855F7]" /></div>
                : filteredCCUsers.length === 0 ? <p className="text-[#6B7280] text-sm text-center p-10">No users found.</p>
                : <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={thClass}>Client</th><th className={thClass}>Company</th><th className={thClass}>Plan</th><th className={thClass}>Monthly Price</th><th className={thClass}>Expires</th><th className={thClass}>Client View</th><th className={thClass}>Joined</th></tr></thead><tbody>{filteredCCUsers.map(u => (<tr key={u.id}><td className={tdClass}><div className="font-medium">{u.full_name || '—'}</div></td><td className={tdClass + ' text-[#9CA3AF]'}>{u.company_name || '—'}</td><td className={tdClass}><PlanBadge plan={u.plan} /></td><td className={tdClass}><PriceEditor userId={u.id} currentPrice={u.clout_club_price} onSave={handlePriceSaved} /></td><td className={tdClass}><ExpiryEditor userId={u.id} currentExpiry={u.subscription_expires_at ?? null} onSave={handleExpirySaved} /></td><td className={tdClass}>{u.clout_club_price ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}><CheckCircle size={11} /> Shows ₹{(u.clout_club_price / 100).toLocaleString('en-IN')}/mo</span> : <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}><Clock size={11} /> Shows "Negotiable"</span>}</td><td className={tdClass + ' text-[#9CA3AF]'}>{formatDate(u.created_at)}</td></tr>))}</tbody></table></div>}
            </div>
          </div>
        )}

        {/* ── MESSAGES / FEEDBACK ───────────────────────────────────────────── */}
        {tab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-white text-2xl">Messages & Feedback</h2>
                <p className="text-[#9CA3AF] text-sm mt-1">Member conversations and creative feedback in one place.</p>
              </div>
              <button onClick={loadMessageUsers} className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={13} /> Refresh</button>
            </div>

            <div className="grid md:grid-cols-[280px_1fr] gap-4" style={{ height: 'calc(100dvh - 13rem)', minHeight: 500 }}>
              {/* Member list */}
              <div className={`glass-card rounded-2xl overflow-hidden flex-col ${selectedMsgUser ? 'hidden md:flex' : 'flex'}`} style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                  <Search size={12} className="text-[#9CA3AF]" />
                  <input value={msgSearch} onChange={e => setMsgSearch(e.target.value)} placeholder="Search members..." className="bg-transparent text-xs text-white placeholder-[#6B7280] focus:outline-none flex-1" />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingTab ? (
                    <div className="flex items-center justify-center p-8"><Loader size={16} className="animate-spin text-[#818CF8]" /></div>
                  ) : filteredMsgUsers.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare size={20} className="text-[#6B7280] mx-auto mb-2" />
                      <p className="text-[#6B7280] text-xs">No messages yet.</p>
                    </div>
                  ) : filteredMsgUsers.map(u => {
                    const unread = unreadByUser[u.id] ?? 0;
                    const selected = selectedMsgUser?.id === u.id;
                    return (
                      <button key={u.id} onClick={() => openThread(u)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b"
                        style={{ background: selected ? 'rgba(99,102,241,0.1)' : 'transparent', borderColor: 'rgba(255,255,255,0.04)', borderLeft: selected ? '2px solid #818CF8' : '2px solid transparent' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.3))', color: '#C4B5FD' }}>
                          {(u.full_name || u.company_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{u.full_name || u.company_name || 'Unknown'}</p>
                          <p className="text-[#6B7280] text-[10px] truncate">{u.plan === 'clout_club' ? 'Clout Club' : 'Free'}</p>
                        </div>
                        {unread > 0 && (
                          <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                            style={{ background: '#EF4444', color: '#fff' }}>{unread}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thread view */}
              <div className={`glass-card rounded-2xl overflow-hidden flex-col ${!selectedMsgUser ? 'hidden md:flex' : 'flex'}`} style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                {!selectedMsgUser ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <MessageSquare size={22} className="text-[#818CF8]" />
                    </div>
                    <p className="text-white font-heading font-semibold text-sm mb-1">Select a member</p>
                    <p className="text-[#9CA3AF] text-xs">Choose a member from the list to view their conversation.</p>
                  </div>
                ) : (
                  <>
                    {/* Thread header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <button className="md:hidden flex items-center text-[#9CA3AF] hover:text-white transition-colors" onClick={() => setSelectedMsgUser(null)}>
                          <ChevronLeft size={18} />
                        </button>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.3))', color: '#C4B5FD' }}>
                          {(selectedMsgUser.full_name || selectedMsgUser.company_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{selectedMsgUser.full_name || selectedMsgUser.company_name || 'Unknown'}</p>
                          <PlanBadge plan={selectedMsgUser.plan} />
                        </div>
                      </div>
                      {/* Filter pills */}
                      <div className="flex gap-1.5">
                        {(['all', 'chat', 'feedback'] as const).map(f => (
                          <button key={f} onClick={() => setMsgFilter(f)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize transition-all"
                            style={{ background: msgFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent', border: msgFilter === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', color: msgFilter === f ? '#818CF8' : '#6B7280' }}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                      {loadingThread ? (
                        <div className="flex items-center justify-center h-full"><Loader size={20} className="animate-spin text-[#818CF8]" /></div>
                      ) : filteredThread.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-[#6B7280] text-sm">No messages in this view.</p>
                        </div>
                      ) : (
                        filteredThread.map(msg => {
                          const fromAdmin = msg.is_from_admin;
                          const creative = msg.creative_request_id
                            ? userCreatives.find(r => r.id === msg.creative_request_id)
                            : null;
                          return (
                            <div key={msg.id} className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'} mb-3`}>
                              <div className={`max-w-[80%] ${fromAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                {creative && (
                                  <p className="text-[10px] font-semibold uppercase tracking-wider px-1 text-[#C084FC]">
                                    Feedback: {creative.brand_name} — {creative.ad_format}
                                  </p>
                                )}
                                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                  style={fromAdmin
                                    ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', color: '#E0E7FF', borderBottomRightRadius: 6 }
                                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', borderBottomLeftRadius: 6 }
                                  }>
                                  {msg.content}
                                </div>
                                <p className="text-[10px] text-[#6B7280] px-1">
                                  {fromAdmin ? 'You (CloutKart)' : selectedMsgUser.full_name || 'Client'} · {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  {msg.type === 'feedback' && <span className="ml-1 text-[#A855F7]">· feedback</span>}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply input */}
                    <div className="p-3 border-t space-y-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                      {replyError && (
                        <p className="text-red-400 text-xs px-1">{replyError}</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={replyText}
                          onChange={e => { setReplyText(e.target.value); setReplyError(''); }}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                          placeholder={`Reply to ${selectedMsgUser.full_name || 'client'}...`}
                          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.4)]"
                        />
                        <button
                          onClick={sendReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(59,130,246,0.4))', border: '1px solid rgba(99,102,241,0.4)' }}>
                          {sendingReply ? <Loader size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
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
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-heading font-semibold text-white text-sm">{sec.title}</h3>
                          <span className="text-xs text-[#9CA3AF] font-mono">{sec.image_count} imgs</span>
                        </div>

                        {/* Instagram info — inline editor */}
                        {igEditId === sec.id ? (
                          <div className="space-y-1.5 mb-2">
                            <input
                              autoFocus
                              value={igEditHandle}
                              onChange={e => setIgEditHandle(e.target.value)}
                              placeholder="@handle"
                              className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.12] focus:border-[rgba(99,102,241,0.5)] focus:outline-none"
                            />
                            <input
                              value={igEditLink}
                              onChange={e => setIgEditLink(e.target.value)}
                              placeholder="https://instagram.com/yourbrand"
                              className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.12] focus:border-[rgba(99,102,241,0.5)] focus:outline-none"
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => saveInstagramInfo(sec.id, igEditHandle, igEditLink)}
                                disabled={savingIg}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
                              >
                                {savingIg ? <Loader size={10} className="animate-spin" /> : <Check size={10} />} Save
                              </button>
                              <button
                                onClick={() => setIgEditId(null)}
                                className="px-2.5 py-1 rounded-lg text-[11px] text-[#6B7280] hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setIgEditId(sec.id); setIgEditHandle(sec.instagram_handle); setIgEditLink(sec.instagram_link); }}
                            className="group flex items-center gap-1.5 mb-2 w-full"
                          >
                            {sec.instagram_handle ? (
                              <span className="text-[12px] font-semibold" style={{ color: '#818CF8' }}>{sec.instagram_handle}</span>
                            ) : (
                              <span className="text-[11px] text-[#4B5563] italic">Add Instagram handle…</span>
                            )}
                            <Edit2 size={10} className="text-[#4B5563] group-hover:text-[#818CF8] transition-colors flex-shrink-0" />
                          </button>
                        )}

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

        {/* ── LEAD AGENT ────────────────────────────────────────────────────── */}
        {tab === 'leads' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-white text-2xl">Ezio</h2>
              <p className="text-[#9CA3AF] text-sm mt-1">Precision lead hunting for CloutKart — surgical targeting, no wasted effort.</p>
            </div>

            {/* Sub-tab nav */}
            <div className="flex items-center gap-1 p-1 rounded-xl self-start" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['operations', 'listening'] as const).map(st => (
                <button key={st} onClick={() => setLeadsSubTab(st)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={leadsSubTab === st ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' } : { color: '#6B7280' }}>
                  {st === 'operations' ? <><Target size={13} /> Operations</> : <><Radio size={13} /> Social Listening</>}
                </button>
              ))}
            </div>

            {leadsSubTab === 'operations' && (<>
            {/* ── Discover Leads ─────────────────────────────────────── */}
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                <Target size={15} className="text-[#818CF8]" />
                <h3 className="font-heading font-semibold text-white text-base">Hunt Targets</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>Ezio · Groq</span>
              </div>
              <div className="p-6 space-y-5">
                {/* Mode toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl self-start" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['local', 'growth'] as const).map(m => {
                    const active = discoverMode === m;
                    return (
                      <button key={m} onClick={() => { setDiscoverMode(m); setDiscoverForm({ ...DISCOVER_DEFAULTS[m] }); setDiscoverResults([]); setDiscoverError(''); }}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={active ? {
                          background: m === 'local' ? 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.2))' : 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(59,130,246,0.2))',
                          border: `1px solid ${m === 'local' ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`,
                          color: m === 'local' ? '#10B981' : '#818CF8',
                        } : { background: 'transparent', border: '1px solid transparent', color: '#6B7280' }}>
                        {m === 'local' ? '📍 Local Brands' : '📈 Growth Brands'}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#6B7280] -mt-2">
                  {discoverMode === 'local'
                    ? 'Hyper-local: home sellers, WhatsApp businesses, 0–5K followers, no ads yet'
                    : 'Scaling brands: 5K–100K followers, running Meta ads, bootstrapped to seed stage'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Niche */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">
                      Target Niche <span className="text-[#F59E0B] font-normal normal-case tracking-normal">* required for Google Places</span>
                    </label>
                    <input value={discoverForm.niche} onChange={e => setDiscoverForm(f => ({ ...f, niche: e.target.value }))}
                      placeholder="e.g. Skincare, Food, Fashion"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)] focus:outline-none" />
                  </div>
                  {/* City */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">
                      City <span className="text-[#10B981] font-normal normal-case tracking-normal">→ real businesses via Google Maps</span>
                    </label>
                    <input value={discoverForm.city} onChange={e => setDiscoverForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                  </div>
                  {/* Business Stage */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Business Stage</label>
                    <CustomSelect value={discoverForm.stage} onChange={v => setDiscoverForm(f => ({ ...f, stage: v }))} options={[{ value: 'early_0_1yr', label: 'Early (0–1 yr)' }, { value: 'growing_1_3yr', label: 'Growing (1–3 yr)' }, { value: 'scaling_3_5yr', label: 'Scaling (3–5 yr)' }]} />
                  </div>
                  {/* IG Followers */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Instagram Followers</label>
                    <CustomSelect value={discoverForm.followers} onChange={v => setDiscoverForm(f => ({ ...f, followers: v }))} options={[{ value: '0_5k', label: '0–5K' }, { value: '5k_25k', label: '5K–25K' }, { value: '25k_100k', label: '25K–100K' }, { value: 'gt_100k', label: '100K+' }]} />
                  </div>
                  {/* Funding */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Funding Status</label>
                    <CustomSelect value={discoverForm.funding} onChange={v => setDiscoverForm(f => ({ ...f, funding: v }))} options={[{ value: 'bootstrapped', label: 'Bootstrapped' }, { value: 'angel', label: 'Angel-funded' }, { value: 'seed', label: 'Seed' }, { value: 'series_a', label: 'Series A+' }]} />
                  </div>
                  {/* Running Ads */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Running Paid Ads?</label>
                    <CustomSelect value={discoverForm.runningAds} onChange={v => setDiscoverForm(f => ({ ...f, runningAds: v }))} options={[{ value: 'no_ads', label: 'No (organic only)' }, { value: 'just_started', label: 'Just started' }, { value: 'inconsistent', label: 'Inconsistent' }, { value: 'scaling', label: 'Actively scaling' }]} />
                  </div>
                  {/* Creative Setup */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Current Creative Setup</label>
                    <CustomSelect value={discoverForm.creativeSetup} onChange={v => setDiscoverForm(f => ({ ...f, creativeSetup: v }))} options={[{ value: 'founder_diy', label: 'Founder does it themselves' }, { value: 'canva', label: 'Canva / DIY' }, { value: 'freelancers', label: 'Freelancers' }, { value: 'small_team', label: 'Small in-house team' }]} />
                  </div>
                  {/* Pain Point */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Pain Point to Target</label>
                    <CustomSelect value={discoverForm.painPoint} onChange={v => setDiscoverForm(f => ({ ...f, painPoint: v }))} options={[{ value: 'cant_afford_agency', label: "Can't afford a full agency" }, { value: 'too_busy', label: 'Too busy to create content' }, { value: 'inconsistent_look', label: 'Inconsistent brand look' }, { value: 'ads_not_converting', label: 'Ads not converting' }]} />
                  </div>
                  {/* Outreach Platform */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Outreach Platform</label>
                    <CustomSelect value={discoverForm.platform} onChange={v => setDiscoverForm(f => ({ ...f, platform: v }))} options={[{ value: 'instagram_dm', label: 'Instagram DM' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }, { value: 'linkedin', label: 'LinkedIn' }]} />
                  </div>
                  {/* Geography */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Geography</label>
                    <CustomSelect value={discoverForm.geography} onChange={v => setDiscoverForm(f => ({ ...f, geography: v }))} options={[{ value: 'india', label: 'India' }, { value: 'international', label: 'International' }, { value: 'both', label: 'Both' }]} />
                  </div>
                  {/* Employees */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Employee Count</label>
                    <CustomSelect value={discoverForm.employeeRange} onChange={v => setDiscoverForm(f => ({ ...f, employeeRange: v }))} options={[{ value: '1-10', label: '1–10' }, { value: '10-50', label: '10–50' }, { value: '50-200', label: '50–200' }]} />
                  </div>
                  {/* Monthly Ad Budget */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Monthly Ad Budget</label>
                    <CustomSelect value={discoverForm.budget} onChange={v => setDiscoverForm(f => ({ ...f, budget: v }))} options={[{ value: 'lt_50k', label: '< ₹50K' }, { value: '50k_2l', label: '₹50K–2L' }, { value: '2l_10l', label: '₹2L–10L' }, { value: 'gt_10l', label: '₹10L+' }]} />
                  </div>
                </div>

                <button onClick={discoverLeads} disabled={discovering}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.9),rgba(59,130,246,0.9))', color: '#fff' }}>
                  {discovering ? <><Loader size={14} className="animate-spin" /> Hunting…</> : <><Target size={14} /> Hunt Targets</>}
                </button>

                {discoverError && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-xs">{discoverError}</span>
                  </div>
                )}

                {discoverResults.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{discoverResults.length} Leads Found</p>
                        {discoverSource === 'google_places' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                            Real businesses · Google Maps
                          </span>
                        )}
                        {discoverSource === 'ai_archetypes' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>
                            AI archetypes
                          </span>
                        )}
                      </div>
                      <button onClick={exportDiscoverCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' }}>
                        <ArrowRight size={11} style={{ transform: 'rotate(90deg)' }} /> Export CSV
                      </button>
                    </div>
                    {discoverResults.map((lead, i) => (
                      <DiscoverLeadCard key={i} lead={lead} onSave={openAddLeadFromResult} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Score a Brand ──────────────────────────────────────── */}
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                <Sparkles size={15} className="text-[#C084FC]" />
                <h3 className="font-heading font-semibold text-white text-base">Qualify a Target</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>Ezio · Groq · PDL if URL</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Brand Name <span className="text-red-400">*</span></label>
                    <input value={scoreForm.brandName} onChange={e => setScoreForm(f => ({ ...f, brandName: e.target.value }))}
                      placeholder="e.g. Minimalist, Mamaearth"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Website / Instagram URL</label>
                    <input value={scoreForm.brandUrl} onChange={e => setScoreForm(f => ({ ...f, brandUrl: e.target.value }))}
                      placeholder="https://brand.com"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Niche</label>
                    <input value={scoreForm.niche} onChange={e => setScoreForm(f => ({ ...f, niche: e.target.value }))}
                      placeholder="e.g. Skincare"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">Outreach Platform</label>
                    <CustomSelect value={scoreForm.platform} onChange={v => setScoreForm(f => ({ ...f, platform: v }))} options={[{ value: 'instagram_dm', label: 'Instagram DM' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }, { value: 'linkedin', label: 'LinkedIn' }]} />
                  </div>
                </div>

                <button onClick={scoreBrand} disabled={scoring || !scoreForm.brandName.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.8),rgba(99,102,241,0.8))', color: '#fff' }}>
                  {scoring ? <><Loader size={14} className="animate-spin" /> Qualifying…</> : <><Sparkles size={14} /> Qualify This Target</>}
                </button>

                {scoreError && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-xs">{scoreError}</span>
                  </div>
                )}

                {scoreResult && (() => {
                  const sr = scoreResult;
                  const scoreColor = sr.compositeScore >= 8 ? '#10B981' : sr.compositeScore >= 5 ? '#F59E0B' : '#F87171';
                  const outreachId = `outreach-${sr.name}`;
                  return (
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(168,85,247,0.15)' }}>
                      <div className="px-5 py-4 flex items-start justify-between gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div>
                          <p className="text-white font-heading font-bold text-base">{sr.name}</p>
                          <p className="text-[#9CA3AF] text-xs mt-0.5">Brand fit analysis</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-mono font-bold text-2xl leading-none" style={{ color: scoreColor }}>{sr.compositeScore}</p>
                            <p className="text-[10px] text-[#6B7280] mt-0.5">/ 10</p>
                          </div>
                          <button onClick={() => openAddLeadFromResult(sr)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#C084FC' }}>
                            <Plus size={11} /> Save
                          </button>
                        </div>
                      </div>
                      <div className="px-5 py-4 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Score Breakdown</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {([
                              ['Creative Volume Need', sr.scoreBreakdown.creativeVolumeNeed],
                              ['Capacity Gap', sr.scoreBreakdown.capacityGap],
                              ['Budget Readiness', sr.scoreBreakdown.budgetReadiness],
                              ['Growth Stage Fit', sr.scoreBreakdown.growthStageFit],
                            ] as [string, number][]).map(([label, val]) => (
                              <div key={label}>
                                <p className="text-[10px] text-[#9CA3AF] mb-1">{label}</p>
                                <ScoreBar value={val} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Why They Need CloutKart</p>
                          <p className="text-[#D1D5DB] text-sm leading-relaxed">{sr.whyTheyNeedUs}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Score Rationale</p>
                          <p className="text-[#9CA3AF] text-xs leading-relaxed italic">{sr.scoreRationale}</p>
                        </div>
                        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="grid sm:grid-cols-2 gap-4">
                          {sr.greenFlags && sr.greenFlags.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-2">Green Flags</p>
                              <div className="space-y-1">
                                {sr.greenFlags.map((f, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <CheckCircle size={11} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                                    <p className="text-[#D1D5DB] text-xs">{f}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {sr.redFlags && sr.redFlags.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-[#F87171] uppercase tracking-widest mb-2">Red Flags</p>
                              <div className="space-y-1">
                                {sr.redFlags.map((f, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <AlertCircle size={11} className="text-[#F87171] mt-0.5 flex-shrink-0" />
                                    <p className="text-[#D1D5DB] text-xs">{f}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {sr.outreachMessage && (
                          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-[#C084FC] uppercase tracking-widest">Suggested Outreach Message</p>
                              <button onClick={() => copyText(sr.outreachMessage!, outreachId)}
                                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                                style={{ background: copiedId === outreachId ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: copiedId === outreachId ? '#10B981' : '#9CA3AF' }}>
                                <Copy size={10} />
                                {copiedId === outreachId ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <p className="text-[#D1D5DB] text-sm leading-relaxed">{sr.outreachMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Lead Tracker ───────────────────────────────────────── */}
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.12)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
                <TrendingUp size={15} className="text-[#10B981]" />
                <h3 className="font-heading font-semibold text-white text-base">Mission Log</h3>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={loadLeads} className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-colors"><RefreshCw size={12} /></button>
                  {leads.length > 0 && (
                    <button onClick={exportLeadsCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' }}>
                      <ArrowRight size={11} style={{ transform: 'rotate(90deg)' }} /> Export CSV
                    </button>
                  )}
                  <button onClick={() => { setAddLeadForm({ ...DEFAULT_ADD_LEAD_FORM }); setShowAddLead(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                    <Plus size={11} /> Add Lead
                  </button>
                </div>
              </div>
              {loadingLeads
                ? <div className="flex items-center justify-center p-10"><Loader size={18} className="animate-spin text-[#10B981]" /></div>
                : leads.length === 0
                  ? <div className="p-10 text-center">
                      <Target size={22} className="text-[#6B7280] mx-auto mb-2" />
                      <p className="text-[#6B7280] text-sm">No leads saved yet.</p>
                      <p className="text-[#4B5563] text-xs mt-1">Use Hunt or Qualify above to find your first targets.</p>
                    </div>
                  : <div className="overflow-x-auto p-4">
                      <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                        {Object.entries(leadStatusColors).map(([status, colors]) => {
                          const col = leads.filter(l => l.status === status);
                          const isOver = dragOverStatus === status;
                          return (
                            <div
                              key={status}
                              className="flex flex-col gap-2 rounded-xl transition-colors duration-150"
                              style={{
                                width: 220,
                                padding: '6px',
                                background: isOver ? colors.bg : 'transparent',
                                outline: isOver ? `1px solid ${colors.border}` : '1px solid transparent',
                              }}
                              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverStatus(status); }}
                              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStatus(null); }}
                              onDrop={e => {
                                e.preventDefault();
                                const leadId = e.dataTransfer.getData('leadId');
                                if (leadId && leadId !== leads.find(l => l.id === leadId && l.status === status)?.id) {
                                  updateLeadStatus(leadId, status);
                                }
                                setDraggingLeadId(null);
                                setDragOverStatus(null);
                              }}
                            >
                              <div className="flex items-center gap-2 px-1 pb-1">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.text }} />
                                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>{colors.label}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-auto tabular-nums"
                                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                  {col.length}
                                </span>
                              </div>
                              {col.length === 0
                                ? <div className="rounded-xl p-4 text-center transition-colors"
                                    style={{ border: `1px dashed ${isOver ? colors.border : 'rgba(255,255,255,0.07)'}` }}>
                                    <p className="text-[11px]" style={{ color: isOver ? colors.text : '#3B4049' }}>
                                      {isOver ? `Move here` : 'Empty'}
                                    </p>
                                  </div>
                                : col.map(lead => (
                                    <div
                                      key={lead.id}
                                      draggable
                                      onDragStart={e => {
                                        e.dataTransfer.setData('leadId', lead.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggingLeadId(lead.id);
                                      }}
                                      onDragEnd={() => { setDraggingLeadId(null); setDragOverStatus(null); }}
                                      style={{
                                        opacity: draggingLeadId === lead.id ? 0.4 : 1,
                                        cursor: 'grab',
                                        transform: draggingLeadId === lead.id ? 'scale(0.98)' : 'none',
                                        transition: 'opacity 0.15s, transform 0.15s',
                                      }}
                                    >
                                      <KanbanCard
                                        lead={lead}
                                        onStatusUpdate={updateLeadStatus}
                                        onNotesUpdate={updateLeadNotes}
                                        onViewContacts={openContactsModal}
                                        onDelete={deleteLead}
                                      />
                                    </div>
                                  ))
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
              }
            </div>
            </>)}

            {/* ── Social Listening ─────────────────────────────────── */}
            {leadsSubTab === 'listening' && (
              <div className="space-y-6">

                {/* Reddit Radar */}
                <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                    <Radio size={15} className="text-[#818CF8]" />
                    <h3 className="font-heading font-semibold text-white text-base">Reddit Radar</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>Free · No Key Needed</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <p className="text-[#9CA3AF] text-sm">Businesses actively asking for marketing help in these subreddits are the highest-intent leads you can find — they're raising their hand.</p>
                    <div>
                      <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Subreddits</label>
                      <div className="flex flex-wrap gap-2">
                        {['ecommerce', 'smallbusiness', 'IndiaStartups', 'digital_marketing', 'startups', 'Entrepreneur'].map(sub => {
                          const active = redditSubreddits.includes(sub);
                          return (
                            <button key={sub} onClick={() => setRedditSubreddits(prev => active ? prev.filter(s => s !== sub) : [...prev, sub])}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={active ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}>
                              r/{sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Search Keywords</label>
                      <textarea value={redditKeywords} onChange={e => setRedditKeywords(e.target.value)} rows={2}
                        placeholder="e.g. looking for marketing agency OR need creative team"
                        className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(99,102,241,0.5)] focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {(['day', 'week', 'month'] as const).map(t => (
                          <button key={t} onClick={() => setRedditTimeframe(t)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize"
                            style={redditTimeframe === t ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8' } : { color: '#6B7280' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <button onClick={searchReddit} disabled={searchingReddit || redditSubreddits.length === 0 || !redditKeywords.trim()}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {searchingReddit ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                        {searchingReddit ? 'Scanning Reddit…' : 'Scan Reddit'}
                      </button>
                    </div>
                    {redditError && <p className="text-red-400 text-sm">{redditError}</p>}
                    {redditResults.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{redditResults.length} posts found</p>
                        {redditResults.map(post => (
                          <div key={post.id} className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <a href={post.permalink} target="_blank" rel="noopener noreferrer"
                                  className="text-sm font-semibold text-white hover:text-[#818CF8] transition-colors line-clamp-2 leading-snug block">{post.title}</a>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[10px] font-bold text-[#818CF8]">r/{post.subreddit}</span>
                                  <span className="text-[#6B7280] text-[10px]">·</span>
                                  <span className="text-[#6B7280] text-[10px]">u/{post.author}</span>
                                  <span className="text-[#6B7280] text-[10px]">·</span>
                                  <span className="text-[#6B7280] text-[10px]">{Math.round((Date.now() / 1000 - post.createdUtc) / 3600)}h ago</span>
                                </div>
                              </div>
                              <a href={post.permalink} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:text-white text-[#6B7280] transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            {post.selftext && <p className="text-[#9CA3AF] text-xs leading-relaxed line-clamp-3">{post.selftext}</p>}
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[10px] text-[#6B7280]">▲ {post.score}</span>
                              <span className="text-[10px] text-[#6B7280]">💬 {post.numComments}</span>
                              <button onClick={() => { setShowAddLead(true); setAddLeadForm({ ...DEFAULT_ADD_LEAD_FORM, brand_name: post.author, platform: 'instagram_dm', notes: `Reddit: "${post.title.slice(0, 80)}" — r/${post.subreddit}` }); }}
                                className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                                + Save as Lead
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Alerts Setup */}
                <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(251,191,36,0.15)' }}>
                  <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(251,191,36,0.1)' }}>
                    <Bell size={15} className="text-[#FBBF24]" />
                    <h3 className="font-heading font-semibold text-white text-base">Google Alerts Setup</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}>Free · Zero Maintenance</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-[#9CA3AF] text-sm">Businesses posting these phrases are actively in the market for a marketing partner. Set up once, catch leads in your inbox forever.</p>
                    <div className="space-y-2">
                      {[
                        'looking for marketing agency',
                        'need creative team',
                        'hiring social media manager',
                        'need help with Instagram ads',
                        'digital marketing freelancer needed',
                        'brand creative needed',
                        'need video ads for Instagram',
                      ].map(phrase => (
                        <div key={phrase} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <p className="text-sm text-[#D1D5DB] font-mono truncate">"{phrase}"</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => navigator.clipboard.writeText(phrase)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <Copy size={11} />
                            </button>
                            <a href="https://www.google.com/alerts" target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                              Set Alert <ExternalLink size={9} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[#6B7280] text-xs">Open Google Alerts → paste the phrase → set frequency to "As it happens" and source to "Web".</p>
                  </div>
                </div>

                {/* Instagram Audit */}
                <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.15)' }}>
                  <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                    <Activity size={15} className="text-[#C084FC]" />
                    <h3 className="font-heading font-semibold text-white text-base">Instagram Audit</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>Signal Scorer · Free</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <p className="text-[#9CA3AF] text-sm">Spot businesses with poor creative quality or inconsistent branding — enter what you observe while browsing their profile.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Instagram Handle</label>
                        <input value={igAuditForm.handle} onChange={e => setIgAuditForm(f => ({ ...f, handle: e.target.value }))}
                          placeholder="@brandname"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Followers</label>
                        <input type="number" value={igAuditForm.followers} onChange={e => setIgAuditForm(f => ({ ...f, followers: e.target.value }))}
                          placeholder="e.g. 5000"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Days Since Last Post</label>
                        <input type="number" value={igAuditForm.lastPostDays} onChange={e => setIgAuditForm(f => ({ ...f, lastPostDays: e.target.value }))}
                          placeholder="e.g. 21"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Posts Per Week (avg)</label>
                        <input type="number" step="0.5" value={igAuditForm.postsPerWeek} onChange={e => setIgAuditForm(f => ({ ...f, postsPerWeek: e.target.value }))}
                          placeholder="e.g. 0.5"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Avg Likes per Post</label>
                        <input type="number" value={igAuditForm.avgLikes} onChange={e => setIgAuditForm(f => ({ ...f, avgLikes: e.target.value }))}
                          placeholder="e.g. 30"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={calcIgAuditScore} className="btn-primary flex items-center gap-2">
                        <Activity size={14} /> Score Signal
                      </button>
                      {igAuditScore && igAuditForm.handle && (
                        <button onClick={() => { setShowAddLead(true); setAddLeadForm({ ...DEFAULT_ADD_LEAD_FORM, brand_name: igAuditForm.handle.replace('@', ''), platform: 'instagram_dm', notes: `IG Audit: ${igAuditScore.score}/10 — ${igAuditScore.verdict}\n${igAuditScore.signals.join('; ')}` }); }}
                          className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl transition-all"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                          <Plus size={13} /> Add to Mission Log
                        </button>
                      )}
                    </div>
                    {igAuditScore && (
                      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Intent Signal Score</span>
                          <span className="text-2xl font-bold font-mono" style={{ color: igAuditScore.score >= 7 ? '#10B981' : igAuditScore.score >= 4 ? '#FBBF24' : '#EF4444' }}>
                            {igAuditScore.score}<span className="text-sm text-[#6B7280]">/10</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${igAuditScore.score * 10}%`, background: igAuditScore.score >= 7 ? 'linear-gradient(90deg,#10B981,#34D399)' : igAuditScore.score >= 4 ? 'linear-gradient(90deg,#FBBF24,#FDE68A)' : 'linear-gradient(90deg,#EF4444,#FCA5A5)' }} />
                        </div>
                        <p className="text-xs font-semibold" style={{ color: igAuditScore.score >= 7 ? '#10B981' : igAuditScore.score >= 4 ? '#FBBF24' : '#EF4444' }}>
                          {igAuditScore.verdict}
                        </p>
                        {igAuditScore.signals.length > 0 && (
                          <ul className="space-y-1.5 mt-1">
                            {igAuditScore.signals.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[#D1D5DB]">
                                <span className="text-[#818CF8] flex-shrink-0 mt-0.5">→</span>{s}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── Add Lead Modal ─────────────────────────────────────── */}
            {showAddLead && createPortal(
              <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={() => setShowAddLead(false)}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="relative w-full max-w-md rounded-3xl p-8 max-h-[92vh] overflow-y-auto"
                  style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(16,185,129,0.2)' }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddLead(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
                  <h3 className="font-heading font-bold text-white text-xl mb-6">Save Lead</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Brand Name <span className="text-red-400">*</span></label>
                        <input value={addLeadForm.brand_name} onChange={e => setAddLeadForm(f => ({ ...f, brand_name: e.target.value }))}
                          placeholder="e.g. Minimalist"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Business Name</label>
                        <input value={addLeadForm.business_name} onChange={e => setAddLeadForm(f => ({ ...f, business_name: e.target.value }))}
                          placeholder="Registered entity name"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Niche</label>
                        <input value={addLeadForm.niche} onChange={e => setAddLeadForm(f => ({ ...f, niche: e.target.value }))}
                          placeholder="e.g. Skincare"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Score</label>
                        <input type="number" min="0" max="10" step="0.1" value={addLeadForm.score} onChange={e => setAddLeadForm(f => ({ ...f, score: e.target.value }))}
                          placeholder="0–10"
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Platform</label>
                        <CustomSelect value={addLeadForm.platform} onChange={v => setAddLeadForm(f => ({ ...f, platform: v }))} options={[{ value: 'instagram_dm', label: 'Instagram DM' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }, { value: 'linkedin', label: 'LinkedIn' }]} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Status</label>
                        <CustomSelect value={addLeadForm.status} onChange={v => setAddLeadForm(f => ({ ...f, status: v }))} options={Object.entries(leadStatusColors).map(([s, c]) => ({ value: s, label: c.label }))} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Contact Info</label>
                      <input value={addLeadForm.contact_info} onChange={e => setAddLeadForm(f => ({ ...f, contact_info: e.target.value }))}
                        placeholder="@handle, email, or phone"
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Outreach Used</label>
                      <textarea value={addLeadForm.outreach_used} onChange={e => setAddLeadForm(f => ({ ...f, outreach_used: e.target.value }))}
                        rows={3} placeholder="Paste the message you sent (or plan to send)…"
                        className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Notes</label>
                      <textarea value={addLeadForm.notes} onChange={e => setAddLeadForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2} placeholder="Any extra context…"
                        className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={saveLead} disabled={savingLead || !addLeadForm.brand_name.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold disabled:opacity-50 transition-all"
                        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.8),rgba(5,150,105,0.8))', color: '#fff' }}>
                        {savingLead ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Save Lead
                      </button>
                      <button onClick={() => setShowAddLead(false)}
                        className="px-5 py-3 rounded-2xl text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* ── Contacts Modal ────────────────────────────────────────── */}
            {contactsLead && createPortal(
              <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={() => setContactsLead(null)}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="relative w-full max-w-lg rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
                  style={{ background: 'rgba(12,8,24,0.98)', border: '1px solid rgba(99,102,241,0.25)' }}
                  onClick={e => e.stopPropagation()}>

                  {/* Header */}
                  <div className="sticky top-0 px-6 py-4 flex items-center justify-between border-b z-10"
                    style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(12,8,24,0.98)' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Users size={14} className="text-[#818CF8]" />
                        <h3 className="font-heading font-bold text-white text-base">Decision Makers</h3>
                      </div>
                      <p className="text-[#9CA3AF] text-xs">{contactsLead.brand_name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div className="flex items-center gap-1.5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}>
                        <input
                          value={hunterDomain}
                          onChange={e => setHunterDomain(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') fetchContactsFromHunter(); }}
                          placeholder="brand.com"
                          className="bg-transparent text-xs text-white placeholder-[#6B7280] focus:outline-none px-3 py-1.5 w-28"
                        />
                        <button onClick={fetchContactsFromHunter} disabled={fetchingContacts || !hunterDomain.trim()}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 transition-all border-l"
                          style={{ borderColor: 'rgba(99,102,241,0.25)', color: '#818CF8' }}>
                          {fetchingContacts ? <Loader size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                          Hunter
                        </button>
                      </div>
                      <button onClick={() => { setShowAddContact(s => !s); setContactForm({ ...DEFAULT_CONTACT_FORM }); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                        <Plus size={11} /> Add
                      </button>
                      <button onClick={() => setContactsLead(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Add contact inline form */}
                    {showAddContact && (
                      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">New Contact</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="Full name *"
                              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          </div>
                          <input value={contactForm.role} onChange={e => setContactForm(f => ({ ...f, role: e.target.value }))}
                            placeholder="Role (e.g. Founder, CMO)"
                            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          <input value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="Email"
                            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="Phone / WhatsApp"
                            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          <input value={contactForm.linkedin_url} onChange={e => setContactForm(f => ({ ...f, linkedin_url: e.target.value }))}
                            placeholder="LinkedIn URL"
                            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          <input value={contactForm.instagram_handle} onChange={e => setContactForm(f => ({ ...f, instagram_handle: e.target.value }))}
                            placeholder="@instagram"
                            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          <div className="col-span-2">
                            <input value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))}
                              placeholder="Notes (optional)"
                              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6B7280] bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(16,185,129,0.5)] focus:outline-none" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveContact} disabled={savingContact || !contactForm.name.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
                            {savingContact ? <Loader size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                            Save Contact
                          </button>
                          <button onClick={() => setShowAddContact(false)}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Contact list */}
                    {loadingContacts
                      ? <div className="flex items-center justify-center py-10"><Loader size={18} className="animate-spin text-[#818CF8]" /></div>
                      : leadContacts.length === 0
                        ? <div className="py-10 text-center">
                            <Users size={22} className="text-[#4B5563] mx-auto mb-2" />
                            <p className="text-[#6B7280] text-sm">No contacts yet.</p>
                            <p className="text-[#4B5563] text-xs mt-1">Enter a domain and click Hunter to auto-fetch, or use "+ Add" to add manually.</p>
                          </div>
                        : leadContacts.map(contact => (
                            <div key={contact.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.25))', color: '#C4B5FD' }}>
                                    {contact.name[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold text-sm">{contact.name}</p>
                                    {contact.role && <p className="text-[#818CF8] text-xs">{contact.role}</p>}
                                  </div>
                                </div>
                                <button onClick={() => deleteContact(contact.id)} disabled={deletingContactId === contact.id}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity flex-shrink-0"
                                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                  {deletingContactId === contact.id ? <Loader size={10} className="animate-spin text-red-400" /> : <Trash2 size={10} className="text-red-400" />}
                                </button>
                              </div>
                              <div className="mt-3 space-y-1.5 pl-12">
                                {contact.email && (
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest w-16 flex-shrink-0">Email</span>
                                    <span className="text-[#D1D5DB] text-xs flex-1 truncate">{contact.email}</span>
                                    <button onClick={() => copyText(contact.email!, `email-${contact.id}`)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: copiedId === `email-${contact.id}` ? '#10B981' : '#6B7280' }}>
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest w-16 flex-shrink-0">Phone</span>
                                    <span className="text-[#D1D5DB] text-xs flex-1">{contact.phone}</span>
                                    <button onClick={() => copyText(contact.phone!, `phone-${contact.id}`)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: copiedId === `phone-${contact.id}` ? '#10B981' : '#6B7280' }}>
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                )}
                                {contact.linkedin_url && (
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest w-16 flex-shrink-0">LinkedIn</span>
                                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                                      className="text-[#818CF8] text-xs hover:underline truncate flex-1">{contact.linkedin_url.replace('https://linkedin.com/in/', '')}</a>
                                    <button onClick={() => copyText(contact.linkedin_url!, `li-${contact.id}`)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: copiedId === `li-${contact.id}` ? '#10B981' : '#6B7280' }}>
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                )}
                                {contact.instagram_handle && (
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest w-16 flex-shrink-0">Instagram</span>
                                    <span className="text-[#D1D5DB] text-xs flex-1">{contact.instagram_handle}</span>
                                    <button onClick={() => copyText(contact.instagram_handle!, `ig-${contact.id}`)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: copiedId === `ig-${contact.id}` ? '#10B981' : '#6B7280' }}>
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                )}
                                {contact.notes && (
                                  <div className="flex items-start gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest w-16 flex-shrink-0 mt-0.5">Notes</span>
                                    <p className="text-[#9CA3AF] text-xs leading-relaxed">{contact.notes}</p>
                                  </div>
                                )}
                                {!contact.email && !contact.phone && !contact.linkedin_url && !contact.instagram_handle && (
                                  <p className="text-[#4B5563] text-xs italic">No contact details added.</p>
                                )}
                              </div>
                            </div>
                          ))
                    }
                  </div>
                </div>
              </div>,
              document.body
            )}

          </div>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-heading font-bold text-white text-2xl">Settings</h2>
            <div className="glass-card rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-[#9CA3AF] text-sm">Admin account: <span className="text-white">{user?.email}</span></p>
              <p className="text-[#6B7280] text-xs mt-2">Logged in as <span className="text-[#818CF8] font-semibold">{adminName}</span></p>
            </div>
          </div>
        )}
      </main>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => { setShowAddSection(false); setThumbnailFile(null); setNewSectionHandle(''); setNewSectionLink(''); if (sectionFileRef.current) sectionFileRef.current.value = ''; }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card rounded-3xl p-8" style={{ background: 'rgba(12,12,12,0.98)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-white text-xl">Add New Section</h3>
              <button onClick={() => { setShowAddSection(false); setThumbnailFile(null); setNewSectionHandle(''); setNewSectionLink(''); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Section Name</label>
                <input type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g. E-Commerce Ads" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Instagram Handle</label>
                  <input type="text" value={newSectionHandle} onChange={e => setNewSectionHandle(e.target.value)} placeholder="@yourbrand" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em]">Instagram Link</label>
                  <input type="url" value={newSectionLink} onChange={e => setNewSectionLink(e.target.value)} placeholder="https://instagram.com/…" className={inputClass} />
                </div>
              </div>
              <div className="border-2 border-dashed border-white/[0.10] rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors" onClick={() => sectionFileRef.current?.click()}>
                {thumbnailPreview
                  ? <div className="relative aspect-video bg-white/[0.04]"><img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent"><p className="text-[#9CA3AF] text-xs">Click to change</p></div></div>
                  : <div className="p-6 flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}><Upload size={18} className="text-[#818CF8]" /></div><p className="text-[#9CA3AF] text-sm text-center">Click to upload thumbnail</p></div>
                }
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
