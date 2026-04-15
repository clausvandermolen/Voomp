import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { getUserFullName, makeChatKey } from "../utils/chat";
import { supabase } from "../lib/supabase";
import Avatar from "./ui/Avatar";

const BookingChat = ({ booking, user, onClose, onMarkRead }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isHost = String(user?.id) === String(booking.hostId || booking.host_id);
  const otherId = isHost ? (booking.conductorId || booking.conductor_id) : (booking.hostId || booking.host_id);
  const otherName = isHost ? (booking.conductorName || booking.conductor_name || "Conductor") : (booking.hostName || booking.host_name || "Anfitrión");
  const chatKey = makeChatKey(user.id, otherId);

  useEffect(() => {
    // Initial load
    supabase
      .from('messages')
      .select('*')
      .eq('chat_key', chatKey)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
        if (data && data.length > 0 && onMarkRead) {
          const maxId = Math.max(...data.map(m => m.id));
          onMarkRead(chatKey, maxId);
        }
      });

    // Realtime subscription
    const channel = supabase.channel(`chat:${chatKey}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_key=eq.${chatKey}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        if (onMarkRead) onMarkRead(chatKey, payload.new.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const msg = {
      chat_key: chatKey,
      booking_id: booking.id,
      sender_id: user.id,
      sender_name: getUserFullName(user),
      recipient_id: otherId,
      text: newMsg.trim(),
    };
    try {
      await supabase.from('messages').insert(msg);
    } catch (e) { /* silent */ }
    setNewMsg("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, height: "70vh", maxHeight: 600, display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={otherName} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{otherName}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{booking.listingTitle || booking.listing_title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color="#555" /></button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && <div style={{ textAlign: "center", color: "#999", padding: 20 }}>Cargando...</div>}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: 32 }}>
              <MessageCircle size={32} color="#ddd" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14 }}>Inicia la conversación</p>
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = String(m.sender_id) === String(user.id);
            const time = m.created_at ? new Date(m.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "";
            return (
              <div key={m.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: 16, background: isMe ? BRAND_COLOR : "#f0f0f0", color: isMe ? "#fff" : "#222", fontSize: 14, lineHeight: 1.4 }}>
                  {!isMe && <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, opacity: 0.8 }}>{m.sender_name}</div>}
                  {m.text}
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: "right" }}>{time}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un mensaje..." onKeyDown={e => { if (e.key === "Enter") handleSend(); }} style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          <button onClick={handleSend} style={{ width: 38, height: 38, borderRadius: "50%", background: BRAND_COLOR, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={15} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingChat;
