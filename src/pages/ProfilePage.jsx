import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Star, Camera, Plus, MessageCircle, Calendar, Car, DollarSign, Eye, Edit, AlertCircle, CheckCircle, Check, X, ChevronRight, LogOut, Heart } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT, DARK_BG, VEHICLE_TYPES, SECURITY_FEATURES, CAR_COLORS, CAR_BRANDS, CAR_MODELS, getVehicleTypeForModel, getVehicleDimensions } from "../constants";
import { formatCLP } from "../utils/format";
import { supabase } from "../lib/supabase";
import { StarRating, Avatar, Badge, Btn, Input, Modal } from "../components/ui";
import SettingsPanel from "../components/SettingsPanel";
import BookingChat from "../components/BookingChat";
import ReviewModal from "../components/ReviewModal";
import { useNotifications } from "../contexts/NotificationsContext";

const FormAutocomplete = ({ value, onChange, options, placeholder, disabled = false, onFocus = () => {}, alwaysShowOtros = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes((value||"").toLowerCase()));
  const showDropdown = open && (filtered.length > 0 || alwaysShowOtros);

  return (
    <div ref={ref} style={{ position: "relative", opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <Input 
        value={value} 
        onChange={e => { onChange(e.target.value); setOpen(true); }} 
        onFocus={() => { setOpen(true); onFocus(); }}
        placeholder={placeholder} 
        disabled={disabled}
      />
      {showDropdown && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ddd", borderRadius: 10, boxShadow: "0 8px 16px rgba(0,0,0,.08)", maxHeight: 200, overflow: "auto", zIndex: 200, marginTop: 4 }}>
          {filtered.map(o => (
             <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: "12px 16px", fontSize: 14, cursor: "pointer", background: value === o ? "#f7f7f7" : "#fff", fontWeight: value === o ? 600 : 400 }} onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"} onMouseLeave={e => e.currentTarget.style.background = value === o ? "#f7f7f7" : "#fff"}>
               {o}
             </div>
          ))}
          {alwaysShowOtros && (
             <div key="Otros" onClick={() => { onChange("Otros"); setOpen(false); }} style={{ padding: "12px 16px", fontSize: 14, cursor: "pointer", background: value === "Otros" ? "#f7f7f7" : "#fff", fontWeight: value === "Otros" ? 700 : 600, borderTop: "1px solid #eee", color: BRAND_COLOR }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = value === "Otros" ? "#f7f7f7" : "#fff"}>
               Otros (Especificar)
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ onBack, onNavigate, user, onLogout, onUpdateUser, listings = [], setListings, bookings = [], setBookings, onMarkRead, onSelectListing, onUpdateListing, onDeleteListing, onUpdateBooking, onEditListing, initialTab, onTabChange }) => {
  const { pushNotification } = useNotifications();
  const [chatBooking, setChatBooking] = useState(null);
  const [expandedListingId, setExpandedListingId] = useState(null);
  const [reviewsListing, setReviewsListing] = useState(null);
  const [listingReviewsShown, setListingReviewsShown] = useState(5);
  const [myListingsShown, setMyListingsShown] = useState(5);
  const [incomingBookingsShown, setIncomingBookingsShown] = useState(5);
  const [vehiclesShown, setVehiclesShown] = useState(5);
  const [myBookingsShown, setMyBookingsShown] = useState(5);
  const [previewListing, setPreviewListing] = useState(null);
  const [tab, setTab] = useState(initialTab || "profile");
  useEffect(() => { if (initialTab && initialTab !== tab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { if (onTabChange) onTabChange(tab); }, [tab]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user || {});
  // My Vehicles
  const [vehicles, setVehicles] = useState(user?.vehicles || []);
  const [newVehicle, setNewVehicle] = useState({ brand: "", customBrand: "", model: "", customModel: "", color: "", customColor: "", type: "", plate: "", ev: false, width: "", length: "", height: "" });
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Reviews
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, type: 'listing'|'host'|'driver', targetId, title, subtitle }
  const [submittingReview, setSubmittingReview] = useState(false);
  const [doneReviews, setDoneReviews] = useState({}); // key: `${bookingId}_${type}` → true

  // Initial load of authored reviews to mark buttons as "Done"
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id, review_type')
        .eq('author_id', user.id);
      if (error) { console.error('fetch authored reviews:', error); return; }
      const map = {};
      (data || []).forEach(r => {
        if (r.booking_id) map[`${r.booking_id}_${r.review_type}`] = true;
      });
      setDoneReviews(map);
    })();
  }, [user?.id]);
  const [driverRatings, setDriverRatings] = useState({}); // { [conductorId]: { avg, count } } — for host's incoming-bookings panel
  const [myDriverReviews, setMyDriverReviews] = useState([]); // reviews received as a driver (review_type='driver')
  const [myHostReviews, setMyHostReviews] = useState([]); // reviews received as a host (review_type='host')
  const [ratingsSubTab, setRatingsSubTab] = useState("host");
  const [dashboardSubTab, setDashboardSubTab] = useState("listings");
  const savedListings = (listings || []).filter(l => l.favorite);

  // No local fetch needed, we use contextListings.filter(l => l.favorite) above.

  // Parking preferences
  const [prefs, setPrefs] = useState(user?.parking_preferences || { type: "", ev: false, security: [] });
  const [prefsSaving, setPrefsSaving] = useState(false);

  const saveVehicles = async (updatedVehicles) => {
    setVehicles(updatedVehicles);
    if (onUpdateUser) await onUpdateUser({ vehicles: updatedVehicles });
  };

  const addVehicle = async () => {
    // Require raw brand/model before applying "Otros-" fallback, or legacy name.
    if (!newVehicle.type) return;
    if (!newVehicle.brand && !newVehicle.name) return;
    if (!newVehicle.model && !newVehicle.name) return;
    const finalBrand = CAR_BRANDS.includes(newVehicle.brand) ? newVehicle.brand : `Otros-${newVehicle.brand}`;
    const finalColor = CAR_COLORS.includes(newVehicle.color) ? newVehicle.color : `Otros-${newVehicle.color}`;
    const finalModel = (CAR_MODELS[newVehicle.brand] || []).includes(newVehicle.model) ? newVehicle.model : `Otros-${newVehicle.model}`;

    let updated;
    const toNum = (x) => {
      const n = parseFloat(String(x).replace(",", "."));
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    const payload = {
      ...newVehicle,
      brand: finalBrand,
      model: finalModel,
      color: finalColor,
      width: toNum(newVehicle.width),
      length: toNum(newVehicle.length),
      height: toNum(newVehicle.height),
      name: `${finalBrand.replace("Otros-", "")} ${finalModel.replace("Otros-", "")}`.trim(),
    };
    if (editingVehicleId) {
      updated = vehicles.map(v => v.id === editingVehicleId ? { ...payload, id: editingVehicleId } : v);
    } else {
      updated = [...vehicles, { ...payload, id: Date.now() }];
    }
    await saveVehicles(updated);
    setNewVehicle({ brand: "", customBrand: "", model: "", customModel: "", color: "", customColor: "", type: "", plate: "", ev: false, width: "", length: "", height: "" });
    setShowAddVehicle(false);
    setEditingVehicleId(null);
  };

  const submitReview = async ({ rating, comment }) => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      const { bookingId, type, targetId, listingId } = reviewModal;
      const { error: reviewError } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        review_type: type,
        listing_id: type === 'listing' ? (listingId || targetId) : (listingId || null),
        target_id: targetId,
        author_id: user.id,
        author_name: `${user.firstName || ''} ${user.lastNameP || ''}`.trim(),
        rating,
        comment,
      });
      if (reviewError) {
        console.error('submitReview insert:', reviewError);
        alert('No se pudo guardar la reseña.');
        setSubmittingReview(false);
        return;
      }
      setDoneReviews(prev => ({ ...prev, [`${bookingId}_${type}`]: true }));
      // Notify target
      const targetLabel = type === 'listing' ? 'tu estacionamiento' : type === 'host' ? 'tu perfil' : 'tu perfil de conductor';
      const notifTitle = type === 'driver' ? 'Nueva calificación de conductor' : 'Nueva reseña recibida';
      try {
        await pushNotification({
          userId: targetId,
          type: 'review',
          title: notifTitle,
          body: `${user.firstName || 'Alguien'} te calificó con ${rating} estrellas en ${targetLabel}.`,
          link: 'profile',
        });
      } catch (notifErr) {
        console.error('submitReview notify:', notifErr);
      }
    } catch(e) { console.error(e); }
    setSubmittingReview(false);
  };

  const editVehicle = (id) => {
    const v = vehicles.find(x => x.id === id);
    if (!v) return;
    setNewVehicle({ 
      brand: v.brand?.startsWith("Otros-") ? "Otros" : (v.brand || v.name?.split(" ")[0] || ""), 
      customBrand: v.brand?.startsWith("Otros-") ? v.brand.slice(6) : "",
      model: v.model?.startsWith("Otros-") ? "Otros" : (v.model || v.name?.split(" ").slice(1).join(" ") || ""), 
      customModel: v.model?.startsWith("Otros-") ? v.model.slice(6) : "",
      color: v.color?.startsWith("Otros-") ? "Otros" : (v.color || ""),
      customColor: v.color?.startsWith("Otros-") ? v.color.slice(6) : "",
      type: v.type, plate: v.plate || "", ev: v.ev || false, name: v.name,
      width: v.width ?? "", length: v.length ?? "", height: v.height ?? "",
    });
    setEditingVehicleId(id);
    setShowAddVehicle(true);
    setTimeout(() => {
      const el = document.getElementById("vehicle-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const removeVehicle = async (id) => {
    await saveVehicles(vehicles.filter(v => v.id !== id));
  };

  const savePrefs = async () => {
    setPrefsSaving(true);
    if (onUpdateUser) await onUpdateUser({ parking_preferences: prefs });
    setPrefsSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      if (typeof onUpdateUser === 'function') await onUpdateUser(editForm);
      setIsEditing(false);
    } catch(err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const ext = file.name?.split('.').pop() || 'jpg';
    const path = `${user.id}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { console.error('avatar upload:', error); return; }
    // Cache-bust so the new image overrides any previously cached URL
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;
    setEditForm({ ...editForm, avatar: bustedUrl });
    if (onUpdateUser) {
      try { await onUpdateUser({ avatar: bustedUrl }); }
      catch (err) { console.error('avatar persist:', err); }
    }
  };
  const myListings = listings.filter(l => l.host?.userId && user?.id && String(l.host.userId) === String(user.id));
  const allReviews = myListings.flatMap(l => l.reviewsList || []);
  const avgRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / allReviews.length).toFixed(1)
    : "—";

  const myBookings = bookings.filter(b => user?.id && String(b.conductorId) === String(user.id));
  const incomingBookings = bookings.filter(b => user?.id && String(b.hostId) === String(user.id));

  // Load driver+host reviews received by the current user. These are the
  // two metrics that live on the user (separate from listing reviews which
  // already come through ListingsContext as l.reviewsList).
  useEffect(() => {
    if (!user?.id) { setMyDriverReviews([]); setMyHostReviews([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, author_name, author_id, created_at, listing_id, booking_id, review_type')
        .in('review_type', ['driver', 'host'])
        .eq('target_id', user.id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) { console.error('my user reviews fetch:', error); return; }
      const all = data || [];
      setMyDriverReviews(all.filter(r => r.review_type === 'driver'));
      setMyHostReviews(all.filter(r => r.review_type === 'host'));
    })();
    return () => { cancelled = true; };
  }, [user?.id, submittingReview]);

  const myDriverAvg = myDriverReviews.length > 0
    ? +(myDriverReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / myDriverReviews.length).toFixed(2)
    : null;
  const myHostAvg = myHostReviews.length > 0
    ? +(myHostReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / myHostReviews.length).toFixed(2)
    : null;

  // Load driver ratings for the conductors that booked my listings
  useEffect(() => {
    const conductorIds = [...new Set(incomingBookings.map(b => b.conductorId).filter(Boolean))];
    if (conductorIds.length === 0) { setDriverRatings({}); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('target_id, rating')
        .eq('review_type', 'driver')
        .in('target_id', conductorIds);
      if (cancelled) return;
      if (error) { console.error('driver ratings fetch:', error); return; }
      const grouped = {};
      (data || []).forEach(r => {
        const k = r.target_id;
        if (!grouped[k]) grouped[k] = { sum: 0, count: 0 };
        grouped[k].sum += r.rating || 0;
        grouped[k].count += 1;
      });
      const out = {};
      Object.entries(grouped).forEach(([k, v]) => {
        const avg = v.count > 0 ? +(v.sum / v.count).toFixed(2) : 0;
        out[k] = { avg, count: v.count };
      });
      setDriverRatings(out);
    })();
    return () => { cancelled = true; };
  }, [incomingBookings.map(b => b.conductorId).join(',')]);

  const confirmedIncoming = incomingBookings.filter(b => b.status === "confirmed" || b.status === "completed");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Net earnings from a gross amount (deduct 5% host commission)
  const HOST_FEE_RATE = 0.05;
  const netFromGross = (amount) => {
    const fee = Math.round(amount * HOST_FEE_RATE);
    return amount - fee;
  };
  const feeFromGross = (amount) => Math.round(amount * HOST_FEE_RATE);

  // For a booking, compute what earnings fall in a given month/year
  const earningsInMonth = (b, month, year) => {
    if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
      // Installment booking: prorate in start month, then monthly installments
      const startDate = new Date(b.monthlyStartDate ? b.monthlyStartDate + "T00:00:00" : b.createdAt);
      const startM = startDate.getMonth();
      const startY = startDate.getFullYear();

      // Check if this month is the prorate month
      if (month === startM && year === startY) {
        const proGross = (b.prorateAmount || 0) + Math.round((b.prorateAmount || 0) * 0.05);
        return netFromGross(proGross);
      }

      // Check if this month is one of the installment months
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
    // Non-installment: all earnings in the booking's start month (or creation)
    const d = new Date(b.startDate || b.createdAt);
    if (d.getMonth() === month && d.getFullYear() === year) {
      return netFromGross(b.total || b.price || 0);
    }
    return 0;
  };

  // Total earnings from booking (all months combined)
  const earningsFromBooking = (b) => {
    if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
      const proGross = (b.prorateAmount || 0) + Math.round((b.prorateAmount || 0) * 0.05);
      const installGross = (b.monthlyInstallment || 0) + Math.round((b.monthlyInstallment || 0) * 0.05);
      return netFromGross(proGross) + netFromGross(installGross) * b.fullMonths;
    }
    return netFromGross(b.total || b.price || 0);
  };

  const monthlyEarnings = confirmedIncoming.reduce((sum, b) => sum + earningsInMonth(b, currentMonth, currentYear), 0);
  const activeBookings = confirmedIncoming.filter(b => {
    // A booking is "active this month" if it generates revenue this month
    return earningsInMonth(b, currentMonth, currentYear) > 0;
  }).length;

  const stats = { earnings: monthlyEarnings, bookings: activeBookings, rating: avgRating, views: myListings.length * 12 };
  const displayName = user ? `${user.firstName} ${user.lastNameP} ${user.lastNameM}` : "";
  const displayEmail = user?.email || "";
  const displayPhone = user?.phone || "";
  const displayId = user ? `${user.idType === "rut" ? "RUT" : "Pasaporte"}: ${user.idNumber}` : "";
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  /* FIX: Clean tab style helper to avoid redundant border declarations */
  const tabStyle = (id) => ({
    padding: "12px 20px",
    fontWeight: tab === id ? 700 : 400,
    color: tab === id ? "#222" : "#555",
    background: "none",
    border: "none",
    borderBottom: tab === id ? `2px solid ${DARK_BG}` : "2px solid transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 15,
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 80px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, marginBottom: 24, color: "#555" }}>
        <ArrowLeft size={18} /> Volver
      </button>

      {/* Profile header */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "center" }}>
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => { if (!isEditing) { setIsEditing(true); setEditForm(user || {}); } }}>
          <Avatar src={isEditing ? editForm.avatar : user?.avatar} name={user?.firstName || "Tú"} size={96} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: BRAND_COLOR, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer" }}>
            <Camera size={14} color="#fff" />
          </div>
          {isEditing && (
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }} title="Cambiar foto de perfil" />
          )}
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{isEditing ? `${editForm.firstName || ""} ${editForm.lastNameP || ""}`.trim() : displayName}</h1>
          <div style={{ color: "#555", fontSize: 15, marginTop: 4 }}>
            {myListings.length > 0 ? "Anfitrión" : "Conductor"} · Miembro desde {memberSince}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap", color: "#555", fontSize: 13 }}>
            {avgRating !== "—" && (
              <span title="Promedio de reseñas dejadas sobre tus estacionamientos">
                <Star size={12} fill="#222" stroke="none" style={{ verticalAlign: "middle" }} /> <strong style={{ color: "#222" }}>{avgRating}</strong> estacionamientos
              </span>
            )}
            {myHostAvg !== null && (
              <span title="Promedio de reseñas dejadas sobre ti como anfitrión">
                <Star size={12} fill="#222" stroke="none" style={{ verticalAlign: "middle" }} /> <strong style={{ color: "#222" }}>{myHostAvg}</strong> anfitrión
              </span>
            )}
            {myDriverAvg !== null && (
              <span title="Promedio de calificaciones recibidas como conductor">
                <Star size={12} fill="#222" stroke="none" style={{ verticalAlign: "middle" }} /> <strong style={{ color: "#222" }}>{myDriverAvg}</strong> conductor
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {user?.idNumber && <Badge><CheckCircle size={12} /> Identidad verificada</Badge>}
            {Number(user?.credit) > 0 && <Badge style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}><DollarSign size={12} /> Saldo pendiente: {formatCLP(Number(user.credit))}</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 4, borderBottom: "1px solid #eee", marginBottom: 28, overflowX: "auto", overflowY: "hidden" }}>
        {[{ id: "profile", l: "Perfil" }, { id: "saved", l: "Mis Voomps guardados" }, { id: "vehicles", l: "Mis Vehículos" }, { id: "ratings", l: "Mis calificaciones" }, { id: "dashboard", l: "Panel anfitrión" }, { id: "analytics", l: "Estadísticas" }, { id: "bookings", l: "Mis reservas" }, { id: "settings", l: "Configuración" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...tabStyle(t.id), flexShrink: 0, whiteSpace: "nowrap" }}>{t.l}</button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { id: "listings", l: "Mis espacios publicados", count: myListings.length },
              { id: "incoming", l: "Reservas recibidas", count: incomingBookings.length },
            ].map(o => (
              <button
                key={o.id}
                onClick={() => setDashboardSubTab(o.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: dashboardSubTab === o.id ? `2px solid ${DARK_BG}` : "1px solid #ddd",
                  background: dashboardSubTab === o.id ? "#fff" : "transparent",
                  fontWeight: dashboardSubTab === o.id ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {o.l}
                {o.count > 0 && (
                  <span style={{ fontSize: 12, color: "#555", background: "#f0f0f0", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>{o.count}</span>
                )}
              </button>
            ))}
          </div>

          {dashboardSubTab === "listings" && (<>
          {myListings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#555", background: "#f7f7f7", borderRadius: 16, marginBottom: 24 }}>
              <Car size={40} color="#ccc" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, marginBottom: 4 }}>Aún no has publicado espacios</p>
              <p style={{ fontSize: 13 }}>Publica tu primer estacionamiento y comienza a generar ingresos.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {myListings.slice(0, myListingsShown).map(l => {
                const lReviews = l.reviewsList || [];
                const lRating = lReviews.length > 0 ? (lReviews.reduce((s, r) => s + r.rating, 0) / lReviews.length).toFixed(1) : null;
                return (
                  <div key={l.id} style={{ background: "#f7f7f7", borderRadius: 12, border: "1px solid transparent", transition: "all .2s", overflow: "hidden" }} onMouseEnter={e => e.currentTarget.style.borderColor = BRAND_COLOR} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                    <div style={{ display: "flex", gap: 16, padding: 16, cursor: "pointer" }} onClick={() => setPreviewListing(l)}>
                      {(l.photos || [])[0] ? <img src={l.photos[0]} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 80, height: 60, borderRadius: 8, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={24} color="#bbb" /></div>}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{l.title}</div>
                        <div style={{ color: "#555", fontSize: 13 }}>{l.location}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          {lRating ? (
                            <><Star size={13} fill="#222" stroke="none" /><span style={{ fontSize: 13, fontWeight: 600 }}>{lRating}</span><span style={{ fontSize: 12, color: "#555" }}>({lReviews.length} reseña{lReviews.length !== 1 ? "s" : ""})</span></>
                          ) : (
                            <span style={{ fontSize: 12, color: "#999" }}>Sin reseñas</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700 }}>{formatCLP(l.price)}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>/{l.priceUnit}</div>
                      </div>
                    </div>
                    <div style={{ padding: "0 16px 12px", display: "flex", gap: 8 }}>
                      <button onClick={() => onEditListing(l)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#222" }}><Edit size={14} /> Editar</button>
                      <button onClick={() => setReviewsListing(l)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#222" }}><Star size={14} /> Ver reseñas{lReviews.length > 0 ? ` (${lReviews.length})` : ""}</button>
                    </div>
                  </div>
                );
              })}
              {myListings.length > myListingsShown && (
                <button onClick={() => setMyListingsShown(n => n + 5)} style={{ alignSelf: "center", padding: "10px 20px", borderRadius: 10, border: "1px solid #222", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#222", marginTop: 4 }}>Ver más ({myListings.length - myListingsShown} restantes)</button>
              )}
            </div>
          )}

          <Btn primary onClick={() => onNavigate("create")} style={{ marginTop: 24 }}><Plus size={16} /> Publicar nuevo espacio</Btn>
          </>)}

          {dashboardSubTab === "incoming" && (<>
          {incomingBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#555", background: "#f7f7f7", borderRadius: 16 }}>
              <Calendar size={40} color="#ccc" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, marginBottom: 4 }}>No hay reservas</p>
              <p style={{ fontSize: 13 }}>Tus futuras reservas aparecerán aquí.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {incomingBookings.slice(0, incomingBookingsShown).map(b => {
                const isPending = b.status === "pending_approval";
                const isRejected = b.status === "rejected";
                const statusColor = isPending ? "#c76d00" : isRejected || b.status === "cash_unpaid" ? "#b91c1c" : "#008A05";
                const statusLabel = isPending ? "Pendiente de aprobación" : isRejected ? "Rechazada" : b.status === "completed" ? "Pagada" : b.status === "cash_unpaid" ? "Pago no recibido" : "Confirmada";
                const handleApprove = async () => {
                  try {
                    if (onUpdateBooking) await onUpdateBooking(b.id, { status: "confirmed", approved_at: new Date().toISOString() });
                    pushNotification({ userId: b.conductorId, type: 'booking', title: 'Reserva aprobada', body: `Tu reserva en ${b.listingTitle} fue aprobada por el anfitrión.`, link: 'bookings' });
                    // Second notification to host: request cash payment confirmation
                    if (b.payMethod === "efectivo" && b.hostId) {
                      pushNotification({ userId: b.hostId, type: 'booking', title: 'Confirma la recepción del pago en efectivo', body: `Cuando recibas el pago de ${b.conductorName || 'el conductor'} por ${b.listingTitle}, confírmalo desde tu panel.`, link: 'profile' });
                    }
                  } catch(e) { alert("Error al aprobar la reserva."); }
                };
                const handleReject = async () => {
                  if (!window.confirm("¿Rechazar esta solicitud de reserva?")) return;
                  try {
                    if (onUpdateBooking) await onUpdateBooking(b.id, { status: "rejected", rejected_at: new Date().toISOString() });
                    pushNotification({ userId: b.conductorId, type: 'booking', title: 'Reserva rechazada', body: `Tu solicitud para ${b.listingTitle} fue rechazada.`, link: 'bookings' });
                  } catch(e) { alert("Error al rechazar la reserva."); }
                };
                const isCash = b.payMethod === "efectivo";
                const isConfirmed = b.status === "confirmed";
                const isCompleted = b.status === "completed";
                const isCashUnpaid = b.status === "cash_unpaid";
                const bookingTotal = b.total || b.price || 0;
                const handleConfirmCash = async () => {
                  if (!window.confirm(`¿Confirmas haber recibido ${formatCLP(bookingTotal)} en efectivo del conductor?`)) return;
                  try {
                    if (onUpdateBooking) await onUpdateBooking(b.id, { status: "completed" });
                    pushNotification({ userId: b.conductorId, type: 'booking', title: 'Pago en efectivo confirmado', body: `${b.hostName || 'El anfitrión'} confirmó haber recibido el pago de ${b.listingTitle}.`, link: 'bookings' });
                  } catch(e) { alert("Error al confirmar el pago."); }
                };
                const handleCashUnpaid = async () => {
                  const bookingTotal = b.total || b.price || 0;
                  const penalty = Math.round(bookingTotal * 0.3);
                  const totalDebt = bookingTotal + penalty;
                  if (!window.confirm(`¿Marcar esta reserva como NO pagada? Se cobrará al conductor el total de la reserva (${formatCLP(bookingTotal)}) más una multa del 30% (${formatCLP(penalty)}), totalizando ${formatCLP(totalDebt)}.`)) return;
                  try {
                    // The on_booking_cash_unpaid DB trigger applies (total + 30%) to
                    // the conductor's profiles.credit server-side, bypassing RLS.
                    if (onUpdateBooking) await onUpdateBooking(b.id, { status: "cash_unpaid" });
                    pushNotification({ userId: b.conductorId, type: 'booking', title: 'Pago pendiente — multa aplicada', body: `${b.hostName || 'El anfitrión'} reportó no haber recibido el pago de ${b.listingTitle}. Se agregó ${formatCLP(totalDebt)} a tu saldo pendiente.`, link: 'profile' });
                  } catch(e) { console.error(e); alert("Error al marcar como no pagado."); }
                };
                return (
                  <div key={b.id} style={{ padding: 16, background: isPending ? "#fffbeb" : "#f7f7f7", borderRadius: 12, border: isPending ? "1px solid #f59e0b33" : "1px solid transparent" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <Avatar name={b.conductorName || "U"} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 600 }}>{b.conductorName}</div>
                          {driverRatings[b.conductorId] ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "#555" }}>
                              <Star size={12} fill="#222" stroke="none" />
                              <span style={{ fontWeight: 700, color: "#222" }}>{driverRatings[b.conductorId].avg}</span>
                              <span>({driverRatings[b.conductorId].count})</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#888" }}>Sin calificaciones</span>
                          )}
                        </div>
                        <div style={{ color: "#555", fontSize: 13 }}>{b.listingTitle}</div>
                        {b.priceUnit === "mes" && b.monthlyStartDate && (
                          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                            Desde {new Date(b.monthlyStartDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                            {b.monthlyEndMonth && ` hasta fin de ${new Date(b.monthlyEndMonth + "-01").toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`}
                            {b.fullMonths > 0 && ` · ${b.fullMonths} mes${b.fullMonths > 1 ? "es" : ""} + prorrateo`}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, color: statusColor, fontWeight: 600 }}>{statusLabel}</div>
                        <div style={{ fontWeight: 700 }}>{formatCLP(b.total || b.price)}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{b.payMethod === "efectivo" ? "Efectivo" : b.payMethod === "tarjeta" ? "Tarjeta" : b.payMethod === "paypal" ? "PayPal" : "—"}</div>
                      </div>
                    </div>
                    {isPending && (
                      <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                        <Btn primary onClick={handleApprove} style={{ flex: 1 }}><Check size={16} /> Aprobar</Btn>
                        <Btn outline onClick={handleReject} style={{ flex: 1, color: "#b91c1c", borderColor: "#fca5a5" }}><X size={16} /> Rechazar</Btn>
                      </div>
                    )}
                    {isCash && isConfirmed && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                        <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> Esperando confirmación de pago en efectivo</div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <Btn primary onClick={handleConfirmCash} style={{ flex: 1 }}><Check size={16} /> Confirmar pago recibido</Btn>
                          <Btn outline onClick={handleCashUnpaid} style={{ flex: 1, color: "#b91c1c", borderColor: "#fca5a5" }}><X size={16} /> No recibí el pago</Btn>
                        </div>
                      </div>
                    )}
                    {isCash && isCompleted && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 12, color: "#008A05", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle size={14} /> Pago en efectivo confirmado
                      </div>
                    )}
                    {isCash && isCashUnpaid && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 12, color: "#b91c1c", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <AlertCircle size={14} /> Pago no recibido — deuda aplicada al conductor: {formatCLP(bookingTotal + Math.round(bookingTotal * 0.3))} (total + 30%)
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: isPending ? 8 : 12, paddingTop: isPending ? 0 : 12, borderTop: isPending ? "none" : "1px solid #eee" }}>
                      <Btn outline onClick={() => setChatBooking(b)} style={{ flex: 1 }}><MessageCircle size={16} /> Chat con {b.conductorName || "conductor"}</Btn>
                      {!isPending && !isRejected && !doneReviews[`${b.id}_driver`] && (
                        <button onClick={() => setReviewModal({ bookingId: b.id, type: "driver", targetId: b.conductorId, listingId: b.listingId, title: "Calificar conductor", subtitle: b.conductorName })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${BRAND_COLOR}44`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: BRAND_COLOR }}>
                          <Star size={14} /> Calificar conductor
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {incomingBookings.length > incomingBookingsShown && (
                <button onClick={() => setIncomingBookingsShown(n => n + 5)} style={{ alignSelf: "center", padding: "10px 20px", borderRadius: 10, border: "1px solid #222", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#222", marginTop: 4 }}>Ver más ({incomingBookings.length - incomingBookingsShown} restantes)</button>
              )}
            </div>
          )}

          </>)}
        </div>
      )}

      {/* Edit Listing Modal Omitted: Replaced by Full Page editing */}

      {tab === "profile" && (<>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Información personal</h3>
              <button onClick={() => setTab("settings")} style={{ fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: BRAND_COLOR }}>Editar en Configuración</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Nombre completo", value: displayName || "—" },
                { label: "Email", value: displayEmail || "—" },
                { label: "Teléfono", value: displayPhone || "—" },
                ...(displayId ? [{ label: "Identificación", value: displayId }] : []),
              ].map((item, i) => (
                <div key={i} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ color: "#555", fontSize: 14 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Verificaciones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { l: "Identidad", done: !!user?.idNumber },
                { l: "Correo electrónico", done: !!user?.email },
                { l: "Número de teléfono", done: !!user?.phone },
                { l: "Google", done: false },
              ].map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {v.done ? <CheckCircle size={20} color="#008A05" /> : <AlertCircle size={20} color="#555" />}
                  <span style={{ color: v.done ? "#222" : "#555" }}>{v.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parking Preferences */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Preferencias de estacionamiento</h3>
          <div style={{ padding: 20, background: "#f7f7f7", borderRadius: 12, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 6, display: "block", fontWeight: 600 }}>Tipo de espacio preferido</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ v: "", l: "Sin preferencia" }, { v: "covered", l: "Techado 🏠" }, { v: "outdoor", l: "Aire libre ☀️" }].map(t => (
                  <button key={t.v} onClick={() => setPrefs({ ...prefs, type: t.v })} style={{ padding: "8px 16px", borderRadius: 8, border: prefs.type === t.v ? `2px solid ${DARK_BG}` : "1px solid #ddd", background: prefs.type === t.v ? "#fff" : "transparent", fontWeight: prefs.type === t.v ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{t.l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Necesito cargador eléctrico (EV)</span>
              <div onClick={() => setPrefs({ ...prefs, ev: !prefs.ev })} style={{ width: 44, height: 24, borderRadius: 12, background: prefs.ev ? BRAND_COLOR : "#ccc", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: prefs.ev ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 6, display: "block", fontWeight: 600 }}>Seguridad requerida</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SECURITY_FEATURES.map(s => (
                  <button key={s} onClick={() => setPrefs({ ...prefs, security: (prefs.security || []).includes(s) ? prefs.security.filter(x => x !== s) : [...(prefs.security || []), s] })} style={{ padding: "6px 14px", borderRadius: 8, border: (prefs.security || []).includes(s) ? `2px solid ${DARK_BG}` : "1px solid #ddd", background: (prefs.security || []).includes(s) ? "#f0f0f0" : "#fff", fontWeight: (prefs.security || []).includes(s) ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
                ))}
              </div>
            </div>
            <Btn primary onClick={savePrefs} disabled={prefsSaving}>{prefsSaving ? "Guardando..." : "Guardar preferencias"}</Btn>
          </div>
        </div>
      </>)}

      {tab === "vehicles" && (() => {
        const vehicleFormJsx = (
          <div id="vehicle-form" style={{ padding: 20, background: "#f7f7f7", borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, border: editingVehicleId ? `2px solid ${BRAND_COLOR}` : "1px solid transparent" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: editingVehicleId ? BRAND_COLOR : "#222" }}>{editingVehicleId ? "Editar vehículo" : "Agregar vehículo"}</h4>
              {editingVehicleId && (
                <span style={{ fontSize: 12, color: "#777" }}>Estás modificando un vehículo existente</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Marca</label>
                <FormAutocomplete value={newVehicle.brand} onChange={val => setNewVehicle({ ...newVehicle, brand: val, model: "", type: "", width: "", length: "", height: "" })} options={[...CAR_BRANDS].sort()} placeholder="Ej: Toyota" alwaysShowOtros />
                {newVehicle.brand === "Otros" && (
                  <div style={{ marginTop: 8 }}>
                    <Input placeholder="Escribe la marca comercial" value={newVehicle.customBrand} onChange={e => setNewVehicle({ ...newVehicle, customBrand: e.target.value })} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Modelo</label>
                {newVehicle.brand === "Otros" ? (
                  <Input placeholder="Escribe el modelo" value={newVehicle.customModel} onChange={e => setNewVehicle({ ...newVehicle, model: "Otros", customModel: e.target.value })} />
                ) : (
                  <>
                    <FormAutocomplete value={newVehicle.model} onChange={val => {
                      const autoType = val && val !== "Otros" ? getVehicleTypeForModel(newVehicle.brand, val) : "";
                      const nextType = autoType || newVehicle.type;
                      const dims = val && val !== "Otros" ? getVehicleDimensions(newVehicle.brand, val, nextType) : null;
                      setNewVehicle({
                        ...newVehicle,
                        model: val,
                        type: nextType,
                        width: dims ? dims.width : "",
                        length: dims ? dims.length : "",
                        height: dims ? dims.height : "",
                      });
                    }} disabled={!newVehicle.brand} options={(CAR_MODELS[newVehicle.brand] || []).sort()} placeholder="Ej: Corolla" alwaysShowOtros />
                    {newVehicle.model === "Otros" && (
                      <div style={{ marginTop: 8 }}>
                        <Input placeholder="Escribe el modelo exacto" value={newVehicle.customModel} onChange={e => setNewVehicle({ ...newVehicle, customModel: e.target.value })} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Color</label>
                <FormAutocomplete value={newVehicle.color} onChange={val => setNewVehicle({ ...newVehicle, color: val })} options={[...CAR_COLORS].sort()} placeholder="Ej: Blanco" alwaysShowOtros />
                {newVehicle.color === "Otros" && (
                  <div style={{ marginTop: 8 }}>
                    <Input placeholder="Escribe el color" value={newVehicle.customColor} onChange={e => setNewVehicle({ ...newVehicle, customColor: e.target.value })} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Patente</label>
                <Input placeholder="Ej: ABCD-12" value={newVehicle.plate} onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Ancho (m)</label>
                <Input type="number" step="0.01" min="0" placeholder="1.85" value={newVehicle.width} onChange={e => setNewVehicle({ ...newVehicle, width: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Largo (m)</label>
                <Input type="number" step="0.01" min="0" placeholder="4.63" value={newVehicle.length} onChange={e => setNewVehicle({ ...newVehicle, length: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 600 }}>Alto (m)</label>
                <Input type="number" step="0.01" min="0" placeholder="1.50" value={newVehicle.height} onChange={e => setNewVehicle({ ...newVehicle, height: e.target.value })} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#777", marginTop: -4 }}>Rellenamos automáticamente las medidas del modelo seleccionado. Puedes ajustarlas si tu vehículo tiene accesorios o medidas distintas.</div>
            <div>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 6, display: "block", fontWeight: 600 }}>Tipo de vehículo</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {VEHICLE_TYPES.map(v => (
                  <button key={v} onClick={() => {
                    const hasModelDims = !!getVehicleDimensions(newVehicle.brand, newVehicle.model, null);
                    const next = { ...newVehicle, type: v };
                    if (!hasModelDims) {
                      const typeDims = getVehicleDimensions(null, null, v);
                      if (typeDims) {
                        next.width = typeDims.width;
                        next.length = typeDims.length;
                        next.height = typeDims.height;
                      }
                    }
                    setNewVehicle(next);
                  }} style={{ padding: "6px 14px", borderRadius: 8, border: newVehicle.type === v ? `2px solid ${DARK_BG}` : "1px solid #ddd", background: newVehicle.type === v ? "#f0f0f0" : "#fff", fontWeight: newVehicle.type === v ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 6, display: "block", fontWeight: 600 }}>¿Es eléctrico?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setNewVehicle({ ...newVehicle, ev: false })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: newVehicle.ev === false ? `2px solid ${DARK_BG}` : "1px solid #ddd", background: newVehicle.ev === false ? "#f0f0f0" : "#fff", fontWeight: newVehicle.ev === false ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  <Car size={14} /> No
                </button>
                <button type="button" onClick={() => setNewVehicle({ ...newVehicle, ev: true })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: newVehicle.ev === true ? `2px solid ${BRAND_COLOR}` : "1px solid #ddd", background: newVehicle.ev === true ? "#fff5f7" : "#fff", color: newVehicle.ev === true ? BRAND_COLOR : "#222", fontWeight: newVehicle.ev === true ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  ⚡ Sí, eléctrico
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>Solo activa esto si tu vehículo necesita carga eléctrica.</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setShowAddVehicle(false); setEditingVehicleId(null); setNewVehicle({ brand: "", customBrand: "", model: "", customModel: "", color: "", customColor: "", type: "", plate: "", ev: false, width: "", length: "", height: "" }); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Cancelar</button>
              <Btn primary onClick={addVehicle} disabled={!newVehicle.brand || !newVehicle.type}>{editingVehicleId ? "Guardar cambios" : "Guardar"}</Btn>
            </div>
          </div>
        );

        const showAddingForm = showAddVehicle && !editingVehicleId;

        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Mis Vehículos</h3>
              <button onClick={() => { setShowAddVehicle(!showAddVehicle); setEditingVehicleId(null); setNewVehicle({ brand: "", customBrand: "", model: "", customModel: "", color: "", customColor: "", type: "", plate: "", ev: false, width: "", length: "", height: "" }); }} style={{ display: "flex", alignItems: "center", gap: 6, background: BRAND_COLOR, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}><Plus size={14} /> Agregar</button>
            </div>

            {vehicles.length === 0 && !showAddVehicle ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#555", background: "#f7f7f7", borderRadius: 12 }}>
                <Car size={36} color="#ccc" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14 }}>No tienes vehículos registrados</p>
                <p style={{ fontSize: 13, color: "#999" }}>Agrega tus vehículos para filtrar estacionamientos más rápido</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {vehicles.slice(0, vehiclesShown).map(v => (
                  <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f7f7f7", borderRadius: 12 }}>
                      <Car size={20} color="#555" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{v.brand ? `${v.brand.startsWith("Otros-") ? v.brand.slice(6) : v.brand} ${v.model && v.model.startsWith("Otros-") ? v.model.slice(6) : (v.model || "")}` : v.name}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{v.type}{v.color ? ` · ${v.color.startsWith("Otros-") ? v.color.slice(6) : v.color}` : ""}{v.plate ? ` · Patente: ${v.plate}` : ""}{v.ev ? " · ⚡ Eléctrico" : ""}{(v.width || v.length || v.height) ? ` · ${[v.width && `${v.width}m ancho`, v.length && `${v.length}m largo`, v.height && `${v.height}m alto`].filter(Boolean).join(" · ")}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button onClick={() => editingVehicleId === v.id ? (setShowAddVehicle(false), setEditingVehicleId(null), setNewVehicle({ brand: "", customBrand: "", model: "", customModel: "", color: "", customColor: "", type: "", plate: "", ev: false, width: "", length: "", height: "" })) : editVehicle(v.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Edit size={16} color={editingVehicleId === v.id ? BRAND_COLOR : "#555"} /></button>
                        <button onClick={() => removeVehicle(v.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={16} color="#999" /></button>
                      </div>
                    </div>
                    {editingVehicleId === v.id && vehicleFormJsx}
                  </div>
                ))}
                {vehicles.length > vehiclesShown && (
                  <button onClick={() => setVehiclesShown(n => n + 5)} style={{ alignSelf: "center", padding: "10px 20px", borderRadius: 10, border: "1px solid #222", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#222", marginTop: 4 }}>Ver más ({vehicles.length - vehiclesShown} restantes)</button>
                )}
              </div>
            )}

            {showAddingForm && (
              <div style={{ marginTop: 16 }}>{vehicleFormJsx}</div>
            )}
          </div>
        );
      })()}

      {tab === "ratings" && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Mis calificaciones</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { id: "host", l: "Anfitrión", count: myHostReviews.length, avg: myHostAvg },
              { id: "driver", l: "Conductor", count: myDriverReviews.length, avg: myDriverAvg },
              { id: "listings", l: "Estacionamientos", count: allReviews.length, avg: avgRating },
            ].map(o => (
              <button
                key={o.id}
                onClick={() => setRatingsSubTab(o.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: ratingsSubTab === o.id ? `2px solid ${DARK_BG}` : "1px solid #ddd",
                  background: ratingsSubTab === o.id ? "#fff" : "transparent",
                  fontWeight: ratingsSubTab === o.id ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {o.l}
                {o.count > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#555" }}>
                    <Star size={12} fill="#222" stroke="none" /> {o.avg} · {o.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {ratingsSubTab === "host" && (
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                Reseñas como anfitrión {myHostReviews.length > 0 && <span style={{ fontWeight: 400, fontSize: 14, color: "#555" }}>({myHostReviews.length})</span>}
              </h4>
              {myHostReviews.length === 0 ? (
                <p style={{ fontSize: 14, color: "#555" }}>Aún no tienes reseñas como anfitrión. Aparecerán aquí cuando los conductores te califiquen a ti (no a tus espacios).</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Star size={20} fill="#222" stroke="none" />
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{myHostAvg}</span>
                    <span style={{ color: "#555", fontSize: 14 }}>· {myHostReviews.length} reseña{myHostReviews.length !== 1 ? "s" : ""}</span>
                  </div>
                  {myHostReviews.map((r) => (
                    <div key={r.id} style={{ padding: 16, background: "#f7f7f7", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Avatar src={null} name={r.author_name || "Conductor"} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author_name || "Conductor"}</div>
                          <div style={{ color: "#555", fontSize: 12 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}><StarRating rating={r.rating} /></div>
                      </div>
                      {r.comment && <p style={{ fontSize: 14, color: "#333", lineHeight: 1.5, margin: 0 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {ratingsSubTab === "driver" && (
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                Calificación como conductor {myDriverReviews.length > 0 && <span style={{ fontWeight: 400, fontSize: 14, color: "#555" }}>({myDriverReviews.length})</span>}
              </h4>
              {myDriverReviews.length === 0 ? (
                <p style={{ fontSize: 14, color: "#555" }}>Aún no tienes calificaciones como conductor. Aparecerán aquí cuando los anfitriones te califiquen.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Star size={20} fill="#222" stroke="none" />
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{myDriverAvg}</span>
                    <span style={{ color: "#555", fontSize: 14 }}>· {myDriverReviews.length} calificación{myDriverReviews.length !== 1 ? "es" : ""}</span>
                  </div>
                  {myDriverReviews.map((r) => (
                    <div key={r.id} style={{ padding: 16, background: "#f7f7f7", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Avatar src={null} name={r.author_name || "Anfitrión"} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author_name || "Anfitrión"}</div>
                          <div style={{ color: "#555", fontSize: 12 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}><StarRating rating={r.rating} /></div>
                      </div>
                      {r.comment && <p style={{ fontSize: 14, color: "#333", lineHeight: 1.5, margin: 0 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {ratingsSubTab === "listings" && (
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                Reseñas de mis estacionamientos {allReviews.length > 0 && <span style={{ fontWeight: 400, fontSize: 14, color: "#555" }}>({allReviews.length})</span>}
              </h4>
              {allReviews.length === 0 ? (
                <p style={{ fontSize: 14, color: "#555" }}>Aún no tienes reseñas en tus estacionamientos. Aparecerán aquí cuando los conductores los califiquen.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Star size={20} fill="#222" stroke="none" />
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{avgRating}</span>
                    <span style={{ color: "#555", fontSize: 14 }}>· {allReviews.length} reseñas en total</span>
                  </div>
                  {allReviews.map((r, i) => (
                    <div key={i} style={{ padding: 16, background: "#f7f7f7", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Avatar src={null} name={r.author_name || r.authorName || "Usuario"} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author_name || r.authorName || "Usuario"}</div>
                          <div style={{ color: "#555", fontSize: 12 }}>{(r.created_at || r.date) ? new Date(r.created_at || r.date).toLocaleDateString("es-CL", { year: "numeric", month: "long" }) : ""}</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}><StarRating rating={r.rating} /></div>
                      </div>
                      {r.comment && <p style={{ fontSize: 14, color: "#333", lineHeight: 1.5, margin: 0 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (() => {
        // Build monthly history from all confirmed incoming bookings
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const monthlyData = {};

        // Distribute each booking's earnings into the months they belong to
        const addToMonth = (month, year, earn, b) => {
          const key = `${year}-${String(month + 1).padStart(2, "0")}`;
          if (!monthlyData[key]) monthlyData[key] = { key, year, month, bookings: [], earnings: 0, count: 0 };
          monthlyData[key].earnings += earn;
          if (!monthlyData[key].bookings.includes(b)) { monthlyData[key].bookings.push(b); monthlyData[key].count++; }
        };

        confirmedIncoming.forEach(b => {
          if (b.billingSchedule === "monthly" && b.priceUnit === "mes" && b.fullMonths > 0) {
            // Installment: distribute across months
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
            // Non-installment: all in booking start month (or creation)
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

        // Compute future months from installment bookings
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

        // Per-listing stats
        const listingStats = myListings.map(l => {
          const lBookings = confirmedIncoming.filter(b => String(b.listingId) === String(l.id));
          const totalEarned = lBookings.reduce((s, b) => s + earningsFromBooking(b), 0);
          const monthlyEarn = lBookings.reduce((s, b) => s + earningsInMonth(b, currentMonth, currentYear), 0);
          const monthBookingCount = lBookings.filter(b => earningsInMonth(b, currentMonth, currentYear) > 0).length;
          // Future earnings grouped by month
          const futureMap = {};
          lBookings.forEach(b => {
            futureMonthsForBooking(b).forEach(fm => {
              const fKey = `${fm.year}-${String(fm.month + 1).padStart(2, "0")}`;
              if (!futureMap[fKey]) futureMap[fKey] = { month: fm.month, year: fm.year, earnings: 0 };
              futureMap[fKey].earnings += fm.earnings;
            });
          });
          const futureMonths = Object.values(futureMap).sort((a, b) => a.year - b.year || a.month - b.month);
          const totalFuture = futureMonths.reduce((s, f) => s + f.earnings, 0);
          return { listing: l, totalBookings: lBookings.length, monthBookings: monthBookingCount, totalEarnings: totalEarned, monthlyEarnings: monthlyEarn, occupancy: lBookings.length, futureMonths, totalFuture };
        }).sort((a, b) => b.totalEarnings - a.totalEarnings);

        const totalAllTime = confirmedIncoming.reduce((s, b) => s + earningsFromBooking(b), 0);
        const avgPerBooking = confirmedIncoming.length > 0 ? Math.round(totalAllTime / confirmedIncoming.length) : 0;

        // Max bar for visual scaling
        const maxMonthEarnings = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m.earnings)) : 1;
        const maxListingEarnings = listingStats.length > 0 ? Math.max(...listingStats.map(l => l.totalEarnings)) : 1;

        return (
          <div>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
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

            {/* Monthly history vertical bar chart */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial mensual de ganancias</h3>
              {sortedMonths.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#555", background: "#f7f7f7", borderRadius: 12 }}>
                  <DollarSign size={32} color="#ccc" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 14 }}>Aún no hay datos de ganancias</p>
                </div>
              ) : (() => {
                const displayMonths = [...sortedMonths].reverse().slice(-12);
                const maxVal = Math.max(...displayMonths.map(m => m.earnings), 1);
                return (
                  <div style={{ background: "#f7f7f7", borderRadius: 16, padding: "24px 20px 12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
                      {displayMonths.map(m => {
                        const isCurrent = m.key === currentKey;
                        const isFuture = m.key > currentKey;
                        const barColor = isCurrent ? BRAND_COLOR : isFuture ? "#ffa3b5" : "#ffcdd5";
                        const pct = Math.max(4, (m.earnings / maxVal) * 100);
                        return (
                          <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", marginBottom: 4, whiteSpace: "nowrap" }}>{formatCLP(m.earnings)}</div>
                            <div style={{ width: "100%", maxWidth: 48, borderRadius: "6px 6px 0 0", background: barColor, height: `${pct}%`, transition: "height .4s", minHeight: 4, position: "relative", border: isCurrent ? `2px solid ${BRAND_COLOR}` : "none" }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
                      {displayMonths.map(m => (
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

            {/* Per-listing ranking */}
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
                    const maxFutureVal = ls.futureMonths.length > 0 ? Math.max(...ls.futureMonths.map(f => f.earnings), 1) : 1;
                    return (
                    <div key={ls.listing.id} style={{ background: "#f7f7f7", borderRadius: 14, padding: "16px 20px", border: idx === 0 ? `2px solid ${BRAND_COLOR}22` : "none" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: idx === 0 ? BRAND_COLOR : idx === 1 ? "#f5a623" : idx === 2 ? "#aaa" : "#ddd", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{ls.listing.title}</div>
                          <div style={{ fontSize: 12, color: "#555" }}>{ls.listing.location}</div>
                        </div>
                        {idx === 0 && <Badge style={{ background: "#fef2f2", color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}33` }}>Más rentable</Badge>}
                      </div>
                      {/* Stats row */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Este mes</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#008A05" }}>{formatCLP(ls.monthlyEarnings)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Total ganado</div>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{formatCLP(ls.totalEarnings)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Reservas mes</div>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{ls.monthBookings}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.3 }}>Total reservas</div>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{ls.totalBookings}</div>
                        </div>
                      </div>
                      {/* Earnings bar */}
                      <div style={{ marginTop: 10, background: "#e5e5e5", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: idx === 0 ? BRAND_COLOR : "#ffa3b5", width: `${Math.max(2, (ls.totalEarnings / maxListingEarnings) * 100)}%`, transition: "width .3s" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: "right" }}>
                        {maxListingEarnings > 0 ? Math.round((ls.totalEarnings / maxListingEarnings) * 100) : 0}% del más rentable
                      </div>

                      {/* Por cobrar section */}
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
                                {ls.futureMonths.map(fm => {
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
                                {ls.futureMonths.map(fm => (
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

            {/* Monthly breakdown table */}
            {sortedMonths.length > 0 && (
              <div>
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
                      {sortedMonths.map(m => {
                        const uniqueListings = new Set(m.bookings.map(b => b.listingId)).size;
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

            {/* Per-booking transactions with commission breakdown */}
            {confirmedIncoming.length > 0 && (() => {
              const totalGross = confirmedIncoming.reduce((s, b) => s + (b.total || b.price || 0), 0);
              const totalCommission = confirmedIncoming.reduce((s, b) => s + feeFromGross(b.total || b.price || 0), 0);
              const totalNet = totalGross - totalCommission;
              return (
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial de ingresos</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
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
                        {[...confirmedIncoming].sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt)).map(b => {
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
      })()}

      {tab === "bookings" && (
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Reservas como conductor</h3>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#555" }}>
              <Calendar size={40} color="#ccc" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, marginBottom: 4 }}>No tienes reservas aún</p>
              <p style={{ fontSize: 13 }}>Cuando reserves un estacionamiento, aparecerá aquí.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {myBookings.slice(0, myBookingsShown).map(b => {
                const isPending = b.status === "pending_approval";
                const isRejected = b.status === "rejected";
                const isCompleted = b.status === "completed" || b.status === "confirmed";
                const canRateListing = isCompleted && !doneReviews[`${b.id}_listing`];
                const canRateHost = isCompleted && !doneReviews[`${b.id}_host`];
                const badgeBg = isPending ? "#fef7f0" : isRejected ? "#fef2f2" : "#e8f5e8";
                const badgeColor = isPending ? "#c76d00" : isRejected ? "#b91c1c" : "#008A05";
                const badgeText = isPending ? "Pendiente" : isRejected ? "Rechazada" : "Confirmada";
                return (
                  <div key={b.id} style={{ background: isPending ? "#fffbeb" : "#f7f7f7", borderRadius: 16, border: isPending ? "1px solid #f59e0b33" : "none", overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 16, padding: 20, alignItems: "center" }}>
                      {b.photo ? <img src={b.photo} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 80, height: 60, borderRadius: 8, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={24} color="#bbb" /></div>}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{b.listingTitle}</div>
                        <div style={{ color: "#555", fontSize: 14 }}>{b.location}</div>
                        <div style={{ fontSize: 13, color: BRAND_COLOR, fontWeight: 600, marginTop: 4 }}>
                          {b.startDate || b.createdAt ? new Date(b.startDate || b.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                        </div>
                        {b.priceUnit === "mes" && isPending && (
                          <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>Esperando aprobación del anfitrión</div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{formatCLP(b.total || b.price)}</div>
                        <Badge style={{ marginTop: 4, background: badgeBg, color: badgeColor }}>{badgeText}</Badge>
                      </div>
                    </div>
                    <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <Btn outline onClick={() => setChatBooking(b)} style={{ width: "100%" }}><MessageCircle size={16} /> Chat con anfitrión</Btn>
                      {(canRateListing || canRateHost) && (
                        <div style={{ display: "flex", gap: 8 }}>
                          {canRateListing && (
                            <button onClick={() => setReviewModal({ bookingId: b.id, type: "listing", targetId: b.listingId, listingId: b.listingId, title: "Calificar estacionamiento", subtitle: b.listingTitle })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND_COLOR}44`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: BRAND_COLOR }}>
                              <Star size={14} /> Calificar estacionamiento
                            </button>
                          )}
                          {canRateHost && (
                            <button onClick={() => setReviewModal({ bookingId: b.id, type: "host", targetId: b.hostId, listingId: b.listingId, title: "Calificar anfitrión", subtitle: b.hostName })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND_COLOR}44`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: BRAND_COLOR }}>
                              <Star size={14} /> Calificar anfitrión
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "settings" && (
        <SettingsPanel user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />
      )}

      {/* Review modal */}
      <ReviewModal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        onSubmit={submitReview}
        title={reviewModal?.title || ""}
        subtitle={reviewModal?.subtitle || ""}
        submitting={submittingReview}
      />

      {chatBooking && (
        <BookingChat booking={chatBooking} user={user} onClose={() => setChatBooking(null)} onMarkRead={onMarkRead} />
      )}

      {/* Reviews modal for host */}
      {reviewsListing && (() => {
        const rl = reviewsListing;
        const rvs = rl.reviewsList || [];
        const avg = rvs.length > 0 ? (rvs.reduce((s, r) => s + r.rating, 0) / rvs.length).toFixed(1) : "—";
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setReviewsListing(null); setListingReviewsShown(5); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{rl.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    {rvs.length > 0 ? (
                      <>
                        <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.round(avg) ? "#222" : "none"} stroke="#222" />)}</div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{avg}</span>
                        <span style={{ color: "#555", fontSize: 13 }}>({rvs.length} reseña{rvs.length !== 1 ? "s" : ""})</span>
                      </>
                    ) : (
                      <span style={{ color: "#999", fontSize: 14 }}>Sin reseñas aún</span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setReviewsListing(null); setListingReviewsShown(5); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={22} /></button>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
                {rvs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                    <Star size={36} color="#ddd" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 14 }}>Este espacio aún no tiene reseñas.</p>
                    <p style={{ fontSize: 13, color: "#bbb" }}>Las reseñas aparecerán aquí cuando los conductores las publiquen.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {rvs.slice(0, listingReviewsShown).map((r, i, arr) => {
                      const author = r.author_name || r.authorName || "Usuario";
                      const dateStr = r.created_at || r.date;
                      return (
                        <div key={r.id || i} style={{ padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <Avatar name={author} size={36} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{author}</div>
                              <div style={{ fontSize: 12, color: "#999" }}>{dateStr ? new Date(dateStr).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : ""}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "#222" : "none"} stroke="#222" />)}</div>
                          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>{r.comment}</p>
                        </div>
                      );
                    })}
                    {rvs.length > listingReviewsShown && (
                      <button onClick={() => setListingReviewsShown(n => n + 5)} style={{ alignSelf: "center", padding: "10px 20px", borderRadius: 10, border: "1px solid #222", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#222" }}>Ver más reseñas ({rvs.length - listingReviewsShown} restantes)</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Listing preview modal for host */}
      {previewListing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewListing(null)}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Vista previa del anuncio</h3>
              <button onClick={() => setPreviewListing(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={22} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {(previewListing.photos || []).length > 0 && (
                <img src={previewListing.photos[0]} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
              )}
              <div style={{ padding: "20px 24px" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{previewListing.title}</h2>
                <div style={{ color: "#555", fontSize: 14, marginBottom: 12 }}>{previewListing.location}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  {(previewListing.reviewsList || []).length > 0 ? (
                    <><Star size={14} fill="#222" stroke="none" /><span style={{ fontWeight: 700, fontSize: 14 }}>{((previewListing.reviewsList || []).reduce((s, r) => s + r.rating, 0) / (previewListing.reviewsList || []).length).toFixed(1)}</span><span style={{ color: "#555", fontSize: 13 }}>({(previewListing.reviewsList || []).length} reseña{(previewListing.reviewsList || []).length !== 1 ? "s" : ""})</span></>
                  ) : (
                    <span style={{ color: "#999", fontSize: 13 }}>Sin reseñas</span>
                  )}
                </div>
                <div style={{ background: "#f7f7f7", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{formatCLP(Number(previewListing.price) || 0)}</span>
                  <span style={{ color: "#555", fontSize: 14 }}>/ {previewListing.priceUnit || "hora"}</span>
                </div>
                {previewListing.description && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Descripción</div>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{previewListing.description}</p>
                  </div>
                )}
                {previewListing.vehicleTypes && previewListing.vehicleTypes.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Vehículos aceptados</div>
                    <div style={{ fontSize: 13 }}>{previewListing.vehicleTypes.join(", ")}</div>
                  </div>
                )}
                {previewListing.access && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Tipo de acceso</div>
                    <div style={{ fontSize: 13 }}>{previewListing.access}</div>
                  </div>
                )}
                {previewListing.amenities && previewListing.amenities.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Comodidades</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {previewListing.amenities.map((a, i) => (
                        <span key={i} style={{ background: "#f0f0f0", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "saved" && (
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Mis Voomps guardados</h2>
          {savedListings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#555", background: "#f7f7f7", borderRadius: 16 }}>
              <Heart size={40} color="#ddd" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, marginBottom: 4 }}>Aún no tienes Voomps guardados</p>
              <p style={{ fontSize: 13, color: "#888" }}>Presiona el botón "Guardar" en cualquier estacionamiento para verlo aquí.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {savedListings.map(l => (
                <div key={l.id} onClick={() => onSelectListing && onSelectListing(l)} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #eee", cursor: "pointer", transition: "box-shadow .2s", background: "#fff" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.1)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  {l.photos?.[0] ? (
                    <img src={l.photos[0]} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: 160, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={32} color="#bbb" /></div>
                  )}
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{l.title}</div>
                    <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>{l.location}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: BRAND_COLOR }}>{l.price > 0 ? `$${Number(l.price).toLocaleString("es-CL")} / hora` : `$${Number(l.price_daily || 0).toLocaleString("es-CL")} / día`}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
