import { BRAND_COLOR } from "../../constants";

const Badge = ({ children, color = BRAND_COLOR, style: s = {} }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: `${color}14`, color, fontSize: 12, fontWeight: 600, ...s }}>{children}</span>
);

export default Badge;
