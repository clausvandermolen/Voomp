import React, { useState } from "react";
import { Camera, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND_COLOR } from "../constants";

const CardCarousel = ({ photos = [], onFav, isFav }) => {
  const [idx, setIdx] = useState(0);
  const hasPhotos = photos.length > 0;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1/0.95", borderRadius: 12, overflow: "hidden" }}>
      {hasPhotos ? (
        <img src={photos[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
          <Camera size={36} />
          <span style={{ fontSize: 13, marginTop: 8 }}>Sin fotos</span>
        </div>
      )}
      <button onClick={(e) => { e.stopPropagation(); onFav?.(); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", filter: "drop-shadow(0 1px 3px rgba(0,0,0,.3))" }}>
        <Heart size={24} fill={isFav ? BRAND_COLOR : "rgba(0,0,0,.5)"} stroke={isFav ? BRAND_COLOR : "#fff"} strokeWidth={2} />
      </button>
      {photos.length > 1 && (
        <>
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {photos.slice(0, 5).map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,.5)" }} />)}
          </div>
          {idx > 0 && <button onClick={e => { e.stopPropagation(); setIdx(idx - 1); }} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}><ChevronLeft size={14} /></button>}
          {idx < photos.length - 1 && <button onClick={e => { e.stopPropagation(); setIdx(idx + 1); }} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}><ChevronRight size={14} /></button>}
        </>
      )}
    </div>
  );
};

export default CardCarousel;
