import { useState } from "react";
import { AlertCircle, CheckCircle, Camera, CreditCard, Lock, Info, Shield } from "lucide-react";
import { BRAND_COLOR } from "../constants";
import { formatCLP } from "../utils/format";
import { Btn, Pill, Input, StarRating } from "./ui";

/* ─── Booking Confirmation ─── */
const BookingConfirmation = ({ listing, user, selectedModality, availableModalities, bookingHours, bookingDate, bookingEndDate, monthlyStartDate, monthlyEndMonth, vehicleInfo, onBooking, onClose, onUpdateUser }) => {
  const [step, setStep] = useState(0);
  const [cardNum, setCardNum] = useState("");
  const [processing, setProcessing] = useState(false);
  const userDebt = Number(user?.credit) || 0;
  const [payMethod, setPayMethod] = useState("tarjeta"); // efectivo gets disabled below when userDebt > 0
  const [billingChoice, setBillingChoice] = useState("installment"); // "installment" or "upfront"

  const mod = availableModalities.find(m => m.id === selectedModality) || availableModalities[0] || { price: listing.price, id: listing.priceUnit };
  const modPrice = mod.price;
  const modUnit = mod.id;

  // Hourly calculation
  const calcHours = () => {
    if (!bookingHours || !bookingDate) return 1;
    const endD = bookingEndDate || bookingDate;
    const sDate = new Date(`${bookingDate}T${bookingHours.startH}:${bookingHours.startM}:00`);
    const eDate = new Date(`${endD}T${bookingHours.endH}:${bookingHours.endM}:00`);
    const mins = (eDate - sDate) / 60000;
    return mins > 0 ? mins / 60 : 1;
  };

  // Daily calculation
  const calcDays = () => {
    if (!bookingDate) return 1;
    if (!bookingEndDate || bookingEndDate === bookingDate) return 1;
    const start = new Date(bookingDate + "T00:00:00");
    const end = new Date(bookingEndDate + "T00:00:00");
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  // Monthly calculation
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

  // Compute subtotal based on modality
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
  // Cash: conductor pays the host only the booking subtotal in cash. The 5% platform
  // commission becomes new debt and prior debt stays untouched (paid later via card).
  // Card/PayPal: everything is collected via the platform — host gets subtotal, platform
  // gets the fee and clears any prior debt.
  const total = payMethod === "efectivo"
    ? subtotal
    : subtotal + serviceFee + userDebt;

  // User chooses: installment (monthly) or upfront (pay all now)
  const canChooseBilling = modUnit === "mes" && monthlyInfo && monthlyInfo.fullMonths > 0;
  const isMonthlyInstallment = canChooseBilling && billingChoice === "installment";
  const firstPayment = isMonthlyInstallment ? (monthlyInfo.prorateAmount + Math.round(monthlyInfo.prorateAmount * 0.05)) : null;
  const monthlyInstallment = isMonthlyInstallment ? (monthlyInfo.monthlyPrice + Math.round(monthlyInfo.monthlyPrice * 0.05)) : null;

  const handleConfirmPay = async () => {
    if (!user) return;
    setProcessing(true);

    const bookingData = {
      listing_id: listing.id,
      listing_title: listing.title,
      photo_url: (listing.photos || [])[0] || null,
      conductor_id: user.id,
      conductor_name: `${user.firstName || ""} ${user.lastNameP || ""} ${user.lastNameM || ""}`.trim(),
      host_id: listing.host?.userId,
      host_name: listing.host?.name || "Anfitrión",
      vehicle_name: vehicleInfo?.name || null,
      vehicle_plate: vehicleInfo?.plate || null,
      price: modPrice,
      price_unit: modUnit,
      // Store the booking value (subtotal). Platform fee/debt are bookkeeping, not
      // part of the booking record. The host's earnings are always the subtotal.
      total: subtotal,
      // All bookings (hour/day/month) require host approval before being confirmed.
      status: "pending_approval",
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

      // Credit/debt changes are deferred until the host approves the booking.
      // The on_booking_approved DB trigger applies the right credit logic
      // (clear debt for card/paypal, add 5% commission for cash) at that moment.

      setTimeout(() => { setProcessing(false); setStep(2); }, 1000);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      alert("Error al procesar la reserva. Inténtalo de nuevo.");
    }
  };

  if (step === 2) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fef7f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <AlertCircle size={40} color="#c76d00" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Solicitud enviada</h2>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>Tu solicitud de reserva fue enviada al anfitrión. Recibirás una notificación cuando sea aprobada o rechazada.</p>
        <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{listing.title}</div>
          <div style={{ fontSize: 14, color: "#555" }}>Modalidad: {modUnit === "hora" ? "Por hora" : modUnit === "día" ? "Por día" : "Por mes"}</div>
          {modUnit === "hora" && bookingHours && (
            <div style={{ fontSize: 14, color: "#555" }}>Horario: {bookingHours.startH}:{bookingHours.startM} ({bookingDate?.split("-").reverse().join("/")}) — {bookingHours.endH}:{bookingHours.endM} ({(bookingEndDate || bookingDate)?.split("-").reverse().join("/")}) ({calcHours().toLocaleString("es-CL", { maximumFractionDigits: 1 })}h)</div>
          )}
          {modUnit === "día" && bookingDate && (
             <div style={{ fontSize: 14, color: "#555" }}>Estadía: {bookingDate.split("-").reverse().join("/")} — {(bookingEndDate || bookingDate).split("-").reverse().join("/")} | Llegada est: {bookingHours.arrivalH}:{bookingHours.arrivalM}</div>
          )}
          {modUnit === "mes" && isMonthlyInstallment && (
            <>
              <div style={{ fontSize: 14, color: "#555" }}>Primer cobro (prorrateo): {formatCLP(firstPayment)}</div>
              <div style={{ fontSize: 14, color: "#555" }}>Cuota mensual: {formatCLP(monthlyInstallment)} × {monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""}</div>
            </>
          )}
          {vehicleInfo?.name && <div style={{ fontSize: 14, color: "#555" }}>Vehículo: {vehicleInfo.name}{vehicleInfo.plate ? ` · Patente: ${vehicleInfo.plate}` : ""}</div>}
          <div style={{ fontSize: 14, color: "#555" }}>Pago: {payMethod === "efectivo" ? "Efectivo" : payMethod === "tarjeta" ? "Tarjeta" : "PayPal"}</div>
          <div style={{ fontSize: 14, color: "#555" }}>Acceso: {listing.access}</div>
          <div style={{ fontSize: 14, color: "#555" }}>Total: {formatCLP(subtotal + serviceFee)}</div>
          {payMethod === "efectivo" && <div style={{ fontSize: 13, color: "#b45309", marginTop: 8, fontWeight: 600 }}>Comisión pendiente — se descontará en tu próximo pago con tarjeta.</div>}
          {isMonthlyInstallment && (
            <div style={{ fontSize: 13, color: "#555", marginTop: 8, padding: 10, background: "#e8f5e8", borderRadius: 8 }}>
              El cobro se realizará mensualmente. En caso de impago, el anfitrión podrá cancelar la reserva.
            </div>
          )}
        </div>
        <Btn primary onClick={onClose}>Volver al inicio</Btn>
      </div>
    );
  }

  return (
    <div>
      {step === 0 && (
        <div>
          <div style={{ display: "flex", gap: 16, padding: 16, background: "#f7f7f7", borderRadius: 12, marginBottom: 24 }}>
            {(listing.photos || [])[0] ? <img src={listing.photos[0]} alt="" style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 100, height: 80, borderRadius: 8, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={24} color="#bbb" /></div>}
            <div>
              <div style={{ fontWeight: 600 }}>{listing.title}</div>
              <div style={{ color: "#555", fontSize: 14 }}>{listing.location}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}><StarRating rating={listing.rating} /><span style={{ color: "#555", fontSize: 13 }}>({listing.reviewsList?.length ?? listing.reviews_count ?? 0})</span></div>
            </div>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Tu reserva</h3>

          {/* Modality — read-only summary */}
          <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Modalidad</div>
            <div style={{ fontSize: 14, color: "#555" }}>{mod.label} — {formatCLP(mod.price)}/{modUnit}</div>
          </div>

          {modUnit === "hora" && bookingHours && (
            <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600 }}>Rango horario</div>
              <div style={{ fontSize: 14, color: "#555" }}>{bookingHours.startH}:{bookingHours.startM} — {bookingHours.endH}:{bookingHours.endM} ({calcHours().toLocaleString("es-CL", { maximumFractionDigits: 1 })} hora{calcHours() !== 1 ? "s" : ""})</div>
              {bookingDate && <div style={{ fontSize: 13, color: "#555" }}>Fecha entrada: {new Date(bookingDate + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</div>}
              {bookingEndDate && <div style={{ fontSize: 13, color: "#555" }}>Fecha salida: {new Date(bookingEndDate + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</div>}
            </div>
          )}

          {/* Daily details */}
          {modUnit === "día" && (
             <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
               <div style={{ fontWeight: 600 }}>Fechas de uso diario</div>
               {bookingDate && <div style={{ fontSize: 14, color: "#555" }}>Entrada: {new Date(bookingDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} — Salida: {new Date((bookingEndDate || bookingDate) + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</div>}
               <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>Hora estimada de llegada: <span style={{ fontWeight: 600, color: BRAND_COLOR }}>{bookingHours.arrivalH}:{bookingHours.arrivalM} hrs</span></div>
               <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>Nota: Recuerda respetar el horario diario estipulado por el anfitrión (De {listing.dimensions?.dailyStart || "06:00"} a {listing.dimensions?.dailyEnd || "22:00"}).</div>
             </div>
          )}

          {/* Monthly details */}
          {modUnit === "mes" && monthlyInfo && (
            <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600 }}>Detalle mensual</div>
              {monthlyInfo.prorrateDays > 0 && monthlyInfo.prorrateDays < monthlyInfo.daysInMonth && (
                <div style={{ fontSize: 14, color: "#555" }}>Prorrateo: {monthlyInfo.prorrateDays} de {monthlyInfo.daysInMonth} días → {formatCLP(monthlyInfo.prorateAmount)}</div>
              )}
              {monthlyInfo.fullMonths > 0 && (
                <div style={{ fontSize: 14, color: "#555" }}>{monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""} completo{monthlyInfo.fullMonths > 1 ? "s" : ""} → {formatCLP(monthlyInfo.fullMonths * monthlyInfo.monthlyPrice)}</div>
              )}
            </div>
          )}

          {/* Billing choice for monthly */}
          {canChooseBilling && (
            <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Forma de cobro</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div onClick={() => setBillingChoice("installment")} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: billingChoice === "installment" ? `2px solid ${BRAND_COLOR}` : "2px solid #eee", cursor: "pointer", background: billingChoice === "installment" ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: billingChoice === "installment" ? `6px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Pago mensual (cuotas)</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      Hoy pagas el prorrateo ({formatCLP(monthlyInfo.prorateAmount + Math.round(monthlyInfo.prorateAmount * 0.05))}), luego {formatCLP(monthlyInfo.monthlyPrice + Math.round(monthlyInfo.monthlyPrice * 0.05))}/mes
                    </div>
                  </div>
                </div>
                <div onClick={() => setBillingChoice("upfront")} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: billingChoice === "upfront" ? `2px solid ${BRAND_COLOR}` : "2px solid #eee", cursor: "pointer", background: billingChoice === "upfront" ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: billingChoice === "upfront" ? `6px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Pago total anticipado</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      Pagas todo ahora: {formatCLP(subtotal + Math.round(subtotal * 0.05))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle info */}
          <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Vehículo</div>
            {vehicleInfo?.name ? (
              <div>
                <div style={{ fontSize: 14, color: "#555" }}>{vehicleInfo.name}{vehicleInfo.type ? ` · ${vehicleInfo.type}` : ""}</div>
                {vehicleInfo.plate && <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>Patente: <strong style={{ color: "#222" }}>{vehicleInfo.plate}</strong></div>}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#b91c1c" }}>No seleccionaste un vehículo</div>
            )}
          </div>
          {!user && <div style={{ marginBottom: 16, padding: 12, background: "#fef2f2", borderRadius: 8, color: "#b91c1c", fontSize: 13, fontWeight: 600 }}>Debes iniciar sesión para reservar.</div>}
          <Btn primary full onClick={() => setStep(1)} style={{ marginTop: 24 }} disabled={!user}>Continuar al pago</Btn>
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Pagar con</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[{ id: "tarjeta", l: "Tarjeta" }, { id: "paypal", l: "PayPal" }, { id: "efectivo", l: "Efectivo" }].map(m => (
              <Pill 
                key={m.id} 
                active={payMethod === m.id} 
                onClick={() => setPayMethod(m.id)} 
              >
                {m.l}
              </Pill>
            ))}
          </div>

          {payMethod === "tarjeta" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <Input icon={CreditCard} placeholder="Número de tarjeta" value={cardNum} onChange={e => setCardNum(e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input placeholder="MM/AA" />
                <Input icon={Lock} placeholder="CVV" />
              </div>
              <Input placeholder="Nombre en la tarjeta" />
            </div>
          )}
          {payMethod === "paypal" && (
            <div style={{ padding: 24, textAlign: "center", background: "#f7f7f7", borderRadius: 12, marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: "#555" }}>Serás redirigido a PayPal para completar el pago.</p>
            </div>
          )}
          {payMethod === "efectivo" && (
            <div style={{ padding: 16, background: "#fffbeb", borderRadius: 12, border: "1px solid #f59e0b33", marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: "#92400e", fontWeight: 600, marginBottom: 8 }}>Pago en efectivo al anfitrión</p>
              <p style={{ fontSize: 13, color: "#78350f" }}>Pagarás directamente al anfitrión. La comisión de servicio quedará como saldo pendiente y se descontará automáticamente en tu próximo pago con tarjeta.</p>
            </div>
          )}

          {/* Credit notice */}
          {userDebt > 0 && (
            <div style={{ padding: 12, background: "#fef2f2", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fca5a5" }}>
              <span style={{ fontWeight: 700, color: "#b91c1c" }}>Saldo pendiente: {formatCLP(userDebt)}</span>
              <span style={{ color: "#555" }}>
                {payMethod === "efectivo"
                  ? " — No se cobra ahora. Quedará pendiente hasta tu próximo pago con tarjeta."
                  : " — Se sumará al total a pagar ahora para regularizar tu cuenta."}
              </span>
            </div>
          )}

          <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>{qtyLabel}</span><span>{formatCLP(subtotal)}</span></div>
            {isMonthlyInstallment && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "#555" }}><span>  └ Prorrateo primer mes</span><span>{formatCLP(monthlyInfo.prorateAmount)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#555" }}><span>  └ {monthlyInfo.fullMonths} cuota{monthlyInfo.fullMonths > 1 ? "s" : ""} de {formatCLP(monthlyInfo.monthlyPrice)}</span><span>{formatCLP(monthlyInfo.fullMonths * monthlyInfo.monthlyPrice)}</span></div>
              </>
            )}
            {payMethod !== "efectivo" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Tarifa de servicio (5%)</span><span>{formatCLP(serviceFee)}</span></div>
            )}
            {payMethod !== "efectivo" && userDebt > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#b91c1c", fontWeight: 600 }}><span>Saldo pendiente anterior</span><span>+{formatCLP(userDebt)}</span></div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: 12, marginTop: 8 }}>
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
              <div style={{ marginTop: 10, padding: 10, background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#78350f" }}>
                Comisión plataforma (5% = {formatCLP(serviceFee)}) se sumará a tu saldo pendiente: {formatCLP(userDebt + serviceFee)}.
              </div>
            )}
            {isMonthlyInstallment && (
              <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
                Luego: {formatCLP(monthlyInstallment)} /mes × {monthlyInfo.fullMonths} mes{monthlyInfo.fullMonths > 1 ? "es" : ""}
              </div>
            )}
          </div>

          {isMonthlyInstallment && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, padding: 14, background: "#f0f9ff", borderRadius: 12, border: "1px solid #bae6fd" }}>
              <Info size={18} color="#0369a1" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: "#0c4a6e" }}>
                <strong>Cobro en cuotas mensuales:</strong> Se realizará el cobro mensual automático a tu método de pago seleccionado. En caso de impago, el anfitrión podrá cancelar la reserva de forma inmediata.
              </div>
            </div>
          )}


          <Btn primary full style={{ marginTop: 24 }} onClick={handleConfirmPay} disabled={processing}>
            {processing ? "Procesando..." : isMonthlyInstallment
              ? `Confirmar (hoy ${formatCLP(payMethod === "efectivo" ? monthlyInfo.prorateAmount : firstPayment + userDebt)})`
              : payMethod === "efectivo"
                ? `Confirmar reserva (${formatCLP(total)} en efectivo)`
                : `Confirmar y pagar ${formatCLP(total)}`}
          </Btn>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
