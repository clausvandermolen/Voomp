import { useState, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";
import { formatCLP } from "../../utils/format";

const HostDashboard = ({
  listings = [],
  bookings = [],
  user,
  onProposeMod,
  onMarkRead,
  onUpdateBooking,
  onSelectListing,
  onEditListing,
  onDeleteListing,
  onUpdateListing,
  pushNotification,
  initialDashboardSubTab,
  onDashboardSubTabChange,
}) => {
  const [dashboardSubTab, setDashboardSubTab] = useState(
    initialDashboardSubTab || "listings"
  );

  useEffect(() => {
    if (
      initialDashboardSubTab &&
      initialDashboardSubTab !== dashboardSubTab
    ) {
      setDashboardSubTab(initialDashboardSubTab);
      if (onDashboardSubTabChange) onDashboardSubTabChange(null);
    }
  }, [initialDashboardSubTab, dashboardSubTab, onDashboardSubTabChange]);

  const incomingBookings = bookings.filter(
    (b) => b.hostId === user?.id && !b.completed
  );
  const pendingBookings = incomingBookings.filter((b) => b.status === "pending");

  const thisMonth = new Date();
  const monthBookings = bookings.filter((b) => {
    if (b.hostId !== user?.id) return false;
    try {
      return new Date(b.startDate).getMonth() === thisMonth.getMonth();
    } catch {
      return false;
    }
  });

  const monthEarnings = monthBookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const allEarnings = bookings
    .filter((b) => b.hostId === user?.id)
    .reduce((sum, b) => sum + (b.total || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${COLORS.border}`, marginBottom: SPACING.xl }}>
        {[
          { id: "listings", label: "Mis anuncios" },
          { id: "incoming", label: `Reservas entrantes (${pendingBookings.length})` },
          { id: "analytics", label: "Analytics" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setDashboardSubTab(t.id)}
            style={{
              background: dashboardSubTab === t.id ? "#000" : "#fff",
              color: dashboardSubTab === t.id ? "#fff" : COLORS.muted,
              border: "none",
              padding: `${SPACING.sm}px ${SPACING.lg}px`,
              cursor: "pointer",
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.semibold,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {dashboardSubTab === "listings" && (
        <div>
          {listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.light }}>
              Sin anuncios
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
              {listings.map((l) => (
                <div
                  key={l.id}
                  style={{
                    background: COLORS.bg,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>
                      {l.title}
                    </div>
                    <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.light }}>
                      {l.location}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: SPACING.xs }}>
                    <button onClick={() => onSelectListing?.(l)} style={{ background: "none", color: BRAND_COLOR, border: "none", cursor: "pointer" }} title="Ver">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => onEditListing?.(l)} style={{ background: "none", color: "#666", border: "none", cursor: "pointer" }} title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDeleteListing?.(l.id)} style={{ background: "none", color: COLORS.danger, border: "none", cursor: "pointer" }} title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dashboardSubTab === "incoming" && (
        <div>
          {incomingBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.light }}>
              Sin reservas entrantes
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
              {incomingBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: b.status === "pending" ? "#fffbeb" : COLORS.bg,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.md,
                    border: b.status === "pending" ? "1px solid #f59e0b33" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md }}>
                        {b.listingTitle}
                      </div>
                      <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.sm }}>
                        {b.conductorName} • {b.startDate}
                      </div>
                      {b.status === "pending" && (
                        <div style={{ fontSize: FONT_SIZE.sm, color: "#92400e", marginTop: SPACING.xs }}>
                          Esperando aprobación
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.lg }}>
                        {formatCLP(b.total)}
                      </div>
                      {b.status === "pending" && (
                        <div style={{ display: "flex", gap: SPACING.xs, marginTop: SPACING.xs }}>
                          <button
                            onClick={() =>
                              onUpdateBooking(b.id, { status: "confirmed" })
                            }
                            style={{
                              fontSize: FONT_SIZE.sm,
                              background: BRAND_COLOR,
                              color: "#fff",
                              border: "none",
                              borderRadius: RADIUS.sm,
                              padding: `${SPACING.xs}px ${SPACING.sm}px`,
                              cursor: "pointer",
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() =>
                              onUpdateBooking(b.id, { status: "rejected" })
                            }
                            style={{
                              fontSize: FONT_SIZE.sm,
                              background: COLORS.bg,
                              color: "#000",
                              border: "none",
                              borderRadius: RADIUS.sm,
                              padding: `${SPACING.xs}px ${SPACING.sm}px`,
                              cursor: "pointer",
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dashboardSubTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: SPACING.md }}>
          <div style={{ background: "#f0fdf4", borderRadius: RADIUS.lg, padding: SPACING.md }}>
            <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, marginBottom: SPACING.xs }}>
              Este mes
            </div>
            <div style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.extrabold, color: "#008A05" }}>
              {formatCLP(monthEarnings)}
            </div>
          </div>
          <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
            <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, marginBottom: SPACING.xs }}>
              Este mes (reservas)
            </div>
            <div style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.extrabold }}>
              {monthBookings.length}
            </div>
          </div>
          <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
            <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, marginBottom: SPACING.xs }}>
              Total ganado
            </div>
            <div style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.extrabold }}>
              {formatCLP(allEarnings)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;
