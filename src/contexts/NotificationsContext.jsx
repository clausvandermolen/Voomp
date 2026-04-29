import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

const TOAST_COLORS = {
  success: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
  error:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  info:    { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
};

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { console.error('fetchNotifications:', error); return; }
    setNotifications(data || []);
    setUnread((data || []).filter(n => !n.read).length);
  }, [user?.id]);

  // Initial fetch
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnread(prev => prev + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  // In-app toast helper for the current user.
  const notify = useCallback((message, level = 'info') => {
    if (!message) return;
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, level }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Polymorphic: object → persist a notification for another user (DB insert);
  // string → ephemeral in-app toast for the current user.
  // Many call sites use the 2-string toast form, so we route them here.
  // NOTE: do NOT use .select().single() on the DB insert — under RLS the
  // inserter is typically not the row owner, so reading the row back would
  // be blocked by the SELECT policy and the whole insert would error out.
  const pushNotification = async (arg, level) => {
    if (typeof arg === 'string') {
      notify(arg, level);
      return;
    }
    if (!arg || typeof arg !== 'object') return;
    const { userId, type, title, body, link } = arg;
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,     // 'booking' | 'review' | 'payment' | 'message' | 'system'
        title,
        body,
        link: link || null,
        read: false,
      });
    if (error) {
      console.error('pushNotification:', error);
      throw error;
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unread, fetchNotifications, markAllRead, markRead, pushNotification, notify }}>
      {children}
      {/* Toast stack — fixed top-right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = TOAST_COLORS[t.level] || TOAST_COLORS.info;
          return (
            <div
              key={t.id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                minWidth: 220,
                maxWidth: 360,
                pointerEvents: 'auto',
                animation: 'fadeIn .2s',
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
