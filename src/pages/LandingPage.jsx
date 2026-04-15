import { useState, useEffect } from "react";
import { MapPin, Star, Shield, Zap, Car, ChevronRight, DollarSign } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT, DARK_BG } from "../constants";
import { Avatar } from "../components/ui";

const LandingPage = ({ onEnter, onRegister, onLogin }) => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon: <Shield size={28} />, title: "Reserva segura", desc: "Cada reserva cuenta con verificación del anfitrión y del conductor para mayor tranquilidad." },
    { icon: <MapPin size={28} />, title: "Encuentra cerca de ti", desc: "Miles de espacios verificados en tu ciudad. Desde garajes privados hasta estacionamientos ejecutivos." },
    { icon: <Zap size={28} />, title: "Carga eléctrica", desc: "Filtra espacios con cargadores EV. Compatible con Tesla, CCS y Tipo 2 para tu vehículo eléctrico." },
    { icon: <DollarSign size={28} />, title: "Gana con tu espacio", desc: "¿Tienes un estacionamiento vacío? Publícalo y genera ingresos pasivos todos los meses." },
  ];

  const steps = [
    { num: "01", title: "Busca tu zona", desc: "Ingresa tu ubicación o explora el mapa interactivo para encontrar espacios cerca de donde los necesitas." },
    { num: "02", title: "Compara y elige", desc: "Filtra por precio, tipo de vehículo, seguridad y amenidades. Lee reseñas de otros conductores." },
    { num: "03", title: "Reserva al instante", desc: "Paga de forma segura y recibe las instrucciones de acceso. ¡Tu espacio te espera!" },
  ];

  return (
    <div style={{ fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: "#222", background: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrollY > 50 ? "rgba(255,255,255,.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(12px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(0,0,0,.06)" : "none", transition: "all .3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: scrollY > 50 ? BRAND_COLOR : "#fff", transition: "color .3s" }}>Voomp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onLogin} style={{ padding: "10px 20px", borderRadius: 24, border: scrollY > 50 ? "1px solid #ddd" : "1px solid rgba(255,255,255,.4)", background: "transparent", color: scrollY > 50 ? "#222" : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .3s" }}>Iniciar sesión</button>
          <button onClick={onRegister} style={{ padding: "10px 20px", borderRadius: 24, border: "none", background: BRAND_GRADIENT, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Registrarse</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + scrollY * 0.0003})`, transition: "transform .1s" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 50%, rgba(0,0,0,.7) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 780, padding: "0 24px", animation: "fadeUp .8s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", backdropFilter: "blur(12px)", borderRadius: 30, padding: "8px 20px", marginBottom: 28, border: "1px solid rgba(255,255,255,.2)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>+2,500 espacios disponibles en Santiago</span>
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            Tu lugar para estacionar,{" "}
            <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>siempre seguro</span>
          </h1>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,.85)", lineHeight: 1.6, marginBottom: 36, maxWidth: 580, margin: "0 auto 36px" }}>
            Voomp conecta conductores con espacios de estacionamiento verificados. Reserva en segundos, estaciona con tranquilidad.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <button onClick={onEnter} style={{ padding: "16px 36px", borderRadius: 12, border: "none", background: BRAND_GRADIENT, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 30px rgba(255,56,92,.4)", transition: "transform .2s, box-shadow .2s" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(255,56,92,.5)"; }} onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 30px rgba(255,56,92,.4)"; }}>
              Explorar espacios
            </button>
            <button onClick={onEnter} style={{ padding: "16px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }} onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,.2)"; }} onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,.1)"; }}>
              Publica tu espacio
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", animation: "float 2s ease-in-out infinite" }}>
          <ChevronRight size={24} color="rgba(255,255,255,.6)" style={{ transform: "rotate(90deg)" }} />
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>¿Por qué Voomp?</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Estacionar nunca fue tan fácil</h2>
          <p style={{ color: "#555", fontSize: 17, marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>La plataforma que transforma cómo encontramos y ofrecemos estacionamiento en la ciudad.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 20, border: "1px solid #eee", transition: "all .3s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,56,92,.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${BRAND_COLOR}10`, display: "flex", alignItems: "center", justifyContent: "center", color: BRAND_COLOR, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ background: "#fafafa", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>Cómo funciona</span>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Tres pasos y listo</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 800, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>{s.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: DARK_BG, padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { value: "2,500+", label: "Espacios activos" },
            { value: "12,000+", label: "Conductores felices" },
            { value: "4.89", label: "Calificación promedio" },
            { value: "$0", label: "Comisión para conductores" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: 15 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>Testimonios</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Lo que dicen nuestros usuarios</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { name: "Andrés M.", role: "Conductor", text: "Antes perdía 20 minutos buscando dónde estacionar. Con Voomp llego directo a mi lugar reservado. ¡Increíble!", avatar: "https://i.pravatar.cc/100?img=33", rating: 5 },
            { name: "María G.", role: "Anfitriona", text: "Publiqué mi garaje vacío y ahora genero $55.000 al mes sin esfuerzo. La plataforma es super fácil de usar.", avatar: "https://i.pravatar.cc/100?img=1", rating: 5 },
            { name: "Carlos R.", role: "Conductor", text: "Lo uso cada vez que viajo al aeropuerto. Mucho más barato que los estacionamientos oficiales y con seguro incluido.", avatar: "https://i.pravatar.cc/100?img=3", rating: 5 },
          ].map((t, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 20, border: "1px solid #eee", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 4 }}>{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} fill="#f5a623" stroke="none" />)}</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#444", flex: 1 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                <Avatar src={t.avatar} name={t.name} size={40} />
                <div><div style={{ fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 13, color: "#555" }}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", background: BRAND_GRADIENT, borderRadius: 28, padding: "72px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16, position: "relative" }}>¿Listo para estacionar mejor?</h2>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 17, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", position: "relative" }}>Únete a miles de conductores y anfitriones que ya hacen parte de Voomp.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, position: "relative" }}>
            <button onClick={onEnter} style={{ padding: "16px 36px", borderRadius: 12, border: "none", background: "#fff", color: BRAND_COLOR, fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "transform .2s" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              Crear cuenta gratis
            </button>
            <button onClick={onEnter} style={{ padding: "16px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
              Explorar sin cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{ borderTop: "1px solid #eee", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={14} color="#fff" /></div>
            <span style={{ fontWeight: 800, fontSize: 18, color: BRAND_COLOR }}>Voomp</span>
          </div>
          <div style={{ color: "#555", fontSize: 13 }}>© 2026 Voomp, Inc. · Privacidad · Términos · Contacto</div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 14 }}>🌐 Español (CL)</span>
            <span style={{ fontSize: 14 }}>$ CLP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
