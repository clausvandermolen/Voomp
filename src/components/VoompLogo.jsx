import { BRAND_GRADIENT } from "../constants";

// V de ángulo cerrado + círculo completo que la enmarca (concepto pin/marca de lugar)
// V converge desde (6,4)/(54,4) hasta el punto (30,48) dentro del círculo
// Círculo: centro (30,38) r=19 — los brazos de la V lo cruzan en ~(17,25)/(43,25)
export const VoompMark = ({ height = 34, variant = "white", instanceId = "a" }) => {
  const width = height; // viewBox cuadrado 60×60
  const gradId = `vg-${instanceId}`;
  const isWhite = variant === "white";
  const stroke = isWhite ? "white" : `url(#${gradId})`;
  const sw = 4.5;

  return (
    <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {!isWhite && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF385C" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      )}
      {/* Círculo que enmarca la V — dibujado primero, queda debajo */}
      <circle cx="30" cy="38" r="19" stroke={stroke} strokeWidth={sw} fill="none" />
      {/* Brazo izquierdo de la V — sobre el círculo */}
      <line x1="6" y1="4" x2="30" y2="50"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Brazo derecho de la V — sobre el círculo */}
      <line x1="54" y1="4" x2="30" y2="50"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
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
