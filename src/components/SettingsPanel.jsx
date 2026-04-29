import { useState } from "react";
import { User, Shield, CreditCard, Bell, Globe, Lock, ChevronRight, LogOut } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";
import { formatCLP, formatRut, isValidRut } from "../utils/format";
import { supabase } from "../lib/supabase";
import Btn from "./ui/Btn";

const SUCCESS_COLOR = "#008A05";

const inputStyle = {
  width: "100%",
  padding: `${SPACING.xs + 2}px ${SPACING.md - 2}px`,
  borderRadius: RADIUS.md,
  border: `1px solid ${COLORS.border}`,
  fontSize: FONT_SIZE.md,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: COLORS.text,
};

const labelStyle = {
  fontSize: FONT_SIZE.base,
  color: COLORS.muted,
  marginBottom: 4,
  display: "block",
  fontWeight: FONT_WEIGHT.semibold,
};

const sectionStyle = {
  padding: SPACING.xl,
  background: "#fafafa",
  borderRadius: RADIUS.lg,
  display: "flex",
  flexDirection: "column",
  gap: SPACING.md,
};

const errorBoxStyle = {
  padding: SPACING.sm,
  background: COLORS.danger,
  color: "#fff",
  borderRadius: RADIUS.md,
  fontSize: FONT_SIZE.base,
  fontWeight: FONT_WEIGHT.semibold,
};

const successBoxStyle = {
  fontSize: FONT_SIZE.base,
  color: SUCCESS_COLOR,
  fontWeight: FONT_WEIGHT.semibold,
};

const toggleTrack = (active) => ({
  width: 44,
  height: 24,
  borderRadius: 12,
  background: active ? BRAND_COLOR : "#ccc",
  cursor: "pointer",
  position: "relative",
  transition: "background .2s",
});

const toggleKnob = (active) => ({
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#fff",
  position: "absolute",
  top: 2,
  left: active ? 22 : 2,
  transition: "left .2s",
  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
});

const SettingsPanel = ({ user, onUpdateUser, onLogout }) => {
  const [openSection, setOpenSection] = useState("personal");
  const [form, setForm] = useState({ ...(user || {}) });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggle = (id) => {
    setOpenSection(id);
    setError("");
    setSuccess("");
  };

  const saveUser = async (updates) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (typeof onUpdateUser === "function") await onUpdateUser(updates);
      setForm((prev) => ({ ...prev, ...updates }));
      setSuccess("Guardado correctamente");
    } catch (e) {
      setError(e?.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!pwForm.newPw) { setError("Ingresa la nueva contraseña"); return; }
    if (pwForm.newPw.length < 6) { setError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (pwForm.newPw !== pwForm.confirm) { setError("Las contraseñas no coinciden"); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (err) {
        setError(err.message || "Error al cambiar la contraseña");
      } else {
        setSuccess("Contraseña actualizada correctamente");
        setPwForm({ current: "", newPw: "", confirm: "" });
      }
    } catch (e) {
      setError(e?.message || "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "personal", icon: <User size={20} />, l: "Datos personales", d: "Nombre, email, teléfono" },
    { id: "security", icon: <Shield size={20} />, l: "Seguridad", d: "Contraseña y verificación" },
    { id: "payments", icon: <CreditCard size={20} />, l: "Pagos y cobros", d: "Métodos de pago y cuenta bancaria" },
    { id: "notifications", icon: <Bell size={20} />, l: "Notificaciones", d: "Preferencias de avisos" },
    { id: "locale", icon: <Globe size={20} />, l: "Idioma y moneda", d: "Español · CLP" },
    { id: "privacy", icon: <Lock size={20} />, l: "Privacidad", d: "Datos y visibilidad" },
  ];

  const submitBtnStyle = saving ? { opacity: 0.6, cursor: "not-allowed" } : undefined;

  const Feedback = () => (
    <>
      {error && <div style={errorBoxStyle}>{error}</div>}
      {success && !error && <div style={successBoxStyle}>{success}</div>}
    </>
  );

  if (!user) {
    return (
      <div style={{ padding: SPACING.xl, color: COLORS.muted, fontSize: FONT_SIZE.md }}>
        Cargando configuración...
      </div>
    );
  }

  return (
    <div>
    <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>Configuración</h2>
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: SPACING.xl + SPACING.xs, alignItems: "start", marginTop: SPACING.lg }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: SPACING.xl }}>
        {sections.map((s) => {
          const active = openSection === s.id;
          return (
            <div
              key={s.id}
              onClick={() => toggle(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING.sm,
                padding: `${SPACING.sm}px ${SPACING.sm + 2}px`,
                borderRadius: RADIUS.md + 2,
                cursor: "pointer",
                background: active ? "#f0f0f0" : "transparent",
                transition: "background .15s",
              }}
            >
              <div style={{ color: active ? COLORS.text : COLORS.muted }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: active ? FONT_WEIGHT.bold : FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>{s.l}</div>
                <div style={{ fontSize: FONT_SIZE.sm, color: "#777" }}>{s.d}</div>
              </div>
              <ChevronRight size={16} color={COLORS.light} />
            </div>
          );
        })}
        <Btn outline onClick={onLogout} style={{ marginTop: SPACING.md, color: BRAND_COLOR, borderColor: BRAND_COLOR }}>
          <LogOut size={16} /> Cerrar sesión
        </Btn>
      </div>

      <div style={{ minWidth: 0, maxWidth: 640 }}>
        {openSection === "personal" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if ((form.idType || "rut") === "rut" && form.idNumber && !isValidRut(form.idNumber)) {
                setError("RUT inválido (revisa el dígito verificador)");
                setSuccess("");
                return;
              }
              saveUser({
                firstName: form.firstName,
                lastName1: form.lastName1,
                lastName2: form.lastName2,
                email: form.email,
                phone: form.phone,
                idType: form.idType,
                idNumber: form.idNumber,
              });
            }}
            style={sectionStyle}
          >
            <div><label style={labelStyle}>Nombres</label><input style={inputStyle} value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><label style={labelStyle}>Primer apellido</label><input style={inputStyle} value={form.lastName1 || ""} onChange={(e) => setForm({ ...form, lastName1: e.target.value })} /></div>
            <div><label style={labelStyle}>Segundo apellido</label><input style={inputStyle} value={form.lastName2 || ""} onChange={(e) => setForm({ ...form, lastName2: e.target.value })} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div>
              <label style={labelStyle}>Tipo de identificación</label>
              <select style={inputStyle} value={form.idType || "rut"} onChange={(e) => setForm({ ...form, idType: e.target.value })}>
                <option value="rut">RUT</option>
                <option value="passport">Pasaporte</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Número de identificación</label>
              <input
                style={inputStyle}
                value={form.idNumber || ""}
                onChange={(e) => setForm({ ...form, idNumber: (form.idType || "rut") === "rut" ? formatRut(e.target.value) : e.target.value })}
              />
            </div>
            <Feedback />
            <Btn primary type="submit" disabled={saving} style={submitBtnStyle}>{saving ? "Guardando..." : "Guardar cambios"}</Btn>
          </form>
        )}

        {openSection === "security" && (
          <form onSubmit={changePassword} style={sectionStyle}>
            <div><label style={labelStyle}>Nueva contraseña</label><input type="password" style={inputStyle} value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} /></div>
            <div><label style={labelStyle}>Confirmar nueva contraseña</label><input type="password" style={inputStyle} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} /></div>
            <Feedback />
            <Btn primary type="submit" disabled={saving} style={submitBtnStyle}>{saving ? "Guardando..." : "Cambiar contraseña"}</Btn>
          </form>
        )}

        {openSection === "payments" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveUser({
                bankHolder: form.bankHolder,
                bankName: form.bankName,
                bankAccountType: form.bankAccountType,
                bankAccount: form.bankAccount,
                bankRut: form.bankRut,
              });
            }}
            style={sectionStyle}
          >
            <div>
              <label style={labelStyle}>Nombre del titular de la cuenta</label>
              <input style={inputStyle} value={form.bankHolder || ""} onChange={(e) => setForm({ ...form, bankHolder: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div>
              <label style={labelStyle}>Banco</label>
              <select style={inputStyle} value={form.bankName || ""} onChange={(e) => setForm({ ...form, bankName: e.target.value })}>
                <option value="">Seleccionar banco</option>
                {["Banco de Chile", "BancoEstado", "Banco Santander", "Banco BCI", "Banco Itaú", "Banco Scotiabank", "Banco Falabella", "Banco Ripley", "Banco Security", "Banco BICE", "Banco Consorcio"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de cuenta</label>
              <select style={inputStyle} value={form.bankAccountType || ""} onChange={(e) => setForm({ ...form, bankAccountType: e.target.value })}>
                <option value="">Seleccionar tipo</option>
                <option value="corriente">Cuenta corriente</option>
                <option value="vista">Cuenta vista / RUT</option>
                <option value="ahorro">Cuenta de ahorro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Número de cuenta</label>
              <input style={inputStyle} value={form.bankAccount || ""} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} placeholder="Ej: 00-123-45678-90" />
            </div>
            <div>
              <label style={labelStyle}>RUT del titular</label>
              <input style={inputStyle} value={form.bankRut || ""} onChange={(e) => setForm({ ...form, bankRut: e.target.value })} placeholder="12.345.678-9" />
            </div>
            {user?.credit > 0 && (
              <div style={{ padding: SPACING.sm, background: "#fef2f2", borderRadius: RADIUS.md, fontSize: FONT_SIZE.base }}>
                <span style={{ fontWeight: FONT_WEIGHT.semibold, color: COLORS.danger }}>Saldo pendiente: {formatCLP(Number(user.credit))}</span>
                <span style={{ color: COLORS.muted }}> — se descontará en tu próximo pago con tarjeta</span>
              </div>
            )}
            <Feedback />
            <Btn primary type="submit" disabled={saving} style={submitBtnStyle}>{saving ? "Guardando..." : "Guardar datos bancarios"}</Btn>
          </form>
        )}

        {openSection === "notifications" && (
          <div style={sectionStyle}>
            {[
              { key: "notifEmail", l: "Notificaciones por email" },
              { key: "notifPush", l: "Notificaciones push" },
              { key: "notifBookings", l: "Nuevas reservas" },
              { key: "notifMessages", l: "Mensajes nuevos" },
              { key: "notifPromo", l: "Promociones y ofertas" },
            ].map((n) => {
              const active = form[n.key] !== false;
              return (
                <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING.xs}px 0` }}>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium }}>{n.l}</span>
                  <div onClick={() => setForm({ ...form, [n.key]: !active })} style={toggleTrack(active)}>
                    <div style={toggleKnob(active)} />
                  </div>
                </div>
              );
            })}
            <Feedback />
            <Btn
              primary
              onClick={() => saveUser({ notifEmail: form.notifEmail, notifPush: form.notifPush, notifBookings: form.notifBookings, notifMessages: form.notifMessages, notifPromo: form.notifPromo })}
              disabled={saving}
              style={submitBtnStyle}
            >
              {saving ? "Guardando..." : "Guardar preferencias"}
            </Btn>
          </div>
        )}

        {openSection === "locale" && (
          <div style={sectionStyle}>
            <div>
              <label style={labelStyle}>Idioma</label>
              <select style={inputStyle} value={form.language || "es"} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Moneda</label>
              <select style={inputStyle} value={form.currency || "CLP"} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="CLP">CLP - Peso chileno</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <Feedback />
            <Btn primary onClick={() => saveUser({ language: form.language, currency: form.currency })} disabled={saving} style={submitBtnStyle}>
              {saving ? "Guardando..." : "Guardar"}
            </Btn>
          </div>
        )}

        {openSection === "privacy" && (
          <div style={sectionStyle}>
            {[
              { key: "privProfile", l: "Perfil público visible" },
              { key: "privShowPhone", l: "Mostrar teléfono a anfitriones" },
              { key: "privShowEmail", l: "Mostrar email a anfitriones" },
            ].map((p) => {
              const active = !!form[p.key];
              return (
                <div key={p.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING.xs}px 0` }}>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium }}>{p.l}</span>
                  <div onClick={() => setForm({ ...form, [p.key]: !active })} style={toggleTrack(active)}>
                    <div style={toggleKnob(active)} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: "1px solid #eee", paddingTop: SPACING.md, marginTop: SPACING.xs }}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: COLORS.danger, marginBottom: SPACING.xs }}>Zona de peligro</div>
              <Btn
                outline
                onClick={() => {
                  if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
                    alert("Funcionalidad de eliminación próximamente.");
                  }
                }}
                style={{ color: COLORS.danger, borderColor: "#fca5a5" }}
              >
                Eliminar mi cuenta
              </Btn>
            </div>
            <Feedback />
            <Btn
              primary
              onClick={() => saveUser({ privProfile: form.privProfile, privShowPhone: form.privShowPhone, privShowEmail: form.privShowEmail })}
              disabled={saving}
              style={submitBtnStyle}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Btn>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SettingsPanel;
