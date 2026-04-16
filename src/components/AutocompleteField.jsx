import { useState, useEffect, useRef } from "react";
import { BRAND_COLOR } from "../constants";

const AutocompleteField = ({ label, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => { setText(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(text.toLowerCase()));

  return (
    <div ref={ref} style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "10px 14px", position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, color: "#555" }}>{label}</div>
      <input
        value={text}
        onChange={e => { setText(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Enter") { if (open && filtered.length > 0) { onChange(filtered[0]); setText(filtered[0]); } setOpen(false); } }}
        placeholder={placeholder}
        style={{ border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", background: "transparent", color: "#222" }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #eee", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", maxHeight: 200, overflow: "auto", zIndex: 200, marginTop: 4 }}>
          {value && (
            <div onClick={() => { onChange(""); setText(""); setOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, color: BRAND_COLOR, cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontWeight: 600 }}>Limpiar filtro</div>
          )}
          {filtered.map(o => (
            <div key={o} onClick={() => { onChange(o); setText(o); setOpen(false); }} style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", background: value === o ? "#f7f7f7" : "#fff", fontWeight: value === o ? 600 : 400 }} onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"} onMouseLeave={e => e.currentTarget.style.background = value === o ? "#f7f7f7" : "#fff"}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteField;
