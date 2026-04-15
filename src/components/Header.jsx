import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MessageCircle, Car, Menu, LogOut, Bell, BookOpen, Star, DollarSign, AlertCircle, CheckCircle, User, Settings, BarChart3, LayoutDashboard, CalendarCheck } from "lucide-react";
import { RENTAL_TYPES, VEHICLE_TYPES, BRAND_COLOR, BRAND_GRADIENT } from "../constants";
import { Avatar, Btn } from "./ui";
import AutocompleteField from "./AutocompleteField";
import { useNotifications } from "../contexts/NotificationsContext";

const NOTIF_ICONS = {
  booking:  { icon: BookOpen,      color: "#0369a1", bg: "#e0f2fe" },
  review:   { icon: Star,          color: "#92400e", bg: "#fef3c7" },
  payment:  { icon: DollarSign,    color: "#065f46", bg: "#d1fae5" },
  message:  { icon: MessageCircle, color: "#6d28d9", bg: "#ede9fe" },
  system:   { icon: AlertCircle,   color: "#555",    bg: "#f3f4f6" },
  default:  { icon: CheckCircle,   color: "#555",    bg: "#f3f4f6" },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const Header = ({ onNavigate, currentPage, searchQuery, setSearchQuery, onSearch, user, onLogout, searchVehicle, setSearchVehicle, searchDate, setSearchDate, searchRentalType, setSearchRentalType, unreadMessages, listings }) => {
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

  const PROFILE_TABS = [
    { id: "profile",   label: "Perfil",          icon: User },
    { id: "vehicles",  label: "Mis Vehículos",   icon: Car },
    { id: "ratings",   label: "Mis calificaciones", icon: Star },
    { id: "dashboard", label: "Panel anfitrión", icon: LayoutDashboard },
    { id: "analytics", label: "Estadísticas",    icon: BarChart3 },
    { id: "bookings",  label: "Mis reservas",    icon: CalendarCheck },
    { id: "settings",  label: "Configuración",   icon: Settings },
  ];

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
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 1760, margin: "0 auto", padding: isMobile ? "0 12px" : "0 24px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 56 : 66, gap: 8 }}>
          <div onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: BRAND_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Car size={isMobile ? 16 : 18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: isMobile ? 17 : 20, color: BRAND_COLOR, letterSpacing: -0.5 }}>Voomp</span>
          </div>

          {!isMobile && <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 40, border: "none", background: BRAND_GRADIENT, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(255,56,92,.3)", transition: "transform .15s, box-shadow .15s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,56,92,.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,56,92,.3)"; }}>
            <Search size={16} /> Encuentra tu estacionamiento
          </button>}

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: isMobile ? "auto" : 0 }}>
            {isMobile && <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: "none", background: BRAND_GRADIENT, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(255,56,92,.3)" }}>
              <Search size={18} />
            </button>}
            {!isMobile && <button onClick={() => onNavigate("create")} style={{ padding: "8px 16px", borderRadius: 24, border: "none", background: BRAND_GRADIENT, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(255,56,92,.3)", transition: "transform .15s, box-shadow .15s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,56,92,.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,56,92,.3)"; }}>Publica tu Voomp</button>}

            {/* Messages */}
            {!isMobile && <button onClick={() => onNavigate("messages")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <MessageCircle size={20} />
              {unreadMessages > 0 && (
                <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: BRAND_COLOR, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{unreadMessages > 9 ? "9+" : unreadMessages}</div>
              )}
            </button>}

            {/* Notifications Bell */}
            {!isMobile && <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => { const opening = !notifOpen; setNotifOpen(opening); if (opening && unread > 0) markAllRead(); }}
                style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: BRAND_COLOR, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{unread > 9 ? "9+" : unread}</div>
                )}
              </button>

              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.14)", border: "1px solid #eee", zIndex: 999, overflow: "hidden", animation: "fadeIn .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #eee" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Notificaciones</span>
                    {notifications.some(n => !n.read) && (
                      <button onClick={markAllRead} style={{ fontSize: 12, color: BRAND_COLOR, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Marcar todo leído</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 24px", color: "#999" }}>
                        <Bell size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                        <div style={{ fontSize: 14 }}>Sin notificaciones aún</div>
                      </div>
                    ) : notifications.map(n => {
                      const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
                      const IconComp = cfg.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => { markRead(n.id); if (n.link) onNavigate(n.link); setNotifOpen(false); }}
                          style={{ display: "flex", gap: 12, padding: "12px 18px", background: n.read ? "#fff" : "#fef7f5", cursor: n.link ? "pointer" : "default", borderBottom: "1px solid #f5f5f5", transition: "background .15s" }}
                          onMouseEnter={e => { if (n.link) e.currentTarget.style.background = "#f9f9f9"; }}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? "#fff" : "#fef7f5"}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <IconComp size={16} color={cfg.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, lineHeight: 1.4 }}>{n.title}</div>
                            {n.body && <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                          </div>
                          {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND_COLOR, flexShrink: 0, marginTop: 6 }} />}
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
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 5px 5px 12px", border: "1px solid #ddd", borderRadius: 24, cursor: "pointer", background: profileMenuOpen ? "#f7f7f7" : "#fff", transition: "background .15s, box-shadow .15s, border-color .15s", boxShadow: profileMenuOpen ? "0 2px 8px rgba(0,0,0,.06)" : "none" }}
                onMouseEnter={e => { if (!profileMenuOpen) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)"; }}
                onMouseLeave={e => { if (!profileMenuOpen) e.currentTarget.style.boxShadow = "none"; }}
              >
                <Menu size={16} />
                <Avatar src={user?.avatar} name={user?.firstName || "Tú"} size={30} />
              </div>

              {profileMenuOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 240, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.14)", border: "1px solid #eee", zIndex: 999, overflow: "hidden", animation: "fadeIn .15s" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={user?.avatar} name={user?.firstName || "Tú"} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName || "Tú"}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>Mi cuenta</div>
                    </div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {PROFILE_TABS.map(t => {
                      const Icon = t.icon;
                      return (
                        <div
                          key={t.id}
                          onClick={() => { setProfileMenuOpen(false); onNavigate("profile", { tab: t.id }); }}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", cursor: "pointer", fontSize: 14, color: "#222", transition: "background .12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <Icon size={16} color="#555" />
                          <span style={{ fontWeight: 500 }}>{t.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {onLogout && (
                    <div
                      onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", cursor: "pointer", fontSize: 14, color: BRAND_COLOR, fontWeight: 600, borderTop: "1px solid #eee", transition: "background .12s" }}
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
          <form onSubmit={e => { e.preventDefault(); setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ padding: "0 0 20px", animation: "fadeIn .2s" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, background: "#f7f7f7", borderRadius: 16, padding: 8, maxWidth: 880, margin: "0 auto", alignItems: "stretch" }}>
              <div style={{ flex: 0.7, background: "#fff", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, color: "#555" }}>Arriendo por</div>
                <select value={searchRentalType || ""} onChange={e => setSearchRentalType(e.target.value)} style={{ border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", background: "transparent", color: "#222", cursor: "pointer" }}>
                  {RENTAL_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <AutocompleteField label="Ubicación" value={searchQuery} onChange={setSearchQuery} options={comunas} placeholder="¿Dónde buscas?" />
              <div style={{ flex: 0.9, background: "#fff", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, color: "#555" }}>Llegada</div>
                <input type="date" value={searchDate || ""} onChange={e => setSearchDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", background: "transparent", color: searchDate ? "#222" : "#999", cursor: "pointer" }} />
              </div>
              <AutocompleteField label="Vehículo" value={searchVehicle} onChange={setSearchVehicle} options={VEHICLE_TYPES} placeholder="¿Qué conduces?" />
              <Btn primary onClick={() => { setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ borderRadius: 12, padding: "12px 16px", alignSelf: "center" }}>
                <Search size={18} /> Buscar
              </Btn>
              {user?.vehicles?.length > 0 && (
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center", paddingTop: 8, borderTop: "1px solid #eee" }}>
                  <span style={{ fontSize: 12, color: "#555", fontWeight: 600, whiteSpace: "nowrap" }}>Mis vehículos:</span>
                  {user.vehicles.map(v => (
                    <button key={v.id} onClick={() => { setSearchVehicle(searchVehicle === v.type ? "" : v.type); setExpanded(false); if (currentPage !== "home") onNavigate("home"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, border: searchVehicle === v.type ? `2px solid ${BRAND_COLOR}` : "1px solid #ddd", background: searchVehicle === v.type ? "#fff0f3" : "#fff", fontSize: 12, fontWeight: searchVehicle === v.type ? 700 : 500, cursor: "pointer", fontFamily: "inherit", color: "#222", whiteSpace: "nowrap" }}>
                      <Car size={12} /> {v.name}{v.ev ? " ⚡" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(searchQuery || searchDate || searchVehicle || searchRentalType) && (
              <div style={{ display: "flex", gap: 8, maxWidth: 880, margin: "10px auto 0", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#555" }}>Filtros activos:</span>
                {searchRentalType && <span style={{ fontSize: 12, background: "#ffe4e8", color: BRAND_COLOR, padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>Por {RENTAL_TYPES.find(r => r.value === searchRentalType)?.label} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchRentalType("")} /></span>}
                {searchQuery && <span style={{ fontSize: 12, background: "#ffe4e8", color: BRAND_COLOR, padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{searchQuery} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchQuery("")} /></span>}
                {searchDate && <span style={{ fontSize: 12, background: "#ffe4e8", color: BRAND_COLOR, padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{new Date(searchDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchDate("")} /></span>}
                {searchVehicle && <span style={{ fontSize: 12, background: "#ffe4e8", color: BRAND_COLOR, padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{searchVehicle} <X size={12} style={{ cursor: "pointer" }} onClick={() => setSearchVehicle("")} /></span>}
                <span onClick={() => { setSearchQuery(""); setSearchDate(""); setSearchVehicle(""); setSearchRentalType(""); }} style={{ fontSize: 12, color: "#555", textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}>Limpiar todo</span>
              </div>
            )}
          </form>
        )}
      </div>
    </header>
    {isMobile && (
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99, background: "#fff", borderTop: "1px solid #eee", padding: "8px 12px calc(8px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "space-around", gap: 8, boxShadow: "0 -4px 16px rgba(0,0,0,.08)" }}>
        <button onClick={() => onNavigate("messages")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "#555", fontFamily: "inherit", fontSize: 10, fontWeight: 600 }}>
          <MessageCircle size={22} />
          <span>Mensajes</span>
          {unreadMessages > 0 && (
            <div style={{ position: "absolute", top: 2, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: BRAND_COLOR, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{unreadMessages > 9 ? "9+" : unreadMessages}</div>
          )}
        </button>
        <button onClick={() => { if (unread > 0) markAllRead(); setNotifOpen(o => !o); }} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "#555", fontFamily: "inherit", fontSize: 10, fontWeight: 600 }}>
          <Bell size={22} />
          <span>Alertas</span>
          {unread > 0 && (
            <div style={{ position: "absolute", top: 2, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: BRAND_COLOR, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{unread > 9 ? "9+" : unread}</div>
          )}
        </button>
        <button onClick={() => onNavigate("create")} style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 24, border: "none", background: BRAND_GRADIENT, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(255,56,92,.3)", display: "flex", alignItems: "center", gap: 6 }}>
          <Car size={16} /> Publica tu Voomp
        </button>
      </div>
    )}
    {isMobile && notifOpen && (
      <>
        <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200 }} />
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201, background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(0,0,0,.2)", animation: "fadeIn .2s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "#fff" }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Notificaciones</span>
            <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} /></button>
          </div>
          <div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 24px", color: "#999" }}>
                <Bell size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>Sin notificaciones aún</div>
              </div>
            ) : notifications.map(n => {
              const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
              const IconComp = cfg.icon;
              return (
                <div key={n.id} onClick={() => { markRead(n.id); if (n.link) onNavigate(n.link); setNotifOpen(false); }} style={{ display: "flex", gap: 12, padding: "14px 20px", background: n.read ? "#fff" : "#fef7f5", cursor: n.link ? "pointer" : "default", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconComp size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 14, lineHeight: 1.4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND_COLOR, flexShrink: 0, marginTop: 6 }} />}
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
