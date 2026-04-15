import { BRAND_GRADIENT, DARK_BG } from "../../constants";

const Btn = ({ children, primary, outline, full, small, onClick, disabled, style: s = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: small ? "8px 16px" : "12px 24px", borderRadius: 8, border: outline ? `1px solid ${DARK_BG}` : "none", background: primary ? BRAND_GRADIENT : outline ? "transparent" : "#f7f7f7", color: primary ? "#fff" : DARK_BG, fontSize: small ? 13 : 15, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, transition: "all .15s", ...s }}>{children}</button>
);

export default Btn;
