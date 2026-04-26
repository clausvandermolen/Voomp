import { Car, Home, CreditCard, MapPin, Shield, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";

const HowItWorksPage = ({ onNavigate }) => {
  const sections = [
    {
      actor: "Conductores",
      icon: Car,
      color: "#0369a1",
      steps: [
        { num: 1, title: "Busca", desc: "Explora estacionamientos disponibles en tu zona con precios y seguridad en tiempo real." },
        { num: 2, title: "Reserva", desc: "Selecciona fechas y horarios. Confirma con un clic desde la app." },
        { num: 3, title: "Paga", desc: "Transacciones seguras con Webpay. Recibe comprobante digital instantáneamente." },
        { num: 4, title: "Estaciona", desc: "Navega al lugar con GPS integrado. Nuestro seguro cubre daños." },
      ],
      trust: [
        { icon: "🔒", label: "Pasarela Webpay" },
        { icon: "📋", label: "Seguro Incluido" },
        { icon: "⭐", label: "Calificaciones Verificadas" },
      ],
    },
    {
      actor: "Anfitriones",
      icon: Home,
      color: "#65a30d",
      steps: [
        { num: 1, title: "Publica", desc: "Crea tu anuncio con fotos, ubicación exacta y precios por hora/día/mes." },
        { num: 2, title: "Verifica", desc: "Validamos tu identidad y tu propiedad para máxima confianza." },
        { num: 3, title: "Administra", desc: "Panel dinámico: bloquea fechas, ajusta precios, ve reservas en calendario." },
        { num: 4, title: "Gana", desc: "Recibe pagos directos a tu cuenta. Sin comisiones por 6 meses (promoción)." },
      ],
      trust: [
        { icon: "✅", label: "Verificación KYC" },
        { icon: "💰", label: "Cero Comisiones x6 meses" },
        { icon: "🛡️", label: "Póliza Daños" },
      ],
    },
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header style={{ padding: `${SPACING.lg}px ${SPACING.xl}px`, background: BRAND_GRADIENT, color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.extrabold, marginBottom: SPACING.md }}>
          Cómo Funciona Voomp
        </h1>
        <p style={{ fontSize: FONT_SIZE.lg, opacity: 0.9, maxWidth: 600, margin: "0 auto" }}>
          Conecta tu espacio con quien lo necesita. Simple, seguro, directo.
        </p>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: SPACING.xl }}>
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} style={{ marginBottom: `${SPACING.xl * 3}px` }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.lg }}>
                <Icon size={32} color={section.color} />
                <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>
                  {section.actor}
                </h2>
              </div>

              {/* Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: SPACING.lg, marginBottom: SPACING.lg }}>
                {section.steps.map((step) => (
                  <div key={step.num} style={{ borderLeft: `4px solid ${section.color}`, paddingLeft: SPACING.md }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: SPACING.sm, marginBottom: SPACING.sm }}>
                      <span style={{ fontSize: 24, fontWeight: FONT_WEIGHT.extrabold, color: section.color }}>
                        {step.num}
                      </span>
                      <h3 style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>
                        {step.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: FONT_SIZE.md, color: COLORS.muted, lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust Elements */}
              <div style={{ background: "#f7f7f7", padding: SPACING.lg, borderRadius: 12, marginTop: SPACING.lg }}>
                <h4 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md, color: COLORS.text }}>
                  Elementos de Confianza
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: SPACING.md }}>
                  {section.trust.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: SPACING.sm, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.text }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div style={{ background: BRAND_GRADIENT, color: "#fff", padding: `${SPACING.xl * 2}px ${SPACING.xl}px`, textAlign: "center" }}>
        <h3 style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md }}>
          ¿Listo para comenzar?
        </h3>
        <div style={{ display: "flex", gap: SPACING.md, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("register")} style={{ padding: `${SPACING.sm}px ${SPACING.lg}px`, background: "#fff", color: BRAND_COLOR, border: "none", borderRadius: 8, fontWeight: FONT_WEIGHT.bold, cursor: "pointer" }}>
            Registrarse
          </button>
          <button onClick={() => onNavigate("explorar")} style={{ padding: `${SPACING.sm}px ${SPACING.lg}px`, background: "transparent", color: "#fff", border: "2px solid #fff", borderRadius: 8, fontWeight: FONT_WEIGHT.bold, cursor: "pointer" }}>
            Explorar Espacios
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
