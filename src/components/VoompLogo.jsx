import { BRAND_GRADIENT } from "../constants";

// V-Bold + punto logomark
// white variant: for use inside gradient backgrounds (popup, colored containers)
// gradient variant: standalone on light backgrounds
export const VoompMark = ({ size = 24, variant = "white", instanceId = "a" }) => {
  const gradId = `vg-${instanceId}`;
  const isWhite = variant === "white";

  return (
    <svg
      width={size}
      height={Math.round(size * 0.85)}
      viewBox="0 0 40 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!isWhite && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF385C" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      )}
      {/* Left arm */}
      <line
        x1="3" y1="3"
        x2="20" y2="28"
        stroke={isWhite ? "white" : `url(#${gradId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Right arm */}
      <line
        x1="37" y1="3"
        x2="20" y2="28"
        stroke={isWhite ? "white" : `url(#${gradId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Dot — white ring + filled circle */}
      {!isWhite && <circle cx="20" cy="28" r="5.5" fill="white" />}
      <circle
        cx="20" cy="28" r="3.8"
        fill={isWhite ? "white" : "#FF385C"}
        opacity={isWhite ? "0.9" : "1"}
      />
    </svg>
  );
};

// Square container with gradient background + white mark inside
// Drop-in replacement for the old Car-icon-in-gradient-box pattern
export const VoompLogoBox = ({ size = 36, radius = 10, instanceId = "box" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: BRAND_GRADIENT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <VoompMark size={Math.round(size * 0.6)} variant="white" instanceId={instanceId} />
  </div>
);
