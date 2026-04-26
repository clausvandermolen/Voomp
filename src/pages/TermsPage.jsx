import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";

const TermsPage = ({ onNavigate }) => {
  const sections = [
    {
      title: "1. Definiciones",
      content: `
- "Plataforma": Voomp.cl, aplicación web/mobile y servicios asociados
- "Anfitrión": Propietario que publica espacios de estacionamiento
- "Conductor": Usuario que busca y reserva espacios
- "Espacio": Estacionamiento, garaje, o área de parqueo publicada
- "Reserva": Acuerdo de alquiler temporal del Espacio
      `
    },
    {
      title: "2. Responsabilidades del Anfitrión",
      content: `
- Garantiza que posee o tiene autorización para usar la propiedad
- Mantiene el espacio en condiciones seguras y operativas
- Responde por daños a vehículos causados por negligencia propia
- Cumple normativas legales y regulaciones municipales
- No discrimina conductores por raza, género u origen
      `
    },
    {
      title: "3. Responsabilidades del Conductor",
      content: `
- Paga el monto acordado dentro del plazo establecido
- Utiliza el espacio según instrucciones del anfitrión
- Responde por daños causados por mal uso o negligencia propia
- No subloca el espacio a terceros sin autorización
- Mantiene válida su licencia de conducir
      `
    },
    {
      title: "4. Cobertura de Seguros",
      content: `
- Daños a terceros: Cobertura obligatoria por responsabilidad civil
- Daños al vehículo: Según póliza adicional contratada
- Daños a la propiedad: Anfitrión asume responsabilidad por negligencia
- Robos: Fuera del alcance de cobertura Voomp. Recomendamos seguro vehícular
      `
    },
    {
      title: "5. Política de Cancelación",
      content: `
- Conductor cancela 24h antes: Reembolso del 100%
- Conductor cancela 12-24h antes: Reembolso del 50%
- Conductor cancela menos de 12h: Sin reembolso
- Anfitrión cancela: Reembolso completo al conductor + $5.000 crédito
      `
    },
    {
      title: "6. Privacidad y Datos",
      content: `
- Recopilamos datos según Ley 19.628 de Protección de Vida Privada
- No vendemos datos a terceros
- Datos de pago procesados por Webpay bajo encriptación SSL
- Usuarios pueden solicitar acceso/corrección de datos en cualquier momento
      `
    },
    {
      title: "7. Limitación de Responsabilidad",
      content: `
- Voomp no es responsable por actos u omisiones de usuarios
- No garantizamos la disponibilidad continua del servicio
- Cambios a estos términos: 30 días de notificación previa
- Pueden terminar esta relación en cualquier momento
      `
    },
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header style={{ padding: `${SPACING.lg}px ${SPACING.xl}px`, background: "#f7f7f7", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.text, marginBottom: SPACING.sm }}>
          Términos y Condiciones
        </h1>
        <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>
          Última actualización: 26 de abril de 2026
        </p>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: SPACING.xl }}>
        <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.lg }}>
          <p style={{ fontSize: FONT_SIZE.sm, color: "#92400e", margin: 0 }}>
            <strong>Importante:</strong> Al usar Voomp, aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.
          </p>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: SPACING.lg }}>
            <h2 style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text, marginBottom: SPACING.sm }}>
              {section.title}
            </h2>
            <p style={{ fontSize: FONT_SIZE.md, color: COLORS.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {section.content.trim()}
            </p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #ddd", paddingTop: SPACING.lg, marginTop: SPACING.lg * 2 }}>
          <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>
            Para preguntas sobre estos términos, contacta a <strong>legal@voomp.cl</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
