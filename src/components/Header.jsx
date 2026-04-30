import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MessageCircle, Car, Menu, LogOut, Bell, BookOpen, Star, DollarSign, AlertCircle, CheckCircle, User, Settings, BarChart3, LayoutDashboard, CalendarCheck, Heart } from "lucide-react";
import { RENTAL_TYPES, VEHICLE_TYPES, BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from "../constants/styles";
import { Avatar, Btn } from "./ui";
import AutocompleteField from "./AutocompleteField";
import { useNotifications } from "../contexts/NotificationsContext";

const NOTIF_ICONS = {
  booking:  { icon: BookOpen,      color: "#0369a1", bg: "#e0f2fe" },
  review:   { icon: Star,          color: "#92400e", bg: "#fef3c7" },
  payment:  { icon: DollarSign,    color: "#065f46", bg: "#d1fae5" },
  message:  { icon: MessageCircle, color: "#6d28d9", bg: "#ede9fe" },
  system:   { icon: AlertCircle,   color: COLORS.muted, bg: "#f3f4f6" },
  default:  { icon: CheckCircle,   color: COLORS.muted, bg: "#f3f4f6" },
};

const PROFILE_TABS = [
  { id: "profile",   label: "Perfil",          icon: User },
  { id: "saved",     label: "Mis Voomps guardados", icon: Heart },
  { id: "vehicles",  label: "Mis Vehículos",   icon: Car },
  { id: "ratings",   label: "Mis calificaciones", icon: Star },
  { id: "dashboard", label: "Panel del anfitrión", icon: LayoutDashboard },
  { id: "analytics", label: "Estadísticas",    icon: BarChart3 },
  { id: "bookings",  label: "Mis reservas",    icon: CalendarCheck },
  { id: "settings",  label: "Configuración",   icon: Settings },
];

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#fff",
  borderBottom: "1px solid #eee",
};

const logoTextStyle = {
  fontWeight: FONT_WEIGHT.extrabold,
  color: BRAND_COLOR,
  letterSpacing: -0.5,
};

const primaryPillButton = {
  display: "flex",
  alignItems: "center",
  gap: SPACING.xs,
  padding: `10px ${SPACING.xl}px`,
  borderRadius: 40,
  border: "none",
  background: BRAND_GRADIENT,
  color: "#fff",
  cursor: "pointer",
  fontWeight: FONT_WEIGHT.bold,
  fontSize: FONT_SIZE.md,
  fontFamily: "inherit",
  boxShadow: "0 2px 8px rgba(255,56,92,.3)",
  transition: "transform .15s, box-shadow .15s",
};

const publishButton = {
  padding: `${SPACING.xs}px ${SPACING.md}px`,
  borderRadius: SPACING.xl,
  border: "none",
  background: BRAND_GRADIENT,
  color: "#fff",
  cursor: "pointer",
  fontWeight: FONT_WEIGHT.bold,
  fontSize: FONT_SIZE.md,
  fontFamily: "inherit",
  boxShadow: "0 2px 8px rgba(255,56,92,.3)",
  transition: "transform .15s, box-shadow .15s",
};

const iconButton = {
  position: "relative",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: SPACING.xs,
  borderRadius: "50%",
  transition: "background .15s",
};

const badgeStyle = {
  position: "absolute",
  top: 2,
  right: 2,
  width: SPACING.md,
  height: SPACING.md,
  borderRadius: "50%",
  background: BRAND_COLOR,
  color: "#fff",
  fontSize: 10,
  fontWeight: FONT_WEIGHT.bold,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #fff",
};

const dropdownPanel = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  background: "#fff",
  borderRadius: RADIUS.xl,
  boxShadow: "0 12px 40px rgba(0,0,0,.14)",
  border: "1px solid #eee",
  zIndex: 999,
  overflow: "hidden",
  animation: "fadeIn .15s",
};

const dropdownHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `14px 18px`,
  borderBottom: "1px solid #eee",
};

const notifEmptyStyle = {
  textAlign: "center",
  padding: `40px ${SPACING.xl}px`,
  color: COLORS.light,
};

const notifItemStyle = (read, hasLink) => ({
  display: "flex",
  gap: SPACING.sm,
  padding: `${SPACING.sm}px 18px`,
  background: read ? "#fff" : "#fef7f5",
  cursor: hasLink ? "pointer" : "default",
  borderBottom: "1px solid #f5f5f5",
  transition: "background .15s",
});

const notifIconWrap = (bg) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const profileMenuTrigger = (open) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: `5px 5px 5px ${SPACING.sm}px`,
  border: `1px solid ${COLORS.border}`,
  borderRadius: SPACING.xl,
  cursor: "pointer",
  background: open ? "#f7f7f7" : "#fff",
  transition: "background .15s, box-shadow .15s, border-color .15s",
  boxShadow: open ? "0 2px 8px rgba(0,0,0,.06)" : "none",
});

const profileMenuItem = {
  display: "flex",
  alignItems: "center",
  gap: SPACING.sm,
  padding: `10px 18px`,
  cursor: "pointer",
  fontSize: FONT_SIZE.md,
  color: COLORS.text,
  transition: "background .12s",
};

const logoutItem = {
  display: "flex",
  alignItems: "center",
  gap: SPACING.sm,
  padding: `${SPACING.sm}px 18px`,
  cursor: "pointer",
  fontSize: FONT_SIZE.md,
  color: BRAND_COLOR,
  fontWeight: FONT_WEIGHT.semibold,
  borderTop: "1px solid #eee",
  transition: "background .12s",
};

const searchFieldBox = {
  background: "#fff",
  borderRadius: RADIUS.lg,
  padding: `10px 14px`,
};

const fieldLabelStyle = {
  fontSize: FONT_SIZE.xs,
  fontWeight: FONT_WEIGHT.bold,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 3,
  color: COLORS.muted,
};

const fieldInputStyle = (hasValue) => ({
  border: "none",
  outline: "none",
  fontSize: FONT_SIZE.md,
  width: "100%",
  fontFamily: "inherit",
  background: "transparent",
  color: hasValue ? COLORS.text : COLORS.light,
  cursor: "pointer",
});

const filterChipStyle = {
  fontSize: FONT_SIZE.sm,
  background: "#ffe4e8",
  color: BRAND_COLOR,
  padding: `3px 10px`,
  borderRadius: 20,
  fontWeight: FONT_WEIGHT.semibold,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const mobileNavBar = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 99,
  background: "#fff",
  borderTop: "1px solid #eee",
  padding: `${SPACING.xs}px ${SPACING.sm}px calc(${SPACING.xs}px + env(safe-area-inset-bottom))`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  gap: SPACING.xs,
  boxShadow: "0 -4px 16px rgba(0,0,0,.08)",
};

const mobileNavButton = {
  position: "relative",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: SPACING.xs,
  borderRadius: RADIUS.lg,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  color: COLORS.muted,
  fontFamily: "inherit",
  fontSize: 10,
  fontWeight: FONT_WEIGHT.semibold,
};

const mobileNavBadge = {
  position: "absolute",
  top: 2,
  right: SPACING.xs,
  minWidth: SPACING.md,
  height: SPACING.md,
  padding: `0 4px`,
  borderRadius: SPACING.xs,
  background: BRAND_COLOR,
  color: "#fff",
  fontSize: 10,
  fontWeight: FONT_WEIGHT.bold,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #fff",
};

const mobilePublishButton = {
  flexShrink: 0,
  padding: `10px 18px`,
  borderRadius: SPACING.xl,
  border: "none",
  background: BRAND_GRADIENT,
  color: "#fff",
  cursor: "pointer",
  fontWeight: FONT_WEIGHT.bold,
  fontSize: FONT_SIZE.base,
  fontFamily: "inherit",
  boxShadow: "0 2px 8px rgba(255,56,92,.3)",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const mobileSheetOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  zIndex: 200,
};

const mobileSheet = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 201,
  background: "#fff",
  borderTopLeftRadius: SPACING.lg,
  borderTopRightRadius: SPACING.lg,
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 -8px 32px rgba(0,0,0,.2)",
  animation: "fadeIn .2s",
};

const mobileSheetHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${SPACING.md}px ${SPACING.lg}px`,
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  background: "#fff",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const Header = ({ onNavigate, currentPage, searchQuery, setSearchQuery, user, onLogout, searchVehicle, setSearchVehicle, searchDate, setSearchDate, searchRentalType, setSearchRentalType, unreadMessages, listings }) => {
  const [expanded, setExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const notifRef = useRef(null);
  const profileMenuRef = useRef(null);
  const { notifications, unread, markAllRead, markRead } = useNotifications();

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = isMobile ? "76px" : "";
    return () => { document.body.style.paddingBottom = ""; };
  }, [isMobile]);

  // Close panels when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const comunas = useMemo(() => {
    const fromListings = listings?.map(l => l.location?.split(",")[0]?.trim()).filter(Boolean) || [];
    return [...new Set(fromListings)].sort();
  }, [listings]);

  return (
    <>
    <header style={headerStyle}>
      <div style={{ maxWidth: 1760, margin: "0 auto", padding: isMobile ? `0 ${SPACING.sm}px` : `0 ${SPACING.xl}px` }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 56 : 66, gap: SPACING.xs }}>
          <div onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <img src="/logo.png" alt="Voomp" style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: RADIUS.md }} />
          </div>

          {!isMobile && <button onClick={() => setExpanded(!expanded)} style={primaryPillButton} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,56,92,.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,56,92,.3)"; }}>
            <Search size={16} /> Encuentra tu estacionamiento
          </button>}

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: isMobile ? "auto" : 0 }}>
            {isMobile && <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: "none", background: BRAND_GRADIENT, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(255,56,92,.3)" }}>
              <Search size={18} />
            </button>}
            {!isMobile && <button onClick={() => onNavigate("create")} style={publishButton} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,56,92,.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,56,92,.3)"; }}>Publica tu Voomp</button>}

            {/* Messages */}
            {!isMobile && <button onClick={() => onNavigate("messages")} style={iconButton} onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <MessageCircle size={20} />
              {unreadMessages > 0 && (
                <div style={badgeStyle}>{unreadMessages > 9 ? "9+" : unreadMessages}</div>
              )}
            </button>}

            {/* Notifications Bell */}
            {!isMobile && <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={iconButton}
                onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <div style={badgeStyle}>{unread > 9 ? "9+" : unread}</div>
                )}
              </button>

              {notifOpen && (
                <div style={{ ...dropdownPanel, width: 360 }}>
                  <div style={dropdownHeader}>
                    <span style={{ fontWeight: FONT_WEIGHT.bold, fontSize: 15 }}>Notificaciones</span>
                    {notifications.some(n => !n.read) && (
                      <button onClick={markAllRead} style={{ fontSize: FONT_SIZE.sm, color: BRAND_COLOR, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: FONT_WEIGHT.semibold }}>Marcar todo leído</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={notifEmptyStyle}>
                        <Bell size={32} style={{ marginBottom: SPACING.xs, opacity: 0.3 }} />
                        <div style={{ fontSize: FONT_SIZE.md }}>Sin notificaciones aún</div>
                      </div>
                    ) : notifications.map(n => {
                      const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
                      const IconComp = cfg.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => { markRead(n.id); if (n.link) { const raw = typeof n.link === 'string' ? n.link.replace(/^\/+/, '') : ''; const [pg, tb, sb] = raw.split('/'); const known = ['home', 'profile', 'messages', 'create', 'listing']; if (pg && known.includes(pg)) onNavigate(pg, tb ? { tab: tb, subTab: sb } : undefined); } setNotifOpen(false); }}
                          style={notifItemStyle(n.read, !!n.link)}
                          onMouseEnter={e => { if (n.link) e.currentTarget.style.background = "#f9f9f9"; }}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? "#fff" : "#fef7f5"}
                        >
                          <div style={notifIconWrap(cfg.bg)}>
                            <IconComp size={16} color={cfg.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: n.read ? FONT_WEIGHT.medium : FONT_WEIGHT.bold, fontSize: FONT_SIZE.base, lineHeight: 1.4 }}>{n.title}</div>
                            {n.body && <div style={{ fontSize: FONT_SIZE.sm, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                            <div style={{ fontSize: FONT_SIZE.xs, color: "#aaa", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                          </div>
                          {!n.read && <div style={{ width: SPACING.xs, height: SPACING.xs, borderRadius: "50%", background: BRAND_COLOR, flexShrink: 0, marginTop: 6 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>}

            <div ref={profileMenuRef} style={{ position: "relative" }}>
              <div
                onClick={() => setProfileMenuOpen(o => !o)}
                style={profileMenuTrigger(profileMenuOpen)}
                onMouseEnter={e => { if (!profileMenuOpen) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)"; }}
                onMouseLeave={e => { if (!profileMenuOpen) e.currentTarget.style.boxShadow = "none"; }}
              >
                <Menu size={16} />
                <Avatar src={user?.avatar} name={user?.firstName || "Tú"} size={30} />
              </div>

              {profileMenuOpen && (
                <div style={{ ...dropdownPanel, width: 240 }}>
                  <div style={{ padding: `14px 18px`, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={user?.avatar} name={user?.firstName || "Tú"} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName || "Tú"}</div>
                      <div style={{ fontSize: FONT_SIZE.xs, color: "#888" }}>Mi cuenta</div>
                    </div>
                  </div>
                  <div style={{ padding: `6px 0` }}>
                    {PROFILE_TABS.map(t => {
                      const Icon = t.icon;
                      return (
                        <div
                          key={t.id}
                          onClick={() => { setProfileMenuOpen(false); onNavigate("profile", { tab: t.id }); }}
                          style={profileMenuItem}
                          onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <Icon size={16} color={COLORS.muted} />
                          <span style={{ fontWeight: FONT_WEIGHT.medium }}>{t.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {onLogout && (
                    <div
                      onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                      style={logoutItem}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff5f7"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded search */}
        {expanded && (
          <form onSubmit={e => { e.preventDefault(); setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ padding: `0 0 ${SPACING.lg}px`, animation: "fadeIn .2s" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: SPACING.xs, background: COLORS.bg, borderRadius: RADIUS.xl, padding: SPACING.xs, maxWidth: 880, margin: "0 auto", alignItems: "stretch" }}>
              <div style={{ ...searchFieldBox, flex: 0.7 }}>
                <div style={fieldLabelStyle}>Arriendo por</div>
                <select value={searchRentalType || ""} onChange={e => setSearchRentalType(e.target.value)} style={fieldInputStyle(true)}>
                  {RENTAL_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <AutocompleteField label="Ubicación" value={searchQuery} onChange={setSearchQuery} options={comunas} placeholder="¿Dónde buscas?" />
              <div style={{ ...searchFieldBox, flex: 0.9 }}>
                <div style={fieldLabelStyle}>Llegada</div>
                <input type="date" value={searchDate || ""} onChange={e => setSearchDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={fieldInputStyle(!!searchDate)} />
              </div>
              <AutocompleteField label="Vehículo" value={searchVehicle} onChange={setSearchVehicle} options={VEHICLE_TYPES} placeholder="¿Qué conduces?" />
              <Btn primary onClick={() => { setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ borderRadius: RADIUS.lg, padding: `${SPACING.sm}px ${SPACING.md}px`, alignSelf: "center" }}>
                <Search size={18} /> Buscar
              </Btn>
              {user?.vehicles?.length > 0 && (
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: SPACING.xs, alignItems: "center", paddingTop: SPACING.xs, borderTop: "1px solid #eee" }}>
                  <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, fontWeight: FONT_WEIGHT.semibold, whiteSpace: "nowrap" }}>Mis vehículos:</span>
                  {user.vehicles.map(v => (
                    <button key={v.id} onClick={() => { setSearchVehicle(searchVehicle === v.type ? "" : v.type); setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: `6px ${SPACING.sm}px`, borderRadius: 20, border: searchVehicle === v.type ? `2px solid ${BRAND_COLOR}` : `1px solid ${COLORS.border}`, background: searchVehicle === v.type ? "#fff0f3" : "#fff", fontSize: FONT_SIZE.sm, fontWeight: searchVehicle === v.type ? FONT_WEIGHT.bold : FONT_WEIGHT.medium, cursor: "pointer", fontFamily: "inherit", color: COLORS.text, whiteSpace: "nowrap" }}>
                      <Car size={12} /> {v.name}{v.ev ? " ⚡" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(searchQuery || searchDate || searchVehicle || searchRentalType) && (
              <div style={{ display: "flex", gap: SPACING.xs, maxWidth: 880, margin: "10px auto 0", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted }}>Filtros activos:</span>
                {searchRentalType && <span style={filterChipStyle}>Por {RENTAL_TYPES.find(r => r.value === searchRentalType)?.label} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchRentalType("")} /></span>}
                {searchQuery && <span style={filterChipStyle}>{searchQuery} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchQuery("")} /></span>}
                {searchDate && <span style={filterChipStyle}>{new Date(searchDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchDate("")} /></span>}
                {searchVehicle && <span style={filterChipStyle}>{searchVehicle} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchVehicle("")} /></span>}
                <span onClick={() => { setSearchQuery(""); setSearchDate(""); setSearchVehicle(""); setSearchRentalType(""); }} style={{ fontSize: FONT_SIZE.sm, color: COLORS.muted, textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}>Limpiar todo</span>
              </div>
            )}
          </form>
        )}
      </div>
    </header>
    {isMobile && (
      <div style={mobileNavBar}>
        <button onClick={() => onNavigate("messages")} style={mobileNavButton}>
          <MessageCircle size={22} />
          <span>Mensajes</span>
          {unreadMessages > 0 && (
            <div style={mobileNavBadge}>{unreadMessages > 9 ? "9+" : unreadMessages}</div>
          )}
        </button>
        <button onClick={() => setNotifOpen(o => !o)} style={mobileNavButton}>
          <Bell size={22} />
          <span>Alertas</span>
          {unread > 0 && (
            <div style={mobileNavBadge}>{unread > 9 ? "9+" : unread}</div>
          )}
        </button>
        <button onClick={() => onNavigate("create")} style={mobilePublishButton}>
          <Car size={16} /> Publica tu Voomp
        </button>
      </div>
    )}
    {isMobile && notifOpen && (
      <>
        <div onClick={() => setNotifOpen(false)} style={mobileSheetOverlay} />
        <div style={mobileSheet}>
          <div style={mobileSheetHeader}>
            <span style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.lg }}>Notificaciones</span>
            <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
          </div>
          <div>
            {notifications.length === 0 ? (
              <div style={notifEmptyStyle}>
                <Bell size={32} style={{ marginBottom: SPACING.xs, opacity: 0.3 }} />
                <div style={{ fontSize: FONT_SIZE.md }}>Sin notificaciones aún</div>
              </div>
            ) : notifications.map(n => {
              const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
              const IconComp = cfg.icon;
              return (
                <div key={n.id} onClick={() => { markRead(n.id); if (n.link) { const raw = typeof n.link === 'string' ? n.link.replace(/^\/+/, '') : ''; const [pg, tb, sb] = raw.split('/'); const known = ['home', 'profile', 'messages', 'create', 'listing']; if (pg && known.includes(pg)) onNavigate(pg, tb ? { tab: tb, subTab: sb } : undefined); } setNotifOpen(false); }} style={{ ...notifItemStyle(n.read, !!n.link), padding: `14px ${SPACING.lg}px` }}>
                  <div style={notifIconWrap(cfg.bg)}>
                    <IconComp size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.read ? FONT_WEIGHT.medium : FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, lineHeight: 1.4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: FONT_SIZE.sm, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: FONT_SIZE.xs, color: "#aaa", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div style={{ width: SPACING.xs, height: SPACING.xs, borderRadius: "50%", background: BRAND_COLOR, flexShrink: 0, marginTop: 6 }} />}
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
    </>
  );
};

export default Header;
