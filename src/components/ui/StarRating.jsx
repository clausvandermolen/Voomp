import { Star } from "lucide-react";

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
    <Star size={size} fill="#222" stroke="none" />
    <span style={{ fontWeight: 600, fontSize: size - 1 }}>{rating}</span>
  </span>
);

export default StarRating;
