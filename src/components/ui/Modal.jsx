import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  const maxW = wide ? "860px" : "560px";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 16, width: `min(95vw, ${maxW})`, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "#fff", zIndex: 2, borderRadius: "16px 16px 0 0" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <div style={{ width: 28 }} />
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
