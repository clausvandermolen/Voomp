import { Heart, Car } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from "../../constants/styles";

const SavedSection = ({ listings = [], onSelectListing }) => {
  const savedListings = listings.filter((l) => l.favorite);

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl }}>
      <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>Mis Voomps guardados</h2>
      {savedListings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#555", background: "#f7f7f7", borderRadius: 16 }}>
          <Heart size={40} color="#ddd" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, marginBottom: 4 }}>Aún no tienes Voomps guardados</p>
          <p style={{ fontSize: 13, color: "#888" }}>Presiona el botón "Guardar" en cualquier estacionamiento para verlo aquí.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {savedListings.map((l) => (
            <div
              key={l.id}
              onClick={() => onSelectListing && onSelectListing(l)}
              style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "box-shadow .2s", background: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {l.photos?.[0] ? (
                <img src={l.photos[0]} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: 160, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Car size={32} color="#bbb" />
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{l.title}</div>
                <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>{l.location}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: BRAND_COLOR }}>
                  {l.price > 0
                    ? `$${Number(l.price).toLocaleString("es-CL")} / hora`
                    : `$${Number(l.price_daily || 0).toLocaleString("es-CL")} / día`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSection;
