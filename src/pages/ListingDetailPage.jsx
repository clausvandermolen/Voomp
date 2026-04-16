import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Star, Heart, Share2, Camera, MapPin, Calendar, Shield, Zap, Lock, Wifi, Sun, Phone, Award, Check, Grid, Info, ChevronDown, Car, Clock, Edit, TrendingUp, DollarSign, Eye } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { formatCLP } from "../utils/format";
import { StarRating, Avatar, Badge, Btn, Pill } from "../components/ui";
import PhotoGallery from "../components/PhotoGallery";
import BookingConfirmation from "../components/BookingConfirmation";
import { Modal } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useNotifications } from "../contexts/NotificationsContext";
import { useListings } from "../contexts/ListingsContext";

/* ── Busy intervals helpers ── */
const BLOCKING_STATUSES = new Set(["pending_approval", "confirmed", "cash_unpaid", "completed"]);

const getBusyIntervals = (listingId, bookings) => {
  if (!listingId) return [];
  return (bookings || [])
    .filter(b => String(b.listingId || b.listing_id) === String(listingId))
    .filter(b => BLOCKING_STATUSES.has(b.status))
    .map(b => {
      const unit = b.priceUnit || b.price_unit || "hora";
      const sd = b.startDate || b.start_date;
      const ed = b.endDate || b.end_date || sd;
      try {
        if (unit === "hora" && sd) {
          const sH = (b.startTime || b.start_time || "00:00").slice(0, 5);
          const eH = (b.endTime || b.end_time || "23:59").slice(0, 5);
          return { start: new Date(`${sd}T${sH}:00`), end: new Date(`${ed}T${eH}:00`), unit, status: b.status };
        }
        if (unit === "día" && sd) {
          return { start: new Date(`${sd}T00:00:00`), end: new Date(`${ed}T23:59:59`), unit, status: b.status };
        }
        if (unit === "mes") {
          const startStr = b.monthlyStartDate || b.monthly_start_date || sd;
          if (!startStr) return null;
          const start = new Date(`${startStr}T00:00:00`);
          const months = Number(b.fullMonths || b.full_months) || 1;
          const end = new Date(start);
          end.setMonth(end.getMonth() + Math.max(months, 1));
          return { start, end, unit, status: b.status };
        }
      } catch { return null; }
      return null;
    })
    .filter(r => r && !isNaN(r.start) && !isNaN(r.end) && r.end > r.start)
    .sort((a, b) => a.start - b.start);
};

const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const formatBusyLabel = (iv) => {
  const fmtDate = (d) => d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  const fmtTime = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (iv.unit === "hora") {
    const sameDay = iv.start.toDateString() === iv.end.toDateString();
    if (sameDay) return `${fmtDate(iv.start)} · ${fmtTime(iv.start)}–${fmtTime(iv.end)}`;
    return `${fmtDate(iv.start)} ${fmtTime(iv.start)} → ${fmtDate(iv.end)} ${fmtTime(iv.end)}`;
  }
  if (iv.unit === "día") {
    const sameDay = iv.start.toDateString() === iv.end.toDateString();
    if (sameDay) return `${fmtDate(iv.start)} (día completo)`;
    return `${fmtDate(iv.start)} → ${fmtDate(iv.end)}`;
  }
  return `${fmtDate(iv.start)} → ${fmtDate(iv.end)}`;
};

/* ── Custom Time Picker ── */
const TimePicker = ({ value, onChange, label, disabledHours }) => {
  // value = "HH:MM", onChange receives "HH:MM"
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hoursRef = useRef(null);
  const [h, m] = (value || "08:00").split(":").map(Number);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && hoursRef.current) {
      const activeEl = hoursRef.current.querySelector('[data-active="true"]');
      if (activeEl) activeEl.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [open]);

  const pick = (newH, newM) => {
    onChange(`${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
  };

  const displayTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const isPM = h >= 12;
  const ampmLabel = isPM ? "PM" : "AM";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>{label}</label>}
      <button type="button" onClick={() => setOpen(!open)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: open ? `1px solid ${BRAND_COLOR}` : "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box", transition: "border .2s", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={15} color="#999" />
          <span>{displayTime}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: isPM ? "#c2610c" : "#2563eb", background: isPM ? "#fff7ed" : "#eff6ff", padding: "2px 8px", borderRadius: 10 }}>{ampmLabel}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50, background: "#fff", borderRadius: 14, border: "1px solid #e5e5e5", boxShadow: "0 8px 24px rgba(0,0,0,.12)", overflow: "hidden", display: "flex" }}>
          {/* Hours column */}
          <div ref={hoursRef} style={{ flex: 1, maxHeight: 220, overflowY: "auto", borderRight: "1px solid #f0f0f0", scrollbarWidth: "thin" }}>
            {Array.from({ length: 24 }, (_, i) => {
              const isAM = i < 12;
              const active = i === h;
              const isBusy = disabledHours && disabledHours.has(i);
              const bg = isBusy ? "#fef2f2" : (active ? (isAM ? "#eff6ff" : "#fff7ed") : "transparent");
              const color = isBusy ? "#b91c1c" : (active ? (isAM ? "#1d4ed8" : "#c2610c") : (isAM ? "#475569" : "#78350f"));
              return (
                <button key={i} data-active={active} disabled={isBusy} onClick={() => { if (!isBusy) pick(i, m); }} title={isBusy ? "Periodo reservado" : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 14px", border: "none", cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 700 : (isBusy ? 600 : 400), background: bg, color, textDecoration: isBusy ? "line-through" : "none", transition: "background .1s", borderLeft: active ? `3px solid ${isAM ? "#3b82f6" : "#f59e0b"}` : (isBusy ? "3px solid #ef4444" : "3px solid transparent") }}>
                  <span>{String(i).padStart(2, "0")}h{isBusy ? " · Reservado" : ""}</span>
                  {active && !isBusy && <Check size={13} />}
                </button>
              );
            })}
          </div>
          {/* Minutes column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {["00", "15", "30", "45"].map(min => {
              const active = parseInt(min) === m;
              return (
                <button key={min} onClick={() => { pick(h, parseInt(min)); setOpen(false); }} style={{ flex: 1, padding: "14px 14px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 700 : 400, background: active ? "#f8f8f8" : "transparent", color: active ? "#222" : "#777", transition: "background .1s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>:{min}</span>
                  {active && <Check size={13} color="#222" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ListingDetailPage = ({ listing, onBack, onNavigate, user, listings = [], setListings, onUpdateUser, onBooking, onEditListing, bookings = [] }) => {
  const { pushNotification } = useNotifications();
  const { fetchListings } = useListings();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [bookingDates, setBookingDates] = useState({ start: "", end: "" });
  const [bookingHours, setBookingHours] = useState({ startH: "08", startM: "00", endH: "10", endM: "00", arrivalH: "08", arrivalM: "00" });
  const [monthlyStartDate, setMonthlyStartDate] = useState("");
  const [monthlyEndMonth, setMonthlyEndMonth] = useState("");
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewsShown, setReviewsShown] = useState(5);
  const [hostReviews, setHostReviews] = useState([]);
  const [hostReviewText, setHostReviewText] = useState("");
  const [hostReviewRating, setHostReviewRating] = useState(5);
  const [showAllHostReviews, setShowAllHostReviews] = useState(false);
  const [hostReviewsModalOpen, setHostReviewsModalOpen] = useState(false);
  const [hostReviewsShown, setHostReviewsShown] = useState(5);
  const [bookingStep, setBookingStep] = useState(0); // 0=collapsed, 1=datetime, 2=vehicle, 3=summary
  // Vehicle selection
  const [selectedVehicleId, setSelectedVehicleId] = useState(null); // id from user.vehicles, or "custom"
  const [customVehicleName, setCustomVehicleName] = useState("");
  const [customVehiclePlate, setCustomVehiclePlate] = useState("");
  const userVehicles = user?.vehicles || [];
  // Modality selection for booking
  const availableModalities = [];
  if (listing) {
    if (Number(listing.price) > 0) availableModalities.push({ id: "hora", label: "Por hora", price: Number(listing.price) });
    if (Number(listing.priceDaily) > 0) availableModalities.push({ id: "día", label: "Por día", price: Number(listing.priceDaily) });
    if (Number(listing.priceMonthly) > 0) availableModalities.push({ id: "mes", label: "Por mes", price: Number(listing.priceMonthly) });
  }
  const [selectedModality, setSelectedModality] = useState(availableModalities[0]?.id || "hora");

  // Busy intervals for this listing (excluding own current bookings is unnecessary — they still block).
  const busyIntervals = useMemo(() => getBusyIntervals(listing?.id, bookings), [listing?.id, bookings]);

  // Hours busy for the currently selected booking start date (for the time picker)
  const busyHoursForStart = useMemo(() => {
    const set = new Set();
    if (!bookingDates.start) return set;
    const dayStart = new Date(`${bookingDates.start}T00:00:00`);
    const dayEnd = new Date(`${bookingDates.start}T23:59:59`);
    busyIntervals.forEach(iv => {
      if (!intervalsOverlap(dayStart, dayEnd, iv.start, iv.end)) return;
      const from = iv.start < dayStart ? 0 : iv.start.getHours();
      const to = iv.end > dayEnd ? 24 : (iv.end.getHours() + (iv.end.getMinutes() > 0 ? 1 : 0));
      for (let i = from; i < to; i++) set.add(i);
    });
    return set;
  }, [busyIntervals, bookingDates.start]);

  const busyHoursForEnd = useMemo(() => {
    const set = new Set();
    const endDateStr = bookingDates.end || bookingDates.start;
    if (!endDateStr) return set;
    const dayStart = new Date(`${endDateStr}T00:00:00`);
    const dayEnd = new Date(`${endDateStr}T23:59:59`);
    busyIntervals.forEach(iv => {
      if (!intervalsOverlap(dayStart, dayEnd, iv.start, iv.end)) return;
      const from = iv.start < dayStart ? 0 : iv.start.getHours();
      const to = iv.end > dayEnd ? 24 : (iv.end.getHours() + (iv.end.getMinutes() > 0 ? 1 : 0));
      for (let i = from; i < to; i++) set.add(i);
    });
    return set;
  }, [busyIntervals, bookingDates.end, bookingDates.start]);

  // Determine if current selection conflicts with any busy interval
  const currentSelectionConflict = useMemo(() => {
    if (!busyIntervals.length) return null;
    let sel = null;
    if (selectedModality === "hora" && bookingDates.start) {
      const sd = bookingDates.start;
      const ed = bookingDates.end || sd;
      sel = { start: new Date(`${sd}T${bookingHours.startH}:${bookingHours.startM}:00`), end: new Date(`${ed}T${bookingHours.endH}:${bookingHours.endM}:00`) };
    } else if (selectedModality === "día" && bookingDates.start) {
      const sd = bookingDates.start;
      const ed = bookingDates.end || sd;
      sel = { start: new Date(`${sd}T00:00:00`), end: new Date(`${ed}T23:59:59`) };
    } else if (selectedModality === "mes" && monthlyStartDate) {
      const start = new Date(`${monthlyStartDate}T00:00:00`);
      const end = new Date(start);
      if (monthlyEndMonth) {
        const [ey, em] = monthlyEndMonth.split("-").map(Number);
        end.setFullYear(ey, em, 0);
        end.setHours(23, 59, 59);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      sel = { start, end };
    }
    if (!sel || isNaN(sel.start) || isNaN(sel.end) || sel.end <= sel.start) return null;
    const conflict = busyIntervals.find(iv => intervalsOverlap(sel.start, sel.end, iv.start, iv.end));
    return conflict || null;
  }, [busyIntervals, selectedModality, bookingDates.start, bookingDates.end, bookingHours, monthlyStartDate, monthlyEndMonth]);

  // Resolve selected vehicle info
  const getSelectedVehicle = () => {
    if (selectedVehicleId === "custom") return { name: customVehicleName, plate: customVehiclePlate };
    const v = userVehicles.find(v => v.id === selectedVehicleId);
    if (v) return { name: v.name, plate: v.plate || "", type: v.type, width: v.width ?? null, length: v.length ?? null, height: v.height ?? null };
    return { name: "", plate: "" };
  };

  // Hourly calculation
  const calcHourlyTotal = () => {
    if (!bookingDates.start) return 0;
    const endD = bookingDates.end || bookingDates.start;
    const sDate = new Date(`${bookingDates.start}T${bookingHours.startH}:${bookingHours.startM}:00`);
    const eDate = new Date(`${endD}T${bookingHours.endH}:${bookingHours.endM}:00`);
    const mins = (eDate - sDate) / 60000;
    return mins > 0 ? mins / 60 : 0;
  };
  // Monthly calculation helper
  const calcMonthlyBreakdown = () => {
    if (!monthlyStartDate) return { prorrateDays: 0, prorrateDaysInMonth: 30, fullMonths: 0, totalAmount: 0 };
    const start = new Date(monthlyStartDate + "T00:00:00");
    const startDay = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
    const remainingDays = daysInStartMonth - startDay + 1;
    const monthlyPrice = Number(listing?.priceMonthly) || 0;

    if (!monthlyEndMonth) {
      // Until end of same month
      const prorateAmount = Math.round((monthlyPrice / daysInStartMonth) * remainingDays);
      return { prorrateDays: remainingDays, prorrateDaysInMonth: daysInStartMonth, fullMonths: 0, totalAmount: prorateAmount, monthlyPrice };
    }
    // Until end of chosen month
    const [endY, endM] = monthlyEndMonth.split("-").map(Number);
    let fullMonths = 0;
    let cM = startMonth + 1, cY = startYear;
    if (cM > 11) { cM = 0; cY++; }
    while (cY < endY || (cY === endY && cM <= endM - 1)) {
      fullMonths++;
      cM++;
      if (cM > 11) { cM = 0; cY++; }
    }
    const prorateAmount = Math.round((monthlyPrice / daysInStartMonth) * remainingDays);
    const totalAmount = prorateAmount + (fullMonths * monthlyPrice);
    return { prorrateDays: remainingDays, prorrateDaysInMonth: daysInStartMonth, fullMonths, totalAmount, monthlyPrice, prorateAmount };
  };

  // Fetch host reviews. Declared BEFORE the early return so hook order is stable
  // across renders where `listing` may flip from null to non-null.
  const hostIdForReviews = listing?.host?.userId || null;
  const { toggleFavorite } = useListings();
  const isSaved = listing?.favorite || false;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      prompt('Copia este link:', window.location.href);
    }
  };

  const handleToggleSave = () => {
    toggleFavorite(listing.id);
  };

  useEffect(() => {
    let cancelled = false;
    if (!hostIdForReviews) { setHostReviews([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, author_name, author_id, created_at')
        .eq('review_type', 'host')
        .eq('target_id', hostIdForReviews)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) { console.error('host reviews fetch:', error); setHostReviews([]); return; }
      setHostReviews(data || []);
    })();
    return () => { cancelled = true; };
  }, [hostIdForReviews]);

  if (!listing) return null;
  const l = {
    photos: [], rating: 0, reviews: 0, favorite: false, location: "Sin ubicación",
    vehicleTypes: [], security: [], amenities: [], rules: [],
    dimensions: { width: "", length: "", height: "" },
    host: { name: "Anfitrión", avatar: null, photo: null, superhost: false },
    price: 0, priceUnit: "hora", access: "", cancellation: "flexible",
    title: "", description: "", address: "", ev: false,
    ...listing,
    // Ensure nested objects have defaults even if listing has partial data
    host: { name: "Anfitrión", avatar: null, photo: null, superhost: false, ...(listing.host || {}) },
    dimensions: { width: "", length: "", height: "", ...(listing.dimensions || {}) },
  };
  // Rules are now guaranteed to be an array from ListingsContext, but we keep a safety check
  const rules = Array.isArray(l.rules) ? l.rules : [];
  const sidePhotos = Array.isArray(l.photos) ? l.photos.slice(1, 5) : [];
  const reviews = Array.isArray(l.reviewsList) ? l.reviewsList : [];
  const isOwner = user && l.host?.userId && String(l.host.userId) === String(user.id);
  const hostId = l.host?.userId || null;
  const hostAvgRating = (Array.isArray(hostReviews) && hostReviews.length > 0)
    ? +(hostReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / hostReviews.length).toFixed(2)
    : 0;

  const handleSubmitHostReview = async () => {
    if (!hostReviewText.trim() || !user || !hostId) return;
    try {
      const { data, error } = await supabase.from('reviews').insert({
        review_type: 'host',
        target_id: hostId,
        listing_id: listing.id,
        author_id: user.id,
        author_name: `${user.firstName || ''} ${user.lastNameP || ''}`.trim(),
        rating: hostReviewRating,
        comment: hostReviewText.trim(),
      }).select().single();
      if (error) { console.error(error); alert('No se pudo publicar la reseña.'); return; }
      setHostReviews(prev => [data, ...prev]);
      setHostReviewText("");
      setHostReviewRating(5);
    } catch(err) { console.error(err); }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || !user) return;
    try {
      const { data: inserted, error } = await supabase.from('reviews').insert({
        review_type: 'listing',
        listing_id: listing.id,
        author_id: user.id,
        author_name: `${user.firstName || ""} ${user.lastNameP || ""}`.trim(),
        rating: reviewRating,
        comment: reviewText.trim(),
      }).select().single();
      if (error) { console.error(error); alert('No se pudo publicar la reseña.'); return; }
      // Optimistic update
      const newReview = inserted || { author_name: `${user.firstName || ""} ${user.lastNameP || ""}`.trim(), author_id: user.id, rating: reviewRating, comment: reviewText.trim(), created_at: new Date().toISOString() };
      const updatedReviews = [...reviews, newReview];
      const sum = updatedReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
      const newRating = updatedReviews.length > 0 ? +(sum / updatedReviews.length).toFixed(2) : 0;
      if (setListings) setListings(prev => prev.map(x => x.id === listing.id ? { ...x, reviewsList: updatedReviews, rating: newRating, reviews_count: updatedReviews.length } : x));
      setReviewText("");
      setReviewRating(5);
      // Notify host
      const ownerId = l.host?.userId;
      if (ownerId && ownerId !== user.id) {
        try {
          await pushNotification({
            userId: ownerId,
            type: 'review',
            title: 'Nueva reseña en tu estacionamiento',
            body: `${user.firstName || 'Alguien'} dejó una reseña de ${reviewRating} estrellas en ${l.title || 'tu estacionamiento'}.`,
            link: 'profile',
          });
        } catch(notifErr) { console.error('notify host review:', notifErr); }
      }
      // Refetch to keep everything in sync
      if (fetchListings) { try { await fetchListings(); } catch(e) { console.error(e); } }
    } catch(err) { console.error(err); }
  };

  return (
    <div>
      {galleryOpen && <PhotoGallery photos={l.photos} onClose={() => setGalleryOpen(false)} />}
      {showBookingConfirm && (
        <Modal open title="Confirmar reserva" onClose={() => setShowBookingConfirm(false)}>
          <BookingConfirmation
            listing={l}
            user={user}
            selectedModality={selectedModality}
            availableModalities={availableModalities}
            bookingHours={bookingHours}
            bookingDate={bookingDates.start}
            bookingEndDate={bookingDates.end}
            monthlyStartDate={monthlyStartDate}
            monthlyEndMonth={monthlyEndMonth}
            vehicleInfo={getSelectedVehicle()}
            onBooking={onBooking}
            onClose={() => { setShowBookingConfirm(false); onNavigate("home"); }}
            onUpdateUser={onUpdateUser}
          />
        </Modal>
      )}

      <Modal
        open={hostReviewsModalOpen}
        onClose={() => { setHostReviewsModalOpen(false); setHostReviewsShown(5); }}
        title={hostReviews.length > 0 ? `${hostAvgRating} ★ · ${hostReviews.length} reseña${hostReviews.length !== 1 ? "s" : ""} sobre ${l.host.name}` : `Reseñas sobre ${l.host.name}`}
        wide
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
          {hostReviews.length === 0 ? (
            <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Este anfitrión todavía no tiene reseñas. ¡Sé el primero en dejar una!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {hostReviews.slice(0, hostReviewsShown).map((r) => (
                <div key={r.id} style={{ paddingBottom: 14, borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Avatar src={null} name={r.author_name || "Usuario"} size={40} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{r.author_name || "Usuario"}</div>
                      <div style={{ color: "#555", fontSize: 13 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "#222" : "none"} stroke="#222" />)}</div>
                  {r.comment && <p style={{ fontSize: 15, color: "#333", lineHeight: 1.55, margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
              {hostReviews.length > hostReviewsShown && (
                <Btn outline style={{ alignSelf: "flex-start" }} onClick={() => setHostReviewsShown(n => n + 5)}>Ver más reseñas ({hostReviews.length - hostReviewsShown} restantes)</Btn>
              )}
            </div>
          )}
        </div>

        {user && !isOwner && hostId && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
            <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, marginTop: 0 }}>Deja una reseña al anfitrión</h4>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={24} fill={s <= hostReviewRating ? "#222" : "none"} stroke="#222" style={{ cursor: "pointer" }} onClick={() => setHostReviewRating(s)} />
              ))}
            </div>
            <textarea
              value={hostReviewText}
              onChange={e => setHostReviewText(e.target.value)}
              placeholder={`¿Cómo fue tu experiencia con ${l.host.name}?`}
              rows={3}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: "#222" }}
            />
            <Btn primary onClick={async () => { await handleSubmitHostReview(); }} style={{ marginTop: 12 }} disabled={!hostReviewText.trim()}>Publicar reseña</Btn>
          </div>
        )}
      </Modal>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 24px 80px" }}>
        {/* Back button */}
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 500, marginBottom: 20, color: "#222", padding: 0 }}>
          <ArrowLeft size={18} /> Volver a resultados
        </button>
        {/* Title */}
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{l.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <StarRating rating={l.rating} />
          <span style={{ color: "#555", fontSize: 14 }}>· {reviews.length} reseñas</span>
          {l.host.superhost && <Badge><Award size={12} /> Superanfitrión</Badge>}
          <span style={{ color: "#555", fontSize: 14 }}>· <span style={{ textDecoration: "underline", fontWeight: 500 }}>{l.location}</span></span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <div style={{ position: "relative" }}>
                {shareToast && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#222", color: "#fff", padding: "4px 12px", borderRadius: 8, fontSize: 12, whiteSpace: "nowrap", zIndex: 10 }}>¡Link copiado!</div>
                )}
                <Btn small outline onClick={handleShare}><Share2 size={15} /> Compartir</Btn>
              </div>
              {user && !isOwner && (
                <Btn small outline onClick={handleToggleSave} style={{ color: isSaved ? "#e11d48" : "inherit", borderColor: isSaved ? "#e11d48" : undefined }}>
                  <Heart size={15} fill={isSaved ? "#e11d48" : "none"} stroke={isSaved ? "#e11d48" : "currentColor"} /> {isSaved ? "Guardado" : "Guardar"}
                </Btn>
              )}
            </div>
        </div>

        {/* Photo Grid */}
        {l.photos.length > 0 ? (
          <>
            <div onClick={() => setGalleryOpen(true)} style={{ display: "grid", gridTemplateColumns: sidePhotos.length > 0 ? "1fr 1fr" : "1fr", gap: 8, borderRadius: 16, overflow: "hidden", cursor: "pointer", maxHeight: 420 }}>
              <div style={{ gridRow: sidePhotos.length > 0 ? "1 / 3" : undefined }}>
                <img src={l.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {sidePhotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: sidePhotos.length >= 2 ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {sidePhotos.map((p, i) => (
                    <div key={i} style={{ overflow: "hidden" }}>
                      <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 120 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <Btn small outline onClick={() => setGalleryOpen(true)}><Grid size={14} /> Mostrar todas las fotos</Btn>
            </div>
          </>
        ) : (
          <div style={{ background: "#f7f7f7", borderRadius: 16, height: 320, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, border: "1px solid #eee" }}>
            <Camera size={48} color="#bbb" />
            <span style={{ color: "#999", fontSize: 16 }}>Sin fotos disponibles</span>
          </div>
        )}

        {/* Content + Booking */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, marginTop: 32 }}>
          {/* Left */}
          <div>
            {/* Host info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #eee" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Estacionamiento de {l.host.name}</h2>
                  {hostReviews.length > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: "#222", background: "#f0f0f0", padding: "3px 10px", borderRadius: 999 }} title="Calificación del anfitrión">
                      <Star size={13} fill="#222" stroke="none" />
                      <span style={{ fontWeight: 700 }}>{hostAvgRating}</span>
                      <span style={{ color: "#555" }}>({hostReviews.length})</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setHostReviewsModalOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 13, fontWeight: 600, color: BRAND_COLOR,
                      background: "#fff", border: `1px solid ${BRAND_COLOR}55`,
                      padding: "5px 12px", borderRadius: 999, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {hostReviews.length > 0 ? "Ver reseñas" : "Dejar reseña"}
                  </button>
                </div>
                <div style={{ color: "#555", fontSize: 15, marginTop: 6 }}>{l.vehicleTypes.join(" · ")} · {l.type === "covered" ? "Techado" : "Aire libre"} · {l.dimensions.width}m × {l.dimensions.length}m{l.dimensions.height ? ` × ${l.dimensions.height}m alto` : ""}</div>
              </div>
              <Avatar src={l.host.avatar} name={l.host.name} size={56} badge={l.host.superhost} />
            </div>

            {/* Highlights */}
            <div style={{ padding: "24px 0", borderBottom: "1px solid #eee", display: "flex", flexDirection: "column", gap: 20 }}>
              {l.host.superhost && (
                <div style={{ display: "flex", gap: 16 }}>
                  <Award size={24} />
                  <div><div style={{ fontWeight: 600 }}>{l.host.name} es Superanfitrión</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Los Superanfitriones son propietarios con experiencia y excelentes reseñas.</div></div>
                </div>
              )}
              <div style={{ display: "flex", gap: 16 }}>
                <MapPin size={24} />
                <div><div style={{ fontWeight: 600 }}>Excelente ubicación</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>{l.address}</div></div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {l.access === "Control remoto" ? <Wifi size={24} /> : l.access === "App móvil" ? <Phone size={24} /> : <Lock size={24} />}
                <div><div style={{ fontWeight: 600 }}>Acceso: {l.access}</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Ingresa al estacionamiento de forma {l.access === "Manual (anfitrión abre)" ? "coordinada con el anfitrión" : "autónoma"}.</div></div>
              </div>
              {l.cancellation === "flexible" && (
                <div style={{ display: "flex", gap: 16 }}>
                  <Calendar size={24} />
                  <div><div style={{ fontWeight: 600 }}>Cancelación flexible</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Cancelación gratuita hasta 24 horas antes del inicio.</div></div>
                </div>
              )}
            </div>



            {/* Description */}
            <div style={{ padding: "24px 0", borderBottom: "1px solid #eee" }}>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#222" }}>{l.description}</p>
            </div>

            {/* Dimensions */}
            <div style={{ padding: "24px 0", borderBottom: "1px solid #eee" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Dimensiones del espacio</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: BRAND_COLOR }}>{l.dimensions.width}m</div>
                  <div style={{ color: "#555", fontSize: 14, marginTop: 4 }}>Ancho</div>
                </div>
                <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: BRAND_COLOR }}>{l.dimensions.length}m</div>
                  <div style={{ color: "#555", fontSize: 14, marginTop: 4 }}>Largo</div>
                </div>
                <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: BRAND_COLOR }}>{l.dimensions.height ? `${l.dimensions.height}m` : "∞"}</div>
                  <div style={{ color: "#555", fontSize: 14, marginTop: 4 }}>Altura máx.</div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div style={{ padding: "24px 0", borderBottom: "1px solid #eee" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Lo que ofrece este lugar</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(showAllAmenities ? l.amenities : l.amenities.slice(0, 6)).map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                    {a.includes("EV") || a.includes("Carga") ? <Zap size={22} /> : a.includes("Cámara") || a.includes("Vigilancia") || a.includes("Seguridad") || a.includes("Alarm") ? <Shield size={22} /> : a.includes("Iluminado") || a.includes("LED") ? <Sun size={22} /> : <Check size={22} />}
                    <span style={{ fontSize: 15 }}>{a}</span>
                  </div>
                ))}
              </div>
              {l.amenities.length > 6 && !showAllAmenities && (
                <Btn outline style={{ marginTop: 16 }} onClick={() => setShowAllAmenities(true)}>Mostrar las {l.amenities.length} comodidades</Btn>
              )}
            </div>

            {/* Reviews */}
            <div style={{ padding: "24px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Star size={22} fill="#222" stroke="none" />
                <span style={{ fontSize: 22, fontWeight: 700 }}>{reviews.length > 0 ? `${l.rating} · ${reviews.length} reseña${reviews.length !== 1 ? "s" : ""}` : "Reseñas"}</span>
              </div>
              {reviews.length === 0 ? (
                <p style={{ fontSize: 14, color: "#555" }}>Este estacionamiento aún no tiene reseñas.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: reviews.length === 1 ? "1fr" : "1fr 1fr", gap: 20 }}>
                  {reviews.slice(0, reviewsShown).map((r, i) => (
                    <div key={i} style={{ padding: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Avatar src={null} name={r.author_name || r.authorName || "Usuario"} size={40} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{r.author_name || r.authorName || "Usuario"}</div>
                          <div style={{ color: "#555", fontSize: 13 }}>{(r.created_at || r.date) ? new Date(r.created_at || r.date).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "#222" : "none"} stroke="#222" />)}</div>
                      <p style={{ fontSize: 15, color: "#333", lineHeight: 1.55, margin: 0 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              {reviews.length > reviewsShown && (
                <Btn outline style={{ marginTop: 20 }} onClick={() => setReviewsShown(n => n + 5)}>Ver más reseñas ({reviews.length - reviewsShown} restantes)</Btn>
              )}

              {/* Review form — only for logged-in users who are NOT the owner */}
              {user && !isOwner && (
                <div style={{ marginTop: 24, padding: 20, background: "#f7f7f7", borderRadius: 12 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Deja tu reseña</h4>
                  <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={24} fill={s <= reviewRating ? "#222" : "none"} stroke="#222" style={{ cursor: "pointer" }} onClick={() => setReviewRating(s)} />
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Comparte tu experiencia con este estacionamiento..." rows={3} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: "#222" }} />
                  <Btn primary onClick={handleSubmitReview} style={{ marginTop: 12 }} disabled={!reviewText.trim()}>Publicar reseña</Btn>
                </div>
              )}
            </div>

            {/* Rules */}
            <div style={{ padding: "24px 0" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Reglas del espacio</h3>
              {l.rules.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < l.rules.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <Info size={16} color="#555" />
                  <span style={{ fontSize: 15 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Booking Widget / Owner Metrics */}
          <div>
            {isOwner ? (() => {
              const listingBookings = bookings.filter(b => String(b.listingId || b.listing_id) === String(listing.id));
              const confirmed = listingBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
              const pending = listingBookings.filter(b => b.status === 'pending_approval');
              const completed = listingBookings.filter(b => b.status === 'completed');
              const totalRevenue = listingBookings
                .filter(b => b.status !== 'cancelled' && b.status !== 'rejected')
                .reduce((s, b) => s + (Number(b.total) || 0), 0);
              const uniqueConductors = new Set(listingBookings.map(b => b.conductorId || b.conductor_id).filter(Boolean)).size;
              const ratingAvg = reviews.length > 0
                ? +(reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(2)
                : 0;

              return (
                <div style={{ border: "1px solid #e0e0e0", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ padding: "20px 24px", background: BRAND_GRADIENT, color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <TrendingUp size={18} />
                      <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>Panel del anfitrión</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Tu publicación</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Solo tú puedes ver estas métricas</div>
                  </div>

                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <DollarSign size={13} /> Ingresos totales
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{formatCLP(totalRevenue)}</div>
                      </div>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <Calendar size={13} /> Reservas totales
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{listingBookings.length}</div>
                      </div>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <Check size={13} /> Confirmadas
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#008A05" }}>{confirmed.length}</div>
                      </div>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <Clock size={13} /> Pendientes
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#c76d00" }}>{pending.length}</div>
                      </div>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <Star size={13} /> Calificación
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{ratingAvg || "—"} <span style={{ fontSize: 12, color: "#555", fontWeight: 400 }}>({reviews.length})</span></div>
                      </div>
                      <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555", fontSize: 12, marginBottom: 4 }}>
                          <Eye size={13} /> Conductores únicos
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{uniqueConductors}</div>
                      </div>
                    </div>

                    <div style={{ padding: "12px 14px", background: "#fff7ed", borderRadius: 12, border: "1px solid #fed7aa", fontSize: 13, color: "#78350f" }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>Precios publicados</div>
                      {Number(listing.price) > 0 && <div>· Hora: {formatCLP(listing.price)}</div>}
                      {Number(listing.priceDaily) > 0 && <div>· Día: {formatCLP(listing.priceDaily)}</div>}
                      {Number(listing.priceMonthly) > 0 && <div>· Mes: {formatCLP(listing.priceMonthly)}</div>}
                    </div>

                    {completed.length > 0 && (
                      <div style={{ fontSize: 12, color: "#555" }}>
                        {completed.length} reserva{completed.length !== 1 ? "s" : ""} completada{completed.length !== 1 ? "s" : ""}
                      </div>
                    )}

                    <Btn
                      primary
                      full
                      onClick={() => { if (onEditListing) onEditListing(listing); }}
                      style={{ padding: "14px 24px", fontSize: 16, borderRadius: 12 }}
                    >
                      <Edit size={18} /> Editar publicación
                    </Btn>
                  </div>
                </div>
              );
            })() : (() => {
              const mod = availableModalities.find(m => m.id === selectedModality) || availableModalities[0] || { price: l.price, id: l.priceUnit };
              const modPrice = mod.price;
              const modUnit = mod.id;

              let widgetSubtotal = modPrice;
              let widgetQtyLabel = `${formatCLP(modPrice)} × 1 ${modUnit}`;
              if (modUnit === "hora") {
                const hrs = calcHourlyTotal();
                widgetSubtotal = Math.round(hrs * modPrice);
                widgetQtyLabel = hrs > 0 ? `${formatCLP(modPrice)} × ${hrs.toLocaleString("es-CL", { maximumFractionDigits: 1 })} hora${hrs !== 1 ? "s" : ""}` : `${formatCLP(modPrice)} × 0 horas`;
              } else if (modUnit === "mes") {
                const mb = calcMonthlyBreakdown();
                widgetSubtotal = mb.totalAmount;
                widgetQtyLabel = mb.fullMonths > 0
                  ? `Prorrateo ${mb.prorrateDays}d + ${mb.fullMonths} mes${mb.fullMonths > 1 ? "es" : ""}`
                  : mb.prorrateDays > 0 ? `Prorrateo ${mb.prorrateDays} días` : `${formatCLP(modPrice)} × 1 mes`;
              }
              const widgetFee = Math.round(widgetSubtotal * 0.05);
              const widgetTotal = widgetSubtotal + widgetFee;

              const selectedVehicle = getSelectedVehicle();
              const hasDateFilled = modUnit === "hora" ? !!bookingDates.start : modUnit === "día" ? !!bookingDates.start : !!monthlyStartDate;
              const hasVehicleFilled = !!selectedVehicle.name;

              // Dimension warning: the selected vehicle has measurements that
              // don't fit in the listing's declared space. Non-blocking: informative.
              const listingW = Number(l.dimensions?.width) || null;
              const listingL = Number(l.dimensions?.length) || null;
              const listingH = Number(l.dimensions?.height) || null;
              const vW = Number(selectedVehicle.width) || null;
              const vL = Number(selectedVehicle.length) || null;
              const vH = Number(selectedVehicle.height) || null;
              const overWidth = !!(vW && listingW && vW > listingW);
              const overLength = !!(vL && listingL && vL > listingL);
              const overHeight = !!(vH && listingH && vH > listingH);
              const sizeWarning = (overWidth || overLength || overHeight) ? {
                overWidth, overLength, overHeight, listingW, listingL, listingH, vW, vL, vH,
              } : null;

              return (
                <div style={{ border: "1px solid #e0e0e0", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  {/* Header — always visible, acts as CTA */}
                  <div style={{ padding: "20px 24px", background: bookingStep === 0 ? "#fafafa" : "#fff" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: availableModalities.length > 1 ? 14 : 0 }}>
                      <div>
                        <span style={{ fontSize: 24, fontWeight: 700 }}>{formatCLP(modPrice)}</span>
                        <span style={{ color: "#777", fontSize: 15 }}> / {modUnit}</span>
                      </div>
                      {bookingStep > 0 && (
                        <button onClick={() => setBookingStep(0)} style={{ background: "none", border: "none", fontSize: 13, color: BRAND_COLOR, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Minimizar</button>
                      )}
                    </div>
                    {availableModalities.length > 1 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {availableModalities.map(m => (
                          <Pill key={m.id} active={selectedModality === m.id} onClick={() => { setSelectedModality(m.id); if (bookingStep === 0) setBookingStep(1); }}>{m.label}</Pill>
                        ))}
                      </div>
                    )}
                    {bookingStep === 0 && (
                      <Btn primary full onClick={() => setBookingStep(1)} style={{ marginTop: 16, padding: "14px 24px", fontSize: 16, borderRadius: 12 }}>
                        <Calendar size={18} /> Elegir fecha y reservar
                      </Btn>
                    )}
                  </div>

                  {/* Step 1 — Date & Time */}
                  {bookingStep >= 1 && (
                    <div style={{ padding: "0 24px 20px", borderTop: "1px solid #f0f0f0" }}>
                      <button onClick={() => setBookingStep(bookingStep === 1 ? 0 : 1)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "16px 0 12px", margin: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: hasDateFilled ? BRAND_COLOR : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {hasDateFilled ? <Check size={14} color="#fff" /> : <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>1</span>}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>Fecha y horario</span>
                        </div>
                        {hasDateFilled && bookingStep !== 1 && (
                          <span style={{ fontSize: 13, color: "#777" }}>
                            {modUnit === "hora" && bookingDates.start ? `${new Date(bookingDates.start + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} ${bookingHours.startH}:${bookingHours.startM} - ${bookingDates.end ? new Date(bookingDates.end + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" }) : ""} ${bookingHours.endH}:${bookingHours.endM}` : modUnit === "mes" && monthlyStartDate ? `Desde ${new Date(monthlyStartDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}` : "Configurado"}
                          </span>
                        )}
                        <ChevronDown size={16} color="#999" style={{ transform: bookingStep === 1 ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
                      </button>

                      {bookingStep === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 4 }}>
                          {modUnit === "hora" && (
                            <>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div>
                                  <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Fecha de entrada</label>
                                  <input type="date" value={bookingDates.start} onChange={e => setBookingDates({ ...bookingDates, start: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = BRAND_COLOR} onBlur={e => e.target.style.borderColor = "#ddd"} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Fecha de salida</label>
                                  <input type="date" value={bookingDates.end} onChange={e => setBookingDates({ ...bookingDates, end: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = BRAND_COLOR} onBlur={e => e.target.style.borderColor = "#ddd"} />
                                </div>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <TimePicker label="Hora inicio" value={`${bookingHours.startH}:${bookingHours.startM}`} onChange={v => { const [h, m] = v.split(":"); setBookingHours({ ...bookingHours, startH: h, startM: m }); }} disabledHours={busyHoursForStart} />
                                <TimePicker label="Hora fin" value={`${bookingHours.endH}:${bookingHours.endM}`} onChange={v => { const [h, m] = v.split(":"); setBookingHours({ ...bookingHours, endH: h, endM: m }); }} disabledHours={busyHoursForEnd} />
                              </div>
                            </>
                          )}
                          {modUnit === "día" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              <div style={{ background: "#f8f8f8", border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
                                <span style={{ fontWeight: 600, fontSize: 13, color: "#555" }}>Regla de horario de uso diario: </span>
                                <span style={{ fontSize: 13, color: BRAND_COLOR, fontWeight: 600 }}>De {l.dimensions?.dailyStart || "06:00"} a {l.dimensions?.dailyEnd || "22:00"}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div>
                                  <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Fecha de entrada</label>
                                  <input type="date" value={bookingDates.start} onChange={e => setBookingDates({ ...bookingDates, start: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Fecha de salida</label>
                                  <input type="date" value={bookingDates.end} onChange={e => setBookingDates({ ...bookingDates, end: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }} />
                                </div>
                              </div>
                              <div>
                                <TimePicker label="Hora estimada de llegada" value={`${bookingHours.arrivalH}:${bookingHours.arrivalM}`} onChange={v => { const [h, m] = v.split(":"); setBookingHours({ ...bookingHours, arrivalH: h, arrivalM: m }); }} />
                              </div>
                            </div>
                          )}
                          {modUnit === "mes" && (
                            <>
                              <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Fecha de inicio</label>
                                <input type="date" value={monthlyStartDate} onChange={e => setMonthlyStartDate(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>Mes de término</label>
                                <select value={monthlyEndMonth} onChange={e => setMonthlyEndMonth(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }}>
                                  <option value="">Mismo mes de inicio</option>
                                  {Array.from({ length: 12 }, (_, i) => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() + i);
                                    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                                    const label = d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
                                    return <option key={val} value={val}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>;
                                  })}
                                </select>
                              </div>
                            </>
                          )}
                          <Btn primary full onClick={() => setBookingStep(2)} style={{ borderRadius: 12, marginTop: 4 }}>Continuar</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 — Vehicle */}
                  {bookingStep >= 2 && (
                    <div style={{ padding: "0 24px 20px", borderTop: "1px solid #f0f0f0" }}>
                      <button onClick={() => setBookingStep(bookingStep === 2 ? 1 : 2)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "16px 0 12px", margin: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: hasVehicleFilled ? BRAND_COLOR : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {hasVehicleFilled ? <Check size={14} color="#fff" /> : <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>2</span>}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>Vehículo</span>
                        </div>
                        {hasVehicleFilled && bookingStep !== 2 && (
                          <span style={{ fontSize: 13, color: "#777" }}>{selectedVehicle.name}{selectedVehicle.plate ? ` · ${selectedVehicle.plate}` : ""}</span>
                        )}
                        <ChevronDown size={16} color="#999" style={{ transform: bookingStep === 2 ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
                      </button>

                      {bookingStep === 2 && (
                        <div style={{ paddingBottom: 4 }}>
                          {userVehicles.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                              {userVehicles.map(v => (
                                <div key={v.id} onClick={() => setSelectedVehicleId(v.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: selectedVehicleId === v.id ? `2px solid ${BRAND_COLOR}` : "1px solid #ddd", cursor: "pointer", background: selectedVehicleId === v.id ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: selectedVehicleId === v.id ? `5px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</div>
                                    <div style={{ fontSize: 12, color: "#777" }}>{v.type}{v.plate ? ` · ${v.plate}` : ""}</div>
                                  </div>
                                </div>
                              ))}
                              <div onClick={() => setSelectedVehicleId("custom")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: selectedVehicleId === "custom" ? `2px solid ${BRAND_COLOR}` : "1px solid #ddd", cursor: "pointer", background: selectedVehicleId === "custom" ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: selectedVehicleId === "custom" ? `5px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                                <div style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>Otro vehículo</div>
                              </div>
                            </div>
                          )}
                          {(selectedVehicleId === "custom" || userVehicles.length === 0) && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <input placeholder="Nombre del vehículo (ej: Toyota Corolla)" value={customVehicleName} onChange={e => setCustomVehicleName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }} />
                              <input placeholder="Patente (ej: ABCD-12)" value={customVehiclePlate} onChange={e => setCustomVehiclePlate(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#222", outline: "none", boxSizing: "border-box" }} />
                            </div>
                          )}
                          {sizeWarning && (
                            <div style={{ marginTop: 12, background: "#fef7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <Info size={16} color="#c2410c" style={{ marginTop: 2, flexShrink: 0 }} />
                              <div style={{ fontSize: 13, color: "#7c2d12", lineHeight: 1.45 }}>
                                <strong>Tu vehículo podría no caber en este estacionamiento.</strong>
                                <div style={{ marginTop: 4 }}>
                                  {sizeWarning.overWidth && (
                                    <div>• Es demasiado <b>ancho</b>: tu vehículo mide {sizeWarning.vW}m y el espacio tiene {sizeWarning.listingW}m de ancho.</div>
                                  )}
                                  {sizeWarning.overLength && (
                                    <div>• Es demasiado <b>largo</b>: tu vehículo mide {sizeWarning.vL}m y el espacio tiene {sizeWarning.listingL}m de largo.</div>
                                  )}
                                  {sizeWarning.overHeight && (
                                    <div>• Es demasiado <b>alto</b>: tu vehículo mide {sizeWarning.vH}m y el espacio tiene {sizeWarning.listingH}m de alto.</div>
                                  )}
                                </div>
                                <div style={{ marginTop: 6, fontSize: 12, color: "#9a3412" }}>
                                  Puedes continuar con la reserva, pero cualquier daño o imposibilidad de ingresar al espacio queda <b>bajo tu responsabilidad</b>.
                                </div>
                              </div>
                            </div>
                          )}
                          <Btn primary full onClick={() => setBookingStep(3)} style={{ borderRadius: 12, marginTop: 12 }} disabled={!hasVehicleFilled}>Continuar</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3 — Summary + Reserve */}
                  {bookingStep >= 3 && (
                    <div style={{ padding: "0 24px 24px", borderTop: "1px solid #f0f0f0" }}>
                      <div style={{ padding: "16px 0 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: BRAND_COLOR, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>3</span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>Resumen</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#555" }}>{widgetQtyLabel}</span>
                          <span>{formatCLP(widgetSubtotal)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#555" }}>Tarifa de servicio</span>
                          <span>{formatCLP(widgetFee)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #eee", paddingTop: 12, marginTop: 4 }}>
                          <span>Total</span>
                          <span>{formatCLP(widgetTotal)}</span>
                        </div>
                      </div>
                      {currentSelectionConflict && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <Lock size={14} color="#b91c1c" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.4 }}>
                            <strong>Periodo no disponible.</strong> Se solapa con: {formatBusyLabel(currentSelectionConflict)}. Ajusta tu horario para poder reservar.
                          </div>
                        </div>
                      )}
                      {sizeWarning && (
                        <div style={{ background: "#fef7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <Info size={14} color="#c2410c" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div style={{ fontSize: 12, color: "#7c2d12", lineHeight: 1.4 }}>
                            <strong>Atención:</strong> tu vehículo excede las medidas del espacio ({[sizeWarning.overWidth && "ancho", sizeWarning.overLength && "largo", sizeWarning.overHeight && "alto"].filter(Boolean).join(", ")}). Continúas bajo tu responsabilidad.
                          </div>
                        </div>
                      )}
                      <Btn primary full onClick={() => setShowBookingConfirm(true)} disabled={!!currentSelectionConflict} style={{ padding: "14px 24px", fontSize: 16, borderRadius: 12 }}>Reservar</Btn>
                      <p style={{ textAlign: "center", color: "#999", fontSize: 12, marginTop: 10 }}>No se hará ningún cargo aún</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
