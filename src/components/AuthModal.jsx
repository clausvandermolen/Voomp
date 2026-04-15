import { useState, useEffect } from "react";
import { X, User, Phone, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { COUNTRY_CODES, ID_TYPES } from "../constants";
import { supabase } from "../lib/supabase";
import { formatRut } from "../utils/format";
import { Input, Btn } from "./ui";

const AuthModal = ({ open, onClose, onSuccess, initialMode = "register" }) => {
  const [mode, setMode] = useState(initialMode);
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  const [form, setForm] = useState({ firstName: "", lastNameP: "", lastNameM: "", email: "", countryCode: "+56", phone: "", idType: "rut", idNumber: "", password: "", passwordConfirm: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleRegister = async () => {
    setError("");
    if (!form.firstName || !form.lastNameP || !form.lastNameM) return setError("Completa tu nombre completo.");
    if (!form.email || !form.email.includes("@")) return setError("Ingresa un correo electrónico válido.");
    if (!form.phone) return setError("Ingresa tu número de teléfono.");
    if (!form.idNumber) return setError("Ingresa tu número de identificación.");
    const normalizedId = form.idType === "rut" ? formatRut(form.idNumber) : form.idNumber;
    if (form.idType === "rut" && !/^\d{1,3}(\.\d{3})*-[\dK]$/.test(normalizedId)) return setError("Ingresa un RUT válido.");
    if (!form.password || form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (form.password !== form.passwordConfirm) return setError("Las contraseñas no coinciden.");

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name_p: form.lastNameP,
            last_name_m: form.lastNameM,
            phone: `${form.countryCode} ${form.phone}`,
            country_code: form.countryCode,
            id_type: form.idType,
            id_number: normalizedId,
          }
        }
      });
      if (signUpError) return setError(signUpError.message);

      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 1200);
    } catch(err) {
      setError("Error al conectar con el servidor.");
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!loginForm.email || !loginForm.password) return setError("Completa todos los campos.");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (signInError) return setError("Credenciales incorrectas.");
      onSuccess();
    } catch(err) {
      setError("Error al conectar con el servidor.");
    }
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 48, textAlign: "center", maxWidth: 420, animation: "fadeIn .3s" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e7faf0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><CheckCircle size={36} color="#008A05" /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>¡Bienvenido a Voomp!</h2>
          <p style={{ color: "#555", fontSize: 15 }}>Tu cuenta ha sido creada exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", animation: "fadeIn .3s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "#fff", zIndex: 2, borderRadius: "20px 20px 0 0" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{mode === "register" ? "Crear cuenta" : "Iniciar sesión"}</span>
          <div style={{ width: 28 }} />
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f7f7f7", borderRadius: 12, padding: 4 }}>
            {[{ id: "register", l: "Registrarse" }, { id: "login", l: "Iniciar sesión" }].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id); setError(""); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: mode === t.id ? "#fff" : "transparent", boxShadow: mode === t.id ? "0 1px 4px rgba(0,0,0,.08)" : "none", fontWeight: mode === t.id ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#222", transition: "all .2s" }}>{t.l}</button>
            ))}
          </div>

          {mode === "register" ? (
            <form onSubmit={e => { e.preventDefault(); handleRegister(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Nombres *</label>
                <Input icon={User} placeholder="Ej: Juan Pablo" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Apellido Paterno *</label>
                  <Input placeholder="Ej: González" value={form.lastNameP} onChange={e => setForm({ ...form, lastNameP: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Apellido Materno *</label>
                  <Input placeholder="Ej: López" value={form.lastNameM} onChange={e => setForm({ ...form, lastNameM: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Correo electrónico *</label>
                <Input type="email" placeholder="tu@correo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Teléfono *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", cursor: "pointer", minWidth: 140, color: "#222", outline: "none" }}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} {c.country.split(" ")[0]}</option>)}
                  </select>
                  <div style={{ flex: 1 }}>
                    <Input icon={Phone} type="tel" placeholder="9 1234 5678" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Número de identificación *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ display: "flex", gap: 4, background: "#f7f7f7", borderRadius: 10, padding: 4 }}>
                    {ID_TYPES.map(t => (
                      <button type="button" key={t.value} onClick={() => setForm({ ...form, idType: t.value })} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: form.idType === t.value ? "#fff" : "transparent", boxShadow: form.idType === t.value ? "0 1px 4px rgba(0,0,0,.08)" : "none", fontWeight: form.idType === t.value ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#222" }}>{t.label}</button>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input placeholder={form.idType === "rut" ? "12.345.678-9" : "AB123456"} value={form.idNumber} onChange={e => setForm({ ...form, idNumber: form.idType === "rut" ? formatRut(e.target.value) : e.target.value })} />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Contraseña *</label>
                  <Input icon={Lock} type="password" placeholder="Mín. 6 caracteres" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Confirmar *</label>
                  <Input icon={Lock} type="password" placeholder="Repite la contraseña" value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} />
                </div>
              </div>

              {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", fontSize: 14, color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={16} /> {error}</div>}

              <Btn primary full onClick={handleRegister} style={{ padding: "14px 24px", fontSize: 16, borderRadius: 12, marginTop: 8 }}>Crear mi cuenta</Btn>

              <p style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                Al registrarte aceptas los <span style={{ textDecoration: "underline", cursor: "pointer" }}>Términos de servicio</span> y la <span style={{ textDecoration: "underline", cursor: "pointer" }}>Política de privacidad</span> de Voomp.
              </p>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleLogin(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Correo electrónico</label>
                <Input type="email" placeholder="tu@correo.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>Contraseña</label>
                <Input icon={Lock} type="password" placeholder="Tu contraseña" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>

              {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", fontSize: 14, color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={16} /> {error}</div>}

              <Btn primary full onClick={handleLogin} style={{ padding: "14px 24px", fontSize: 16, borderRadius: 12, marginTop: 8 }}>Iniciar sesión</Btn>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
