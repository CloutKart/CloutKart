import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  is_admin_notification: boolean;
  created_at: string;
}

interface NotificationBellProps {
  isAdmin: boolean;
  userId: string;
}

const TYPE_ICONS: Record<string, string> = {
  new_user: '👤',
  new_creative_request: '🎨',
  creative_status: '✅',
  new_message: '💬',
  new_feedback: '⭐',
  new_payment: '💳',
  subscription_expiring: '⏰',
  subscription_expired: '🔴',
};

// How often to poll for new notifications (ms). Acts as guaranteed fallback when
// postgres_changes realtime misses trigger-inserted rows.
const POLL_INTERVAL = 8_000;

export function NotificationBell({ isAdmin, userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accentRgb = isAdmin ? '99,102,241' : '168,85,247';
  const accentColor = isAdmin ? '#818CF8' : '#A855F7';
  const badgeColor = isAdmin ? '#EF4444' : '#A855F7';

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (isAdmin) {
      query = query.eq('is_admin_notification', true);
    } else {
      query = query.eq('user_id', userId).eq('is_admin_notification', false);
    }

    const { data } = await query;
    if (data) setNotifications(data as Notification[]);
  }, [isAdmin, userId]);

  // Initial load
  useEffect(() => {
    if (userId) loadNotifications();
  }, [userId, loadNotifications]);

  // ── Polling — guaranteed fallback for trigger-inserted rows ─────────────────
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(loadNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [userId, loadNotifications]);

  // ── Browser push notification when tab is hidden ────────────────────────────
  async function showBrowserNotification(title: string, body: string) {
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return; // bell is in view — no need to duplicate
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (reg) {
        reg.showNotification(title, { body, icon: '/app-icon-512.webp', badge: '/app-icon-512.webp', tag: 'ck-notif', renotify: true } as NotificationOptions);
      } else {
        new Notification(title, { body, icon: '/app-icon-512.webp' });
      }
    } catch {
      // Notification API not available in this context — silent fail
    }
  }

  // ── Realtime — bonus on top of polling ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const channelName = isAdmin ? `notif-admin-${userId}` : `notif-${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          ...(isAdmin ? {} : { filter: `user_id=eq.${userId}` }),
        },
        (payload) => {
          const row = payload.new as Notification;
          if (isAdmin && !row.is_admin_notification) return;
          if (!isAdmin && (row.user_id !== userId || row.is_admin_notification)) return;
          setNotifications(prev =>
            prev.some(n => n.id === row.id) ? prev : [row, ...prev]
          );
          showBrowserNotification(row.title, row.body);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          ...(isAdmin ? {} : { filter: `user_id=eq.${userId}` }),
        },
        (payload) => {
          const row = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n => n.id === row.id ? { ...n, is_read: row.is_read } : n)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, userId]);

  // Refresh when the tab becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && userId) loadNotifications();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId, loadNotifications]);

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function markAllRead() {
    const ids = notifications.filter(n => !n.is_read).map(n => n.id);
    if (!ids.length) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    if (notifications.find(n => n.id === id)?.is_read) return;
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: open ? `rgba(${accentRgb},0.18)` : `rgba(${accentRgb},0.08)`,
          border: `1px solid rgba(${accentRgb},0.25)`,
        }}
      >
        <Bell size={15} style={{ color: accentColor }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: badgeColor, color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl z-[300]"
          style={{
            background: 'rgba(8,8,16,0.98)',
            border: `1px solid rgba(${accentRgb},0.2)`,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: `rgba(${accentRgb},0.1)` }}
          >
            <div className="flex items-center gap-2">
              <Bell size={12} style={{ color: accentColor }} />
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `rgba(${accentRgb},0.15)`, color: accentColor }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-white transition-colors px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <CheckCheck size={11} /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell size={20} className="text-[#4B5563] mb-2" />
                <p className="text-[#6B7280] text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b"
                  style={{
                    background: n.is_read ? 'transparent' : `rgba(${accentRgb},0.07)`,
                    borderColor: 'rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `rgba(${accentRgb},0.1)`)}
                  onMouseLeave={e => (e.currentTarget.style.background = n.is_read ? 'transparent' : `rgba(${accentRgb},0.07)`)}
                >
                  <span className="text-sm flex-shrink-0 mt-0.5 leading-none">
                    {TYPE_ICONS[n.type] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${n.is_read ? 'text-[#9CA3AF]' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                          style={{ background: accentColor }}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-[#4B5563] mt-1">
                      {new Date(n.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
