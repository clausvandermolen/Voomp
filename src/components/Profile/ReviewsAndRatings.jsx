import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../../constants/styles";

const ReviewsAndRatings = ({ user, bookings }) => {
  const [ratingsSubTab, setRatingsSubTab] = useState("host");
  const [myHostReviews, setMyHostReviews] = useState([]);
  const [myDriverReviews, setMyDriverReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostPage, setHostPage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: hostReviews, error: hostErr } = await supabase
          .from("reviews")
          .select("*")
          .eq("target_id", user.id)
          .eq("review_type", "host");

        if (hostErr) throw hostErr;

        const { data: driverReviews, error: driverErr } = await supabase
          .from("reviews")
          .select("*")
          .eq("target_id", user.id)
          .eq("review_type", "driver");

        if (driverErr) throw driverErr;

        if (isMounted) {
          setMyHostReviews(hostReviews || []);
          setMyDriverReviews(driverReviews || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Error cargando reseñas");
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [user?.id]);

  const renderReviews = (reviews, tabId) => {
    if (reviews.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.light }}>
          Sin reseñas
        </div>
      );
    }

    const avg =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const currentPage = tabId === "host" ? hostPage : driverPage;
    const paginatedReviews = reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const setCurrentPage = tabId === "host" ? setHostPage : setDriverPage;

    return (
      <div>
        <div style={{ marginBottom: SPACING.md }}>
          <div style={{ fontSize: FONT_SIZE.base, color: COLORS.light, marginBottom: SPACING.xs }}>
            Calificación promedio
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
            <div style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.extrabold }}>{avg}</div>
            <div style={{ display: "flex", gap: SPACING.xs }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(avg) ? "#222" : "none"}
                />
              ))}
            </div>
            <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.light }}>
              ({reviews.length} reseñas)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
          {paginatedReviews.map((r, i) => (
            <div key={r.id || i} style={{ padding: SPACING.sm, background: COLORS.bg, borderRadius: RADIUS.md }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.xs }}>
                <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.base }}>
                  {r.author_name || "Anónimo"}
                </div>
                <div style={{ display: "flex", gap: SPACING.xs }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= r.rating ? "#222" : "none"}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>{r.comment}</div>
              <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.light, marginTop: SPACING.xs }}>
                {r.created_at
                  ? new Date(r.created_at).toLocaleDateString("es-CL")
                  : ""}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: SPACING.sm, justifyContent: "center", marginTop: SPACING.md }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: `${SPACING.xs}px ${SPACING.sm}px`,
                  background: currentPage === page ? "#000" : COLORS.bg,
                  color: currentPage === page ? "#fff" : COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: RADIUS.sm,
                  cursor: "pointer",
                  fontSize: FONT_SIZE.sm,
                  fontWeight: currentPage === page ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl }}>
      <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>Reseñas y calificaciones</h2>
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${COLORS.border}`, marginBottom: SPACING.xl, marginTop: SPACING.lg }}>
        {[
          { id: "host", label: "Como anfitrión" },
          { id: "driver", label: "Como conductor" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setRatingsSubTab(t.id)}
            style={{
              background: ratingsSubTab === t.id ? "#000" : "#fff",
              color: ratingsSubTab === t.id ? "#fff" : COLORS.muted,
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

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.light }}>
          Cargando...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.danger, fontSize: FONT_SIZE.md }}>
          {error}
        </div>
      ) : (
        <>
          {ratingsSubTab === "host" && renderReviews(myHostReviews, "host")}
          {ratingsSubTab === "driver" && renderReviews(myDriverReviews, "driver")}
        </>
      )}
    </div>
  );
};

export default ReviewsAndRatings;
