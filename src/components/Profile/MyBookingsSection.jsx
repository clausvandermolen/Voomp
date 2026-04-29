import { useState } from "react";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";
import { formatCLP } from "../../utils/format";

const MyBookingsSection = ({
  bookings = [],
  user,
  onCheckIn,
  onCheckOut,
  onRespondMod,
  onChat,
  doneReviews,
  setDoneReviews,
  pushNotification,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [activePage, setActivePage] = useState(1);

  const userBookings = bookings.filter((b) => b.conductorId === user?.id);
  const activeBookings = userBookings.filter((b) => !b.completed);
  const pastBookings = userBookings.filter((b) => b.completed);

  const itemsPerPage = 5;
  const paginatedActive = activeBookings.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  const totalActivePages = Math.ceil(activeBookings.length / itemsPerPage);

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl }}>
      <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>
        Mis reservas
      </h2>

      {activeBookings.length === 0 && pastBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: COLORS.muted }}>
          Sin reservas
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
          {paginatedActive.map((b) => {
            const isExpanded = expandedId === b.id;
            const isPending = b.status === "pending";

            return (
              <div
                key={b.id}
                style={{
                  background: isPending ? "#fffbeb" : COLORS.bg,
                  borderRadius: RADIUS.lg,
                  border: isPending ? "1px solid #f59e0b33" : "none",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: SPACING.md,
                    padding: SPACING.md,
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.lg }}>
                      {b.listingTitle}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md }}>
                      {b.location}
                    </div>
                    {isPending && (
                      <div style={{ fontSize: FONT_SIZE.xs, color: "#92400e", marginTop: SPACING.xs }}>
                        Esperando aprobación del anfitrión
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.lg }}>
                      {formatCLP(b.total || b.price)}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: `0 ${SPACING.md}px ${SPACING.md}px`, borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: FONT_SIZE.base, color: COLORS.light, marginBottom: SPACING.sm }}>
                      {b.startDate} a {b.endDate}
                    </div>

                    {b.status === "active" && onCheckOut && (
                      <div style={{ display: "flex", gap: SPACING.xs, marginBottom: SPACING.sm }}>
                        <button
                          onClick={() => onCheckOut(b)}
                          style={{
                            flex: 1,
                            background: BRAND_COLOR,
                            color: "#fff",
                            border: "none",
                            borderRadius: RADIUS.sm,
                            padding: `${SPACING.xs}px ${SPACING.sm}px`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: SPACING.xs,
                          }}
                        >
                          <CheckCircle size={16} /> Check-out
                        </button>
                      </div>
                    )}

                    {(b.status === "confirmed" || b.status === "active_pending_checkin") && onCheckIn && (
                      <div style={{ display: "flex", gap: SPACING.xs, marginBottom: SPACING.sm }}>
                        <button
                          onClick={() => onCheckIn(b)}
                          style={{
                            flex: 1,
                            background: BRAND_COLOR,
                            color: "#fff",
                            border: "none",
                            borderRadius: RADIUS.sm,
                            padding: `${SPACING.xs}px ${SPACING.sm}px`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: SPACING.xs,
                          }}
                        >
                          <Clock size={16} /> Check-in
                        </button>
                      </div>
                    )}

                    {b.modStatus === "pending_conductor_approval" && onRespondMod && (
                      <div style={{ background: "#fffbeb", borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm }}>
                        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: "#92400e" }}>
                          Propuesta de modificación del anfitrión
                        </div>
                        <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: SPACING.xs }}>
                          Nuevo check-out: {b.modEndDate}
                        </div>
                        <div style={{ display: "flex", gap: SPACING.xs, marginTop: SPACING.xs }}>
                          <button
                            onClick={() => onRespondMod(b, true)}
                            style={{
                              flex: 1,
                              fontSize: FONT_SIZE.sm,
                              background: BRAND_COLOR,
                              color: "#fff",
                              border: "none",
                              borderRadius: RADIUS.sm,
                              padding: `${SPACING.xs}px ${SPACING.sm}px`,
                              cursor: "pointer",
                            }}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => onRespondMod(b, false)}
                            style={{
                              flex: 1,
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
                      </div>
                    )}

                    {onChat && (
                      <div style={{ display: "flex", gap: SPACING.xs }}>
                        <button
                          onClick={() => onChat(b)}
                          style={{
                            flex: 1,
                            background: COLORS.bg,
                            color: "#000",
                            border: "none",
                            borderRadius: RADIUS.sm,
                            padding: `${SPACING.xs}px ${SPACING.sm}px`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: SPACING.xs,
                          }}
                        >
                          <MessageCircle size={16} /> Chat
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ padding: `${SPACING.xs}px ${SPACING.md}px`, background: COLORS.bg, display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.light,
                      cursor: "pointer",
                      fontSize: FONT_SIZE.sm,
                    }}
                  >
                    {isExpanded ? "Ocultar" : "Ver detalles"}
                  </button>
                </div>
              </div>
            );
          })}

          {totalActivePages > 1 && (
            <div style={{ display: "flex", gap: SPACING.sm, justifyContent: "center", marginTop: SPACING.md }}>
              {Array.from({ length: totalActivePages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  style={{
                    padding: `${SPACING.xs}px ${SPACING.sm}px`,
                    background: activePage === page ? BRAND_COLOR : COLORS.bg,
                    color: activePage === page ? "#fff" : COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: RADIUS.sm,
                    cursor: "pointer",
                    fontSize: FONT_SIZE.sm,
                    fontWeight: activePage === page ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}

          {pastBookings.length > 0 && (
            <div style={{ marginTop: SPACING.xl, paddingTop: SPACING.xl, borderTop: `1px solid ${COLORS.border}` }}>
              <h4 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.sm }}>
                Reservas pasadas ({pastBookings.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: SPACING.xs }}>
                {pastBookings.slice(0, 3).map((b) => (
                  <div key={b.id} style={{ fontSize: FONT_SIZE.base, color: COLORS.light }}>
                    {b.listingTitle} • {b.startDate}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsSection;
