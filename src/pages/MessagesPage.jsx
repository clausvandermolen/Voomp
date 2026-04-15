import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { getUserFullName } from "../utils/chat";
import { Avatar } from "../components/ui";
import { supabase } from "../lib/supabase";

const MessagesPage = ({ onBack, user, onMarkRead }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Initial load
    supabase.from('messages').select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setAllMessages(data || []); setLoading(false); });

    // Realtime subscription for new messages
    const channel = supabase.channel('messages-page')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `sender_id=eq.${user.id}`
      }, (payload) => {
        setAllMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        setAllMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Group messages into conversations by chat_key
  const chats = useMemo(() => {
    if (!user) return [];
    const grouped = {};
    allMessages.filter(m => String(m.sender_id) === String(user.id) || String(m.recipient_id) === String(user.id)).forEach(m => {
      if (!grouped[m.chat_key]) grouped[m.chat_key] = { chatKey: m.chat_key, bookingId: m.booking_id, messages: [], otherName: "" };
      grouped[m.chat_key].messages.push(m);
    });
    return Object.values(grouped).map(g => {
      const otherMsg = g.messages.find(m => String(m.sender_id) !== String(user.id));
      const lastMsg = g.messages[g.messages.length - 1];
      return {
        ...g,
        otherName: otherMsg?.sender_name || "Usuario",
        lastMessage: lastMsg?.text || "",
        lastTime: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : ""
      };
    });
  }, [allMessages, user]);

  const activeConvo = chats.find(c => c.chatKey === activeChat);

  const handleSendMessage = async () => {
    if (!newMsg.trim() || !activeConvo) return;
    const otherMsg = activeConvo.messages.find(m => String(m.sender_id) !== String(user.id));
    const recipientId = otherMsg ? otherMsg.sender_id : activeConvo.messages[0]?.recipient_id;
    const msg = {
      chat_key: activeConvo.chatKey,
      booking_id: activeConvo.bookingId,
      sender_id: user.id,
      sender_name: getUserFullName(user),
      recipient_id: recipientId,
      text: newMsg.trim(),
    };
    try {
      await supabase.from('messages').insert(msg);
    } catch (e) { /* silent */ }
    setNewMsg("");
  };

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: "calc(100vh - 66px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowLeft size={22} /></button>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Mensajes</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, border: "1px solid #eee", borderRadius: 16, overflow: "hidden", flex: 1, minHeight: 0 }}>
        {/* Chat list */}
        <div style={{ borderRight: "1px solid #eee", overflow: "auto" }}>
          {chats.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, color: "#555", textAlign: "center" }}>
              <MessageCircle size={36} color="#ccc" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>{loading ? "Cargando..." : "No tienes conversaciones aún"}</p>
            </div>
          )}
          {chats.map(c => (
            <div key={c.chatKey} onClick={() => { setActiveChat(c.chatKey); if (onMarkRead && c.messages.length > 0) { const maxId = Math.max(...c.messages.map(m => m.id)); onMarkRead(c.chatKey, maxId); } }} style={{ display: "flex", gap: 14, padding: "16px 20px", cursor: "pointer", background: activeChat === c.chatKey ? "#f7f7f7" : "#fff", borderBottom: "1px solid #f0f0f0", transition: "background .15s" }}>
              <Avatar name={c.otherName} size={48} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{c.otherName}</span>
                  <span style={{ fontSize: 12, color: "#555" }}>{c.lastTime}</span>
                </div>
                <div style={{ fontSize: 14, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{c.lastMessage}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat conversation */}
        {activeConvo ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={activeConvo.otherName} size={36} />
              <div>
                <div style={{ fontWeight: 600 }}>{activeConvo.otherName}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {activeConvo.messages.map((m, i) => {
                const isMe = String(m.sender_id) === String(user.id);
                const time = m.created_at ? new Date(m.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div key={m.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", padding: "10px 16px", borderRadius: 18, background: isMe ? BRAND_COLOR : "#f0f0f0", color: isMe ? "#fff" : "#222", fontSize: 15, lineHeight: 1.4 }}>
                      {m.text}
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un mensaje..." onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", outline: "none" }} />
              <button onClick={handleSendMessage} style={{ width: 40, height: 40, borderRadius: "50%", background: BRAND_COLOR, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={16} color="#fff" />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 15 }}>Selecciona una conversación</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
