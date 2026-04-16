import { useState, useEffect } from "react";
import { MapPin, Shield, Zap, Car, ChevronRight, DollarSign, X } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT, DARK_BG } from "../constants";
import { supabase } from "../lib/supabase";
import MapView from "../components/MapView";

const LandingPage = ({ onEnter, onRegister, onLogin }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [showMap, setShowMap] = useState(false);
  const [mapListings, setMapListings] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", r);
    return () => {
      window.removeEventListener("scroll", h);
      window.removeEventListener("resize", r);
    };
  }, []);

  const openMapModal = async () => {
    setShowMap(true);
    const { data } = await supabase
      .from("listings")
      .select("id, title, price, lat, lng")
      .not("lat", "is", null)
      .not("lng", "is", null);
    setMapListings(data || []);
  };

  const features = [
    { icon: <Shield size={28} />, title: "Reserva segura", desc: "Cada reserva cuenta con verificación del anfitrión y del conductor para mayor tranquilidad." },
    { icon: <MapPin size={28} />, title: "Encuentra cerca de ti", desc: "Espacios verificados en tu ciudad. Desde garajes privados hasta estacionamientos ejecutivos." },
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

      {/* Welcome popup */}
      {showWelcome && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowWelcome(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 20, width: isMobile ? "90vw" : "min(460px, 90vw)", padding: isMobile ? "36px 24px" : "44px 36px", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.3)", animation: "fadeUp .5s ease-out" }}>
            <button onClick={() => setShowWelcome(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color="#999" /></button>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: BRAND_GRADIENT, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Car size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>My Voomp</span> sigue en desarrollo
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Estamos construyendo algo grande. Vamos a revolucionar la forma en que nos movemos en el mundo. Mantente atento a las novedades.
            </p>
            <a href="https://www.instagram.com/my_voomp?igsh=ZGtoM3JjeW43NjU=" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 24px" : "14px 28px", borderRadius: 12, background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)", color: "#fff", fontSize: isMobile ? 14 : 15, fontWeight: 700, textDecoration: "none", transition: "transform .2s, box-shadow .2s", boxShadow: "0 6px 20px rgba(225,48,108,.35)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(225,48,108,.45)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(225,48,108,.35)"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              @My_Voomp
            </a>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 16 }}>Haz clic en cualquier lugar para cerrar</p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: isMobile ? "12px 16px" : "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrollY > 50 ? "rgba(255,255,255,.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(12px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(0,0,0,.06)" : "none", transition: "all .3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, background: BRAND_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={isMobile ? 18 : 20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: isMobile ? 19 : 22, color: scrollY > 50 ? BRAND_COLOR : "#fff", transition: "color .3s" }}>Voomp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <button onClick={onLogin} style={{ padding: isMobile ? "8px 12px" : "10px 20px", borderRadius: 24, border: scrollY > 50 ? "1px solid #ddd" : "1px solid rgba(255,255,255,.4)", background: "transparent", color: scrollY > 50 ? "#222" : "#fff", fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .3s", whiteSpace: "nowrap" }}>{isMobile ? "Entrar" : "Iniciar sesión"}</button>
          <button onClick={onRegister} style={{ padding: isMobile ? "8px 14px" : "10px 20px", borderRadius: 24, border: "none", background: BRAND_GRADIENT, color: "#fff", fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Registrarse</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + scrollY * 0.0003})`, transition: "transform .1s" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 50%, rgba(0,0,0,.7) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 780, padding: isMobile ? "0 20px" : "0 24px", animation: "fadeUp .8s ease-out", width: "100%" }}>
          <h1 style={{ fontSize: isMobile ? 34 : 56, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: isMobile ? 14 : 20, letterSpacing: isMobile ? -0.5 : -1 }}>
            Tu lugar para estacionar,{" "}
            <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>siempre seguro</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 20, color: "rgba(255,255,255,.85)", lineHeight: 1.6, marginBottom: isMobile ? 24 : 36, maxWidth: 580, margin: isMobile ? "0 auto 24px" : "0 auto 36px" }}>
            Voomp conecta conductores con espacios de estacionamiento verificados. Reserva en segundos, estaciona con tranquilidad.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 10 : 16, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={openMapModal} style={{ padding: isMobile ? "14px 24px" : "16px 36px", borderRadius: 12, border: "none", background: BRAND_GRADIENT, color: "#fff", fontSize: isMobile ? 16 : 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 30px rgba(255,56,92,.4)", transition: "transform .2s, box-shadow .2s", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 320 : "none" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(255,56,92,.5)"; }} onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 30px rgba(255,56,92,.4)"; }}>
              Explorar espacios
            </button>
            <button onClick={onRegister} style={{ padding: isMobile ? "14px 24px" : "16px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)", color: "#fff", fontSize: isMobile ? 16 : 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 320 : "none" }} onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,.2)"; }} onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,.1)"; }}>
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
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "60px 20px" : "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>¿Por qué Voomp?</span>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Estacionar nunca fue tan fácil</h2>
          <p style={{ color: "#555", fontSize: isMobile ? 15 : 17, marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>La plataforma que transforma cómo encontramos y ofrecemos estacionamiento en la ciudad.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: isMobile ? 16 : 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: isMobile ? 24 : 32, borderRadius: 20, border: "1px solid #eee", transition: "all .3s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,56,92,.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: 16, background: `${BRAND_COLOR}10`, display: "flex", alignItems: "center", justifyContent: "center", color: BRAND_COLOR, marginBottom: isMobile ? 14 : 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: isMobile ? 17 : 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#555", fontSize: isMobile ? 14 : 15, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ background: "#fafafa", padding: isMobile ? "60px 20px" : "100px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
            <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 2 }}>Cómo funciona</span>
            <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Tres pasos y listo</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? 28 : 40 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? 40 : 52, fontWeight: 800, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: isMobile ? 10 : 16 }}>{s.num}</div>
                <h3 style={{ fontSize: isMobile ? 19 : 22, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#555", fontSize: isMobile ? 14 : 15, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Modal */}
      {showMap && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowMap(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 16, width: isMobile ? "95vw" : "min(90vw, 1000px)", height: isMobile ? "85vh" : "75vh", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.3)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #eee" }}>
              <button onClick={() => setShowMap(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Espacios disponibles</span>
              <div style={{ width: 28 }} />
            </div>
            <div style={{ flex: 1 }}>
              <MapView
                listings={mapListings}
                onSelect={() => { setShowMap(false); onRegister(); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", background: BRAND_GRADIENT, borderRadius: isMobile ? 20 : 28, padding: isMobile ? "48px 24px" : "72px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, color: "#fff", marginBottom: isMobile ? 12 : 16, position: "relative" }}>¿Listo para estacionar mejor?</h2>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 24 : 32, maxWidth: 480, margin: isMobile ? "0 auto 24px" : "0 auto 32px", position: "relative" }}>Únete a la comunidad de conductores y anfitriones de Voomp.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 10 : 16, position: "relative", flexDirection: isMobile ? "column" : "row", alignItems: "center" }}>
            <button onClick={onRegister} style={{ padding: isMobile ? "14px 24px" : "16px 36px", borderRadius: 12, border: "none", background: "#fff", color: BRAND_COLOR, fontSize: isMobile ? 16 : 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "transform .2s", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 320 : "none" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              Crear cuenta gratis
            </button>
            <button onClick={openMapModal} style={{ padding: isMobile ? "14px 24px" : "16px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: "#fff", fontSize: isMobile ? 16 : 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 320 : "none" }}>
              Explorar espacios
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={{ borderTop: "1px solid #eee", padding: isMobile ? "28px 20px" : "40px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: isMobile ? 12 : 16, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={14} color="#fff" /></div>
            <span style={{ fontWeight: 800, fontSize: 18, color: BRAND_COLOR }}>Voomp</span>
          </div>
          <div style={{ color: "#555", fontSize: isMobile ? 12 : 13 }}>© 2026 Voomp, Inc. · Privacidad · Términos · Contacto</div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: isMobile ? 13 : 14 }}>🌐 Español (CL)</span>
            <span style={{ fontSize: isMobile ? 13 : 14 }}>$ CLP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
