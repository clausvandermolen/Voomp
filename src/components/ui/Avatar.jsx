import { Check } from "lucide-react";
import { BRAND_COLOR } from "../../constants";

const Avatar = ({ src, name, size = 40, badge }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#ddd" }}>
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND_COLOR, color: "#fff", fontWeight: 700, fontSize: size * 0.4 }}>{name?.[0]}</div>}
    </div>
    {badge && <div style={{ position: "absolute", bottom: -2, right: -2, background: BRAND_COLOR, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}><Check size={10} color="#fff" /></div>}
  </div>
);

export default Avatar;
