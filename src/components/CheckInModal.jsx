import { QRCodeSVG } from "qrcode.react";
import { formatCLP } from "../utils/format";
import { BRAND_COLOR } from "../constants";
import { useLang } from "../contexts/LangContext";

export default function CheckInModal({ booking, type, onClose }) {
  const { t } = useLang();
  if (!booking) return null;
  const qrData = JSON.stringify({
    ref: booking.bookingRef,
    listing: booking.listingTitle,
    conductor: booking.conductorName,
    [type === "checkin" ? "checkedIn" : "checkedOut"]: new Date().toISOString(),
  });

  return (
    <div style={{ textAlign: "center", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
        {type === "checkin" ? t("checkin.checkinTitle") : t("checkin.checkoutTitle")}
      </h2>
      <div style={{ margin: "24px auto", display: "flex", justifyContent: "center" }}>
        <QRCodeSVG value={qrData} size={200} />
      </div>
      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 16, textAlign: "left", marginTop: 16 }}>
        {booking.bookingRef && <p style={{ margin: "4px 0" }}><strong>{t("checkin.ref")}</strong> {booking.bookingRef}</p>}
        <p style={{ margin: "4px 0" }}><strong>{t("checkin.space")}</strong> {booking.listingTitle}</p>
        {booking.conductorName && <p style={{ margin: "4px 0" }}><strong>{t("checkin.driver")}</strong> {booking.conductorName}</p>}
        {(booking.startTime || booking.endTime) && (
          <p style={{ margin: "4px 0" }}><strong>{t("checkin.schedule")}</strong> {booking.startTime || "—"} — {booking.endTime || "—"}</p>
        )}
        {booking.total != null && <p style={{ margin: "4px 0" }}><strong>{t("checkin.total")}</strong> {formatCLP(booking.total)}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 24, padding: "12px 32px", borderRadius: 8,
          background: BRAND_COLOR, color: "#fff", border: "none",
          fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {t("checkin.close")}
      </button>
    </div>
  );
}
