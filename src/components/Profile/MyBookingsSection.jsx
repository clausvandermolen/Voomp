import { useState } from "react";
import { MessageCircle, Clock, CheckCircle, Star } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";
import { formatCLP } from "../../utils/format";
import { supabase } from "../../lib/supabase";
import ReviewModal from "../ReviewModal";

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
  const [reviewModal, setReviewModal] = useState(null); // { booking, type: 'listing'|'host' }
  const [submittingReview, setSubmittingReview] = useState(false);

  const userBookings = bookings.filter((b) => b.conductorId === user?.id);
  const TERMINAL = new Set(["completed", "cancelled", "rejected"]);
  const activeBookings = userBookings.filter((b) => !TERMINAL.has(b.status));
  const pastBookings = userBookings.filter((b) => TERMINAL.has(b.status));

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!reviewModal || !user?.id) return;
    const { booking, type } = reviewModal;
    setSubmittingReview(true);
    try {
      const targetId = type === "host" ? (booking.hostId || booking.host_id) : null;
      const { error } = await supabase.from("reviews").insert({
        review_type: type,
        listing_id: booking.listingId || booking.listing_id,
        target_id: targetId,
        author_id: user.id,
        author_name: `${user.firstName || ""} ${user.lastName1 || ""}`.trim(),
        rating,
        comment,
        booking_id: booking.id,
      });
      if (error) {
        if (error.code === "23505") {
          pushNotification?.("Ya calificaste esta reserva", "warning");
        } else {
          pushNotification?.("No se pudo publicar la reseña", "error");
        }
        return;
      }
      setDoneReviews?.(prev => ({ ...prev, [`${booking.id}_${type}`]: true }));
      pushNotification?.("Reseña publicada", "success");
    } finally {
      setSubmittingReview(false);
    }
  };

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
              <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
                {pastBookings.map((b) => {
                  const ratedListing = doneReviews?.[`${b.id}_listing`];
                  const ratedHost = doneReviews?.[`${b.id}_host`];
                  const reviewable = b.status === "completed";
                  const statusLabel = b.status === "completed" ? "Completada"
                    : b.status === "cancelled" ? "Cancelada"
                    : "Rechazada";
                  const statusColor = b.status === "completed" ? "#065f46"
                    : b.status === "cancelled" ? "#92400e"
                    : "#991b1b";
                  return (
                    <div key={b.id} style={{ padding: SPACING.sm, background: COLORS.bg, borderRadius: RADIUS.md }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.xs }}>
                        <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold }}>{b.listingTitle}</div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                          <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.light }}>{b.startDate}</div>
                          <div style={{ fontSize: FONT_SIZE.xs, color: statusColor, fontWeight: FONT_WEIGHT.semibold }}>{statusLabel}</div>
                        </div>
                      </div>
                      {reviewable && (
                      <div style={{ display: "flex", gap: SPACING.xs }}>
                        <button
                          onClick={() => !ratedListing && setReviewModal({ booking: b, type: "listing" })}
                          disabled={ratedListing}
                          style={{
                            flex: 1, fontSize: FONT_SIZE.sm,
                            background: ratedListing ? COLORS.bg : "#fff",
                            color: ratedListing ? COLORS.light : BRAND_COLOR,
                            border: `1px solid ${ratedListing ? COLORS.border : BRAND_COLOR}44`,
                            borderRadius: RADIUS.sm,
                            padding: `${SPACING.xs}px ${SPACING.sm}px`,
                            cursor: ratedListing ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          }}
                        >
                          <Star size={12} /> {ratedListing ? "Estacionamiento ✓" : "Calificar estacionamiento"}
                        </button>
                        <button
                          onClick={() => !ratedHost && setReviewModal({ booking: b, type: "host" })}
                          disabled={ratedHost}
                          style={{
                            flex: 1, fontSize: FONT_SIZE.sm,
                            background: ratedHost ? COLORS.bg : "#fff",
                            color: ratedHost ? COLORS.light : BRAND_COLOR,
                            border: `1px solid ${ratedHost ? COLORS.border : BRAND_COLOR}44`,
                            borderRadius: RADIUS.sm,
                            padding: `${SPACING.xs}px ${SPACING.sm}px`,
                            cursor: ratedHost ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          }}
                        >
                          <Star size={12} /> {ratedHost ? "Anfitrión ✓" : "Calificar anfitrión"}
                        </button>
                      </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <ReviewModal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        onSubmit={handleReviewSubmit}
        title={reviewModal?.type === "host" ? "Calificar anfitrión" : "Calificar estacionamiento"}
        subtitle={reviewModal?.booking?.listingTitle}
        submitting={submittingReview}
      />
    </div>
  );
};

export default MyBookingsSection;
