const Footer = () => (
  <footer style={{ borderTop: "1px solid #eee", marginTop: 60 }}>
    <div style={{ maxWidth: 1760, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, marginBottom: 32 }}>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Voomp</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Centro de ayuda", "Anti-discriminación", "Opciones de accesibilidad"].map(l => (
              <a key={l} href="#" style={{ color: "#555", textDecoration: "none", fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Comunidad</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Blog", "Foro de la comunidad", "Referir anfitriones", "Programa de afiliados"].map(l => (
              <a key={l} href="#" style={{ color: "#555", textDecoration: "none", fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Anfitriones</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Publica tu espacio", "Recursos para anfitriones", "Foro de anfitriones", "Anfitrión responsable"].map(l => (
              <a key={l} href="#" style={{ color: "#555", textDecoration: "none", fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Empresa</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Noticias", "Carreras", "Inversionistas", "Confianza y seguridad"].map(l => (
              <a key={l} href="#" style={{ color: "#555", textDecoration: "none", fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #eee", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#555", fontSize: 13 }}>© 2026 Voomp, Inc. · Privacidad · Términos · Mapa del sitio</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14 }}>🌐 Español (CL)</span>
          <span style={{ fontSize: 14 }}>$ CLP</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
