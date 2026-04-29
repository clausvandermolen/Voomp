import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PhotoGallery = ({ photos, onClose }) => {
  const safePhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
  const [idx, setIdx] = useState(0);

  // Keyboard navigation: ESC closes, arrows step.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowLeft" && safePhotos.length > 1) {
        setIdx((i) => (i - 1 + safePhotos.length) % safePhotos.length);
      } else if (e.key === "ArrowRight" && safePhotos.length > 1) {
        setIdx((i) => (i + 1) % safePhotos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, safePhotos.length]);

  // Lock background scroll while the lightbox is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (safePhotos.length === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <button onClick={onClose} aria-label="Cerrar galería de fotos" style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer" }}><X size={28} color="#fff" /></button>
        Sin fotos disponibles.
      </div>
    );
  }

  const cur = Math.min(idx, safePhotos.length - 1);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} aria-label="Cerrar galería de fotos" style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer", zIndex: 10 }}><X size={28} color="#fff" /></button>
      <div style={{ position: "relative", width: "90vw", maxWidth: 900, aspectRatio: "16/10" }}>
        <img src={safePhotos[cur]} alt={`Foto ${cur + 1} de ${safePhotos.length}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
        {safePhotos.length > 1 && <>
          <button onClick={() => setIdx((cur - 1 + safePhotos.length) % safePhotos.length)} aria-label="Foto anterior" style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}><ChevronLeft size={20} /></button>
          <button onClick={() => setIdx((cur + 1) % safePhotos.length)} aria-label="Foto siguiente" style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}><ChevronRight size={20} /></button>
        </>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {safePhotos.map((p, i) => <div key={i} onClick={() => setIdx(i)} role="button" tabIndex={0} aria-label={`Ver foto ${i + 1}`} onKeyDown={(e) => e.key === 'Enter' && setIdx(i)} style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: i === cur ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", opacity: i === cur ? 1 : 0.5 }}><img src={p} alt={`Miniatura foto ${i + 1}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>)}
      </div>
    </div>
  );
};

export default PhotoGallery;
