import { ArrowLeft } from "lucide-react";
import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";

const PrivacyPage = ({ onNavigate }) => {
  const sections = [
    {
      title: "1. Información que Recopilamos",
      content: `
- Datos de identidad: Nombre, RUT, email, teléfono
- Datos de ubicación: Dirección, GPS (solo durante activo en app)
- Datos de pago: Cuenta bancaria, transacciones (procesadas por Webpay, no almacenadas)
- Datos de comportamiento: Búsquedas, reservas, calificaciones
      `
    },
    {
      title: "2. Cómo Usamos tus Datos",
      content: `
- Procesar reservas y pagos
- Contactarte por cambios en reservas
- Mejorar el servicio (análisis anónimo de patrones)
- Enviar promociones (puedes optar por no recibirlas)
- Cumplir obligaciones legales
      `
    },
    {
      title: "3. Protección de Datos",
      content: `
- Encriptación SSL en todas las transacciones
- Contraseñas hasheadas con estándares de industria
- Acceso limitado al personal autorizado
- No vendemos datos a terceros
- Cumplimos Ley 19.628 de Protección de Vida Privada (Chile)
      `
    },
    {
      title: "4. Cookies y Rastreo",
      content: `
- Usamos cookies para sesiones y preferencias de usuario
- Google Analytics para estadísticas agregadas (anónimo)
- Puedes desactivar cookies en tu navegador
- No compartimos datos de cookies con terceros
      `
    },
    {
      title: "5. Derechos del Usuario",
      content: `
- Acceso: Puedes solicitar una copia de tus datos
- Corrección: Puedes actualizar información inexacta
- Eliminación: Derecho a ser olvidado (salvo obligaciones legales)
- Portabilidad: Transferir datos a otro servicio
- Solicita en: privacy@voomp.cl
      `
    },
    {
      title: "6. Retención de Datos",
      content: `
- Datos activos: Mientras tengas cuenta activa
- Datos de transacciones: 7 años (requisito tributario)
- Datos de marketing: 2 años si no usas la plataforma
- Puedes pedir eliminación en cualquier momento
      `
    },
    {
      title: "7. Cambios a esta Política",
      content: `
- Podemos actualizar esta política en cualquier momento
- Te notificaremos por email si hay cambios materiales
- Continuar usando Voomp = aceptar cambios
- Revisión recomendada cada 6 meses
      `
    },
    {
      title: "8. Contacto",
      content: `
- Preguntas sobre privacidad: privacy@voomp.cl
- Reclamos: legal@voomp.cl
- Tiempo de respuesta: 10 días hábiles
      `
    },
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header style={{ padding: `${SPACING.lg}px ${SPACING.xl}px`, background: "#f7f7f7", borderBottom: "1px solid #ddd" }}>
        {onNavigate && (
          <button
            onClick={() => onNavigate("landing")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, padding: 0, marginBottom: SPACING.md, fontFamily: "inherit" }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
        )}
        <h1 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.text, marginBottom: SPACING.sm }}>
          Política de Privacidad
        </h1>
        <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>
          Última actualización: 26 de abril de 2026
        </p>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: SPACING.xl }}>
        <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.lg }}>
          <p style={{ fontSize: FONT_SIZE.sm, color: "#1e40af", margin: 0 }}>
            <strong>Tu privacidad es importante.</strong> Esta política explica cómo recopilamos, usamos y protegemos tus datos según la ley chilena.
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
            Última revisión: 26 de abril, 2026 | Próxima revisión programada: abril, 2027
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
