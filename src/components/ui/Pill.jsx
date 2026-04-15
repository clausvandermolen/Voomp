import { DARK_BG } from "../../constants";

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 24, border: active ? `2px solid ${DARK_BG}` : "1px solid #ddd", background: active ? DARK_BG : "#fff", color: active ? "#fff" : "#222", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>{children}</button>
);

export default Pill;
