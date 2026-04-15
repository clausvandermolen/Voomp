import { useEffect, useState } from "react";
import { Filter, MapPin, List, Sparkles } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT } from "../constants";

const pillStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 20px",
  borderRadius: 999,
  border: "none",
  background: BRAND_GRADIENT,
  color: "#fff",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: 13,
  flexShrink: 0,
  boxShadow: "0 4px 14px rgba(255,56,92,.32)",
  transition: "transform .15s, box-shadow .15s",
};

const onHoverIn = e => { e.currentTarget.style.transform = "translateY(-1px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(255,56,92,.42)"; };
const onHoverOut = e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,56,92,.32)"; };

const CategoryBar = ({ onFilter, showMap, setShowMap }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  return (
    <div style={{ position: "sticky", top: isMobile ? 56 : 66, zIndex: 90, background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 1760, margin: "0 auto", padding: isMobile ? "12px 16px" : "14px 24px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: isMobile ? 10 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Sparkles size={isMobile ? 16 : 18} color={BRAND_COLOR} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "#222", letterSpacing: -0.3, whiteSpace: isMobile ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
            Tu próximo estacionamiento te está esperando
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: isMobile ? "center" : "flex-end" }}>
          {setShowMap && (
            <button onClick={() => setShowMap(!showMap)} style={{ ...pillStyle, flex: isMobile ? 1 : "unset", justifyContent: "center" }} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>
              {showMap ? <><List size={15} /> Mostrar lista</> : <><MapPin size={15} /> Mostrar mapa</>}
            </button>
          )}
          <button onClick={onFilter} style={{ ...pillStyle, flex: isMobile ? 1 : "unset", justifyContent: "center" }} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>
            <Filter size={15} /> Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
