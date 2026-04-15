import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

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

  // Helper: push a notification to Supabase. Throws on error.
  // NOTE: do NOT use .select().single() here — under RLS the inserter is
  // typically not the row owner, so reading the row back would be blocked
  // by the SELECT policy and the whole insert would error out.
  const pushNotification = async ({ userId, type, title, body, link }) => {
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
    <NotificationsContext.Provider value={{ notifications, unread, fetchNotifications, markAllRead, markRead, pushNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
