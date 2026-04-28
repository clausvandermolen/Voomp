import { useState } from "react";
import { AlertCircle, Camera, Info } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";
import { formatCLP } from "../utils/format";
import { Btn, Pill, StarRating } from "./ui";

/* ─── Style constants ─── */
const cardBoxStyle = {
  display: "flex",
  gap: SPACING.md,
  padding: SPACING.md,
  background: COLORS.bg,
  borderRadius: RADIUS.lg,
  marginBottom: SPACING.xl,
};

const sectionRowStyle = {
  padding: `${SPACING.sm}px 0`,
  borderBottom: "1px solid #eee",
};

const mutedTextStyle = {
  fontSize: FONT_SIZE.md,
  color: COLORS.muted,
};

const smallMutedStyle = {
  fontSize: FONT_SIZE.base,
  color: COLORS.muted,
};

const summaryBoxStyle = {
  background: COLORS.bg,
  borderRadius: RADIUS.lg,
  padding: SPACING.md,
  marginBottom: SPACING.xl,
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: SPACING.xs,
};

const errorBoxStyle = {
  padding: SPACING.sm,
  background: COLORS.danger,
  color: "#fff",
  borderRadius: RADIUS.md,
  fontSize: FONT_SIZE.base,
  fontWeight: FONT_WEIGHT.semibold,
  marginBottom: SPACING.md,
};

const warningBoxStyle = {
  padding: SPACING.md,
  background: "#fffbeb",
  borderRadius: RADIUS.lg,
  border: "1px solid #f59e0b33",
  marginBottom: SPACING.xl,
};

const debtNoticeStyle = {
  padding: SPACING.sm,
  background: "#fef2f2",
  borderRadius: RADIUS.md,
  marginBottom: SPACING.md,
  fontSize: FONT_SIZE.base,
  border: "1px solid #fca5a5",
};

const billingOption = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: SPACING.sm,
  padding: 14,
  borderRadius: RADIUS.lg,
  border: active ? `2px solid ${BRAND_COLOR}` : "2px solid #eee",
  cursor: "pointer",
  background: active ? "#fff5f7" : "#fff",
  transition: "all .15s",
});

/* ─── Booking Confirmation ─── */
const BookingConfirmation = ({ listing, user, selectedModality, availableModalities, bookingHours, bookingDate, bookingEndDate, monthlyStartDate, monthlyEndMonth, vehicleInfo, onBooking, onClose, onUpdateUser }) => {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const userDebt = Number(user?.credit) || 0;
  const [payMethod, setPayMethod] = useState("mercadopago");
  const [billingChoice, setBillingChoice] = useState("installment");

  const MP_LINK = "https://link.mercadopago.cl/myvoomp";

  const mod = availableModalities.find(m => m.id === selectedModality) || availableModalities[0] || { price: listing.price, id: listing.priceUnit };
  const modPrice = mod.price;
  const modUnit = mod.id;

  const calcHours = () => {
    if (!bookingHours || !bookingDate) return 1;
    const endD = bookingEndDate || bookingDate;
    const sDate = new Date(`${bookingDate}T${bookingHours.startH}:${bookingHours.startM}:00`);
    const eDate = new Date(`${endD}T${bookingHours.endH}:${bookingHours.endM}:00`);
    const mins = (eDate - sDate) / 60000;
    return mins > 0 ? mins / 60 : 1;
  };

  const calcDays = () => {
    if (!bookingDate) return 1;
    if (!bookingEndDate || bookingEndDate === bookingDate) return 1;
    const start = new Date(bookingDate + "T00:00:00");
    const end = new Date(bookingEndDate + "T00:00:00");
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const calcMonthly = () => {
    if (!monthlyStartDate) return { prorrateDays: 0, daysInMonth: 30, fullMonths: 0, totalAmount: modPrice, prorateAmount: 0, monthlyPrice: modPrice };
    const start = new Date(monthlyStartDate + "T00:00:00");
    const startDay = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
    const remainingDays = daysInMonth - startDay + 1;
    const prorateAmount = Math.round((modPrice / daysInMonth) * remainingDays);

    if (!monthlyEndMonth) {
      return { prorrateDays: remainingDays, daysInMonth, fullMonths: 0, totalAmount: prorateAmount, prorateAmount, monthlyPrice: modPrice };
    }
    const [endY, endM] = monthlyEndMonth.split("-").map(Number);
    let fullMonths = 0;
    let cM = startMonth + 1, cY = startYear;
    if (cM > 11) { cM = 0; cY++; }
    while (cY < endY || (cY === endY && cM <= endM - 1)) {
      fullMonths++;
      cM++;
      if (cM > 11) { cM = 0; cY++; }
    }
    const totalAmount = prorateAmount + (fullMonths * modPrice);
    return { prorrateDays: remainingDays, daysInMonth, fullMonths, totalAmount, prorateAmount, monthlyPrice: modPrice };
  };

  let subtotal = modPrice;
  let qtyLabel = `${formatCLP(modPrice)} × 1 ${modUnit}`;
  let monthlyInfo = null;

  if (modUnit === "hora") {
    const hrs = calcHours();
    subtotal = Math.round(hrs * modPrice);
    qtyLabel = `${formatCLP(modPrice)} × ${hrs.toLocaleString("es-CL", { maximumFractionDigits: 1 })} hora${hrs !== 1 ? "s" : ""}`;
  } else if (modUnit === "mes") {
    const mb = calcMonthly();
    subtotal = mb.totalAmount;
    monthlyInfo = mb;
    if (mb.fullMonths > 0) {
      qtyLabel = `Prorrateo ${mb.prorrateDays}d + ${mb.fullMonths} mes${mb.fullMonths > 1 ? "es" : ""}`;
    } else if (mb.prorrateDays > 0 && mb.prorrateDays < mb.daysInMonth) {
      qtyLabel = `Prorrateo ${mb.prorrateDays} de ${mb.daysInMonth} días`;
    } else {
      qtyLabel = `${formatCLP(modPrice)} × 1 mes`;
    }
  } else if (modUnit === "día") {
    const days = calcDays();
    subtotal = Math.round(days * modPrice);
    qtyLabel = `${formatCLP(modPrice)} × ${days} día${days !== 1 ? "s" : ""}`;
  }

  const serviceFee = Math.round(subtotal * 0.05);
  const total = payMethod === "efectivo"
    ? subtotal
    : subtotal + serviceFee + userDebt;

  const canChooseBilling = modUnit === "mes" && monthlyInfo && monthlyInfo.fullMonths > 0;
  const isMonthlyInstallment = canChooseBilling && billingChoice === "installment";
  const firstPayment = isMonthlyInstallment ? (monthlyInfo.prorateAmount + Math.round(monthlyInfo.prorateAmount * 0.05)) : null;
  const monthlyInstallment = isMonthlyInstallment ? (monthlyInfo.monthlyPrice + Math.round(monthlyInfo.monthlyPrice * 0.05)) : null;

  const handleConfirmPay = async () => {
    if (!user) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }
    setError("");
    setProcessing(true);

    const bookingData = {
      listing_id: listing.id,
      listing_title: listing.title,
      photo_url: (listing.photos || [])[0] || null,
      conductor_id: user.id,
      conductor_name: `${user.firstName || ""} ${user.lastName1 || ""} ${user.lastName2 || ""}`.trim(),
      host_id: listing.host?.userId,
      host_name: listing.host?.name || "Anfitrión",
      vehicle_name: vehicleInfo?.name || null,
      vehicle_plate: vehicleInfo?.plate || null,
      price: modPrice,
      price_unit: modUnit,
      total: subtotal,
      status: "pending",
      pay_method: payMethod,
      date: new Date().toISOString().split("T")[0],
      ...(modUnit === "hora" ? {
        start_date: bookingDate || null,
        end_date: bookingEndDate || bookingDate || null,
        start_time: `${bookingHours.startH}:${bookingHours.startM}`,
        end_time: `${bookingHours.endH}:${bookingHours.endM}`,
      } : {}),
      ...(modUnit === "día" ? {
        start_date: bookingDate || null,
        end_date: bookingEndDate || bookingDate || null,
        start_time: `Llegada estimada: ${bookingHours.arrivalH}:${bookingHours.arrivalM}`,
      } : {}),
      ...(modUnit === "mes" ? {
        monthly_start_date: monthlyStartDate || null,
        prorate_amount: monthlyInfo?.prorateAmount || 0,
        full_months: monthlyInfo?.fullMonths || 0,
        monthly_installment: monthlyInfo?.monthlyPrice || 0,
        billing_schedule: isMonthlyInstallment ? "monthly" : "one-time",
      } : {})
    };

    try {
      if (onBooking) {
        await onBooking(bookingData);
      }
      if (payMethod === "mercadopago") {
        const mpAmount = isMonthlyInstallment ? (firstPayment + userDebt) : total;
        try { await navigator.clipboard.writeText(String(mpAmount)); } catch {}
        window.open(MP_LINK, "_blank", "noopener,noreferrer");
      }
      setProcessing(false);
      setStep(2);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setError(err?.message || "Error al procesar el pago. Inténtalo de nuevo.");
    }
  };

  if (step === 2) {
    return (
      <div style={{ textAlign: "center", padding: `${SPACING.xl + 16}px 0` }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fef7f0", display: "flex", alignItems: "center", justifyContent: "center", margin: `0 auto ${SPACING.xl}px` }}>
          <AlertCircle size={40} color="#c76d00" />
        </div>
        <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.xs }}>Solicitud enviada</h2>
        <p style={{ color: COLORS.muted, fontSize: FONT_SIZE.lg, marginBottom: SPACING.xl }}>Tu solicitud de reserva fue enviada al anfitrión. Recibirás una notificación cuando sea aprobada o rechazada.</p>
        <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.lg, textAlign: "left", marginBottom: SPACING.xl }}>
          <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.xs }}>{listing.title}</div>
          <div style={mutedTextStyle}>Modalidad: {modUnit === "hora" ? "Por hora" : modUnit === "día" ? "Por día" : "Por mes"}</div>
          {modUnit === "hora" && bookingHours && (
            <div style={mutedTextStyle}>Horario: {bookingHours.startH}:{bookingHours.startM} ({bookingDate?.split("-").reverse().join("/")}) — {bookingHours.endH}:{bookingHours.endM} ({(bookingEndDate || bookingDate)?.split("-").reverse().join("/")}) ({calcHours().toLocaleString("es-CL", { maximumFractionDigits: 1 })}h)</div>
          )}
          {modUnit === "día" && bookingDate && (
             <div style={mutedTextStyle}>Estadía: {bookingDate.split("-").reverse().join("/")} — {(bookingEndDate || bookingDate).split("-").reverse().join("/")} | Llegada est: {bookingHours.arrivalH}:{bookingHours.arrivalM}</div>
          )}
          {modUnit === "mes" && isMonthlyInstallment && (
            <>
              <div style={mutedTextStyle}>Primer cobro (prorrateo): {formatCLP(firstPayment)}</div>
              <div style={mutedTextStyle}>Cuota mensual: {formatCLP(monthlyInstallment)} × {monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""}</div>
            </>
          )}
          {vehicleInfo?.name && <div style={mutedTextStyle}>Vehículo: {vehicleInfo.name}{vehicleInfo.plate ? ` · Patente: ${vehicleInfo.plate}` : ""}</div>}
          <div style={mutedTextStyle}>Pago: {payMethod === "efectivo" ? "Efectivo" : "Mercado Pago"}</div>
          <div style={mutedTextStyle}>Acceso: {listing.access}</div>
          <div style={mutedTextStyle}>Total: {formatCLP(subtotal + serviceFee)}</div>
          {payMethod === "efectivo" && <div style={{ fontSize: FONT_SIZE.base, color: "#b45309", marginTop: SPACING.xs, fontWeight: FONT_WEIGHT.semibold }}>Comisión pendiente — se descontará en tu próximo pago con tarjeta.</div>}
          {isMonthlyInstallment && (
            <div style={{ fontSize: FONT_SIZE.base, color: COLORS.muted, marginTop: SPACING.xs, padding: SPACING.sm, background: "#e8f5e8", borderRadius: RADIUS.md }}>
              El cobro se realizará mensualmente. En caso de impago, el anfitrión podrá cancelar la reserva.
            </div>
          )}
        </div>
        <Btn primary onClick={() => { if (onClose) onClose(); }}>Volver al inicio</Btn>
      </div>
    );
  }

  return (
    <div>
      {step === 0 && (
        <div>
          <div style={cardBoxStyle}>
            {(listing.photos || [])[0]
              ? <img src={listing.photos[0]} alt="" style={{ width: 100, height: 80, objectFit: "cover", borderRadius: RADIUS.md }} />
              : <div style={{ width: 100, height: 80, borderRadius: RADIUS.md, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={24} color="#bbb" /></div>}
            <div>
              <div style={{ fontWeight: FONT_WEIGHT.semibold }}>{listing.title}</div>
              <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md }}>{listing.location}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <StarRating rating={listing.rating} />
                <span style={{ color: COLORS.muted, fontSize: FONT_SIZE.base }}>({listing.reviewsList?.length ?? listing.reviews_count ?? 0})</span>
              </div>
            </div>
          </div>
          <h3 style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.xl, marginBottom: SPACING.md }}>Tu reserva</h3>

          <div style={sectionRowStyle}>
            <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: 4 }}>Modalidad</div>
            <div style={mutedTextStyle}>{mod.label} — {formatCLP(mod.price)}/{modUnit}</div>
          </div>

          {modUnit === "hora" && bookingHours && (
            <div style={sectionRowStyle}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold }}>Rango horario</div>
              <div style={mutedTextStyle}>{bookingHours.startH}:{bookingHours.startM} — {bookingHours.endH}:{bookingHours.endM} ({calcHours().toLocaleString("es-CL", { maximumFractionDigits: 1 })} hora{calcHours() !== 1 ? "s" : ""})</div>
              {bookingDate && <div style={smallMutedStyle}>Fecha entrada: {new Date(bookingDate + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</div>}
              {bookingEndDate && <div style={smallMutedStyle}>Fecha salida: {new Date(bookingEndDate + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</div>}
            </div>
          )}

          {modUnit === "día" && (
             <div style={sectionRowStyle}>
               <div style={{ fontWeight: FONT_WEIGHT.semibold }}>Fechas de uso diario</div>
               {bookingDate && <div style={mutedTextStyle}>Entrada: {new Date(bookingDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} — Salida: {new Date((bookingEndDate || bookingDate) + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</div>}
               <div style={{ ...mutedTextStyle, marginTop: 4 }}>Hora estimada de llegada: <span style={{ fontWeight: FONT_WEIGHT.semibold, color: BRAND_COLOR }}>{bookingHours.arrivalH}:{bookingHours.arrivalM} hrs</span></div>
               <div style={{ fontSize: FONT_SIZE.sm, color: "#777", marginTop: 4 }}>Nota: Recuerda respetar el horario diario estipulado por el anfitrión (De {listing.dimensions?.dailyStart || "06:00"} a {listing.dimensions?.dailyEnd || "22:00"}).</div>
             </div>
          )}

          {modUnit === "mes" && monthlyInfo && (
            <div style={sectionRowStyle}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold }}>Detalle mensual</div>
              {monthlyInfo.prorrateDays > 0 && monthlyInfo.prorrateDays < monthlyInfo.daysInMonth && (
                <div style={mutedTextStyle}>Prorrateo: {monthlyInfo.prorrateDays} de {monthlyInfo.daysInMonth} días → {formatCLP(monthlyInfo.prorateAmount)}</div>
              )}
              {monthlyInfo.fullMonths > 0 && (
                <div style={mutedTextStyle}>{monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""} completo{monthlyInfo.fullMonths > 1 ? "s" : ""} → {formatCLP(monthlyInfo.fullMonths * monthlyInfo.monthlyPrice)}</div>
              )}
            </div>
          )}

          {canChooseBilling && (
            <div style={sectionRowStyle}>
              <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.xs }}>Forma de cobro</div>
              <div style={{ display: "flex", flexDirection: "column", gap: SPACING.xs }}>
                <div onClick={() => setBillingChoice("installment")} style={billingOption(billingChoice === "installment")}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: billingChoice === "installment" ? `6px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>Pago mensual (cuotas)</div>
                    <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>
                      Hoy pagas el prorrateo ({formatCLP(monthlyInfo.prorateAmount + Math.round(monthlyInfo.prorateAmount * 0.05))}), luego {formatCLP(monthlyInfo.monthlyPrice + Math.round(monthlyInfo.monthlyPrice * 0.05))}/mes
                    </div>
                  </div>
                </div>
                <div onClick={() => setBillingChoice("upfront")} style={billingOption(billingChoice === "upfront")}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: billingChoice === "upfront" ? `6px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>Pago total anticipado</div>
                    <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>
                      Pagas todo ahora: {formatCLP(subtotal + Math.round(subtotal * 0.05))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={sectionRowStyle}>
            <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: 4 }}>Vehículo</div>
            {vehicleInfo?.name ? (
              <div>
                <div style={mutedTextStyle}>{vehicleInfo.name}{vehicleInfo.type ? ` · ${vehicleInfo.type}` : ""}</div>
                {vehicleInfo.plate && <div style={{ fontSize: FONT_SIZE.base, color: "#777", marginTop: 2 }}>Patente: <strong style={{ color: COLORS.text }}>{vehicleInfo.plate}</strong></div>}
              </div>
            ) : (
              <div style={{ fontSize: FONT_SIZE.md, color: COLORS.danger }}>No seleccionaste un vehículo</div>
            )}
          </div>
          {!user && <div style={errorBoxStyle}>Debes iniciar sesión para reservar.</div>}
          <Btn primary full onClick={() => setStep(1)} style={{ marginTop: SPACING.xl }} disabled={!user}>Continuar al pago</Btn>
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.xl, marginBottom: SPACING.md }}>Pagar con</h3>
          <div style={{ display: "flex", gap: SPACING.sm, marginBottom: SPACING.lg }}>
            {[{ id: "mercadopago", l: "Mercado Pago" }, { id: "efectivo", l: "Efectivo" }].map(m => (
              <Pill
                key={m.id}
                active={payMethod === m.id}
                onClick={() => setPayMethod(m.id)}
              >
                {m.l}
              </Pill>
            ))}
          </div>

          {payMethod === "mercadopago" && (() => {
            const mpAmount = isMonthlyInstallment ? (firstPayment + userDebt) : total;
            const handleCopy = async () => {
              try {
                await navigator.clipboard.writeText(String(mpAmount));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            };
            return (
              <div style={{ padding: SPACING.lg, background: "#fffbea", border: "1px solid #facc15", borderRadius: RADIUS.lg, marginBottom: SPACING.xl }}>
                <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: "#78350f", marginBottom: SPACING.xs }}>
                  Pago vía Mercado Pago
                </div>
                <div style={{ fontSize: FONT_SIZE.base, color: "#78350f", marginBottom: SPACING.md }}>
                  Mercado Pago te pedirá ingresar el monto manualmente. Lo copiamos por ti — solo pégalo en la pasarela.
                </div>
                <div style={{ background: "#fff", border: "1px dashed #d97706", borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, textAlign: "center" }}>
                  <div style={{ fontSize: FONT_SIZE.base, color: COLORS.muted, marginBottom: 4 }}>Monto a pegar</div>
                  <div style={{ fontSize: 32, fontWeight: FONT_WEIGHT.bold, color: BRAND_COLOR, letterSpacing: 1 }}>
                    {formatCLP(mpAmount)}
                  </div>
                  <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 4 }}>
                    (sin separadores: <strong>{mpAmount}</strong>)
                  </div>
                </div>
                <Btn full onClick={handleCopy} style={{ marginBottom: SPACING.sm }}>
                  {copied ? "✓ Monto copiado" : "Copiar monto"}
                </Btn>
                <div style={{ fontSize: FONT_SIZE.sm, color: "#78350f" }}>
                  Al confirmar, se abrirá Mercado Pago en una nueva pestaña.
                </div>
              </div>
            );
          })()}
          {payMethod === "efectivo" && (
            <div style={warningBoxStyle}>
              <p style={{ fontSize: FONT_SIZE.md, color: "#92400e", fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.xs }}>Pago en efectivo al anfitrión</p>
              <p style={{ fontSize: FONT_SIZE.base, color: "#78350f" }}>Pagarás directamente al anfitrión. La comisión de servicio quedará como saldo pendiente y se descontará automáticamente en tu próximo pago con tarjeta.</p>
            </div>
          )}

          {userDebt > 0 && (
            <div style={debtNoticeStyle}>
              <span style={{ fontWeight: FONT_WEIGHT.bold, color: COLORS.danger }}>Saldo pendiente: {formatCLP(userDebt)}</span>
              <span style={{ color: COLORS.muted }}>
                {payMethod === "efectivo"
                  ? " — No se cobra ahora. Quedará pendiente hasta tu próximo pago con tarjeta."
                  : " — Se sumará al total a pagar ahora para regularizar tu cuenta."}
              </span>
            </div>
          )}

          <div style={summaryBoxStyle}>
            <div style={summaryRowStyle}><span>{qtyLabel}</span><span>{formatCLP(subtotal)}</span></div>
            {isMonthlyInstallment && (
              <>
                <div style={{ ...summaryRowStyle, marginBottom: 4, fontSize: FONT_SIZE.base, color: COLORS.muted }}><span>  └ Prorrateo primer mes</span><span>{formatCLP(monthlyInfo.prorateAmount)}</span></div>
                <div style={{ ...summaryRowStyle, fontSize: FONT_SIZE.base, color: COLORS.muted }}><span>  └ {monthlyInfo.fullMonths} cuota{monthlyInfo.fullMonths > 1 ? "s" : ""} de {formatCLP(monthlyInfo.monthlyPrice)}</span><span>{formatCLP(monthlyInfo.fullMonths * monthlyInfo.monthlyPrice)}</span></div>
              </>
            )}
            {payMethod !== "efectivo" && (
              <div style={summaryRowStyle}><span>Tarifa de servicio (5%)</span><span>{formatCLP(serviceFee)}</span></div>
            )}
            {payMethod !== "efectivo" && userDebt > 0 && (
              <div style={{ ...summaryRowStyle, color: COLORS.danger, fontWeight: FONT_WEIGHT.semibold }}><span>Saldo pendiente anterior</span><span>+{formatCLP(userDebt)}</span></div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: FONT_WEIGHT.bold, borderTop: `1px solid ${COLORS.border}`, paddingTop: SPACING.sm, marginTop: SPACING.xs }}>
              {isMonthlyInstallment ? (
                <>
                  <span>{payMethod === "efectivo" ? "Pagar al anfitrión hoy (efectivo)" : "Total a pagar hoy"}</span>
                  <span>{formatCLP(payMethod === "efectivo" ? monthlyInfo.prorateAmount : firstPayment + userDebt)}</span>
                </>
              ) : (
                <>
                  <span>{payMethod === "efectivo" ? "Pagar al anfitrión en efectivo" : "Total a pagar ahora"}</span>
                  <span>{formatCLP(total)}</span>
                </>
              )}
            </div>
            {payMethod === "efectivo" && (
              <div style={{ marginTop: SPACING.sm, padding: SPACING.sm, background: "#fffbeb", borderRadius: RADIUS.md, fontSize: FONT_SIZE.sm, color: "#78350f" }}>
                Comisión plataforma (5% = {formatCLP(serviceFee)}) se sumará a tu saldo pendiente: {formatCLP(userDebt + serviceFee)}.
              </div>
            )}
            {isMonthlyInstallment && (
              <div style={{ fontSize: FONT_SIZE.base, color: COLORS.muted, marginTop: SPACING.xs }}>
                Luego: {formatCLP(monthlyInstallment)} /mes × {monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""}
              </div>
            )}
          </div>

          {isMonthlyInstallment && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: SPACING.sm, marginBottom: SPACING.md, padding: 14, background: "#f0f9ff", borderRadius: RADIUS.lg, border: "1px solid #bae6fd" }}>
              <Info size={18} color="#0369a1" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: FONT_SIZE.base, color: "#0c4a6e" }}>
                <strong>Cobro en cuotas mensuales:</strong> Se realizará el cobro mensual automático a tu método de pago seleccionado. En caso de impago, el anfitrión podrá cancelar la reserva de forma inmediata.
              </div>
            </div>
          )}

          {error && <div style={errorBoxStyle} role="alert">{error}</div>}

          <Btn
            primary
            full
            style={{ marginTop: SPACING.xl, opacity: processing ? 0.7 : 1 }}
            onClick={handleConfirmPay}
            disabled={processing}
          >
            {processing ? "Procesando pago..." : isMonthlyInstallment
              ? `Confirmar (hoy ${formatCLP(payMethod === "efectivo" ? monthlyInfo.prorateAmount : firstPayment + userDebt)})`
              : payMethod === "efectivo"
                ? `Confirmar reserva (${formatCLP(total)} en efectivo)`
                : `Abrir Mercado Pago y pagar ${formatCLP(total)}`}
          </Btn>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
