import { useState } from "react";
import { Check } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";

const SECURITY_FEATURES = [
  "Cámara de seguridad",
  "Iluminación nocturna",
  "Rejas o muros",
  "Vigilancia 24/7",
  "Guardia de seguridad",
];

const ParkingPreferences = ({ user, onUpdateUser }) => {
  const [prefs, setPrefs] = useState({
    type: "",
    ev: false,
    security: [],
    ...(user?.parking_preferences || {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSecurityToggle = (feature) => {
    setError(null);
    setPrefs((prev) => ({
      ...prev,
      security: prev.security.includes(feature)
        ? prev.security.filter((f) => f !== feature)
        : [...prev.security, feature],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      if (onUpdateUser) {
        await onUpdateUser({ parking_preferences: prefs });
      }
    } catch (err) {
      setError(err?.message || "Error guardando preferencias");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl }}>
      <h3 style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>
        Preferencias de Estacionamiento
      </h3>

      <div style={{ marginBottom: SPACING.xl }}>
        <label style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, display: "block", marginBottom: SPACING.xs }}>
          Tipo preferido
        </label>
        <select
          value={prefs.type || ""}
          onChange={(e) => setPrefs({ ...prefs, type: e.target.value })}
          style={{
            width: "100%",
            padding: SPACING.sm,
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.border}`,
            fontSize: FONT_SIZE.md,
          }}
        >
          <option value="">Selecciona un tipo</option>
          <option value="Garaje">Garaje</option>
          <option value="Al aire libre">Al aire libre</option>
          <option value="Techado">Techado</option>
        </select>
      </div>

      <div style={{ marginBottom: SPACING.xl, display: "flex", alignItems: "center", gap: SPACING.md }}>
        <input
          type="checkbox"
          checked={prefs.ev || false}
          onChange={(e) => setPrefs({ ...prefs, ev: e.target.checked })}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
        <label style={{ fontSize: FONT_SIZE.md, cursor: "pointer" }}>
          Necesito carga de vehículo eléctrico
        </label>
      </div>

      <div style={{ marginBottom: SPACING.xl }}>
        <label style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, display: "block", marginBottom: SPACING.sm }}>
          Características de seguridad requeridas
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: SPACING.sm }}>
          {SECURITY_FEATURES.map((feature) => (
            <div
              key={feature}
              onClick={() => handleSecurityToggle(feature)}
              style={{
                background: prefs.security.includes(feature) ? BRAND_COLOR : COLORS.bg,
                color: prefs.security.includes(feature) ? "#fff" : "#000",
                borderRadius: RADIUS.md,
                padding: SPACING.sm,
                cursor: "pointer",
                fontWeight: FONT_WEIGHT.medium,
                textAlign: "center",
                border: `2px solid ${prefs.security.includes(feature) ? BRAND_COLOR : COLORS.border}`,
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: COLORS.danger, padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.md, fontSize: FONT_SIZE.md }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          background: BRAND_COLOR,
          color: "#fff",
          border: "none",
          borderRadius: RADIUS.md,
          padding: SPACING.sm,
          cursor: saving ? "not-allowed" : "pointer",
          fontWeight: FONT_WEIGHT.semibold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING.xs,
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Check size={16} /> {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};

export default ParkingPreferences;
