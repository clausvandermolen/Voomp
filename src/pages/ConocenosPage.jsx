import { Shield, MapPin, DollarSign, Zap, Check, ArrowLeft } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { useNavigate } from "react-router-dom";

const NAVY = "#1A3C5E";
const SAFETY_BLUE = "#2563EB";
const SUCCESS_GREEN = "#16A34A";
const SURFACE = "#F7F8FA";
const LIGHT_BLUE = "#EFF6FF";

const ConocenosPage = ({ onNavigate }) => {
  const navigate = useNavigate();

  const conductorBenefits = [
    "Encuentra espacios verificados cerca de donde los necesitas",
    "Reserva por hora, día o mes directamente con el dueño del espacio",
    "Check-in y check-out desde la app, sin efectivo ni trámites",
    "Filtra por carga eléctrica, tipo de vehículo y horario disponible",
  ];

  const hostBenefits = [
    "Publica tu espacio gratis en minutos",
    "Tú controlas los horarios, precio y tipo de vehículo aceptado",
    "Recibe pagos digitales directamente en tu cuenta",
    "Sin intermediarios: trato directo con el conductor",
  ];

  const differences = [
    {
      title: "Espacios donde los necesitas",
      desc: "Voomp conecta con espacios privados en barrios residenciales, edificios y locales. Encuentras estacionamiento en la cuadra que realmente necesitas, no solo donde existe un gran edificio.",
    },
    {
      title: "Precios fijados por el dueño",
      desc: "No hay intermediarios corporativos. El precio lo decide el anfitrión directamente, lo que suele ser más competitivo que las tarifas fijas de estacionamientos comerciales.",
    },
    {
      title: "Mensualidad sin lista de espera",
      desc: "¿Buscas estacionamiento mensual cerca de la oficina o tu casa? Reserva directamente con el dueño, sin formularios ni listas de espera.",
    },
    {
      title: "Comunidad real, no solo infraestructura",
      desc: "Los anfitriones son personas reales con espacios reales — vecinos, dueños de departamentos, pequeños negocios. No operadores de grandes torres de estacionamiento.",
    },
  ];

  return (
    <div style={{ fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: "#222", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,.07)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
          <ArrowLeft size={16} />
          Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <img src="/logo.png" alt="Voomp" style={{width:30, height:30, borderRadius:8}} />
          <span style={{ fontWeight: 800, fontSize: 18, color: BRAND_COLOR }}>Voomp</span>
        </div>
      </nav>

      {/* Header banner */}
      <section style={{ background: NAVY, padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,56,92,.07)" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>Quiénes somos</span>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", marginTop: 12, marginBottom: 20, letterSpacing: -1, lineHeight: 1.15 }}>
            Construyendo la ciudad de mañana
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,.7)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            Voomp es una plataforma P2P que conecta a conductores con dueños de espacios de estacionamiento en Chile.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {/* Mission */}
          <div style={{ background: SURFACE, borderRadius: 20, padding: "40px 36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND_COLOR}15`, border: `1px solid ${BRAND_COLOR}30`, borderRadius: 100, padding: "4px 14px", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND_COLOR }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 1.5 }}>Misión</span>
            </div>
            <p style={{ fontSize: 17, color: "#374151", lineHeight: 1.75 }}>
              Voomp conecta a quienes necesitan estacionar con quienes tienen un espacio vacío. Creemos que la ciudad funciona mejor cuando sus vecinos se ayudan — y que encontrar estacionamiento nunca debería ser un problema.
            </p>
          </div>
          {/* Vision */}
          <div style={{ background: SURFACE, borderRadius: 20, padding: "40px 36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${SUCCESS_GREEN}15`, border: `1px solid ${SUCCESS_GREEN}30`, borderRadius: 100, padding: "4px 14px", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: SUCCESS_GREEN }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: SUCCESS_GREEN, textTransform: "uppercase", letterSpacing: 1.5 }}>Visión</span>
            </div>
            <p style={{ fontSize: 17, color: "#374151", lineHeight: 1.75 }}>
              Ser la red de estacionamiento más grande de Chile, donde cada garaje vacío es una oportunidad y cada conductor llega tranquilo a su destino. En el largo plazo, Voomp forma parte del día a día de las ciudades latinoamericanas.
            </p>
          </div>
        </div>
      </section>

      {/* Value props — Conductores */}
      <section style={{ background: LIGHT_BLUE, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: SAFETY_BLUE, textTransform: "uppercase", letterSpacing: 2 }}>Para conductores</span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginTop: 10, marginBottom: 20, lineHeight: 1.2 }}>
                Para cuando dar vueltas ya no es opción
              </h2>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 28 }}>
                Reserva un espacio antes de salir. Llega directo, sin estrés ni vueltas en círculos.
              </p>
              <button onClick={() => navigate("/")} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: SAFETY_BLUE, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Explorar espacios →
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {conductorBenefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${SAFETY_BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={13} color={SAFETY_BLUE} strokeWidth={3} />
                  </div>
                  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.55 }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props — Anfitriones */}
      <section style={{ background: "#fff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {hostBenefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${SUCCESS_GREEN}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={13} color={SUCCESS_GREEN} strokeWidth={3} />
                  </div>
                  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.55 }}>{b}</p>
                </div>
              ))}
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: SUCCESS_GREEN, textTransform: "uppercase", letterSpacing: 2 }}>Para anfitriones</span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginTop: 10, marginBottom: 20, lineHeight: 1.2 }}>
                Tu garaje vacío puede generar ingresos
              </h2>
              <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 28 }}>
                Publica tu espacio y decide tú las condiciones. Sin compromisos fijos ni exclusividad.
              </p>
              <button onClick={() => navigate("/")} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: SUCCESS_GREEN, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Publicar mi espacio →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How Voomp is different */}
      <section style={{ background: SURFACE, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>La diferencia</span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: NAVY, marginTop: 12, lineHeight: 1.2 }}>
              ¿Qué nos hace distintos?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {differences.map((d, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", borderTop: `3px solid ${BRAND_COLOR}` }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{d.title}</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", background: BRAND_GRADIENT, borderRadius: 24, padding: "64px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 14, position: "relative" }}>¿Listo para empezar?</h2>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 16, marginBottom: 28, position: "relative" }}>
            Únete a Voomp. Es gratis registrarse.
          </p>
          <button onClick={() => navigate("/")} style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: "#fff", color: BRAND_COLOR, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            Volver al inicio
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F2137", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <img src="/logo.png" alt="Voomp" style={{width:26, height:26, borderRadius:7}} />
          <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>Voomp</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>© 2026 Voomp, Inc. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default ConocenosPage;
