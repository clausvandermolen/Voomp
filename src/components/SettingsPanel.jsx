import { useState } from "react";
import { User, Shield, CreditCard, Bell, Globe, Lock, ChevronRight, LogOut } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { formatCLP, formatRut } from "../utils/format";
import { supabase } from "../lib/supabase";
import Btn from "./ui/Btn";

const SettingsPanel = ({ user, onUpdateUser, onLogout }) => {
  const [openSection, setOpenSection] = useState("personal");
  const [form, setForm] = useState({ ...(user || {}) });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (id) => { setOpenSection(id); setMsg(""); };

  const saveUser = async (updates) => {
    setSaving(true); setMsg("");
    try {
      if (onUpdateUser) await onUpdateUser(updates);
      setForm(prev => ({ ...prev, ...updates }));
      setMsg("Guardado correctamente");
    } catch(e) { setMsg("Error al guardar"); }
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff", color: "#222" };
  const labelStyle = { fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 };
  const sectionStyle = { padding: 24, background: "#fafafa", borderRadius: 12, display: "flex", flexDirection: "column", gap: 16 };

  const sections = [
    { id: "personal", icon: <User size={20} />, l: "Datos personales", d: "Nombre, email, teléfono" },
    { id: "security", icon: <Shield size={20} />, l: "Seguridad", d: "Contraseña y verificación" },
    { id: "payments", icon: <CreditCard size={20} />, l: "Pagos y cobros", d: "Métodos de pago y cuenta bancaria" },
    { id: "notifications", icon: <Bell size={20} />, l: "Notificaciones", d: "Preferencias de avisos" },
    { id: "locale", icon: <Globe size={20} />, l: "Idioma y moneda", d: "Español · CLP" },
    { id: "privacy", icon: <Lock size={20} />, l: "Privacidad", d: "Datos y visibilidad" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 24 }}>
        {sections.map(s => {
          const active = openSection === s.id;
          return (
            <div key={s.id} onClick={() => toggle(s.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: active ? "#f0f0f0" : "transparent", transition: "background .15s" }}>
              <div style={{ color: active ? "#222" : "#555" }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: active ? 700 : 600, fontSize: 14 }}>{s.l}</div>
                <div style={{ fontSize: 12, color: "#777" }}>{s.d}</div>
              </div>
              <ChevronRight size={16} color="#999" />
            </div>
          );
        })}
        <Btn outline onClick={onLogout} style={{ marginTop: 16, color: BRAND_COLOR, borderColor: BRAND_COLOR }}><LogOut size={16} /> Cerrar sesión</Btn>
      </div>

      <div style={{ minWidth: 0, maxWidth: 640 }}>
        {sections.filter(s => s.id === openSection).map(s => (
        <div key={s.id}>
          {openSection === "personal" && s.id === "personal" && (
            <form onSubmit={e => { e.preventDefault(); saveUser({ firstName: form.firstName, lastName1: form.lastName1, lastName2: form.lastName2, email: form.email, phone: form.phone, idType: form.idType, idNumber: form.idNumber }); }} style={sectionStyle}>
              <div><label style={labelStyle}>Nombres</label><input style={inputStyle} value={form.firstName || ""} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><label style={labelStyle}>Primer apellido</label><input style={inputStyle} value={form.lastName1 || ""} onChange={e => setForm({ ...form, lastName1: e.target.value })} /></div>
              <div><label style={labelStyle}>Segundo apellido</label><input style={inputStyle} value={form.lastName2 || ""} onChange={e => setForm({ ...form, lastName2: e.target.value })} /></div>
              <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label style={labelStyle}>Tipo de identificación</label>
                <select style={inputStyle} value={form.idType || "rut"} onChange={e => setForm({ ...form, idType: e.target.value })}>
                  <option value="rut">RUT</option><option value="passport">Pasaporte</option>
                </select>
              </div>
              <div><label style={labelStyle}>Número de identificación</label><input style={inputStyle} value={form.idNumber || ""} onChange={e => setForm({ ...form, idNumber: (form.idType || "rut") === "rut" ? formatRut(e.target.value) : e.target.value })} /></div>
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary onClick={() => saveUser({ firstName: form.firstName, lastName1: form.lastName1, lastName2: form.lastName2, email: form.email, phone: form.phone, idType: form.idType, idNumber: form.idNumber })} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Btn>
            </form>
          )}

          {openSection === "security" && s.id === "security" && (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!pwForm.newPw) { setMsg("Ingresa la nueva contraseña"); return; }
              if (pwForm.newPw.length < 6) { setMsg("La nueva contraseña debe tener al menos 6 caracteres"); return; }
              if (pwForm.newPw !== pwForm.confirm) { setMsg("Las contraseñas no coinciden"); return; }
              setSaving(true); setMsg("");
              try {
                const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
                if (error) { setMsg(error.message); } else { setMsg("Contraseña actualizada"); setPwForm({ current: "", newPw: "", confirm: "" }); }
              } catch(e) { setMsg("Error al cambiar contraseña"); }
              setSaving(false);
            }} style={sectionStyle}>
              <div><label style={labelStyle}>Nueva contraseña</label><input type="password" style={inputStyle} value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} /></div>
              <div><label style={labelStyle}>Confirmar nueva contraseña</label><input type="password" style={inputStyle} value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} /></div>
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") || msg.includes("error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary type="submit" disabled={saving}>{saving ? "Guardando..." : "Cambiar contraseña"}</Btn>
            </form>
          )}

          {openSection === "payments" && s.id === "payments" && (
            <form onSubmit={e => { e.preventDefault(); saveUser({ bankHolder: form.bankHolder, bankName: form.bankName, bankAccountType: form.bankAccountType, bankAccount: form.bankAccount, bankRut: form.bankRut }); }} style={sectionStyle}>
              <div>
                <label style={labelStyle}>Nombre del titular de la cuenta</label>
                <input style={inputStyle} value={form.bankHolder || ""} onChange={e => setForm({ ...form, bankHolder: e.target.value })} placeholder="Nombre completo" />
              </div>
              <div>
                <label style={labelStyle}>Banco</label>
                <select style={inputStyle} value={form.bankName || ""} onChange={e => setForm({ ...form, bankName: e.target.value })}>
                  <option value="">Seleccionar banco</option>
                  {["Banco de Chile","BancoEstado","Banco Santander","Banco BCI","Banco Itaú","Banco Scotiabank","Banco Falabella","Banco Ripley","Banco Security","Banco BICE","Banco Consorcio"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo de cuenta</label>
                <select style={inputStyle} value={form.bankAccountType || ""} onChange={e => setForm({ ...form, bankAccountType: e.target.value })}>
                  <option value="">Seleccionar tipo</option>
                  <option value="corriente">Cuenta corriente</option>
                  <option value="vista">Cuenta vista / RUT</option>
                  <option value="ahorro">Cuenta de ahorro</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Número de cuenta</label>
                <input style={inputStyle} value={form.bankAccount || ""} onChange={e => setForm({ ...form, bankAccount: e.target.value })} placeholder="Ej: 00-123-45678-90" />
              </div>
              <div>
                <label style={labelStyle}>RUT del titular</label>
                <input style={inputStyle} value={form.bankRut || ""} onChange={e => setForm({ ...form, bankRut: e.target.value })} placeholder="12.345.678-9" />
              </div>
              {user?.credit > 0 && (
                <div style={{ padding: 12, background: "#fef2f2", borderRadius: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#b91c1c" }}>Saldo pendiente: {formatCLP(Number(user.credit))}</span>
                  <span style={{ color: "#555" }}> — se descontará en tu próximo pago con tarjeta</span>
                </div>
              )}
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary onClick={() => saveUser({ bankHolder: form.bankHolder, bankName: form.bankName, bankAccountType: form.bankAccountType, bankAccount: form.bankAccount, bankRut: form.bankRut })} disabled={saving}>{saving ? "Guardando..." : "Guardar datos bancarios"}</Btn>
            </form>
          )}

          {openSection === "notifications" && s.id === "notifications" && (
            <div style={sectionStyle}>
              {[
                { key: "notifEmail", l: "Notificaciones por email" },
                { key: "notifPush", l: "Notificaciones push" },
                { key: "notifBookings", l: "Nuevas reservas" },
                { key: "notifMessages", l: "Mensajes nuevos" },
                { key: "notifPromo", l: "Promociones y ofertas" },
              ].map(n => (
                <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{n.l}</span>
                  <div onClick={() => setForm({ ...form, [n.key]: !form[n.key] })} style={{ width: 44, height: 24, borderRadius: 12, background: form[n.key] !== false ? BRAND_COLOR : "#ccc", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form[n.key] !== false ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </div>
                </div>
              ))}
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary onClick={() => saveUser({ notifEmail: form.notifEmail, notifPush: form.notifPush, notifBookings: form.notifBookings, notifMessages: form.notifMessages, notifPromo: form.notifPromo })} disabled={saving}>{saving ? "Guardando..." : "Guardar preferencias"}</Btn>
            </div>
          )}

          {openSection === "locale" && s.id === "locale" && (
            <div style={sectionStyle}>
              <div>
                <label style={labelStyle}>Idioma</label>
                <select style={inputStyle} value={form.language || "es"} onChange={e => setForm({ ...form, language: e.target.value })}>
                  <option value="es">Español</option><option value="en">English</option><option value="pt">Português</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Moneda</label>
                <select style={inputStyle} value={form.currency || "CLP"} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option value="CLP">CLP - Peso chileno</option><option value="USD">USD - Dólar</option><option value="EUR">EUR - Euro</option>
                </select>
              </div>
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary onClick={() => saveUser({ language: form.language, currency: form.currency })} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Btn>
            </div>
          )}

          {openSection === "privacy" && s.id === "privacy" && (
            <div style={sectionStyle}>
              {[
                { key: "privProfile", l: "Perfil público visible" },
                { key: "privShowPhone", l: "Mostrar teléfono a anfitriones" },
                { key: "privShowEmail", l: "Mostrar email a anfitriones" },
              ].map(p => (
                <div key={p.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{p.l}</span>
                  <div onClick={() => setForm({ ...form, [p.key]: !form[p.key] })} style={{ width: 44, height: 24, borderRadius: 12, background: form[p.key] ? BRAND_COLOR : "#ccc", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form[p.key] ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#b91c1c", marginBottom: 8 }}>Zona de peligro</div>
                <Btn outline onClick={() => { if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) { alert("Funcionalidad de eliminación próximamente."); }}} style={{ color: "#b91c1c", borderColor: "#fca5a5" }}>Eliminar mi cuenta</Btn>
              </div>
              {msg && <div style={{ fontSize: 13, color: msg.includes("Error") ? "#b91c1c" : "#008A05", fontWeight: 600 }}>{msg}</div>}
              <Btn primary onClick={() => saveUser({ privProfile: form.privProfile, privShowPhone: form.privShowPhone, privShowEmail: form.privShowEmail })} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Btn>
            </div>
          )}
        </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;
