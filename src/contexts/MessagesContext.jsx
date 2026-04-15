import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const MessagesContext = createContext();

export function MessagesProvider({ userId, children }) {
  const [unreadMessages, setUnreadMessages] = useState(0);

  const calcUnread = useCallback(async () => {
    if (!userId) { setUnreadMessages(0); return; }

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, chat_key')
      .eq('recipient_id', userId);

    const { data: readStates } = await supabase
      .from('chat_read_state')
      .select('chat_key, last_read_id')
      .eq('user_id', userId);

    const readMap = {};
    (readStates || []).forEach(r => { readMap[r.chat_key] = r.last_read_id; });

    let unread = 0;
    (msgs || []).forEach(m => {
      if (m.id > (readMap[m.chat_key] || 0)) unread++;
    });
    setUnreadMessages(unread);
  }, [userId]);

  useEffect(() => {
    calcUnread();

    if (!userId) return;

    const channel = supabase.channel('unread-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        calcUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, calcUnread]);

  const markChatRead = useCallback(async (chatKey, maxId) => {
    if (!userId) return;
    await supabase.from('chat_read_state').upsert({
      user_id: userId,
      chat_key: chatKey,
      last_read_id: maxId
    });
    calcUnread();
  }, [userId, calcUnread]);

  return (
    <MessagesContext.Provider value={{ unreadMessages, markChatRead }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => useContext(MessagesContext);
