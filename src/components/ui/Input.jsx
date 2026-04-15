const Input = ({ icon: Icon, style: inputStyle, ...props }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", transition: "border .2s" }}>
    {Icon && <Icon size={18} color="#555" />}
    <input {...props} style={{ border: "none", outline: "none", flex: 1, fontSize: 15, fontFamily: "inherit", color: "#222", background: "transparent", ...(inputStyle || {}) }} />
  </div>
);

export default Input;
