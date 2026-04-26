import { BRAND_GRADIENT } from "../constants";

// V centrada + elipse acostada en perspectiva, sin contacto — pin de mapa 3D
// ViewBox 60×70. V: (14,7)→(30,47)/(46,7)→(30,47). Elipse: cx=30 cy=61 rx=15 ry=5.5
// Gap verificado: 4px entre punta de V y borde superior de elipse. Márgenes: 4.25 top / 1.75 bottom.
export const VoompMark = ({ height = 34, variant = "white", instanceId = "a" }) => {
  const width = Math.round(height * (60 / 70)); // viewBox 60×70
  const gradId = `vg-${instanceId}`;
  const isWhite = variant === "white";
  const stroke = isWhite ? "white" : `url(#${gradId})`;

  return (
    <svg width={width} height={height} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {!isWhite && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF385C" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      )}
      {/* Elipse acostada — más fina que la V para dar perspectiva/profundidad */}
      <ellipse cx="30" cy="61" rx="15" ry="5.5"
        stroke={stroke} strokeWidth="3.5" fill="none" />
      {/* Brazo izquierdo de la V */}
      <line x1="14" y1="7" x2="30" y2="47"
        stroke={stroke} strokeWidth="5.5" strokeLinecap="round" />
      {/* Brazo derecho de la V */}
      <line x1="46" y1="7" x2="30" y2="47"
        stroke={stroke} strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
};

// Contenedor cuadrado con gradiente + marca blanca
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
    <VoompMark height={Math.round(size * 0.72)} variant="white" instanceId={instanceId} />
  </div>
);
