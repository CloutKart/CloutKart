import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Image, CreditCard, Settings, LogOut, ArrowRight,
  Download, Clock, CheckCircle, Loader, ChevronRight, AlertCircle,
  Sparkles, Images, IndianRupee, MessageCircle, ExternalLink, Send,
  Star, Zap, MessageSquare, Lock, RefreshCw, Upload, X, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NotificationBell } from '../components/NotificationBell';
import { usePushNotifications } from '../hooks/usePushNotifications';

type Tab = 'overview' | 'creative' | 'gallery' | 'plan' | 'messages' | 'settings';
const FREE_CREATIVE_LIMIT = 3;

interface CreativeRequest {
  id: string;
  brand_name: string;
  niche: string;
  ad_format: string;
  description: string;
  reference_url: string;
  status: string;
  creative_url: string;
  creative_urls?: string[];
  creative_caption?: string;
  client_message?: string;
  created_at: string;
}

interface VisionData {
  creativeVibe: { label: string; description: string };
  visualDirection: string;
  productColors: Array<{ name: string; hex: string }>;
  vibeColors: Array<{ name: string; hex: string }>;
  vibeColorRationale: string;
  colorStory?: Array<{ name: string; hex: string }>; // legacy fallback
  hook: string;
  adCaption: string;
  whatWeWillCreate: string[];
}

interface UserProfile {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  plan: string;
  clout_club_price: number | null;
  subscription_expires_at: string | null;
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

const timelineSteps = ['Submitted', 'In Review', 'In Production', 'Ready to Download'];
const statusToStep: Record<string, number> = { pending: 0, in_progress: 2, completed: 3 };

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayButtonProps {
  amountPaise: number;
  userEmail: string;
  userName: string;
  userId: string;
}

function RazorpayButton({ amountPaise, userEmail, userName, userId }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  async function handlePay() {
    setLoading(true);
    setError('');

    const loaded = await loadRazorpayScript();
    if (!loaded || !RAZORPAY_KEY) {
      setError('Payment service unavailable. Please contact us directly.');
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in again.'); setLoading(false); return; }

      // Step 1: Create order server-side (requires secret key)
      const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount_paise: amountPaise, user_id: userId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        setError(orderData.error || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: amountPaise,
        currency: 'INR',
        order_id: orderData.order_id,
        name: 'CloutKart',
        description: 'Clout Club Subscription',
        image: '/logo.png',
        prefill: { name: userName, email: userEmail },
        theme: { color: '#A855F7' },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            // Step 2: Verify HMAC signature server-side and record payment
            const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount_paise: amountPaise,
                user_id: userId,
              }),
            });
            if (!verifyRes.ok) {
              const errData = await verifyRes.json();
              console.error('Payment verification failed:', errData.error);
            }
            window.location.reload();
          } catch (_err) {
            console.error('Payment recording failed:', _err);
            window.location.reload();
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      console.error('Payment init error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading || !RAZORPAY_KEY}
        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.7), rgba(59,130,246,0.65), rgba(6,182,212,0.6))' }}
      >
        {loading ? <Loader size={14} className="animate-spin" /> : <IndianRupee size={14} />}
        Pay ₹{(amountPaise / 100).toLocaleString('en-IN')}/mo
        <ArrowRight size={14} />
      </button>
      {!RAZORPAY_KEY && <p className="text-[#F59E0B] text-xs">Payment not yet configured. Contact us.</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── Chat message bubble ──────────────────────────────────────────────────────
function MessageBubble({ msg, creativeRequests }: { msg: Message; creativeRequests: CreativeRequest[] }) {
  const fromAdmin = msg.is_from_admin;
  const creative = msg.creative_request_id
    ? creativeRequests.find(r => r.id === msg.creative_request_id)
    : null;

  return (
    <div className={`flex ${fromAdmin ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[80%] ${fromAdmin ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
        {creative && (
          <p className="text-[10px] font-semibold uppercase tracking-wider px-1"
            style={{ color: '#C084FC' }}>
            Re: {creative.brand_name} — {creative.ad_format}
          </p>
        )}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={fromAdmin
            ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#E2E8F0', borderBottomLeftRadius: 6 }
            : { background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(59,130,246,0.2))', border: '1px solid rgba(168,85,247,0.3)', color: '#F3E8FF', borderBottomRightRadius: 6 }
          }
        >
          {msg.content}
        </div>
        <p className="text-[10px] text-[#6B7280] px-1">
          {fromAdmin ? 'CloutKart Team' : 'You'} · {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─── Image helpers ───────────────────────────────────────────────────────────
interface RefImage { preview: string; base64: string; mimeType: string; }

function resizeImageToBase64(file: File, maxPx = 1000): Promise<RefImage> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(objectUrl);
      resolve({ preview: dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// ─── Color Naming ────────────────────────────────────────────────────────────
const COLOR_PALETTE = [
  { name: 'Signal Red', hex: '#FF2B2B' }, { name: 'Dried Blood', hex: '#8B1A1A' },
  { name: 'Rust Ember', hex: '#C0392B' }, { name: 'Faded Crimson', hex: '#DC143C' },
  { name: 'Brick Dust', hex: '#CB4154' }, { name: 'Furnace Glow', hex: '#FF6B35' },
  { name: 'Burnt Sienna', hex: '#E97451' }, { name: 'Desert Clay', hex: '#C2713A' },
  { name: 'Smoked Tangerine', hex: '#E8730A' }, { name: 'Amber Residue', hex: '#FFBF00' },
  { name: 'Furious Yellow', hex: '#FFD700' }, { name: 'Sulfur Flare', hex: '#E8E040' },
  { name: 'Pale Voltage', hex: '#F0F020' }, { name: 'Honeycomb Static', hex: '#FFC30F' },
  { name: 'Aged Parchment', hex: '#F5DEB3' }, { name: 'Acid Wash', hex: '#7FFF00' },
  { name: 'Sage Smoke', hex: '#78866B' }, { name: 'Olive Skin', hex: '#6B8E23' },
  { name: 'Dead Leaf', hex: '#4F7942' }, { name: 'Petrol Slick', hex: '#2E8B57' },
  { name: 'Malachite Bruise', hex: '#0BDA51' }, { name: 'Hospital Green', hex: '#00A86B' },
  { name: 'Drowned Teal', hex: '#008080' }, { name: 'Ice Burn', hex: '#00CED1' },
  { name: 'Absinthe Mist', hex: '#7FFFD4' }, { name: 'Frozen Pipeline', hex: '#40E0D0' },
  { name: 'Midnight Ink', hex: '#191970' }, { name: 'Navy Séance', hex: '#000080' },
  { name: 'Petrol Drift', hex: '#003153' }, { name: 'Denim Ghost', hex: '#1560BD' },
  { name: 'Cold Signal', hex: '#4169E1' }, { name: 'Washed Indigo', hex: '#5865A0' },
  { name: 'Gunmetal Sky', hex: '#2F4F4F' }, { name: 'Storm Front', hex: '#708090' },
  { name: 'Bruised Violet', hex: '#8B008B' }, { name: 'Ink Stain', hex: '#4B0082' },
  { name: 'Dusk Plum', hex: '#673AB7' }, { name: 'Acetone Purple', hex: '#7B2FBE' },
  { name: 'Toxic Lavender', hex: '#9B59B6' }, { name: 'Faded Orchid', hex: '#DA70D6' },
  { name: 'Pale Séance', hex: '#C9B1FF' }, { name: 'Overexposed Rose', hex: '#FF007F' },
  { name: 'Fever Pink', hex: '#FF6B8A' }, { name: 'Washed Flamingo', hex: '#FC8EAC' },
  { name: 'Blush Static', hex: '#FFB6C1' }, { name: 'Raw Skin', hex: '#FFCBA4' },
  { name: 'Tobacco Stain', hex: '#8B4513' }, { name: 'Wet Earth', hex: '#6B4423' },
  { name: 'Coffee Dregs', hex: '#3C1A0E' }, { name: 'Driftwood', hex: '#A0785A' },
  { name: 'Bone Residue', hex: '#E8DCC8' }, { name: 'Ash Drift', hex: '#B2BEB5' },
  { name: 'Quarry Dust', hex: '#9E9E9E' }, { name: 'Worn Concrete', hex: '#808080' },
  { name: 'Cold Steel', hex: '#6D6D6D' }, { name: 'Lead Fog', hex: '#4A4A4A' },
  { name: 'Split Milk', hex: '#FFFFF0' }, { name: 'Bleached Linen', hex: '#FAF0E6' },
  { name: 'Salt Crust', hex: '#F5F5F5' }, { name: 'Overexposed', hex: '#FFFFFF' },
  { name: 'Crude Black', hex: '#1C1C1C' }, { name: 'Charred Grain', hex: '#2B2B2B' },
  { name: 'Void', hex: '#080808' },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function nameColor(hex: string): string {
  if (!hex || hex.length !== 7) return '';
  const [r1, g1, b1] = hexToRgb(hex);
  let closest = COLOR_PALETTE[0].name;
  let minDist = Infinity;
  for (const entry of COLOR_PALETTE) {
    const [r2, g2, b2] = hexToRgb(entry.hex);
    const dist = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
    if (dist < minDist) { minDist = dist; closest = entry.name; }
  }
  return closest;
}

// ─── Vision Panel ────────────────────────────────────────────────────────────
function KartLoader() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex items-center gap-1.5">
        <span className="flex flex-col gap-[3px] items-end">
          <span className="h-px w-2.5 bg-white/70 rounded animate-streak-1" />
          <span className="h-px w-3.5 bg-white/70 rounded animate-streak-2" />
          <span className="h-px w-2 bg-white/70 rounded animate-streak-3" />
        </span>
        <ShoppingCart size={15} className="animate-kart-roll" />
      </span>
      Generating vision…
    </span>
  );
}

function Typewriter({ text, speed = 20, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [n, setN] = useState(0);
  const firedRef = useRef(false);
  useEffect(() => {
    if (!text) { onDone?.(); return; }
    setN(0);
    firedRef.current = false;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && (
        <span className="inline-block w-px h-[0.85em] bg-white/50 animate-pulse ml-0.5 align-text-bottom" />
      )}
    </>
  );
}

function VisionPanel({ vision, onChange, onApprove, submitting, submitError, animKey, visionImage, generatingVisionImage }: {
  vision: VisionData;
  onChange: (v: VisionData) => void;
  onApprove: () => void;
  submitting: boolean;
  submitError: string;
  animKey: number;
  visionImage?: string | null;
  generatingVisionImage?: boolean;
}) {
  const prodColorRef0 = useRef<HTMLInputElement>(null);
  const prodColorRef1 = useRef<HTMLInputElement>(null);
  const prodColorRef2 = useRef<HTMLInputElement>(null);
  const vibeColorRef0 = useRef<HTMLInputElement>(null);
  const vibeColorRef1 = useRef<HTMLInputElement>(null);
  const vibeColorRef2 = useRef<HTMLInputElement>(null);
  const prodColorRefs: React.RefObject<HTMLInputElement>[] = [prodColorRef0, prodColorRef1, prodColorRef2];
  const vibeColorRefs: React.RefObject<HTMLInputElement>[] = [vibeColorRef0, vibeColorRef1, vibeColorRef2];

  // ── Animation state ──────────────────────────────────────────────────────────
  // phase 0-6: animating sections in sequence; phase 7+: all visible + editable
  const [phase, setPhase] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const advance = useCallback(() => setPhase(p => Math.min(p + 1, 7)), []);

  useEffect(() => {
    if (!animKey) return;
    setPhase(0);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 30);
  }, [animKey]);

  // Advance color phases via timeout (CSS animation handles the visual, timeout triggers next phase)
  useEffect(() => {
    if (phase === 2 || phase === 3) {
      const t = setTimeout(advance, 3 * 130 + 450);
      return () => clearTimeout(t);
    }
    if (phase === 6) {
      const count = vision.whatWeWillCreate?.length || 4;
      const t = setTimeout(advance, count * 220 + 350);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Helper: is this section visible yet?
  const show = (n: number) => phase >= n;
  // Helper: is this section currently animating (typewriter active)?
  const typing = (n: number) => phase === n;
  // ─────────────────────────────────────────────────────────────────────────────

  function updateColor(array: 'productColors' | 'vibeColors', idx: number, field: 'name' | 'hex', value: string) {
    const next = (vision[array] ?? []).map((c, i) => {
      if (i !== idx) return c;
      if (field === 'hex') {
        const normalized = value.startsWith('#') ? value : `#${value}`;
        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
          return { name: nameColor(normalized), hex: normalized };
        }
        return { ...c, hex: value };
      }
      return { ...c, [field]: value };
    });
    onChange({ ...vision, [array]: next });
  }

  function updateDeliverable(idx: number, value: string) {
    const next = vision.whatWeWillCreate.map((d, i) => i === idx ? value : d);
    onChange({ ...vision, whatWeWillCreate: next });
  }

  const divider = <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />;
  const sectionLabel = "block text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.12em] mb-3";
  const editableText = "w-full bg-transparent text-[#D1D5DB] resize-none focus:outline-none leading-relaxed text-sm";
  const editableInput = "w-full bg-transparent text-white focus:outline-none text-sm leading-relaxed";

  // Derive palette tint from extracted product colors
  const productColors = vision.productColors ?? vision.colorStory ?? [];
  const pc0 = productColors[0];
  const pc2 = productColors[2] ?? productColors[1] ?? pc0;
  const paletteOverlay = pc0 && pc2
    ? (() => {
        const [r0, g0, b0] = hexToRgb(pc0.hex);
        const [r1, g1, b1] = hexToRgb(pc2.hex);
        return `linear-gradient(145deg, rgba(${r0},${g0},${b0},0.14) 0%, rgba(${r1},${g1},${b1},0.08) 60%, transparent 100%)`;
      })()
    : null;
  const paletteBorderColor = pc0 && show(2)
    ? (() => { const [r, g, b] = hexToRgb(pc0.hex); return `rgba(${r},${g},${b},0.40)`; })()
    : 'rgba(255,255,255,0.1)';

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col relative"
      style={{ background: 'rgba(14,10,26,0.97)', border: `1px solid ${paletteBorderColor}`, transition: 'border-color 0.7s ease' }}>

      {/* Palette tint — absolute overlay that fades in when product colors are extracted */}
      {paletteOverlay && (
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ background: paletteOverlay, opacity: show(2) ? 1 : 0, transition: 'opacity 0.7s ease' }} />
      )}

      {/* Content sits above the overlay */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#C084FC]" />
          <h3 className="font-heading font-semibold text-white text-sm">Our vision</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
          <Sparkles size={10} />
          Pixie · AI Creative Intelligence
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">

        {/* MOOD IMAGE — above the vision content */}
        {(visionImage || generatingVisionImage) && (
          <div className="relative overflow-hidden border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {generatingVisionImage && !visionImage ? (
              <div className="w-full flex items-center justify-center gap-2.5 py-12"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(99,102,241,0.04) 50%, rgba(6,182,212,0.04) 100%)' }}>
                <Sparkles size={13} className="text-[#A855F7] animate-spin" />
                <span className="text-[11px] text-[#9CA3AF] font-medium">Generating mood image…</span>
              </div>
            ) : visionImage ? (
              <img
                src={`data:image/jpeg;base64,${visionImage}`}
                alt="Campaign mood image"
                className="w-full object-cover"
                style={{ maxHeight: 220, display: 'block' }}
              />
            ) : null}
            <div className="absolute top-2 left-2 pointer-events-none">
              <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(168,85,247,0.35)', color: '#C084FC' }}>
                <Sparkles size={8} />
                AI Mood Image · Stability AI
              </span>
            </div>
          </div>
        )}

        {/* CREATIVE VIBE */}
        {show(0) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>Creative Vibe</span>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full px-3 py-1"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
              {typing(0)
                ? <span className="text-xs font-semibold text-[#C084FC]"><Typewriter text={vision.creativeVibe.label} speed={40} /></span>
                : <input value={vision.creativeVibe.label} onChange={e => onChange({ ...vision, creativeVibe: { ...vision.creativeVibe, label: e.target.value } })} className="bg-transparent focus:outline-none text-xs font-semibold text-[#C084FC]" style={{ minWidth: 50, maxWidth: 130 }} />
              }
            </div>
            {typing(0)
              ? <p className={editableText}><Typewriter text={vision.creativeVibe.description} speed={12} onDone={advance} /></p>
              : <textarea value={vision.creativeVibe.description} onChange={e => onChange({ ...vision, creativeVibe: { ...vision.creativeVibe, description: e.target.value } })} rows={2} className={editableText} />
            }
          </div>
        </div>}
        {show(0) && divider}

        {/* VISUAL DIRECTION */}
        {show(1) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>Visual Direction</span>
          {typing(1)
            ? <p className={editableText}><Typewriter text={vision.visualDirection} speed={7} onDone={advance} /></p>
            : <textarea value={vision.visualDirection} onChange={e => onChange({ ...vision, visualDirection: e.target.value })} rows={3} className={editableText} />
          }
        </div>}
        {show(1) && divider}

        {/* PRODUCT COLORS */}
        {show(2) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>Product Colors</span>
          <div className="grid grid-cols-3 gap-2">
            {(vision.productColors ?? vision.colorStory ?? []).slice(0, 3).map((color, idx) => (
              <div key={idx} className="rounded-xl px-3 py-3 flex flex-col gap-1.5 animate-swatch-pop"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${idx * 130}ms` }}>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      style={{ background: color.hex }} />
                    <input
                      ref={prodColorRefs[idx]}
                      type="color"
                      value={color.hex.length === 7 ? color.hex : '#000000'}
                      onChange={e => updateColor('productColors', idx, 'hex', e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0, border: 'none' }}
                    />
                  </div>
                  <input
                    value={color.name}
                    onChange={e => updateColor('productColors', idx, 'name', e.target.value)}
                    className="bg-transparent focus:outline-none text-[#E5E7EB] text-xs font-medium w-full min-w-0"
                  />
                </div>
                <input
                  value={color.hex}
                  onChange={e => updateColor('productColors', idx, 'hex', e.target.value)}
                  className="bg-transparent focus:outline-none font-mono text-[#6B7280] text-[11px] w-full"
                />
              </div>
            ))}
          </div>
        </div>}
        {show(2) && divider}

        {/* VIBE COLORS */}
        {show(3) && <div className="px-5 py-4 animate-vision-section">
          <div className="flex items-center justify-between mb-3">
            <span className={sectionLabel} style={{ marginBottom: 0 }}>Vibe Colors</span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
              Campaign Atmosphere
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(vision.vibeColors ?? []).slice(0, 3).map((color, idx) => (
              <div key={idx} className="rounded-xl px-3 py-3 flex flex-col gap-1.5 animate-swatch-pop"
                style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)', animationDelay: `${idx * 130}ms` }}>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      style={{ background: color.hex }} />
                    <input
                      ref={vibeColorRefs[idx]}
                      type="color"
                      value={color.hex.length === 7 ? color.hex : '#000000'}
                      onChange={e => updateColor('vibeColors', idx, 'hex', e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0, border: 'none' }}
                    />
                  </div>
                  <input
                    value={color.name}
                    onChange={e => updateColor('vibeColors', idx, 'name', e.target.value)}
                    className="bg-transparent focus:outline-none text-[#E5E7EB] text-xs font-medium w-full min-w-0"
                  />
                </div>
                <input
                  value={color.hex}
                  onChange={e => updateColor('vibeColors', idx, 'hex', e.target.value)}
                  className="bg-transparent focus:outline-none font-mono text-[#6B7280] text-[11px] w-full"
                />
              </div>
            ))}
          </div>
          {vision.vibeColorRationale && (
            <p className="text-[11px] leading-relaxed italic"
              style={{ color: 'rgba(192,132,252,0.7)' }}>
              {vision.vibeColorRationale}
            </p>
          )}
        </div>}
        {show(3) && divider}

        {/* HOOK */}
        {show(4) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>Hook</span>
          <div className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {typing(4)
              ? <p className="font-heading font-bold text-white text-base leading-snug min-h-[1.5rem]">
                  <Typewriter text={vision.hook} speed={55} onDone={advance} />
                </p>
              : <input value={vision.hook} onChange={e => onChange({ ...vision, hook: e.target.value })}
                  className="w-full bg-transparent focus:outline-none font-heading font-bold text-white text-base leading-snug" />
            }
          </div>
        </div>}
        {show(4) && divider}

        {/* AD CAPTION */}
        {show(5) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>Ad Caption</span>
          {typing(5)
            ? <p className={editableText}><Typewriter text={vision.adCaption} speed={9} onDone={advance} /></p>
            : <textarea value={vision.adCaption} onChange={e => onChange({ ...vision, adCaption: e.target.value })} rows={3} className={editableText} />
          }
        </div>}
        {show(5) && divider}

        {/* WHAT WE WILL CREATE */}
        {show(6) && <div className="px-5 py-4 animate-vision-section">
          <span className={sectionLabel}>What We Will Create</span>
          <div className="space-y-2.5">
            {vision.whatWeWillCreate.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 animate-deliverable-slide"
                style={{ animationDelay: `${idx * 220}ms` }}>
                <CheckCircle size={15} className="text-[#10B981] flex-shrink-0" />
                <input
                  value={item}
                  onChange={e => updateDeliverable(idx, e.target.value)}
                  className={`${editableInput} text-[#D1D5DB]`}
                />
              </div>
            ))}
          </div>
        </div>}
      </div>

      {/* Footer: Approve button */}
      <div className="border-t px-5 py-4 flex items-center justify-end gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>

        {submitError && (
          <span className="text-red-300 text-xs flex-1 text-right">{submitError}</span>
        )}

        <button
          onClick={onApprove}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)', color: '#fff' }}>
          {submitting
            ? <><Loader size={13} className="animate-spin" />Sending…</>
            : <>Approve vision</>}
        </button>
      </div>

      </div>{/* end content layer */}
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  usePushNotifications(user?.id ?? null, false);
  const [tab, setTab] = useState<Tab>('overview');
  const [creativeRequests, setCreativeRequests] = useState<CreativeRequest[]>([]);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ brandName: '', niche: '', adFormat: '', description: '', referenceUrl: '' });
  const [vision, setVision] = useState<VisionData | null>(null);
  const [visionKey, setVisionKey] = useState(0);
  const [generatingVision, setGeneratingVision] = useState(false);
  const [visionError, setVisionError] = useState('');
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [generatingVisionImage, setGeneratingVisionImage] = useState(false);
  const [refImages, setRefImages] = useState<RefImage[]>([]);
  const refImageRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({ full_name: null, company_name: null, phone: null, plan: 'free', clout_club_price: null, subscription_expires_at: null });
  const [settingsForm, setSettingsForm] = useState({ fullName: '', company: '', phone: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, company_name, phone, plan, clout_club_price, subscription_expires_at')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      setProfile(data as UserProfile);
      setSettingsForm({ fullName: data.full_name ?? user?.user_metadata?.full_name ?? '', company: data.company_name ?? '', phone: data.phone ?? '' });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('free_creative_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setCreativeRequests((data as CreativeRequest[]) ?? []); setLoadingRequest(false); });
    loadProfile();
  }, [user, loadProfile]);

  // Load messages when Messages tab opens
  useEffect(() => {
    if (tab !== 'messages' || !user) return;
    loadMessages();
  }, [tab, user]);

  // Real-time messages subscription — deduplicates against optimistic inserts
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`messages:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const incoming = payload.new as Message;
        setMessages(prev =>
          prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a subscription expiry notification once per day when within 7 days of expiry
  useEffect(() => {
    if (!user || profile.plan !== 'clout_club' || !profile.subscription_expires_at) return;
    const msLeft = new Date(profile.subscription_expires_at).getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    if (daysLeft > 7) return;

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `ck_sub_notif_${user.id}`;
    if (localStorage.getItem(storageKey) === today) return;

    const expired = msLeft <= 0;
    supabase.from('notifications').insert({
      user_id: user.id,
      type: expired ? 'subscription_expired' : 'subscription_expiring',
      title: expired
        ? 'Subscription expired'
        : `Renew soon — ${Math.max(0, daysLeft)} day${daysLeft === 1 ? '' : 's'} left`,
      body: expired
        ? 'Your Clout Club subscription has expired. Renew to continue using chat and feedback.'
        : `Your subscription expires on ${new Date(profile.subscription_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Renew to avoid interruption.`,
      data: { expires_at: profile.subscription_expires_at },
      is_admin_notification: false,
    }).then(() => localStorage.setItem(storageKey, today));
  }, [user?.id, profile.plan, profile.subscription_expires_at]);

  async function loadMessages() {
    if (!user) return;
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to load messages:', error.message);
      setMessageError('Could not load messages. Make sure the messages table has been created in Supabase.');
    } else {
      const msgs = (data as Message[]) ?? [];
      const hasUnread = msgs.some(m => m.is_from_admin && !m.is_read);
      if (hasUnread) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_from_admin', true)
          .eq('is_read', false);
        setMessages(msgs.map(m => m.is_from_admin ? { ...m, is_read: true } : m));
      } else {
        setMessages(msgs);
      }
    }
    setLoadingMessages(false);
  }

  async function sendMessage() {
    if (!messageInput.trim() || !user) return;
    setSendingMessage(true);
    setMessageError('');
    const { data: inserted, error } = await supabase.from('messages').insert({
      user_id: user.id,
      sender_id: user.id,
      is_from_admin: false,
      content: messageInput.trim(),
      type: 'chat',
    }).select().single();
    if (error) {
      console.error('Send message error:', error.message, error.code);
      setMessageError(error.code === '42P01'
        ? 'Messages table not found. Please run the Supabase migration first.'
        : `Failed to send: ${error.message}`);
    } else if (inserted) {
      setMessages(prev => [...prev, inserted as Message]);
      setMessageInput('');
    }
    setSendingMessage(false);
  }

  async function sendFeedback(requestId: string) {
    if (!feedbackText.trim() || !user) return;
    setSendingFeedback(true);
    setFeedbackError('');
    const { data: inserted, error } = await supabase.from('messages').insert({
      user_id: user.id,
      sender_id: user.id,
      is_from_admin: false,
      content: feedbackText.trim(),
      type: 'feedback',
      creative_request_id: requestId,
    }).select().single();
    if (error) {
      console.error('Send feedback error:', error.message, error.code);
      setFeedbackError(error.code === '42P01'
        ? 'Messages table not found.'
        : `Failed to send: ${error.message}`);
    } else if (inserted) {
      setMessages(prev => [...prev, inserted as Message]);
      setFeedbackText('');
      setFeedbackOpen(null);
    }
    setSendingFeedback(false);
  }

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitError('');
  };

  const generateVision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandName.trim() || !form.niche.trim() || !form.adFormat || !form.description.trim()) {
      setVisionError('Please fill in Brand Name, Niche, Ad Format, and Description first.');
      return;
    }
    setGeneratingVision(true);
    setVisionError('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-creative-vision', {
        body: {
          brandName: form.brandName, niche: form.niche, adFormat: form.adFormat,
          description: form.description, referenceUrl: form.referenceUrl,
          referenceImages: refImages.map(({ base64, mimeType }) => ({ base64, mimeType })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Normalize whatWeWillCreate — model occasionally returns objects instead of strings
      if (Array.isArray(data?.whatWeWillCreate)) {
        data.whatWeWillCreate = data.whatWeWillCreate.map((item: unknown) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const o = item as Record<string, unknown>;
            return [o.title, o.description, o.format, o.platform, o.dimensions]
              .filter(Boolean).join(' — ');
          }
          return String(item);
        });
      }
      const visionData = data as VisionData;
      setVision(visionData);
      setVisionKey(k => k + 1);
      // Kick off image generation in parallel — non-blocking
      setVisionImage(null);
      generateVisionImage(visionData, form.brandName, form.niche, refImages);
    } catch (err: unknown) {
      setVisionError(err instanceof Error ? err.message : 'Failed to generate vision. Please try again.');
    } finally {
      setGeneratingVision(false);
    }
  };

  const generateVisionImage = async (visionData: VisionData, brandName: string, niche: string, productImages: RefImage[] = []) => {
    setGeneratingVisionImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vision-image', {
        body: {
          vision: visionData,
          brandName,
          niche,
          referenceImages: productImages.slice(0, 1).map(({ base64, mimeType }) => ({ base64, mimeType })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.imageBase64) setVisionImage(data.imageBase64 as string);
    } catch (err: unknown) {
      console.warn('[VisionImage] Generation failed:', err instanceof Error ? err.message : err);
    } finally {
      setGeneratingVisionImage(false);
    }
  };

  async function handleRefImages(files: FileList) {
    const toAdd = Math.min(files.length, 3 - refImages.length);
    if (toAdd <= 0) return;
    const resized: RefImage[] = [];
    for (let i = 0; i < toAdd; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try { resized.push(await resizeImageToBase64(file)); } catch { /* skip */ }
    }
    setRefImages(prev => [...prev, ...resized].slice(0, 3));
  }

  function removeRefImage(idx: number) {
    setRefImages(prev => prev.filter((_, i) => i !== idx));
  }

  const handleApproveVision = async () => {
    if (!user || !vision) return;
    if (!isCloutClub && creativeRequests.length >= FREE_CREATIVE_LIMIT) {
      setSubmitError('You have already claimed your 3 free creatives.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: inserted, error: insertError } = await supabase.from('free_creative_requests').insert({
        user_id: user.id, brand_name: form.brandName, niche: form.niche, ad_format: form.adFormat,
        description: form.description, reference_url: form.referenceUrl, status: 'pending',
        approved_vision: vision,
      }).select().single();
      if (insertError) throw insertError;
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`${supabaseUrl}/functions/v1/send-creative-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            brandName: form.brandName, niche: form.niche, adFormat: form.adFormat,
            description: form.description, referenceUrl: form.referenceUrl,
            approvedVision: vision,
          }),
        });
      } catch (emailErr) { console.warn('Email notification failed:', emailErr); }
      setCreativeRequests(prev => [inserted, ...prev]);
      setForm({ brandName: '', niche: '', adFormat: '', description: '', referenceUrl: '' });
      setVision(null);
      setRefImages([]);
      setShowForm(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsSaving(true);
    await supabase.auth.updateUser({ data: { full_name: settingsForm.fullName } });
    await supabase.from('profiles').update({ full_name: settingsForm.fullName, company_name: settingsForm.company, phone: settingsForm.phone }).eq('id', user.id);
    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const userName = profile.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const creativeCount = creativeRequests.length;
  const freeCreativeCount = Math.min(creativeCount, FREE_CREATIVE_LIMIT);
  const freeCreativesLeft = Math.max(0, FREE_CREATIVE_LIMIT - freeCreativeCount);

  // Subscription expiry state
  const isCloutClubMember = profile.plan === 'clout_club';
  const _expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const subscriptionExpired = isCloutClubMember && _expiresAt !== null && _expiresAt < new Date();
  const isCloutClub = isCloutClubMember && !subscriptionExpired;
  const subscriptionExpiringSoon = isCloutClub && _expiresAt !== null &&
    _expiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const daysUntilExpiry = isCloutClub && _expiresAt
    ? Math.max(0, Math.ceil((_expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const freeCreativesClaimed = !isCloutClub && creativeCount >= FREE_CREATIVE_LIMIT;
  const galleryCreatives = creativeRequests.filter(r => r.status === 'completed' && r.creative_url);
  const getActiveStep = (request: CreativeRequest) => statusToStep[request.status] ?? 0;
  const isImageUrl = (url: string) => /\.(apng|avif|gif|jpe?g|png|webp)(\?.*)?$/i.test(url);
  const isVideoUrl = (url: string) => /\.(mp4|mov|webm|avi|m4v|mkv|ogv)(\?.*)?$/i.test(url);
  const unreadCount = messages.filter(m => m.is_from_admin && !m.is_read).length;

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6B7280] focus:outline-none transition-all duration-200 font-medium bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.5)] focus:bg-white/[0.07]";
  const labelClass = "block text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.08em] font-heading";

  // CC-aware sidebar style
  const sidebarBg = isCloutClub
    ? 'linear-gradient(180deg, rgba(22,8,45,0.98) 0%, rgba(12,5,25,0.98) 60%, rgba(10,10,12,0.98) 100%)'
    : 'rgba(10,10,10,0.95)';
  const mainBg = isCloutClub
    ? { background: '#080810', backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(168,85,247,0.07) 0%, transparent 70%), radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100% 100%, 28px 28px' }
    : { background: '#080808', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' };

  const navItems: { id: Tab; icon: React.ElementType; label: string; ccOnly?: boolean }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'creative', icon: Image, label: isCloutClub ? 'My Creatives' : 'My Creative' },
    { id: 'gallery', icon: Images, label: 'Gallery' },
    { id: 'plan', icon: CreditCard, label: 'My Plan' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', ccOnly: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ].filter(item => !item.ccOnly || isCloutClubMember);

  return (
    <div className="min-h-screen flex" style={mainBg}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/[0.06]"
        style={{ background: sidebarBg }}>
        <div className="px-5 pt-6 pb-4">
          <Link to="/"><img src="/logo.png" alt="CloutKart" className="h-8 w-auto object-contain opacity-80" /></Link>
          {isCloutClub && (
            <div className="mt-3 flex items-center gap-1.5">
              <Sparkles size={10} className="text-[#A855F7]" />
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg,#A855F7,#C084FC,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Clout Club
              </span>
            </div>
          )}
        </div>
        <div className="h-px mx-5 bg-white/[0.06]" />
        <nav className="flex-1 px-3 pt-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            const isMsg = id === 'messages';
            const isLocked = isMsg && subscriptionExpired;
            return (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{
                  background: active ? (isCloutClub ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.08)') : 'transparent',
                  borderLeft: active ? `2px solid ${isCloutClub ? '#C084FC' : '#A855F7'}` : '2px solid transparent',
                }}>
                <div className="relative">
                  <Icon size={16} style={{ color: isLocked ? '#6B7280' : active ? (isCloutClub ? '#C084FC' : '#A855F7') : '#9CA3AF' }} />
                  {isMsg && !isLocked && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                      style={{ background: '#A855F7', color: '#fff' }}>{unreadCount}</span>
                  )}
                  {isLocked && (
                    <Lock size={9} className="absolute -top-1 -right-1 text-[#6B7280]" />
                  )}
                </div>
                <span style={isLocked
                  ? { color: '#6B7280' }
                  : active
                    ? { background: isCloutClub ? 'linear-gradient(135deg,#C084FC,#818CF8)' : 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                    : { color: '#D1D5DB' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* CC member badge */}
        {isCloutClub && (
          <div className="mx-4 mb-4 rounded-xl p-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #A855F7, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-2 mb-1">
              <Star size={11} className="text-[#C084FC]" fill="#C084FC" />
              <span className="text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg,#C084FC,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Clout Club
              </span>
            </div>
            <p className="text-[#9CA3AF] text-[11px]">Active member</p>
          </div>
        )}

        <div className="px-5 pb-6 pt-4 border-t border-white/[0.06]">
          <p className="text-[#6B7280] text-xs mb-3 truncate">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Notification bell — desktop top right */}
        <div className="hidden md:flex justify-end mb-6">
          {user && <NotificationBell isAdmin={false} userId={user.id} />}
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                style={{ background: tab === id ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)', border: tab === id ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)', color: tab === id ? '#A855F7' : '#9CA3AF' }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          {user && <div className="flex-shrink-0"><NotificationBell isAdmin={false} userId={user.id} /></div>}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Subscription expired banner */}
            {subscriptionExpired && (
              <div className="rounded-2xl p-4 flex items-start justify-between gap-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Subscription Expired</p>
                    <p className="text-red-400/70 text-xs mt-0.5">Chat and feedback are locked. Your gallery and creatives are still accessible.</p>
                  </div>
                </div>
                <button onClick={() => setTab('plan')}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  <RefreshCw size={11} /> Renew
                </button>
              </div>
            )}
            {/* Subscription expiring soon banner */}
            {subscriptionExpiringSoon && daysUntilExpiry !== null && (
              <div className="rounded-2xl p-4 flex items-start justify-between gap-4"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm">
                      Subscription expires in {daysUntilExpiry} day{daysUntilExpiry === 1 ? '' : 's'}
                    </p>
                    <p className="text-amber-400/70 text-xs mt-0.5">
                      Renews on {_expiresAt!.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                    </p>
                  </div>
                </div>
                <button onClick={() => setTab('plan')}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}>
                  <RefreshCw size={11} /> Renew Now
                </button>
              </div>
            )}
            {/* Welcome card — CC variant */}
            {isCloutClub ? (
              <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(22,8,45,0.9), rgba(15,5,30,0.9))', border: '1px solid rgba(168,85,247,0.35)' }}>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-20"
                    style={{ background: 'radial-gradient(circle, #A855F7, transparent)', transform: 'translate(30%, -30%)' }} />
                  <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10"
                    style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', transform: 'translate(-30%, 30%)' }} />
                </div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-[#C084FC]" />
                      <span className="text-xs font-bold uppercase tracking-widest"
                        style={{ background: 'linear-gradient(135deg,#C084FC,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Clout Club Member
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-white text-2xl mb-1">Welcome back, {userName}</h2>
                    <p className="text-[#C4B5FD] text-sm opacity-80">Your campaigns are in motion.</p>
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
                    <Zap size={20} className="text-[#C084FC]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6" style={{ borderLeft: '3px solid #A855F7' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-white text-xl mb-1">Welcome back, {userName}</h2>
                    <p className="text-[#9CA3AF] text-sm">Here's what's happening with your account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Free creatives summary (free users only) */}
            {!isCloutClub && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-1">Your Free Creatives</p>
                    <h3 className="font-heading font-semibold text-white">{freeCreativesClaimed ? 'All creatives claimed' : creativeRequests[0] ? creativeRequests[0].brand_name : 'Free Creative Requests'}</h3>
                    <p className="text-[#6B7280] text-xs mt-1">{freeCreativeCount}/{FREE_CREATIVE_LIMIT} claimed</p>
                  </div>
                  {creativeRequests[0] && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
                      style={{ background: creativeRequests[0].status === 'completed' ? 'rgba(16,185,129,0.1)' : creativeRequests[0].status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${creativeRequests[0].status === 'completed' ? 'rgba(16,185,129,0.25)' : creativeRequests[0].status === 'in_progress' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`, color: creativeRequests[0].status === 'completed' ? '#10B981' : creativeRequests[0].status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>
                      {creativeRequests[0].status.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {freeCreativesClaimed
                  ? <p className="text-[#10B981] text-sm font-semibold">All 3 free creatives claimed.</p>
                  : creativeRequests[0]?.status === 'completed'
                    ? <a href={creativeRequests[0].creative_url || '#'} target="_blank" rel="noopener noreferrer" download className="btn-primary text-sm"><Download size={14} />Download Now<ArrowRight size={14} /></a>
                    : !creativeRequests[0] && !loadingRequest
                      ? <button onClick={() => setTab('creative')} className="btn-primary text-sm">Claim Free Creatives <ArrowRight size={14} /></button>
                      : <p className="text-[#6B7280] text-sm">{loadingRequest ? 'Loading...' : 'Your creative is being worked on.'}</p>
                }
              </div>
            )}

            {/* CC active campaigns summary */}
            {isCloutClub && creativeRequests.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#C4B5FD] text-xs font-semibold uppercase tracking-widest">Active Creatives</p>
                  <span className="text-xs font-mono font-bold"
                    style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {creativeRequests.length} total
                  </span>
                </div>
                <div className="space-y-2">
                  {creativeRequests.slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{r.brand_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: r.status === 'completed' ? 'rgba(16,185,129,0.1)' : r.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: r.status === 'completed' ? '#10B981' : r.status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`grid gap-4 ${isCloutClubMember && _expiresAt ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {([
                { label: 'Creatives', value: isCloutClub ? `${creativeCount}` : `${freeCreativeCount}/${FREE_CREATIVE_LIMIT}`, color: null as string | null },
                { label: 'Current Plan', value: isCloutClub ? 'Clout Club' : 'Free Plan', color: null },
                ...(isCloutClubMember && _expiresAt ? [{ label: 'Days Left', value: subscriptionExpired ? 'Expired' : `${daysUntilExpiry ?? 0}d`, color: subscriptionExpired ? '#EF4444' : subscriptionExpiringSoon ? '#F59E0B' : '#10B981' }] : []),
                { label: 'Member Since', value: memberSince, color: null },
              ]).map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-5"
                  style={isCloutClub ? { border: '1px solid rgba(168,85,247,0.18)', background: 'rgba(168,85,247,0.04)' } : {}}>
                  <p className="text-[#9CA3AF] text-xs font-medium mb-2">{s.label}</p>
                  <p className={`font-mono font-bold text-lg ${s.color ? '' : 'gradient-text'}`} style={s.color ? { color: s.color } : {}}>{s.value}</p>
                </div>
              ))}
            </div>

            {!isCloutClub && (
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-white font-heading font-semibold text-sm">Upgrade to Clout Club</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">Recurring ad production, priority turnaround</p>
                </div>
                <button onClick={() => setTab('plan')} className="flex items-center gap-1 text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  View Plans <ChevronRight size={14} style={{ color: '#A855F7' }} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY CREATIVE ───────────────────────────────────────────────────── */}
        {tab === 'creative' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">{isCloutClub ? 'My Creatives' : 'My Creative'}</h2>
            {loadingRequest && <div className="glass-card rounded-2xl p-10 flex items-center justify-center"><Loader size={20} className="animate-spin text-[#A855F7]" /></div>}

            {/* Free users: empty state */}
            {!loadingRequest && !isCloutClub && freeCreativeCount === 0 && !showForm && (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}><Image size={24} className="text-[#A855F7]" /></div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">Claim your 3 free creatives</h3>
                <p className="text-[#9CA3AF] text-sm mb-6 max-w-sm">Submit up to 3 free creative briefs. Each one takes 2 minutes and delivers in 48 hours.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Claim Creative 1 of 3<ArrowRight size={14} /></button>
              </div>
            )}

            {/* CC members: empty state */}
            {!loadingRequest && isCloutClub && creativeRequests.length === 0 && !showForm && (
              <div className="rounded-2xl p-10 flex flex-col items-center text-center"
                style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <Sparkles size={24} className="text-[#C084FC]" />
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">Start your first campaign</h3>
                <p className="text-[#C4B5FD] text-sm mb-6 max-w-sm opacity-80">Submit your creative brief and the team will get started on your campaign.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">New Creative Brief <ArrowRight size={14} /></button>
              </div>
            )}

            {/* Form + Vision panel */}
            {!loadingRequest && (isCloutClub || (!freeCreativesClaimed)) && showForm && (
              <div className={vision ? 'grid lg:grid-cols-2 gap-6 items-start' : ''}>
                {/* Brief form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <h3 className="font-heading font-semibold text-white text-lg mb-1">
                    {isCloutClub ? 'New Creative Brief' : 'Free Creative Request'}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm mb-6">
                    {isCloutClub ? 'Fill in your brief — then let us show you the vision.' : `Claiming creative ${freeCreativeCount + 1} of ${FREE_CREATIVE_LIMIT}.`}
                  </p>
                  <form onSubmit={generateVision} className="space-y-4">
                    <div><label className={labelClass}>Brand Name</label><input type="text" name="brandName" value={form.brandName} onChange={handleFormChange} placeholder="Your brand name" className={inputClass} required /></div>
                    <div><label className={labelClass}>Industry / Niche</label><input type="text" name="niche" value={form.niche} onChange={handleFormChange} placeholder="e.g. Fashion, SaaS, Food" className={inputClass} required /></div>
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
                    <div><label className={labelClass}>Brief Description</label><textarea name="description" value={form.description} onChange={handleFormChange} rows={4} placeholder="Describe your product, target audience, and what you want to convey..." className={`${inputClass} resize-none`} required /></div>
                    <div><label className={labelClass}>Reference URL (optional)</label><input type="url" name="referenceUrl" value={form.referenceUrl} onChange={handleFormChange} placeholder="https://..." className={inputClass} /></div>
                    {/* Reference images */}
                    <div>
                      <label className={labelClass}>Reference Images (optional, up to 3)</label>
                      {refImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-2">
                          {refImages.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img src={img.preview} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                              <button type="button" onClick={() => removeRefImage(idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {refImages.length < 3 && (
                        <button type="button" onClick={() => refImageRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-[#6B7280] border border-dashed transition-colors hover:border-white/20 hover:text-[#9CA3AF]"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                          <Upload size={14} />
                          {refImages.length === 0 ? 'Add reference images' : `Add more (${3 - refImages.length} left)`}
                        </button>
                      )}
                      <input ref={refImageRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={e => { if (e.target.files) handleRefImages(e.target.files); e.target.value = ''; }} />
                    </div>
                    {(visionError || submitError) && (
                      <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <span className="text-red-300 text-xs">{visionError || submitError}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="submit" disabled={generatingVision} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {generatingVision
                          ? <KartLoader />
                          : <><Sparkles size={14} />{vision ? 'Regenerate Vision' : 'See Our Vision'}</>}
                      </button>
                      <button type="button" onClick={() => { setShowForm(false); setVision(null); setVisionError(''); setRefImages([]); setVisionImage(null); }} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </form>
                </div>

                {/* Vision panel */}
                {vision && (
                  <VisionPanel
                    vision={vision}
                    onChange={setVision}
                    onApprove={handleApproveVision}
                    submitting={submitting}
                    submitError={submitError}
                    animKey={visionKey}
                    visionImage={visionImage}
                    generatingVisionImage={generatingVisionImage}
                  />
                )}
              </div>
            )}

            {/* Free users: counter + next slot */}
            {!loadingRequest && !isCloutClub && freeCreativeCount > 0 && !freeCreativesClaimed && (
              <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-1">Free Creatives</p>
                  <h3 className="font-heading font-semibold text-white text-lg">{freeCreativeCount}/{FREE_CREATIVE_LIMIT} claimed</h3>
                  <p className="text-[#6B7280] text-sm mt-1">{FREE_CREATIVE_LIMIT - freeCreativeCount} free request{FREE_CREATIVE_LIMIT - freeCreativeCount === 1 ? '' : 's'} remaining.</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm justify-center">
                  Claim Creative {freeCreativeCount + 1} of {FREE_CREATIVE_LIMIT}<ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* CC new brief button */}
            {!loadingRequest && isCloutClub && !showForm && (
              <div className="flex justify-end">
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                  <Sparkles size={14} /> New Brief <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Creative cards */}
            {!loadingRequest && creativeRequests.map((request, index) => {
              const activeStep = getActiveStep(request);
              // Normalise to array, falling back to singular creative_url for old records
              const allUrls: string[] = request.creative_urls?.length
                ? request.creative_urls
                : (request.creative_url ? [request.creative_url] : []);
              const primaryUrl = allUrls[0] ?? '';
              const primaryIsImage = isImageUrl(primaryUrl);
              const primaryIsVideo = isVideoUrl(primaryUrl);
              return (
                <div key={request.id} className="glass-card rounded-2xl p-6 sm:p-8"
                  style={isCloutClub ? { border: '1px solid rgba(168,85,247,0.15)' } : {}}>
                  <div className="flex items-start justify-between mb-4 sm:mb-8">
                    <div>
                      <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-widest mb-1">Creative {index + 1}</p>
                      <h3 className="font-heading font-semibold text-white text-lg">{request.brand_name}</h3>
                      <p className="text-[#9CA3AF] text-sm mt-1">{request.niche} · {request.ad_format}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
                      style={{ background: request.status === 'completed' ? 'rgba(16,185,129,0.1)' : request.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${request.status === 'completed' ? 'rgba(16,185,129,0.25)' : request.status === 'in_progress' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`, color: request.status === 'completed' ? '#10B981' : request.status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>
                      {request.status.replace('_', ' ')}
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
                              {i < timelineSteps.length - 1 && <div className="w-px flex-1 mt-1" style={{ height: 24, background: done ? 'linear-gradient(#A855F7,#3B82F6)' : 'rgba(255,255,255,0.06)' }} />}
                            </div>
                            <div className="pt-1">
                              <p className={`font-heading font-semibold text-sm ${active ? '' : done ? 'text-white' : 'text-[#6B7280]'}`}
                                style={active ? { background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
                                {step}
                              </p>
                              {active && request.status !== 'completed' && <Loader size={12} className="mt-1 text-[#A855F7] animate-spin" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.035)' }}>
                      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">Creative Preview</p>
                        {request.status === 'completed' && (
                          <span className="text-[11px] font-semibold text-[#10B981]">
                            {allUrls.length > 1 ? `${allUrls.length} files ready` : 'Ready'}
                          </span>
                        )}
                      </div>
                      <div className="min-h-[280px] sm:min-h-[360px] flex items-center justify-center p-4">
                        {request.status === 'completed' && primaryUrl ? (
                          primaryIsVideo ? (
                            <video src={primaryUrl} controls className="w-full max-h-[520px] rounded-xl" preload="metadata" />
                          ) : primaryIsImage ? (
                            <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                              <img src={primaryUrl} alt={`${request.brand_name} creative`} className="w-full max-h-[520px] object-contain rounded-xl" />
                            </a>
                          ) : (
                            <div className="text-center max-w-xs mx-auto">
                              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.24)' }}><Download size={22} className="text-[#A855F7]" /></div>
                              <p className="text-white font-heading font-semibold text-sm mb-1">File ready</p>
                              <p className="text-[#9CA3AF] text-xs leading-relaxed">Download to view this creative.</p>
                            </div>
                          )
                        ) : (
                          <div className="text-center max-w-xs mx-auto">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}><Image size={22} className="text-[#6B7280]" /></div>
                            <p className="text-white font-heading font-semibold text-sm mb-1">Preview appears here</p>
                            <p className="text-[#9CA3AF] text-xs leading-relaxed">Your completed creative will show here before download.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {request.status === 'completed' && (
                    <div className="mt-6 space-y-4">
                      {(request.creative_caption || request.client_message) && (
                        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {request.creative_caption && <p className="font-heading font-semibold text-white text-sm mb-2">{request.creative_caption}</p>}
                          {request.client_message && <p className="text-[#D1D5DB] text-sm leading-relaxed">{request.client_message}</p>}
                        </div>
                      )}
                      {allUrls.length === 1 ? (
                        <a href={allUrls[0]} target="_blank" rel="noopener noreferrer" download className="btn-primary text-sm">
                          <Download size={14} />Download Creative<ArrowRight size={14} />
                        </a>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">{allUrls.length} Files</p>
                          {allUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" download
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#D1D5DB' }}>
                              {isImageUrl(url) ? <Image size={14} className="text-[#818CF8] flex-shrink-0" /> : isVideoUrl(url) ? <ChevronRight size={14} className="text-[#818CF8] flex-shrink-0" /> : <Download size={14} className="text-[#818CF8] flex-shrink-0" />}
                              <span className="flex-1 truncate">File {i + 1}</span>
                              <Download size={13} className="text-[#6B7280] flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── GALLERY ───────────────────────────────────────────────────────── */}
        {tab === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-white text-2xl">Gallery</h2>
              <p className="text-[#9CA3AF] text-sm mt-1">Completed creatives uploaded for your account.</p>
            </div>
            {loadingRequest ? (
              <div className="glass-card rounded-2xl p-10 flex items-center justify-center"><Loader size={20} className="animate-spin text-[#A855F7]" /></div>
            ) : galleryCreatives.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}><Images size={24} className="text-[#A855F7]" /></div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">No uploaded creatives yet</h3>
                <p className="text-[#9CA3AF] text-sm max-w-sm">Once the team uploads completed creatives for you, they will appear here.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {galleryCreatives.map(request => {
                  const allUrls: string[] = request.creative_urls?.length
                    ? request.creative_urls
                    : (request.creative_url ? [request.creative_url] : []);
                  const primaryUrl = allUrls[0] ?? '';
                  const primaryIsImage = isImageUrl(primaryUrl);
                  const primaryIsVideo = isVideoUrl(primaryUrl);
                  const feedbackMessages = messages.filter(m => m.creative_request_id === request.id);
                  return (
                    <div key={request.id} className="glass-card rounded-2xl overflow-hidden"
                      style={isCloutClub ? { border: '1px solid rgba(168,85,247,0.15)' } : {}}>
                      {/* Primary preview */}
                      <div className="relative bg-white/[0.04] flex items-center justify-center" style={{ aspectRatio: '1' }}>
                        {primaryIsVideo ? (
                          <video src={primaryUrl} controls className="w-full h-full object-contain" preload="metadata" />
                        ) : primaryIsImage ? (
                          <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            <img src={primaryUrl} alt={request.creative_caption || `${request.brand_name} creative`} className="w-full h-full object-cover" loading="lazy" />
                          </a>
                        ) : (
                          <div className="text-center p-6">
                            <Download size={28} className="text-[#A855F7] mx-auto mb-3" />
                            <p className="text-white font-heading font-semibold text-sm">Download file</p>
                          </div>
                        )}
                        {allUrls.length > 1 && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.65)', color: '#D1D5DB', border: '1px solid rgba(255,255,255,0.15)' }}>
                            +{allUrls.length - 1} more
                          </span>
                        )}
                      </div>
                      {/* Extra file thumbnails strip */}
                      {allUrls.length > 1 && (
                        <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                          {allUrls.slice(1).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" download
                              className="flex-shrink-0 rounded-lg overflow-hidden border border-white/[0.1]"
                              style={{ width: 48, height: 48 }}>
                              {isImageUrl(url) ? (
                                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                              ) : isVideoUrl(url) ? (
                                <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/[0.06]">
                                  <Download size={14} className="text-[#818CF8]" />
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="relative z-10 p-4">
                        <p className="text-[#6B7280] text-[10px] font-semibold uppercase tracking-widest mb-1">{request.brand_name}</p>
                        <h3 className="font-heading font-semibold text-white text-base">{request.creative_caption || 'Creative'}</h3>
                        {request.client_message && <p className="text-[#D1D5DB] text-sm leading-relaxed mt-3">{request.client_message}</p>}
                        <div className="flex items-center gap-2 mt-4">
                          {allUrls.length === 1 ? (
                            <a href={allUrls[0]} target="_blank" rel="noopener noreferrer" download className="btn-secondary text-xs py-2 px-4 flex-1 justify-center">
                              <Download size={13} /> Download
                            </a>
                          ) : (
                            <div className="flex flex-col gap-1.5 flex-1">
                              {allUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" download
                                  className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl font-medium transition-all"
                                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#D1D5DB' }}>
                                  <Download size={12} className="text-[#818CF8] flex-shrink-0" />
                                  <span className="truncate">File {i + 1}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          {isCloutClubMember && (
                            <button
                              onClick={() => isCloutClub && setFeedbackOpen(feedbackOpen === request.id ? null : request.id)}
                              title={subscriptionExpired ? 'Renew subscription to leave feedback' : undefined}
                              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all"
                              style={{
                                background: feedbackOpen === request.id ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.08)',
                                border: '1px solid rgba(168,85,247,0.25)',
                                color: subscriptionExpired ? '#6B7280' : '#C084FC',
                                cursor: subscriptionExpired ? 'not-allowed' : 'pointer',
                                opacity: subscriptionExpired ? 0.5 : 1,
                              }}
                            >
                              {subscriptionExpired ? <Lock size={12} /> : <MessageSquare size={12} />}
                              {feedbackMessages.length > 0 && !subscriptionExpired ? `${feedbackMessages.length}` : 'Feedback'}
                            </button>
                          )}
                        </div>

                        {/* Feedback panel */}
                        {isCloutClub && feedbackOpen === request.id && (
                          <div className="mt-3 rounded-xl overflow-hidden"
                            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
                            {feedbackMessages.length > 0 && (
                              <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                                {feedbackMessages.map(m => (
                                  <div key={m.id} className={`text-xs px-3 py-2 rounded-xl ${m.is_from_admin ? 'text-[#E2E8F0]' : 'text-[#F3E8FF]'}`}
                                    style={{ background: m.is_from_admin ? 'rgba(99,102,241,0.1)' : 'rgba(168,85,247,0.12)' }}>
                                    <span className="font-semibold text-[10px] block mb-0.5"
                                      style={{ color: m.is_from_admin ? '#818CF8' : '#C084FC' }}>
                                      {m.is_from_admin ? 'CloutKart' : 'You'}
                                    </span>
                                    {m.content}
                                  </div>
                                ))}
                              </div>
                            )}
                            {feedbackError && (
                              <p className="text-red-400 text-[10px] px-2 pb-1">{feedbackError}</p>
                            )}
                            <div className="flex gap-2 p-2">
                              <input
                                value={feedbackText}
                                onChange={e => { setFeedbackText(e.target.value); setFeedbackError(''); }}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFeedback(request.id); } }}
                                placeholder="Leave feedback..."
                                className="flex-1 rounded-lg px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.1] focus:border-[rgba(168,85,247,0.4)]"
                              />
                              <button
                                onClick={() => sendFeedback(request.id)}
                                disabled={sendingFeedback || !feedbackText.trim()}
                                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                                style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                                {sendingFeedback ? <Loader size={11} className="animate-spin text-[#C084FC]" /> : <Send size={11} className="text-[#C084FC]" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY PLAN ───────────────────────────────────────────────────────── */}
        {tab === 'plan' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-white text-2xl">My Plan</h2>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Current Plan</p>
                  <h3 className="font-heading font-bold text-white text-xl">
                    {isCloutClub ? 'Clout Club' : subscriptionExpired ? 'Clout Club (Expired)' : 'Free Plan'}
                  </h3>
                  {isCloutClubMember && _expiresAt && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={subscriptionExpired
                          ? { background: 'rgba(239,68,68,0.12)', color: '#F87171' }
                          : subscriptionExpiringSoon
                            ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }
                            : { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                        }>
                        {subscriptionExpired ? '0 days left' : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} left`}
                      </span>
                      <span className="text-[#6B7280] text-xs">
                        · {subscriptionExpired ? 'expired' : 'expires'} {_expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0"
                  style={subscriptionExpired
                    ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }
                    : subscriptionExpiringSoon
                      ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }
                      : { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }
                  }>
                  {subscriptionExpired ? 'Expired' : subscriptionExpiringSoon ? 'Expiring Soon' : 'Active'}
                </span>
              </div>
              {!isCloutClub && (
                <div className="mb-5 inline-flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)' }}>
                  <span className="font-mono font-bold gradient-text text-xl">{freeCreativesLeft}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{freeCreativesLeft === 1 ? 'free creative left' : 'free creatives left'}</p>
                    <p className="text-[#9CA3AF] text-xs">{freeCreativeCount}/{FREE_CREATIVE_LIMIT} claimed</p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                  <Sparkles size={18} className="text-[#A855F7]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Clout Club</h3>
                  <p className="text-[#9CA3AF] text-sm mt-1">Recurring monthly creative production — built around your winning message.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {['Monthly creative production', 'Priority turnaround', 'Hook, caption & visual direction', 'Fresh concepts each campaign'].map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-[#D1D5DB] rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[#A855F7] text-xs mt-0.5 flex-shrink-0">✦</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {isCloutClub ? (
                <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle size={16} className="text-[#10B981] flex-shrink-0" />
                  <div>
                    <p className="text-[#10B981] font-semibold text-sm">Active Clout Club member</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">
                      {_expiresAt ? `Subscription active until ${_expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Your membership is active.'}
                    </p>
                  </div>
                </div>
              ) : subscriptionExpired && profile.clout_club_price ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Lock size={16} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-semibold text-sm">Subscription expired</p>
                      <p className="text-[#9CA3AF] text-xs mt-0.5">Chat and feedback are locked. Renew to restore full access.</p>
                    </div>
                  </div>
                  <RazorpayButton
                    amountPaise={profile.clout_club_price}
                    userEmail={user?.email ?? ''}
                    userName={profile.full_name ?? user?.user_metadata?.full_name ?? ''}
                    userId={user?.id ?? ''}
                  />
                </div>
              ) : subscriptionExpired ? (
                <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Lock size={16} className="text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Subscription expired</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">Contact us to renew your Clout Club membership.</p>
                  </div>
                </div>
              ) : profile.clout_club_price ? (
                <div className="space-y-4">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <p className="text-[#9CA3AF] text-xs mb-1 uppercase tracking-widest font-semibold">Your custom price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-3xl" style={{ background: 'linear-gradient(135deg,#A855F7,#3B82F6,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₹{(profile.clout_club_price / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[#9CA3AF] text-sm">/month</span>
                    </div>
                    <p className="text-[#6B7280] text-xs mt-1">Custom rate agreed with your account manager.</p>
                  </div>
                  <RazorpayButton
                    amountPaise={profile.clout_club_price}
                    userEmail={user?.email ?? ''}
                    userName={profile.full_name ?? user?.user_metadata?.full_name ?? ''}
                    userId={user?.id ?? ''}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                        <IndianRupee size={15} className="text-[#A855F7]" />
                      </div>
                      <div>
                        <p className="text-white font-heading font-semibold text-base">Negotiable</p>
                        <p className="text-[#9CA3AF] text-xs">Pricing is personalised for each brand</p>
                      </div>
                    </div>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">Clout Club pricing is set based on your brand's needs, volume, and goals. Get in touch and we'll put together a custom package for you.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="/#contact" className="btn-primary text-sm justify-center"><MessageCircle size={14} />Contact Us to Get Started</a>
                    <a href="mailto:inquiry@clout-kart.com" className="btn-secondary text-sm justify-center"><ExternalLink size={14} />Email Us</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MESSAGES (Clout Club only) ─────────────────────────────────── */}
        {tab === 'messages' && isCloutClubMember && !isCloutClub && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-white text-2xl">Messages</h2>
            <div className="rounded-2xl p-10 flex flex-col items-center text-center"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Lock size={24} className="text-red-400" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">Subscription Expired</h3>
              <p className="text-[#9CA3AF] text-sm mb-6 max-w-sm">
                Your Clout Club subscription has expired. Renew to continue chatting with your CloutKart team.
              </p>
              <button onClick={() => setTab('plan')} className="btn-primary text-sm">
                <RefreshCw size={14} /> Renew Subscription
              </button>
            </div>
          </div>
        )}
        {tab === 'messages' && isCloutClub && (
          <div className="space-y-4 flex flex-col" style={{ height: 'calc(100dvh - 9rem)' }}>
            <div>
              <h2 className="font-heading font-bold text-white text-2xl">Messages</h2>
              <p className="text-[#9CA3AF] text-sm mt-1">Chat with your CloutKart team. Feedback on specific creatives appears here too.</p>
            </div>
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
              style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.18)' }}>
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full"><Loader size={20} className="animate-spin text-[#A855F7]" /></div>
                ) : messageError && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                    <AlertCircle size={20} className="text-red-400 mb-2" />
                    <p className="text-red-300 text-xs leading-relaxed">{messageError}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <MessageCircle size={20} className="text-[#A855F7]" />
                    </div>
                    <p className="text-white font-heading font-semibold text-sm mb-1">Start a conversation</p>
                    <p className="text-[#9CA3AF] text-xs max-w-xs">Send a message to your CloutKart team. They'll respond within 24 hours.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} creativeRequests={creativeRequests} />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Input */}
              <div className="p-3 border-t border-white/[0.08] space-y-2">
                {messageError && messages.length > 0 && (
                  <p className="text-red-400 text-xs px-1">{messageError}</p>
                )}
                <div className="flex gap-2">
                  <input
                    value={messageInput}
                    onChange={e => { setMessageInput(e.target.value); setMessageError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Message your CloutKart team..."
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none bg-white/[0.05] border border-white/[0.10] focus:border-[rgba(168,85,247,0.4)]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !messageInput.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(99,102,241,0.5))', border: '1px solid rgba(168,85,247,0.4)' }}>
                    {sendingMessage ? <Loader size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-heading font-bold text-white text-2xl">Settings</h2>
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div><label className={labelClass}>Full Name</label><input type="text" value={settingsForm.fullName} onChange={e => setSettingsForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" className={inputClass} /></div>
                <div><label className={labelClass}>Company Name</label><input type="text" value={settingsForm.company} onChange={e => setSettingsForm(p => ({ ...p, company: e.target.value }))} placeholder="Your company" className={inputClass} /></div>
                <div><label className={labelClass}>Phone</label><input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 00000 00000" className={inputClass} /></div>
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
