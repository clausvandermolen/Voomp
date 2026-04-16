import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PhotoGallery = ({ photos, onClose }) => {
  const [idx, setIdx] = useState(0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer", zIndex: 10 }}><X size={28} color="#fff" /></button>
      <div style={{ position: "relative", width: "90vw", maxWidth: 900, aspectRatio: "16/10" }}>
        <img src={photos[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
        {photos.length > 1 && <>
          <button onClick={() => setIdx((idx - 1 + photos.length) % photos.length)} style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}><ChevronLeft size={20} /></button>
          <button onClick={() => setIdx((idx + 1) % photos.length)} style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}><ChevronRight size={20} /></button>
        </>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {photos.map((p, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: i === idx ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", opacity: i === idx ? 1 : 0.5 }}><img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>)}
      </div>
    </div>
  );
};

export default PhotoGallery;
