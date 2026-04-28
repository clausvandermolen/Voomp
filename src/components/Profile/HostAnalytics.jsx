import { useState } from "react";
import { DollarSign, Car, ChevronRight } from "lucide-react";
import { BRAND_COLOR } from "../../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from "../../constants/styles";
import { formatCLP } from "../../utils/format";
import { Badge } from "../ui";

const HOST_FEE_RATE = 0.05;
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const HostAnalytics = ({ listings = [], bookings = [], user }) => {
  const [expandedListingId, setExpandedListingId] = useState(null);

  const myListings = listings.filter((l) => l.host?.userId && user?.id && String(l.host.userId) === String(user.id));
  const incomingBookings = bookings.filter((b) => user?.id && String(b.hostId) === String(user.id));
  const confirmedIncoming = incomingBookings.filter((b) => b.status === "confirmed" || b.status === "completed");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const netFromGross = (amount) => amount - Math.round(amount * HOST_FEE_RATE);
  const feeFromGross = (amount) => Math.round(amount * HOST_FEE_RATE);

  const earningsInMonth = (b, month, year) => {
    if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
      const startDate = new Date(b.monthlyStartDate ? b.monthlyStartDate + "T00:00:00" : b.createdAt);
      const startM = startDate.getMonth();
      const startY = startDate.getFullYear();
      if (month === startM && year === startY) {
        const proGross = (b.prorateAmount || 0) + Math.round((b.prorateAmount || 0) * 0.05);
        return netFromGross(proGross);
      }
      const installGross = (b.monthlyInstallment || 0) + Math.round((b.monthlyInstallment || 0) * 0.05);
      let cM = startM + 1, cY = startY;
      if (cM > 11) { cM = 0; cY++; }
      for (let i = 0; i < b.fullMonths; i++) {
        if (cM === month && cY === year) return netFromGross(installGross);
        cM++;
        if (cM > 11) { cM = 0; cY++; }
      }
      return 0;
    }
    const d = new Date(b.startDate || b.createdAt);
    if (d.getMonth() === month && d.getFullYear() === year) return netFromGross(b.total || b.price || 0);
    return 0;
  };

  const earningsFromBooking = (b) => {
    if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
      const proGross = (b.prorateAmount || 0) + Math.round((b.prorateAmount || 0) * 0.05);
      const installGross = (b.monthlyInstallment || 0) + Math.round((b.monthlyInstallment || 0) * 0.05);
      return netFromGross(proGross) + netFromGross(installGross) * b.fullMonths;
    }
    return netFromGross(b.total || b.price || 0);
  };

  const monthlyData = {};
  const addToMonth = (month, year, earn, b) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { key, year, month, bookings: [], earnings: 0, count: 0 };
    monthlyData[key].earnings += earn;
    if (!monthlyData[key].bookings.includes(b)) {
      monthlyData[key].bookings.push(b);
      monthlyData[key].count++;
    }
  };

  confirmedIncoming.forEach((b) => {
    if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
      const startDate = new Date(b.monthlyStartDate ? b.monthlyStartDate + "T00:00:00" : b.createdAt);
      const startM = startDate.getMonth();
      const startY = startDate.getFullYear();
      const proGross = (b.prorateAmount || 0) + Math.round((b.prorateAmount || 0) * 0.05);
      addToMonth(startM, startY, netFromGross(proGross), b);
      const installGross = (b.monthlyInstallment || 0) + Math.round((b.monthlyInstallment || 0) * 0.05);
      let cM = startM + 1, cY = startY;
      if (cM > 11) { cM = 0; cY++; }
      for (let i = 0; i < b.fullMonths; i++) {
        addToMonth(cM, cY, netFromGross(installGross), b);
        cM++;
        if (cM > 11) { cM = 0; cY++; }
      }
    } else {
      const d = new Date(b.startDate || b.createdAt);
      addToMonth(d.getMonth(), d.getFullYear(), netFromGross(b.total || b.price || 0), b);
    }
  });

  const sortedMonths = Object.values(monthlyData).sort((a, b) => b.key.localeCompare(a.key));
  const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthData = monthlyData[currentKey];
  const lastMonthData = monthlyData[lastKey];
  const thisEarnings = thisMonthData?.earnings || 0;
  const lastEarnings = lastMonthData?.earnings || 0;
  const earningsDiff = lastEarnings > 0 ? Math.round(((thisEarnings - lastEarnings) / lastEarnings) * 100) : thisEarnings > 0 ? 100 : 0;
  const thisCount = thisMonthData?.count || 0;
  const lastCount = lastMonthData?.count || 0;
  const countDiff = lastCount > 0 ? Math.round(((thisCount - lastCount) / lastCount) * 100) : thisCount > 0 ? 100 : 0;

  const futureMonthsForBooking = (b) => {
    const result = [];
    if (b.billingSchedule !== "monthly" || b.priceUnit !== "mes" || !b.fullMonths) return result;
    const startDate = new Date(b.monthlyStartDate ? b.monthlyStartDate + "T00:00:00" : b.createdAt);
    let cM = startDate.getMonth() + 1, cY = startDate.getFullYear();
    if (cM > 11) { cM = 0; cY++; }
    const installGross = (b.monthlyInstallment || 0) + Math.round((b.monthlyInstallment || 0) * 0.05);
    for (let i = 0; i < b.fullMonths; i++) {
      if (cY > currentYear || (cY === currentYear && cM > currentMonth)) {
        result.push({ month: cM, year: cY, earnings: netFromGross(installGross) });
      }
      cM++;
      if (cM > 11) { cM = 0; cY++; }
    }
    return result;
  };

  const listingStats = myListings.map((l) => {
    const lBookings = confirmedIncoming.filter((b) => String(b.listingId) === String(l.id));
    const totalEarned = lBookings.reduce((s, b) => s + earningsFromBooking(b), 0);
    const monthlyEarn = lBookings.reduce((s, b) => s + earningsInMonth(b, currentMonth, currentYear), 0);
    const monthBookingCount = lBookings.filter((b) => earningsInMonth(b, currentMonth, currentYear) > 0).length;
    const futureMap = {};
    lBookings.forEach((b) => {
      futureMonthsForBooking(b).forEach((fm) => {
        const fKey = `${fm.year}-${String(fm.month + 1).padStart(2, "0")}`;
        if (!futureMap[fKey]) futureMap[fKey] = { month: fm.month, year: fm.year, earnings: 0 };
        futureMap[fKey].earnings += fm.earnings;
      });
    });
    const futureMonths = Object.values(futureMap).sort((a, b) => a.year - b.year || a.month - b.month);
    const totalFuture = futureMonths.reduce((s, f) => s + f.earnings, 0);
    return { listing: l, totalBookings: lBookings.length, monthBookings: monthBookingCount, totalEarnings: totalEarned, monthlyEarnings: monthlyEarn, futureMonths, totalFuture };
  }).sort((a, b) => b.totalEarnings - a.totalEarnings);

  const totalAllTime = confirmedIncoming.reduce((s, b) => s + earningsFromBooking(b), 0);
  const avgPerBooking = confirmedIncoming.length > 0 ? Math.round(totalAllTime / confirmedIncoming.length) : 0;
  const maxListingEarnings = listingStats.length > 0 ? Math.max(...listingStats.map((l) => l.totalEarnings), 1) : 1;

  return (
    <div style={{ background: "#fff", borderRadius: RADIUS.xl, padding: SPACING.xl }}>
      <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg, margin: 0 }}>Estadísticas</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "#f0fdf4", borderRadius: 16, padding: 20, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Ganancias este mes</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#008A05" }}>{formatCLP(thisEarnings)}</div>
          {earningsDiff !== 0 && <div style={{ fontSize: 13, marginTop: 6, color: earningsDiff > 0 ? "#008A05" : "#b91c1c", fontWeight: 600 }}>{earningsDiff > 0 ? "+" : ""}{earningsDiff}% vs mes anterior</div>}
        </div>
        <div style={{ background: "#f7f7f7", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Reservas este mes</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{thisCount}</div>
          {countDiff !== 0 && <div style={{ fontSize: 13, marginTop: 6, color: countDiff > 0 ? "#008A05" : "#b91c1c", fontWeight: 600 }}>{countDiff > 0 ? "+" : ""}{countDiff}% vs mes anterior</div>}
        </div>
        <div style={{ background: "#f7f7f7", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Promedio por reserva</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCLP(avgPerBooking)}</div>
          <div style={{ fontSize: 13, marginTop: 6, color: "#555" }}>Total histórico: {formatCLP(totalAllTime)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial mensual de ganancias</h3>
        {sortedMonths.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#555", background: "#f7f7f7", borderRadius: 12 }}>
            <DollarSign size={32} color="#ccc" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14 }}>Aún no hay datos de ganancias</p>
          </div>
        ) : (() => {
          const displayMonths = [...sortedMonths].reverse().slice(-12);
          const maxVal = Math.max(...displayMonths.map((m) => m.earnings), 1);
          return (
            <div style={{ background: "#f7f7f7", borderRadius: 16, padding: "24px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
                {displayMonths.map((m) => {
                  const isCurrent = m.key === currentKey;
                  const isFuture = m.key > currentKey;
                  const barColor = isCurrent ? BRAND_COLOR : isFuture ? "#ffa3b5" : "#ffcdd5";
                  const pct = Math.max(4, (m.earnings / maxVal) * 100);
                  return (
                    <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#555", marginBottom: 4, whiteSpace: "nowrap" }}>{formatCLP(m.earnings)}</div>
                      <div style={{ width: "100%", maxWidth: 48, borderRadius: "6px 6px 0 0", background: barColor, height: `${pct}%`, transition: "height .4s", minHeight: 4, border: isCurrent ? `2px solid ${BRAND_COLOR}` : "none" }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
                {displayMonths.map((m) => (
                  <div key={m.key} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: m.key === currentKey ? BRAND_COLOR : "#888", fontWeight: m.key === currentKey ? 700 : 400 }}>{monthNames[m.month].slice(0, 3)}</div>
                    {m.year !== currentYear && <div style={{ fontSize: 9, color: "#aaa" }}>{m.year}</div>}
                    <div style={{ fontSize: 9, color: "#aaa" }}>{m.count}r</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Rendimiento por estacionamiento</h3>
        {listingStats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#555", background: "#f7f7f7", borderRadius: 12 }}>
            <Car size={32} color="#ccc" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14 }}>Publica un espacio para ver estadísticas</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {listingStats.map((ls, idx) => {
              const isExpanded = expandedListingId === ls.listing.id;
              const maxFutureVal = ls.futureMonths.length > 0 ? Math.max(...ls.futureMonths.map((f) => f.earnings), 1) : 1;
              return (
                <div key={ls.listing.id} style={{ background: "#f7f7f7", borderRadius: 14, padding: "16px 20px", border: idx === 0 ? `2px solid ${BRAND_COLOR}22` : "none" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: idx === 0 ? BRAND_COLOR : idx === 1 ? "#f5a623" : idx === 2 ? "#aaa" : "#ddd", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{ls.listing.title}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{ls.listing.location}</div>
                    </div>
                    {idx === 0 && Badge && <Badge style={{ background: "#fef2f2", color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}33` }}>Más rentable</Badge>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    <div><div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Este mes</div><div style={{ fontSize: 18, fontWeight: 800, color: "#008A05" }}>{formatCLP(ls.monthlyEarnings)}</div></div>
                    <div><div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Total ganado</div><div style={{ fontSize: 18, fontWeight: 800 }}>{formatCLP(ls.totalEarnings)}</div></div>
                    <div><div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Reservas mes</div><div style={{ fontSize: 18, fontWeight: 800 }}>{ls.monthBookings}</div></div>
                    <div><div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Total reservas</div><div style={{ fontSize: 18, fontWeight: 800 }}>{ls.totalBookings}</div></div>
                  </div>
                  <div style={{ marginTop: 10, background: "#e5e5e5", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: idx === 0 ? BRAND_COLOR : "#ffa3b5", width: `${Math.max(2, (ls.totalEarnings / maxListingEarnings) * 100)}%`, transition: "width .3s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: "right" }}>{maxListingEarnings > 0 ? Math.round((ls.totalEarnings / maxListingEarnings) * 100) : 0}% del más rentable</div>

                  {ls.totalFuture > 0 && (
                    <div style={{ marginTop: 12, borderTop: "1px solid #e0e0e0", paddingTop: 12 }}>
                      <div onClick={() => setExpandedListingId(isExpanded ? null : ls.listing.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Por cobrar</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#c76d00" }}>{formatCLP(ls.totalFuture)}</div>
                        </div>
                        <ChevronRight size={16} color="#888" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: 12, background: "#fff", borderRadius: 12, padding: "16px 12px 8px" }}>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                            {ls.futureMonths.map((fm) => {
                              const pct = Math.max(6, (fm.earnings / maxFutureVal) * 100);
                              return (
                                <div key={`${fm.year}-${fm.month}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c76d00", marginBottom: 3, whiteSpace: "nowrap" }}>{formatCLP(fm.earnings)}</div>
                                  <div style={{ width: "100%", maxWidth: 40, borderRadius: "5px 5px 0 0", background: "linear-gradient(180deg, #f5a623 0%, #ffd89b 100%)", height: `${pct}%`, transition: "height .4s", minHeight: 4 }} />
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 6, borderTop: "1px solid #f0f0f0", paddingTop: 6 }}>
                            {ls.futureMonths.map((fm) => (
                              <div key={`${fm.year}-${fm.month}`} style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#888" }}>{monthNames[fm.month].slice(0, 3)}</div>
                                {fm.year !== currentYear && <div style={{ fontSize: 9, color: "#aaa" }}>{fm.year}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sortedMonths.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Detalle por mes</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Mes</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Reservas</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Ganancia neta</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Promedio/reserva</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Estacionamientos usados</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.map((m) => {
                  const uniqueListings = new Set(m.bookings.map((b) => b.listingId)).size;
                  const avg = m.count > 0 ? Math.round(m.earnings / m.count) : 0;
                  return (
                    <tr key={m.key} style={{ borderBottom: "1px solid #f0f0f0", background: m.key === currentKey ? "#fef7f0" : "transparent" }}>
                      <td style={{ padding: "10px 12px", fontWeight: m.key === currentKey ? 700 : 400 }}>
                        {monthNames[m.month]} {m.year}
                        {m.key === currentKey && <span style={{ fontSize: 11, color: BRAND_COLOR, marginLeft: 6 }}>(actual)</span>}
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }}>{m.count}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, color: "#008A05" }}>{formatCLP(m.earnings)}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }}>{formatCLP(avg)}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }}>{uniqueListings}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmedIncoming.length > 0 && (() => {
        const totalGross = confirmedIncoming.reduce((s, b) => s + (b.total || b.price || 0), 0);
        const totalCommission = confirmedIncoming.reduce((s, b) => s + feeFromGross(b.total || b.price || 0), 0);
        const totalNet = totalGross - totalCommission;
        return (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial de ingresos</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#f7f7f7", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>Ingresos brutos</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{formatCLP(totalGross)}</div>
              </div>
              <div style={{ background: "#fef7f0", borderRadius: 14, padding: "16px 18px", border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>Comisión Voomp (5%)</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#c76d00" }}>-{formatCLP(totalCommission)}</div>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "16px 18px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>Ganancia neta</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#008A05" }}>{formatCLP(totalNet)}</div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Fecha</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Conductor</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Espacio</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Vehículo</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Bruto</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Comisión</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#555", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {[...confirmedIncoming].sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt)).map((b) => {
                    const gross = b.total || b.price || 0;
                    const commission = feeFromGross(gross);
                    const net = gross - commission;
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "10px 12px" }}>{new Date(b.startDate || b.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: "10px 12px" }}>{b.conductorName || "—"}</td>
                        <td style={{ padding: "10px 12px" }}>{b.listingTitle || "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          {b.vehicleName || "—"}
                          {b.vehiclePlate && <span style={{ fontSize: 12, color: "#777", marginLeft: 4 }}>({b.vehiclePlate})</span>}
                        </td>
                        <td style={{ textAlign: "right", padding: "10px 12px" }}>{formatCLP(gross)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: "#c76d00" }}>-{formatCLP(commission)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, color: "#008A05" }}>{formatCLP(net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default HostAnalytics;
