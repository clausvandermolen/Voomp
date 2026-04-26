import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";

const FormAutocomplete = ({ value, onChange, options, placeholder, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((value || "").toLowerCase())
  );
  const showDropdown = open && filtered.length > 0;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: "100%", padding: SPACING.sm, borderRadius: RADIUS.md, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md }}
      />
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.lg,
            boxShadow: "0 8px 16px rgba(0,0,0,.08)",
            maxHeight: 200,
            overflow: "auto",
            zIndex: 200,
            marginTop: 4,
          }}
        >
          {filtered.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                fontSize: FONT_SIZE.md,
                cursor: "pointer",
                background: value === o ? COLORS.bg : "#fff",
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MyVehiclesSection = ({ user, onUpdateUser }) => {
  const [vehicles, setVehicles] = useState(user?.vehicles || []);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    brand: "",
    model: "",
    color: "",
    type: "",
    plate: "",
    ev: false,
    width: "",
    length: "",
    height: "",
  });

  const saveVehicles = async (updatedVehicles) => {
    try {
      setSaving(true);
      setError(null);
      setVehicles(updatedVehicles);
      if (onUpdateUser) await onUpdateUser({ vehicles: updatedVehicles });
    } catch (err) {
      setError(err?.message || "Error guardando vehículos");
      setVehicles(vehicles);
    } finally {
      setSaving(false);
    }
  };

  const addVehicle = async () => {
    if (!newVehicle.type || !newVehicle.brand || !newVehicle.model) {
      setError("Por favor completa los campos requeridos: Marca, Modelo y Tipo");
      return;
    }

    const toNum = (x) => {
      const n = parseFloat(String(x).replace(",", "."));
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    const payload = {
      ...newVehicle,
      width: toNum(newVehicle.width),
      length: toNum(newVehicle.length),
      height: toNum(newVehicle.height),
      name: `${newVehicle.brand} ${newVehicle.model}`.trim(),
    };

    let updated;
    if (editingVehicleId) {
      updated = vehicles.map((v) =>
        v.id === editingVehicleId ? { ...payload, id: editingVehicleId } : v
      );
    } else {
      updated = [...vehicles, { ...payload, id: Date.now() }];
    }

    await saveVehicles(updated);
    resetForm();
  };

  const resetForm = () => {
    setNewVehicle({
      brand: "",
      model: "",
      color: "",
      type: "",
      plate: "",
      ev: false,
      width: "",
      length: "",
      height: "",
    });
    setShowAddVehicle(false);
    setEditingVehicleId(null);
  };

  const editVehicle = (id) => {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return;
    setNewVehicle(v);
    setEditingVehicleId(id);
    setShowAddVehicle(true);
  };

  const removeVehicle = async (id) => {
    await saveVehicles(vehicles.filter((v) => v.id !== id));
  };

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg }}>
        <h3 style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, margin: 0 }}>Mis Vehículos</h3>
        <button
          onClick={() => setShowAddVehicle(true)}
          style={{
            background: BRAND_COLOR,
            color: "#fff",
            border: "none",
            borderRadius: RADIUS.md,
            padding: `${SPACING.xs}px ${SPACING.md}px`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: SPACING.xs,
          }}
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {vehicles.length === 0 && !showAddVehicle && (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.light }}>
          Sin vehículos registrados
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm, marginBottom: SPACING.lg }}>
        {vehicles.map((v) => (
          <div
            key={v.id}
            style={{
              background: COLORS.bg,
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>{v.name}</div>
              <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.light }}>
                {v.type} • {v.plate}
              </div>
            </div>
            <div style={{ display: "flex", gap: SPACING.xs }}>
              <button
                onClick={() => editVehicle(v.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: BRAND_COLOR,
                }}
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => removeVehicle(v.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: COLORS.danger,
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddVehicle && (
        <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md, marginBottom: SPACING.md }}>
            <div>
              <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.light, fontWeight: FONT_WEIGHT.semibold }}>Marca</label>
              <input
                value={newVehicle.brand}
                onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                placeholder="Marca"
                style={{ width: "100%", padding: SPACING.sm, borderRadius: RADIUS.md, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Modelo</label>
              <input
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                placeholder="Modelo"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Color</label>
              <input
                value={newVehicle.color}
                onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                placeholder="Color"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Tipo</label>
              <input
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                placeholder="Tipo"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Patente</label>
              <input
                value={newVehicle.plate}
                onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                placeholder="ABC-1234"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={newVehicle.ev}
                  onChange={(e) => setNewVehicle({ ...newVehicle, ev: e.target.checked })}
                />
                <span style={{ fontSize: 14 }}>Vehículo eléctrico</span>
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACING.md, marginBottom: SPACING.md }}>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Ancho (m)</label>
              <input
                type="number"
                value={newVehicle.width}
                onChange={(e) => setNewVehicle({ ...newVehicle, width: e.target.value })}
                placeholder="1.8"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Largo (m)</label>
              <input
                type="number"
                value={newVehicle.length}
                onChange={(e) => setNewVehicle({ ...newVehicle, length: e.target.value })}
                placeholder="4.5"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Alto (m)</label>
              <input
                type="number"
                value={newVehicle.height}
                onChange={(e) => setNewVehicle({ ...newVehicle, height: e.target.value })}
                placeholder="1.6"
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: COLORS.danger, padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.md, fontSize: FONT_SIZE.md }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: SPACING.sm }}>
            <button
              onClick={addVehicle}
              disabled={saving}
              style={{
                flex: 1,
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
            <button
              onClick={resetForm}
              disabled={saving}
              style={{
                flex: 1,
                background: COLORS.bg,
                color: "#000",
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
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehiclesSection;
