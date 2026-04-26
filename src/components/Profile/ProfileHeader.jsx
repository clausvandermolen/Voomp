import { useState } from "react";
import { Edit, Camera, Check, X } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";

const ProfileHeader = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      if (onUpdateUser) {
        await onUpdateUser({
          firstName: editForm.firstName,
          lastName1: editForm.lastName1,
          lastName2: editForm.lastName2,
          email: editForm.email,
          phone: editForm.phone,
          bio: editForm.bio,
        });
      }
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || "Error guardando perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user || {});
    setIsEditing(false);
  };

  const rating = user?.rating || 0;
  const reviewCount = user?.reviewCount || 0;

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl }}>
      <div style={{ display: "flex", gap: SPACING.xl, alignItems: "flex-start", marginBottom: SPACING.xl }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#f0f0f0",
              backgroundImage: user?.avatar ? `url(${user.avatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {isEditing && (
            <button
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: BRAND_COLOR,
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={20} />
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {!isEditing ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.xs }}>
                <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, margin: 0 }}>
                  {user?.firstName} {user?.lastName1}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: BRAND_COLOR,
                  }}
                >
                  <Edit size={18} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm }}>
                <div style={{ fontSize: FONT_SIZE.md, color: COLORS.muted }}>
                  ⭐ {rating.toFixed(1)} ({reviewCount} reseñas)
                </div>
              </div>

              <p style={{ fontSize: FONT_SIZE.md, color: COLORS.light, lineHeight: 1.5, margin: 0 }}>
                {user?.bio || "Sin biografía"}
              </p>
            </>
          ) : (
            <>\n              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md, marginBottom: SPACING.md }}>
                <div>
                  <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.light, fontWeight: FONT_WEIGHT.semibold }}>Nombre</label>
                  <input
                    value={editForm.firstName || ""}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    style={{ width: "100%", padding: SPACING.sm, borderRadius: RADIUS.md, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Apellido 1</label>
                  <input
                    value={editForm.lastName1 || ""}
                    onChange={(e) => setEditForm({ ...editForm, lastName1: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Apellido 2</label>
                  <input
                    value={editForm.lastName2 || ""}
                    onChange={(e) => setEditForm({ ...editForm, lastName2: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Email</label>
                  <input
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Teléfono</label>
                  <input
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: SPACING.md }}>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.light, fontWeight: FONT_WEIGHT.semibold }}>Biografía</label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: SPACING.sm,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${COLORS.border}`,
                    fontFamily: "inherit",
                    fontSize: FONT_SIZE.md,
                  }}
                />
              </div>

              {error && (
                <div style={{ background: "#fee2e2", color: COLORS.danger, padding: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.md, fontSize: FONT_SIZE.md }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: SPACING.sm }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    background: BRAND_COLOR,
                    color: "#fff",
                    border: "none",
                    borderRadius: RADIUS.md,
                    padding: SPACING.sm,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: FONT_WEIGHT.semibold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: SPACING.xs,
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  <Check size={16} /> {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    background: COLORS.bg,
                    color: "#000",
                    border: "none",
                    borderRadius: RADIUS.md,
                    padding: SPACING.sm,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: FONT_WEIGHT.semibold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: SPACING.xs,
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
