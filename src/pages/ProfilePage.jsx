import { useState, useEffect } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { useBookings } from "../contexts/BookingsContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { BRAND_COLOR } from "../constants";
import { supabase } from "../lib/supabase";
import ProfileHeader from "../components/Profile/ProfileHeader";
import MyVehiclesSection from "../components/Profile/MyVehiclesSection";
import HostDashboard from "../components/Profile/HostDashboard";
import MyBookingsSection from "../components/Profile/MyBookingsSection";
import ReviewsAndRatings from "../components/Profile/ReviewsAndRatings";
import ParkingPreferences from "../components/Profile/ParkingPreferences";

const ProfilePage = ({
  onBack,
  onNavigate,
  user,
  onLogout,
  onUpdateUser,
  listings = [],
  setListings,
  bookings = [],
  setBookings,
  onMarkRead,
  onSelectListing,
  onUpdateListing,
  onDeleteListing,
  onUpdateBooking,
  onEditListing,
  initialTab,
  onTabChange,
  initialDashboardSubTab,
  onDashboardSubTabChange,
}) => {
  const { pushNotification } = useNotifications();
  const { checkIn, checkOut, proposeModification, respondToModification } = useBookings();
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [tab, setTab] = useState(initialTab || "profile");
  const [doneReviews, setDoneReviews] = useState({});
  const [dashboardSubTab, setDashboardSubTab] = useState(initialDashboardSubTab || "listings");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (initialTab && initialTab !== tab) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialDashboardSubTab && initialDashboardSubTab !== dashboardSubTab) {
      setDashboardSubTab(initialDashboardSubTab);
      if (onDashboardSubTabChange) onDashboardSubTabChange(null);
    }
  }, [initialDashboardSubTab]);

  // Sync URL with active tab
  useEffect(() => {
    let path;
    if (tab === "profile") {
      path = "/profile";
    } else if (tab === "dashboard") {
      path = dashboardSubTab && dashboardSubTab !== "listings"
        ? `/profile/dashboard/${dashboardSubTab}`
        : "/profile/dashboard";
    } else {
      path = `/profile/${tab}`;
    }
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", path);
    }
  }, [tab, dashboardSubTab]);

  // Load authored reviews to mark as "Done"
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("booking_id, review_type")
        .eq("author_id", user.id);
      if (error) {
        console.error("fetch authored reviews:", error);
        return;
      }
      const map = {};
      (data || []).forEach((r) => {
        if (r.booking_id) map[`${r.booking_id}_${r.review_type}`] = true;
      });
      setDoneReviews(map);
    })();
  }, [user?.id]);

  const handleCheckIn = async (booking) => {
    if (checkIn) {
      await checkIn(booking.id);
      onUpdateBooking?.(booking.id, { status: "active_checkin" });
      pushNotification?.("Check-in realizado", "success");
    }
  };

  const handleCheckOut = async (booking) => {
    if (checkOut) {
      await checkOut(booking.id);
      onUpdateBooking?.(booking.id, { status: "completed" });
      pushNotification?.("Check-out realizado", "success");
    }
  };

  const handleRespondMod = async (booking, accepted) => {
    if (respondToModification) {
      await respondToModification(booking.id, accepted);
      const newStatus = accepted ? "active_pending_checkin" : "active_checkin";
      onUpdateBooking?.(booking.id, { status: newStatus, modStatus: null });
      pushNotification?.(accepted ? "Propuesta aceptada" : "Propuesta rechazada", "success");
    }
  };

  const handleChat = (booking) => {
    if (onNavigate) {
      onNavigate(`/chat/${booking.id}`);
    }
  };

  const handleProposeMod = async (booking, newEndDate) => {
    if (proposeModification) {
      await proposeModification(booking.id, newEndDate);
      onUpdateBooking?.(booking.id, { modStatus: "pending_conductor_approval", modEndDate: newEndDate });
      pushNotification?.("Propuesta de modificación enviada", "success");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#555" }}
        >
          <ArrowLeft size={20} /> Volver
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mi Perfil</h1>
        <button
          onClick={onLogout}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#b91c1c" }}
        >
          <LogOut size={20} /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 24px", display: "flex", gap: 0 }}>
        {["profile", "vehicles", "preferences", "dashboard", "bookings", "reviews"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#000" : "#fff",
              color: tab === t ? "#fff" : "#555",
              border: "none",
              padding: "12px 20px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {t === "profile" && "Perfil"}
            {t === "vehicles" && "Vehículos"}
            {t === "preferences" && "Preferencias"}
            {t === "dashboard" && "Dashboard"}
            {t === "bookings" && "Mis Reservas"}
            {t === "reviews" && "Reseñas"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {tab === "profile" && (
          <ProfileHeader user={user} onUpdateUser={onUpdateUser} />
        )}

        {tab === "vehicles" && (
          <MyVehiclesSection user={user} onUpdateUser={onUpdateUser} />
        )}

        {tab === "preferences" && (
          <ParkingPreferences user={user} onUpdateUser={onUpdateUser} />
        )}

        {tab === "dashboard" && (
          <HostDashboard
            listings={listings}
            bookings={bookings}
            user={user}
            onProposeMod={handleProposeMod}
            onMarkRead={onMarkRead}
            onUpdateBooking={onUpdateBooking}
            onSelectListing={onSelectListing}
            onEditListing={onEditListing}
            onDeleteListing={onDeleteListing}
            onUpdateListing={onUpdateListing}
            pushNotification={pushNotification}
            initialDashboardSubTab={dashboardSubTab}
            onDashboardSubTabChange={(newTab) => {
              if (newTab) setDashboardSubTab(newTab);
            }}
          />
        )}

        {tab === "bookings" && (
          <MyBookingsSection
            bookings={bookings}
            user={user}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onRespondMod={handleRespondMod}
            onChat={handleChat}
            doneReviews={doneReviews}
            setDoneReviews={setDoneReviews}
            pushNotification={pushNotification}
          />
        )}

        {tab === "reviews" && (
          <ReviewsAndRatings user={user} bookings={bookings} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
