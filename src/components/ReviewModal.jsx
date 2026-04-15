import { useState } from "react";
import { Star, X } from "lucide-react";
import { Btn } from "./ui";

const ReviewModal = ({ open, onClose, onSubmit, title, subtitle, submitting }) => {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    await onSubmit({ rating, comment: text.trim() });
    setRating(5);
    setText("");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,.18)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #eee" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stars */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 10 }}>Calificación</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={36}
                  fill={s <= (hovered || rating) ? "#222" : "none"}
                  stroke="#222"
                  style={{ cursor: "pointer", transition: "transform .1s" }}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
              {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][hovered || rating]}
            </div>
          </div>

          {/* Comment */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 8 }}>Comentario (Opcional)</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe tu experiencia (opcional)..."
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <Btn primary onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enviando..." : "Publicar reseña"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
