import CardCarousel from "./CardCarousel";
import { StarRating } from "./ui";
import { formatCLP } from "../utils/format";

const ListingCard = ({ listing, onClick, onFav }) => (
  <div onClick={() => onClick(listing)} style={{ cursor: "pointer" }}>
    <CardCarousel photos={listing.photos} isFav={listing.favorite} onFav={() => onFav(listing.id)} />
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>{listing.location || "Sin ubicación"}</span>
        <StarRating rating={listing.rating || 0} />
      </div>
      <div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>{listing.title}</div>
      {listing.host?.name && <div style={{ color: "#555", fontSize: 13, marginTop: 1 }}>Anfitrión: {listing.host.name}</div>}
      <div style={{ color: "#555", fontSize: 14, marginTop: 1 }}>{(listing.vehicleTypes || []).join(" · ")}</div>
      <div style={{ marginTop: 6 }}>
        <span style={{ fontWeight: 600 }}>{formatCLP(listing.price || 0)}</span>
        <span style={{ color: "#555" }}> / {listing.priceUnit}</span>
      </div>
    </div>
  </div>
);

export default ListingCard;
