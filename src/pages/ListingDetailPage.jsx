import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Star, Heart, Share2, Camera, MapPin, Calendar, Shield, Zap, Lock, Wifi, Sun, Phone, Award, Check, Grid, Info, ChevronDown, Car, Clock, Edit, TrendingUp, DollarSign, Eye } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";
import { formatCLP } from "../utils/format";
import { StarRating, Avatar, Badge, Btn, Pill, Modal } from "../components/ui";
import PhotoGallery from "../components/PhotoGallery";
import BookingConfirmation from "../components/BookingConfirmation";
import LastMileNavigation from "../components/navigation/LastMileNavigation";
import { supabase } from "../lib/supabase";
import { useNotifications } from "../contexts/NotificationsContext";
import { useListings } from "../contexts/ListingsContext";

/* ── Busy intervals helpers ── */
const BLOCKING_STATUSES = new Set(["pending", "confirmed", "cash_unpaid", "completed"]);

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
      {label && <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>{label}</label>}
      <button type="button" onClick={() => setOpen(!open)} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: open ? `1px solid ${BRAND_COLOR}` : `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box", transition: "border .2s", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
          <Clock size={15} color={COLORS.light} />
          <span>{displayTime}</span>
        </div>
        <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: isPM ? "#c2610c" : "#2563eb", background: isPM ? "#fff7ed" : "#eff6ff", padding: "2px 8px", borderRadius: RADIUS.xl }}>{ampmLabel}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50, background: "#fff", borderRadius: RADIUS.xl, border: `1px solid ${COLORS.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.12)", overflow: "hidden", display: "flex" }}>
          <div ref={hoursRef} style={{ flex: 1, maxHeight: 220, overflowY: "auto", borderRight: `1px solid ${COLORS.border}`, scrollbarWidth: "thin" }}>
            {Array.from({ length: 24 }, (_, i) => {
              const isAM = i < 12;
              const active = i === h;
              const isBusy = disabledHours && disabledHours.has(i);
              const bg = isBusy ? "#fef2f2" : (active ? (isAM ? "#eff6ff" : "#fff7ed") : "transparent");
              const color = isBusy ? COLORS.danger : (active ? (isAM ? "#1d4ed8" : "#c2610c") : (isAM ? "#475569" : "#78350f"));
              return (
                <button key={i} data-active={active} disabled={isBusy} onClick={() => { if (!isBusy) pick(i, m); }} title={isBusy ? "Periodo reservado" : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: `${SPACING.sm}px 14px`, border: "none", cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: FONT_SIZE.md, fontWeight: active ? FONT_WEIGHT.bold : (isBusy ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal), background: bg, color, textDecoration: isBusy ? "line-through" : "none", transition: "background .1s", borderLeft: active ? `3px solid ${isAM ? "#3b82f6" : "#f59e0b"}` : (isBusy ? "3px solid #ef4444" : "3px solid transparent") }}>
                  <span>{String(i).padStart(2, "0")}h{isBusy ? " · Reservado" : ""}</span>
                  {active && !isBusy && <Check size={13} />}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {["00", "15", "30", "45"].map(min => {
              const active = parseInt(min) === m;
              return (
                <button key={min} onClick={() => { pick(h, parseInt(min)); setOpen(false); }} style={{ flex: 1, padding: `14px ${SPACING.sm}px`, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: FONT_SIZE.md, fontWeight: active ? FONT_WEIGHT.bold : FONT_WEIGHT.normal, background: active ? "#f8f8f8" : "transparent", color: active ? COLORS.text : COLORS.light, transition: "background .1s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>:{min}</span>
                  {active && <Check size={13} color={COLORS.text} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ListingDetailPage = ({ listing, onBack, onNavigate, user, setListings, onUpdateUser, onBooking, onEditListing, bookings = [] }) => {
  const { pushNotification } = useNotifications();
  const { fetchListings } = useListings();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [bookingDates, setBookingDates] = useState({ start: "", end: "" });
  const [hourlyMode, setHourlyMode] = useState("same_day");
  const [bookingHours, setBookingHours] = useState(() => {
    const now = new Date();
    const rawM = now.getMinutes();
    const roundedM = Math.ceil(rawM / 15) * 15;
    const sh = roundedM >= 60 ? (now.getHours() + 1) % 24 : now.getHours();
    const sm = roundedM >= 60 ? 0 : roundedM;
    const eh = (sh + 2) % 24;
    const pad = n => String(n).padStart(2, "0");
    return { startH: pad(sh), startM: pad(sm), endH: pad(eh), endM: pad(sm), arrivalH: pad(sh), arrivalM: pad(sm) };
  });
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
  const [hostReviewsModalOpen, setHostReviewsModalOpen] = useState(false);
  const [hostReviewsShown, setHostReviewsShown] = useState(5);
  const [bookingStep, setBookingStep] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [customVehicleName, setCustomVehicleName] = useState("");
  const [customVehiclePlate, setCustomVehiclePlate] = useState("");

  // Loading & error states
  const [savingReview, setSavingReview] = useState(false);
  const [savingHostReview, setSavingHostReview] = useState(false);
  const [loadingHostReviews, setLoadingHostReviews] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [hostReviewError, setHostReviewError] = useState("");

  const userVehicles = user?.vehicles || [];
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
    try {
      toggleFavorite(listing.id);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      pushNotification?.("Error al guardar", "error");
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!hostIdForReviews) { setHostReviews([]); return; }
    (async () => {
      try {
        setLoadingHostReviews(true);
        const { data, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, author_name, author_id, created_at')
          .eq('review_type', 'host')
          .eq('target_id', hostIdForReviews)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) {
          console.error('host reviews fetch:', error);
          setHostReviews([]);
          return;
        }
        setHostReviews(data || []);
      } catch (err) {
        console.error('host reviews fetch exception:', err);
        if (!cancelled) setHostReviews([]);
      } finally {
        if (!cancelled) setLoadingHostReviews(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hostIdForReviews]);

  if (!listing) return null;
  const defaults = {
    photos: [], rating: 0, reviews: 0, favorite: false, location: "Sin ubicación",
    vehicleTypes: [], security: [], amenities: [], rules: [],
    dimensions: { width: "", length: "", height: "" },
    host: { name: "Anfitrión", avatar: null, photo: null, superhost: false },
    price: 0, priceUnit: "hora", access: "", cancellation: "flexible",
    title: "", description: "", address: "", ev: false,
  };
  const l = {
    ...defaults,
    ...listing,
    host: { ...defaults.host, ...(listing?.host || {}) },
    dimensions: { ...defaults.dimensions, ...(listing?.dimensions || {}) },
    rules: Array.isArray(listing?.rules) ? listing.rules : [],
  };
  const sidePhotos = Array.isArray(l.photos) ? l.photos.slice(1, 5) : [];
  const reviews = Array.isArray(l.reviewsList) ? l.reviewsList : [];
  const isOwner = user && l.host?.userId && String(l.host.userId) === String(user.id);
  const hostId = l.host?.userId || null;
  const hostAvgRating = (Array.isArray(hostReviews) && hostReviews.length > 0)
    ? +(hostReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / hostReviews.length).toFixed(2)
    : 0;

  const handleSubmitHostReview = async () => {
    if (!hostReviewText.trim() || !user || !hostId) return;
    setSavingHostReview(true);
    setHostReviewError("");
    try {
      const { data, error } = await supabase.from('reviews').insert({
        review_type: 'host',
        target_id: hostId,
        listing_id: listing.id,
        author_id: user.id,
        author_name: `${user.firstName || ''} ${user.lastName1 || ''}`.trim(),
        rating: hostReviewRating,
        comment: hostReviewText.trim(),
      }).select().single();
      if (error) {
        console.error('host review insert error:', error);
        setHostReviewError("No se pudo publicar la reseña. Intenta de nuevo.");
        pushNotification?.("Error al publicar reseña", "error");
        return;
      }
      setHostReviews(prev => [data, ...prev]);
      setHostReviewText("");
      setHostReviewRating(5);
      pushNotification?.("Reseña publicada", "success");
    } catch(err) {
      console.error('host review submit exception:', err);
      setHostReviewError("Error al publicar. Verifica tu conexión.");
      pushNotification?.("Error al publicar reseña", "error");
    } finally {
      setSavingHostReview(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || !user) return;
    setSavingReview(true);
    setReviewError("");
    try {
      const { data: inserted, error } = await supabase.from('reviews').insert({
        review_type: 'listing',
        listing_id: listing.id,
        author_id: user.id,
        author_name: `${user.firstName || ""} ${user.lastName1 || ""}`.trim(),
        rating: reviewRating,
        comment: reviewText.trim(),
      }).select().single();
      if (error) {
        console.error('review insert error:', error);
        setReviewError("No se pudo publicar la reseña. Intenta de nuevo.");
        pushNotification?.("Error al publicar reseña", "error");
        return;
      }
      const newReview = inserted || { author_name: `${user.firstName || ""} ${user.lastName1 || ""}`.trim(), author_id: user.id, rating: reviewRating, comment: reviewText.trim(), created_at: new Date().toISOString() };
      const updatedReviews = [...reviews, newReview];
      const sum = updatedReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
      const newRating = updatedReviews.length > 0 ? +(sum / updatedReviews.length).toFixed(2) : 0;
      if (setListings) setListings(prev => prev.map(x => x.id === listing.id ? { ...x, reviewsList: updatedReviews, rating: newRating, reviews_count: updatedReviews.length } : x));
      setReviewText("");
      setReviewRating(5);
      pushNotification?.("Reseña publicada", "success");
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
      if (fetchListings) {
        try { await fetchListings(); } catch(e) { console.error('refetch listings:', e); }
      }
    } catch(err) {
      console.error('review submit exception:', err);
      setReviewError("Error al publicar. Verifica tu conexión.");
      pushNotification?.("Error al publicar reseña", "error");
    } finally {
      setSavingReview(false);
    }
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
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: SPACING.sm }}>
          {loadingHostReviews ? (
            <p style={{ fontSize: FONT_SIZE.md, color: COLORS.muted, margin: 0 }}>Cargando reseñas...</p>
          ) : hostReviews.length === 0 ? (
            <p style={{ fontSize: FONT_SIZE.md, color: COLORS.muted, margin: 0 }}>Este anfitrión todavía no tiene reseñas. ¡Sé el primero en dejar una!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {hostReviews.slice(0, hostReviewsShown).map((r) => (
                <div key={r.id} style={{ paddingBottom: SPACING.sm, borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.xs }}>
                    <Avatar src={null} name={r.author_name || "Usuario"} size={40} />
                    <div>
                      <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>{r.author_name || "Usuario"}</div>
                      <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.xs }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2, marginBottom: SPACING.xs }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? COLORS.text : "none"} stroke={COLORS.text} />)}</div>
                  {r.comment && <p style={{ fontSize: FONT_SIZE.md, color: "#333", lineHeight: 1.55, margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
              {hostReviews.length > hostReviewsShown && (
                <Btn outline style={{ alignSelf: "flex-start" }} onClick={() => setHostReviewsShown(n => n + 5)}>Ver más reseñas ({hostReviews.length - hostReviewsShown} restantes)</Btn>
              )}
            </div>
          )}
        </div>

        {user && !isOwner && hostId && (
          <div style={{ marginTop: SPACING.xl, paddingTop: SPACING.xl, borderTop: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, marginBottom: SPACING.md, marginTop: 0 }}>Deja una reseña al anfitrión</h4>
            <div style={{ display: "flex", gap: SPACING.xs, marginBottom: SPACING.md }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={24} fill={s <= hostReviewRating ? COLORS.text : "none"} stroke={COLORS.text} style={{ cursor: "pointer", opacity: savingHostReview ? 0.5 : 1 }} onClick={() => !savingHostReview && setHostReviewRating(s)} />
              ))}
            </div>
            {hostReviewError && (
              <div style={{ background: "#fef2f2", border: `1px solid ${COLORS.border}`, color: COLORS.danger, padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.md, fontSize: FONT_SIZE.xs, marginBottom: SPACING.md }}>
                {hostReviewError}
              </div>
            )}
            <textarea
              value={hostReviewText}
              onChange={e => setHostReviewText(e.target.value)}
              placeholder={`¿Cómo fue tu experiencia con ${l.host.name}?`}
              rows={3}
              disabled={savingHostReview}
              style={{ width: "100%", padding: `${SPACING.md}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: COLORS.text, opacity: savingHostReview ? 0.6 : 1 }}
            />
            <Btn primary onClick={handleSubmitHostReview} style={{ marginTop: SPACING.md }} disabled={!hostReviewText.trim() || savingHostReview}>
              {savingHostReview ? "Publicando..." : "Publicar reseña"}
            </Btn>
          </div>
        )}
      </Modal>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: `${SPACING.xl}px ${SPACING.xl}px 80px` }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: SPACING.sm, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, marginBottom: SPACING.xl, color: COLORS.text, padding: 0 }}>
          <ArrowLeft size={18} /> Volver a resultados
        </button>
        <h1 style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.xs }}>{l.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, flexWrap: "wrap", marginBottom: SPACING.xl }}>
          <StarRating rating={l.rating} />
          <span style={{ color: "#555", fontSize: 14 }}>· {reviews.length} reseñas</span>
          {l.host.superhost && <Badge><Award size={12} /> Superanfitrión</Badge>}
          <span style={{ color: "#555", fontSize: 14 }}>· <span style={{ textDecoration: "underline", fontWeight: 500 }}>{l.location}</span></span>
          <div style={{ marginLeft: "auto", display: "flex", gap: SPACING.md }}>
              <div style={{ position: "relative" }}>
                {shareToast && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: COLORS.text, color: "#fff", padding: `${SPACING.xs}px ${SPACING.md}px`, borderRadius: RADIUS.md, fontSize: FONT_SIZE.xs, whiteSpace: "nowrap", zIndex: 10 }}>¡Link copiado!</div>
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

        {l.photos.length > 0 ? (
          <>
            <div onClick={() => setGalleryOpen(true)} style={{ display: "grid", gridTemplateColumns: sidePhotos.length > 0 ? "1fr 1fr" : "1fr", gap: SPACING.sm, borderRadius: RADIUS.xl, overflow: "hidden", cursor: "pointer", maxHeight: 420 }}>
              <div style={{ gridRow: sidePhotos.length > 0 ? "1 / 3" : undefined }}>
                <img src={l.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {sidePhotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: sidePhotos.length >= 2 ? "1fr 1fr" : "1fr", gap: SPACING.sm }}>
                  {sidePhotos.map((p, i) => (
                    <div key={i} style={{ overflow: "hidden" }}>
                      <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 120 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", marginTop: SPACING.sm }}>
              <Btn small outline onClick={() => setGalleryOpen(true)}><Grid size={14} /> Mostrar todas las fotos</Btn>
            </div>
          </>
        ) : (
          <div style={{ background: COLORS.bg, borderRadius: RADIUS.xl, height: 320, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: SPACING.md, border: `1px solid ${COLORS.border}` }}>
            <Camera size={48} color="#bbb" />
            <span style={{ color: COLORS.light, fontSize: FONT_SIZE.md }}>Sin fotos disponibles</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: SPACING.xl * 2, marginTop: SPACING.xl * 2 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: SPACING.xl, borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, margin: 0 }}>Estacionamiento de {l.host.name}</h2>
                  {hostReviews.length > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACING.xs, fontSize: FONT_SIZE.md, color: COLORS.text, background: "#f0f0f0", padding: "3px 10px", borderRadius: 999 }} title="Calificación del anfitrión">
                      <Star size={13} fill={COLORS.text} stroke="none" />
                      <span style={{ fontWeight: FONT_WEIGHT.bold }}>{hostAvgRating}</span>
                      <span style={{ color: COLORS.muted }}>({hostReviews.length})</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setHostReviewsModalOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: SPACING.xs,
                      fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: BRAND_COLOR,
                      background: "#fff", border: `1px solid ${BRAND_COLOR}55`,
                      padding: "5px 12px", borderRadius: 999, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {hostReviews.length > 0 ? "Ver reseñas" : "Dejar reseña"}
                  </button>
                </div>
                <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.sm }}>{l.vehicleTypes.join(" · ")} · {l.type === "covered" ? "Techado" : "Aire libre"} · {l.dimensions.width}m × {l.dimensions.length}m{l.dimensions.height ? ` × ${l.dimensions.height}m alto` : ""}</div>
              </div>
              <Avatar src={l.host.avatar} name={l.host.name} size={56} badge={l.host.superhost} />
            </div>

            <div style={{ padding: `${SPACING.xl}px 0`, borderBottom: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: SPACING.xl }}>
              {l.host.superhost && (
                <div style={{ display: "flex", gap: SPACING.lg }}>
                  <Award size={24} />
                  <div><div style={{ fontWeight: FONT_WEIGHT.semibold }}>{l.host.name} es Superanfitrión</div><div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.xs }}>Los Superanfitriones son propietarios con experiencia y excelentes reseñas.</div></div>
                </div>
              )}
              <div style={{ display: "flex", gap: SPACING.lg }}>
                <MapPin size={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: FONT_WEIGHT.semibold }}>Excelente ubicación</div>
                  <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.xs, marginBottom: SPACING.md }}>{l.address}</div>
                  <LastMileNavigation latitude={l.lat} longitude={l.lng} address={l.address} />
                </div>
              </div>
              <div style={{ display: "flex", gap: SPACING.lg }}>
                {l.access === "Control remoto" ? <Wifi size={24} /> : l.access === "App móvil" ? <Phone size={24} /> : <Lock size={24} />}
                <div><div style={{ fontWeight: FONT_WEIGHT.semibold }}>Acceso: {l.access}</div><div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.xs }}>Ingresa al estacionamiento de forma {l.access === "Manual (anfitrión abre)" ? "coordinada con el anfitrión" : "autónoma"}.</div></div>
              </div>
              {l.cancellation === "flexible" && (
                <div style={{ display: "flex", gap: SPACING.lg }}>
                  <Calendar size={24} />
                  <div><div style={{ fontWeight: FONT_WEIGHT.semibold }}>Cancelación flexible</div><div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.xs }}>Cancelación gratuita hasta 24 horas antes del inicio.</div></div>
                </div>
              )}
            </div>



            <div style={{ padding: `${SPACING.xl}px 0`, borderBottom: `1px solid ${COLORS.border}` }}>
              <p style={{ fontSize: FONT_SIZE.lg, lineHeight: 1.65, color: COLORS.text }}>{l.description}</p>
            </div>

            <div style={{ padding: `${SPACING.xl}px 0`, borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg }}>Dimensiones del espacio</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACING.lg }}>
                <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.xl, textAlign: "center" }}>
                  <div style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.bold, color: BRAND_COLOR }}>{l.dimensions.width}m</div>
                  <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.sm }}>Ancho</div>
                </div>
                <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.xl, textAlign: "center" }}>
                  <div style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.bold, color: BRAND_COLOR }}>{l.dimensions.length}m</div>
                  <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.sm }}>Largo</div>
                </div>
                <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.xl, textAlign: "center" }}>
                  <div style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.bold, color: BRAND_COLOR }}>{l.dimensions.height ? `${l.dimensions.height}m` : "∞"}</div>
                  <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.md, marginTop: SPACING.sm }}>Altura máx.</div>
                </div>
              </div>
            </div>

            <div style={{ padding: `${SPACING.xl}px 0`, borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg }}>Lo que ofrece este lugar</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md }}>
                {(showAllAmenities ? l.amenities : l.amenities.slice(0, 6)).map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACING.md, padding: `${SPACING.sm}px 0` }}>
                    {a.includes("EV") || a.includes("Carga") ? <Zap size={22} /> : a.includes("Cámara") || a.includes("Vigilancia") || a.includes("Seguridad") || a.includes("Alarm") ? <Shield size={22} /> : a.includes("Iluminado") || a.includes("LED") ? <Sun size={22} /> : <Check size={22} />}
                    <span style={{ fontSize: FONT_SIZE.md }}>{a}</span>
                  </div>
                ))}
              </div>
              {l.amenities.length > 6 && !showAllAmenities && (
                <Btn outline style={{ marginTop: SPACING.lg }} onClick={() => setShowAllAmenities(true)}>Mostrar las {l.amenities.length} comodidades</Btn>
              )}
            </div>

            <div style={{ padding: `${SPACING.xl}px 0`, borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.xl }}>
                <Star size={22} fill={COLORS.text} stroke="none" />
                <span style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold }}>{reviews.length > 0 ? `${l.rating} · ${reviews.length} reseña${reviews.length !== 1 ? "s" : ""}` : "Reseñas"}</span>
              </div>
              {reviews.length === 0 ? (
                <p style={{ fontSize: FONT_SIZE.md, color: COLORS.muted }}>Este estacionamiento aún no tiene reseñas.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: reviews.length === 1 ? "1fr" : "1fr 1fr", gap: SPACING.xl }}>
                  {reviews.slice(0, reviewsShown).map((r, i) => (
                    <div key={i} style={{ padding: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.xs }}>
                        <Avatar src={null} name={r.author_name || r.authorName || "Usuario"} size={40} />
                        <div>
                          <div style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md }}>{r.author_name || r.authorName || "Usuario"}</div>
                          <div style={{ color: COLORS.muted, fontSize: FONT_SIZE.xs }}>{(r.created_at || r.date) ? new Date(r.created_at || r.date).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: SPACING.xs, marginBottom: SPACING.sm }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? COLORS.text : "none"} stroke={COLORS.text} />)}</div>
                      <p style={{ fontSize: FONT_SIZE.md, color: "#333", lineHeight: 1.55, margin: 0 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              {reviews.length > reviewsShown && (
                <Btn outline style={{ marginTop: SPACING.xl }} onClick={() => setReviewsShown(n => n + 5)}>Ver más reseñas ({reviews.length - reviewsShown} restantes)</Btn>
              )}

              {user && !isOwner && (
                <div style={{ marginTop: SPACING.xl, padding: SPACING.xl, background: COLORS.bg, borderRadius: RADIUS.lg }}>
                  <h4 style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, marginBottom: SPACING.md }}>Deja tu reseña</h4>
                  <div style={{ display: "flex", gap: SPACING.xs, marginBottom: SPACING.md }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={24} fill={s <= reviewRating ? COLORS.text : "none"} stroke={COLORS.text} style={{ cursor: "pointer", opacity: savingReview ? 0.5 : 1 }} onClick={() => !savingReview && setReviewRating(s)} />
                    ))}
                  </div>
                  {reviewError && (
                    <div style={{ background: "#fef2f2", border: `1px solid ${COLORS.border}`, color: COLORS.danger, padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.md, fontSize: FONT_SIZE.xs, marginBottom: SPACING.md }}>
                      {reviewError}
                    </div>
                  )}
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Comparte tu experiencia con este estacionamiento..."
                    rows={3}
                    disabled={savingReview}
                    style={{ width: "100%", padding: `${SPACING.md}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: COLORS.text, opacity: savingReview ? 0.6 : 1 }}
                  />
                  <Btn primary onClick={handleSubmitReview} style={{ marginTop: SPACING.md }} disabled={!reviewText.trim() || savingReview}>
                    {savingReview ? "Publicando..." : "Publicar reseña"}
                  </Btn>
                </div>
              )}
            </div>

            <div style={{ padding: `${SPACING.xl}px 0` }}>
              <h3 style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.lg }}>Reglas del espacio</h3>
              {l.rules.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACING.md, padding: `${SPACING.sm}px 0`, borderBottom: i < l.rules.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <Info size={16} color={COLORS.muted} />
                  <span style={{ fontSize: FONT_SIZE.md }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Booking Widget / Owner Metrics */}
          <div>
            {isOwner ? (() => {
              const listingBookings = bookings.filter(b => String(b.listingId || b.listing_id) === String(listing.id));
              const confirmed = listingBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
              const pending = listingBookings.filter(b => b.status === 'pending');
              const completed = listingBookings.filter(b => b.status === 'completed');
              const totalRevenue = listingBookings
                .filter(b => b.status !== 'cancelled' && b.status !== 'rejected')
                .reduce((s, b) => s + (Number(b.total) || 0), 0);
              const uniqueConductors = new Set(listingBookings.map(b => b.conductorId || b.conductor_id).filter(Boolean)).size;
              const ratingAvg = reviews.length > 0
                ? +(reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(2)
                : 0;

              return (
                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.xl, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ padding: `${SPACING.xl}px ${SPACING.xl}px`, background: BRAND_GRADIENT, color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.xs }}>
                      <TrendingUp size={18} />
                      <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, opacity: 0.9 }}>Panel del anfitrión</span>
                    </div>
                    <div style={{ fontSize: FONT_SIZE.xl2, fontWeight: FONT_WEIGHT.bold, marginTop: SPACING.xs }}>Tu publicación</div>
                    <div style={{ fontSize: FONT_SIZE.xs, opacity: 0.9, marginTop: SPACING.xs }}>Solo tú puedes ver estas métricas</div>
                  </div>

                  <div style={{ padding: `${SPACING.xl}px ${SPACING.xl}px`, display: "flex", flexDirection: "column", gap: SPACING.md }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.sm }}>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <DollarSign size={13} /> Ingresos totales
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>{formatCLP(totalRevenue)}</div>
                      </div>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <Calendar size={13} /> Reservas totales
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>{listingBookings.length}</div>
                      </div>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <Check size={13} /> Confirmadas
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: "#008A05" }}>{confirmed.length}</div>
                      </div>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <Clock size={13} /> Pendientes
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: "#c76d00" }}>{pending.length}</div>
                      </div>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <Star size={13} /> Calificación
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>{ratingAvg || "—"} <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.muted, fontWeight: FONT_WEIGHT.normal }}>({reviews.length})</span></div>
                      </div>
                      <div style={{ background: COLORS.bg, borderRadius: RADIUS.lg, padding: SPACING.md }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, color: COLORS.muted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                          <Eye size={13} /> Conductores únicos
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text }}>{uniqueConductors}</div>
                      </div>
                    </div>

                    <div style={{ padding: `${SPACING.md}px ${SPACING.md}px`, background: "#fff7ed", borderRadius: RADIUS.lg, border: "1px solid #fed7aa", fontSize: FONT_SIZE.xs, color: "#78350f" }}>
                      <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.xs }}>Precios publicados</div>
                      {Number(listing.price) > 0 && <div>· Hora: {formatCLP(listing.price)}</div>}
                      {Number(listing.priceDaily) > 0 && <div>· Día: {formatCLP(listing.priceDaily)}</div>}
                      {Number(listing.priceMonthly) > 0 && <div>· Mes: {formatCLP(listing.priceMonthly)}</div>}
                    </div>

                    {completed.length > 0 && (
                      <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.muted }}>
                        {completed.length} reserva{completed.length !== 1 ? "s" : ""} completada{completed.length !== 1 ? "s" : ""}
                      </div>
                    )}

                    <Btn
                      primary
                      full
                      onClick={() => { if (onEditListing) onEditListing(listing); }}
                      style={{ padding: `${SPACING.md}px ${SPACING.xl}px`, fontSize: FONT_SIZE.md, borderRadius: RADIUS.lg }}
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
                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.xl, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ padding: `${SPACING.xl}px ${SPACING.xl}px`, background: bookingStep === 0 ? "#fafafa" : "#fff" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: availableModalities.length > 1 ? SPACING.md : 0 }}>
                      <div>
                        <span style={{ fontSize: FONT_SIZE.xl3, fontWeight: FONT_WEIGHT.bold }}>{formatCLP(modPrice)}</span>
                        <span style={{ color: "#777", fontSize: FONT_SIZE.md }}> / {modUnit}</span>
                      </div>
                      {bookingStep > 0 && (
                        <button onClick={() => setBookingStep(0)} style={{ background: "none", border: "none", fontSize: FONT_SIZE.xs, color: BRAND_COLOR, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", fontFamily: "inherit" }}>Minimizar</button>
                      )}
                    </div>
                    {availableModalities.length > 1 && (
                      <div style={{ display: "flex", gap: SPACING.sm }}>
                        {availableModalities.map(m => (
                          <Pill key={m.id} active={selectedModality === m.id} onClick={() => { setSelectedModality(m.id); if (bookingStep === 0) setBookingStep(1); }}>{m.label}</Pill>
                        ))}
                      </div>
                    )}
                    {bookingStep === 0 && (
                      <Btn primary full onClick={() => setBookingStep(1)} style={{ marginTop: SPACING.lg, padding: `${SPACING.md}px ${SPACING.xl}px`, fontSize: FONT_SIZE.md, borderRadius: RADIUS.lg }}>
                        <Calendar size={18} /> Elegir fecha y reservar
                      </Btn>
                    )}
                  </div>

                  {bookingStep >= 1 && (
                    <div style={{ padding: `0 ${SPACING.xl}px ${SPACING.xl}px`, borderTop: `1px solid #f0f0f0` }}>
                      <button onClick={() => setBookingStep(bookingStep === 1 ? 0 : 1)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: `${SPACING.lg}px 0 ${SPACING.md}px`, margin: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: hasDateFilled ? BRAND_COLOR : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {hasDateFilled ? <Check size={14} color="#fff" /> : <span style={{ color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold }}>1</span>}
                          </div>
                          <span style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: COLORS.text }}>Fecha y horario</span>
                        </div>
                        {hasDateFilled && bookingStep !== 1 && (
                          <span style={{ fontSize: FONT_SIZE.xs, color: "#777" }}>
                            {modUnit === "hora" && bookingDates.start ? `${new Date(bookingDates.start + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} ${bookingHours.startH}:${bookingHours.startM} - ${bookingDates.end ? new Date(bookingDates.end + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" }) : ""} ${bookingHours.endH}:${bookingHours.endM}` : modUnit === "mes" && monthlyStartDate ? `Desde ${new Date(monthlyStartDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}` : "Configurado"}
                          </span>
                        )}
                        <ChevronDown size={16} color={COLORS.light} style={{ transform: bookingStep === 1 ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
                      </button>

                      {bookingStep === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md, paddingBottom: SPACING.sm }}>
                          {modUnit === "hora" && (
                            <>
                              {/* Toggle: same day vs overnight */}
                              <div style={{ display: "flex", gap: 8 }}>
                                {[{ id: "same_day", label: "Mismo día" }, { id: "overnight", label: "Pasa la medianoche" }].map(opt => (
                                  <button key={opt.id} type="button"
                                    onClick={() => {
                                      setHourlyMode(opt.id);
                                      if (opt.id === "same_day" && bookingDates.start)
                                        setBookingDates(prev => ({ ...prev, end: prev.start }));
                                    }}
                                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `2px solid ${hourlyMode === opt.id ? BRAND_COLOR : "#e0e0e0"}`, background: hourlyMode === opt.id ? BRAND_COLOR : "#fff", color: hourlyMode === opt.id ? "#fff" : "#666", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
                                  >{opt.label}</button>
                                ))}
                              </div>
                              {/* Date input(s) */}
                              {hourlyMode === "same_day" ? (
                                <div>
                                  <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha</label>
                                  <input type="date" value={bookingDates.start} onChange={e => setBookingDates({ start: e.target.value, end: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = BRAND_COLOR} onBlur={e => e.target.style.borderColor = COLORS.border} />
                                </div>
                              ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md }}>
                                  <div>
                                    <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha entrada</label>
                                    <input type="date" value={bookingDates.start} onChange={e => setBookingDates({ ...bookingDates, start: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = BRAND_COLOR} onBlur={e => e.target.style.borderColor = COLORS.border} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha salida</label>
                                    <input type="date" value={bookingDates.end} onChange={e => setBookingDates({ ...bookingDates, end: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = BRAND_COLOR} onBlur={e => e.target.style.borderColor = COLORS.border} />
                                  </div>
                                </div>
                              )}
                              {/* Time pickers */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <TimePicker label="Hora inicio" value={`${bookingHours.startH}:${bookingHours.startM}`} onChange={v => { const [h, m] = v.split(":"); setBookingHours({ ...bookingHours, startH: h, startM: m }); }} disabledHours={busyHoursForStart} />
                                <TimePicker label="Hora fin" value={`${bookingHours.endH}:${bookingHours.endM}`} onChange={v => { const [h, m] = v.split(":"); setBookingHours({ ...bookingHours, endH: h, endM: m }); }} disabledHours={busyHoursForEnd} />
                              </div>
                            </>
                          )}
                          {modUnit === "día" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
                              <div style={{ background: "#f8f8f8", border: `1px solid ${COLORS.border}`, padding: SPACING.md, borderRadius: RADIUS.lg }}>
                                <span style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.xs, color: COLORS.muted }}>Regla de horario de uso diario: </span>
                                <span style={{ fontSize: FONT_SIZE.xs, color: BRAND_COLOR, fontWeight: FONT_WEIGHT.semibold }}>De {l.dimensions?.dailyStart || "06:00"} a {l.dimensions?.dailyEnd || "22:00"}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md }}>
                                <div>
                                  <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha de entrada</label>
                                  <input type="date" value={bookingDates.start} onChange={e => setBookingDates({ ...bookingDates, start: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha de salida</label>
                                  <input type="date" value={bookingDates.end} onChange={e => setBookingDates({ ...bookingDates, end: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }} />
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
                                <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Fecha de inicio</label>
                                <input type="date" value={monthlyStartDate} onChange={e => setMonthlyStartDate(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }} />
                              </div>
                              <div>
                                <label style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.muted, marginBottom: SPACING.xs, display: "block" }}>Mes de término</label>
                                <select value={monthlyEndMonth} onChange={e => setMonthlyEndMonth(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }}>
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
                          <Btn primary full onClick={() => setBookingStep(2)} style={{ borderRadius: RADIUS.lg, marginTop: SPACING.sm }}>Continuar</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {bookingStep >= 2 && (
                    <div style={{ padding: `0 ${SPACING.xl}px ${SPACING.xl}px`, borderTop: `1px solid #f0f0f0` }}>
                      <button onClick={() => setBookingStep(bookingStep === 2 ? 1 : 2)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: `${SPACING.lg}px 0 ${SPACING.md}px`, margin: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: hasVehicleFilled ? BRAND_COLOR : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {hasVehicleFilled ? <Check size={14} color="#fff" /> : <span style={{ color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold }}>2</span>}
                          </div>
                          <span style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: COLORS.text }}>Vehículo</span>
                        </div>
                        {hasVehicleFilled && bookingStep !== 2 && (
                          <span style={{ fontSize: FONT_SIZE.xs, color: "#777" }}>{selectedVehicle.name}{selectedVehicle.plate ? ` · ${selectedVehicle.plate}` : ""}</span>
                        )}
                        <ChevronDown size={16} color={COLORS.light} style={{ transform: bookingStep === 2 ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
                      </button>

                      {bookingStep === 2 && (
                        <div style={{ paddingBottom: 4 }}>
                          {userVehicles.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm, marginBottom: SPACING.sm }}>
                              {userVehicles.map(v => (
                                <div key={v.id} onClick={() => setSelectedVehicleId(v.id)} style={{ display: "flex", alignItems: "center", gap: SPACING.md, padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: selectedVehicleId === v.id ? `2px solid ${BRAND_COLOR}` : `1px solid ${COLORS.border}`, cursor: "pointer", background: selectedVehicleId === v.id ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: selectedVehicleId === v.id ? `5px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold }}>{v.name}</div>
                                    <div style={{ fontSize: FONT_SIZE.xs, color: "#777" }}>{v.type}{v.plate ? ` · ${v.plate}` : ""}</div>
                                  </div>
                                </div>
                              ))}
                              <div onClick={() => setSelectedVehicleId("custom")} style={{ display: "flex", alignItems: "center", gap: SPACING.md, padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: selectedVehicleId === "custom" ? `2px solid ${BRAND_COLOR}` : `1px solid ${COLORS.border}`, cursor: "pointer", background: selectedVehicleId === "custom" ? "#fff5f7" : "#fff", transition: "all .15s" }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: selectedVehicleId === "custom" ? `5px solid ${BRAND_COLOR}` : "2px solid #ccc", flexShrink: 0 }} />
                                <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: COLORS.muted }}>Otro vehículo</div>
                              </div>
                            </div>
                          )}
                          {(selectedVehicleId === "custom" || userVehicles.length === 0) && (
                            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
                              <input placeholder="Nombre del vehículo (ej: Toyota Corolla)" value={customVehicleName} onChange={e => setCustomVehicleName(e.target.value)} style={{ width: "100%", padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }} />
                              <input placeholder="Patente (ej: ABCD-12)" value={customVehiclePlate} onChange={e => setCustomVehiclePlate(e.target.value)} style={{ width: "100%", padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}`, fontSize: FONT_SIZE.md, fontFamily: "inherit", background: "#fff", color: COLORS.text, outline: "none", boxSizing: "border-box" }} />
                            </div>
                          )}
                          {sizeWarning && (
                            <div style={{ marginTop: SPACING.md, background: "#fef7ed", border: "1px solid #fed7aa", borderRadius: RADIUS.lg, padding: `${SPACING.md}px ${SPACING.md}px`, display: "flex", alignItems: "flex-start", gap: SPACING.md }}>
                              <Info size={16} color="#c2410c" style={{ marginTop: SPACING.xs, flexShrink: 0 }} />
                              <div style={{ fontSize: FONT_SIZE.xs, color: "#7c2d12", lineHeight: 1.45 }}>
                                <strong>Tu vehículo podría no caber en este estacionamiento.</strong>
                                <div style={{ marginTop: SPACING.sm }}>
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
                                <div style={{ marginTop: SPACING.sm, fontSize: FONT_SIZE.xs, color: "#9a3412" }}>
                                  Puedes continuar con la reserva, pero cualquier daño o imposibilidad de ingresar al espacio queda <b>bajo tu responsabilidad</b>.
                                </div>
                              </div>
                            </div>
                          )}
                          <Btn primary full onClick={() => setBookingStep(3)} style={{ borderRadius: RADIUS.lg, marginTop: SPACING.md }} disabled={!hasVehicleFilled}>Continuar</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {bookingStep >= 3 && (
                    <div style={{ padding: `0 ${SPACING.xl}px ${SPACING.xl}px`, borderTop: `1px solid #f0f0f0` }}>
                      <div style={{ padding: `${SPACING.lg}px 0 ${SPACING.md}px` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.lg }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: BRAND_COLOR, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold }}>3</span>
                          </div>
                          <span style={{ fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md, color: COLORS.text }}>Resumen</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm, fontSize: FONT_SIZE.md, marginBottom: SPACING.lg }}>
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
                        <div style={{ background: "#fef2f2", border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.lg, padding: `${SPACING.sm}px ${SPACING.md}px`, marginBottom: SPACING.md, display: "flex", alignItems: "flex-start", gap: SPACING.md }}>
                          <Lock size={14} color={COLORS.danger} style={{ marginTop: SPACING.xs, flexShrink: 0 }} />
                          <div style={{ fontSize: FONT_SIZE.xs, color: "#7f1d1d", lineHeight: 1.4 }}>
                            <strong>Periodo no disponible.</strong> Se solapa con: {formatBusyLabel(currentSelectionConflict)}. Ajusta tu horario para poder reservar.
                          </div>
                        </div>
                      )}
                      {sizeWarning && (
                        <div style={{ background: "#fef7ed", border: "1px solid #fed7aa", borderRadius: RADIUS.lg, padding: `${SPACING.sm}px ${SPACING.md}px`, marginBottom: SPACING.md, display: "flex", alignItems: "flex-start", gap: SPACING.md }}>
                          <Info size={14} color="#c2410c" style={{ marginTop: SPACING.xs, flexShrink: 0 }} />
                          <div style={{ fontSize: FONT_SIZE.xs, color: "#7c2d12", lineHeight: 1.4 }}>
                            <strong>Atención:</strong> tu vehículo excede las medidas del espacio ({[sizeWarning.overWidth && "ancho", sizeWarning.overLength && "largo", sizeWarning.overHeight && "alto"].filter(Boolean).join(", ")}). Continúas bajo tu responsabilidad.
                          </div>
                        </div>
                      )}
                      <Btn primary full onClick={() => setShowBookingConfirm(true)} disabled={!!currentSelectionConflict} style={{ padding: `${SPACING.md}px ${SPACING.xl}px`, fontSize: FONT_SIZE.md, borderRadius: RADIUS.lg }}>Reservar</Btn>
                      <p style={{ textAlign: "center", color: COLORS.light, fontSize: FONT_SIZE.xs, marginTop: SPACING.md }}>No se hará ningún cargo aún</p>
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
