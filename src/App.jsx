import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useAuth } from "./contexts/AuthContext";
import { useNavigation } from "./contexts/NavigationContext";
import { useListings } from "./contexts/ListingsContext";
import { useBookings } from "./contexts/BookingsContext";
import { useMessages } from "./contexts/MessagesContext";
import { useNotifications } from "./contexts/NotificationsContext";
import { Modal, ErrorBoundary } from "./components/ui";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import FilterContent from "./components/FilterContent";
import AuthModal from "./components/AuthModal";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Footer from "./pages/Footer";
import CreateListingPage from "./pages/CreateListingPage";
import MessagesPage from "./pages/MessagesPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const { user, loading, logout, updateProfile } = useAuth();
  const { page, navigate, selectedListing, setSelectedListing, editingListing, setEditingListing, filterOpen, setFilterOpen, showMap, setShowMap, mapViewState, setMapViewState, authModal, setAuthModal, profileTab, setProfileTab } = useNavigation();
  const { listings, setListings, filteredListings, fetchListings, addListing, updateListing, deleteListing, toggleFavorite, category, setCategory, searchQuery, setSearchQuery, searchVehicle, setSearchVehicle, searchDate, setSearchDate, searchRentalType, setSearchRentalType, filters, setFilters } = useListings();
  const { bookings, setBookings, fetchBookings, addBooking, updateBooking } = useBookings();
  const { unreadMessages, markChatRead } = useMessages();
  const { pushNotification } = useNotifications();

  useEffect(() => {
    fetchListings();
    fetchBookings();
    // Context functions aren't memoized; running once on mount is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only redirect to landing once auth has finished loading.
    // If loading is still true, Supabase hasn't recovered the session yet — don't redirect.
    if (!loading && !user) {
      navigate("landing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleAuthSuccess = () => {
    setAuthModal({ open: false, mode: "register" });
    navigate("home");
  };

  const handleLogout = async () => {
    await logout();
    navigate("landing");
  };

  const handlePublish = async (form) => {
    const listingData = {
      title: form.title || "",
      description: form.description || "",
      location: form.location || "Sin ubicación",
      address: form.address || "",
      lat: form.lat || null,
      lng: form.lng || null,
      price: Number(form.price) || 0,
      price_unit: form.priceUnit || "hora",
      price_daily: Number(form.priceDaily) || null,
      price_monthly: Number(form.priceMonthly) || null,
      type: form.type || "covered",
      vehicle_types: form.vehicleTypes || [],
      access: form.access || "",
      security: form.security || [],
      dimensions: { width: form.width || 0, length: form.length || 0, height: form.height || null, dailyStart: form.dailyStart || "06:00", dailyEnd: form.dailyEnd || "22:00" },
      ev: form.ev || false,
      rules: form.rules ? (typeof form.rules === "string" ? form.rules.split("\n").filter(Boolean) : form.rules) : [],
      amenities: form.amenities || [],
      cancellation: form.cancellation || "flexible",
      available_days: form.availableDays || [],
      host_id: user.id,
    };

    let savedListing = null;
    const photoErrors = [];

    try {
      if (form.id) {
         savedListing = await updateListing(form.id, listingData);
      } else {
         savedListing = await addListing(listingData);
      }
    } catch(e) {
      alert("Error al guardar el estacionamiento.");
      return;
    }

    if (!savedListing) {
      alert("Error al guardar el estacionamiento.");
      return;
    }

    if (form.photoFiles && form.photoFiles.length > 0) {
      for (let i = 0; i < form.photoFiles.length; i++) {
        const file = form.photoFiles[i];
        const ext = file.name?.split('.').pop() || 'jpg';
        const path = `${savedListing.id}/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from('listing-photos').upload(path, file);
        if (error) {
          photoErrors.push(`${file.name || `foto ${i + 1}`}: ${error.message}`);
          console.error("Storage error:", error);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path);
          await supabase.from('listing_photos').insert({ listing_id: savedListing.id, url: publicUrl, position: i });
        }
      }
      fetchListings();
    }

    if (photoErrors.length > 0) {
      alert(`Se guardó el estacionamiento, pero hubo errores al subir imágenes:\n\n${photoErrors.join('\n')}\n\nEs posible que falte configurar directrices RLS de Storage en Supabase para el bucket 'listing-photos'.`);
    }
    setEditingListing(null);
  };

  const handleUpdateUser = async (updates) => {
    await updateProfile(updates);
  };

  const handleBooking = async (bookingData) => {
    const result = await addBooking(bookingData);
    // All bookings now require host approval. The cash-confirmation notification
    // for the host is sent later, in ProfilePage.handleApprove.
    if (bookingData.host_id) {
      pushNotification({
        userId: bookingData.host_id,
        type: 'booking',
        title: 'Nueva solicitud de reserva',
        body: `${bookingData.conductor_name || 'Un conductor'} quiere reservar ${bookingData.listing_title || 'tu espacio'}.`,
        link: 'profile',
      });
    }
    if (bookingData.conductor_id) {
      pushNotification({
        userId: bookingData.conductor_id,
        type: 'booking',
        title: 'Reserva recibida',
        body: `Tu solicitud para ${bookingData.listing_title || 'el espacio'} fue enviada y espera aprobación.`,
        link: 'bookings',
      });
    }
    return result;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Nunito Sans', sans-serif" }}>
        <div style={{ textAlign: "center", color: "#555" }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Cargando...</div>
        </div>
      </div>
    );
  }

  const headerProps = {
    onNavigate: navigate,
    currentPage: page,
    searchQuery, setSearchQuery,
    onSearch: () => {},
    user,
    onLogout: handleLogout,
    searchVehicle, setSearchVehicle,
    searchDate, setSearchDate,
    searchRentalType, setSearchRentalType,
    unreadMessages,
    listings,
  };

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: "#222", minHeight: "100vh", background: "#fff" }}>
        <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtros" wide>
          <FilterContent filters={filters} onApply={(f) => { setFilters(f); setFilterOpen(false); }} />
        </Modal>

        <AuthModal open={authModal.open} onClose={() => setAuthModal({ ...authModal, open: false })} onSuccess={handleAuthSuccess} initialMode={authModal.mode} />

        {page === "landing" ? (
          <LandingPage onEnter={() => navigate("home")} onRegister={() => setAuthModal({ open: true, mode: "register" })} onLogin={() => setAuthModal({ open: true, mode: "login" })} />
        ) : page === "create" ? (
          <CreateListingPage onBack={() => { setEditingListing(null); navigate("home"); }} onPublish={handlePublish} initialData={editingListing} />
        ) : page === "messages" ? (
          <>
            <Header {...headerProps} />
            <MessagesPage onBack={() => navigate("home")} user={user} onMarkRead={markChatRead} />
          </>
        ) : page === "profile" ? (
          <>
            <Header {...headerProps} />
            <ProfilePage onBack={() => navigate("home")} onNavigate={navigate} user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} listings={listings} setListings={setListings} bookings={bookings} setBookings={setBookings} onMarkRead={markChatRead} onSelectListing={(l) => { setSelectedListing(l); navigate("listing"); }} onUpdateListing={updateListing} onDeleteListing={deleteListing} onUpdateBooking={updateBooking} onEditListing={(l) => { setEditingListing(l); navigate("create"); }} initialTab={profileTab} onTabChange={setProfileTab} />
          </>
        ) : page === "listing" ? (
          <>
            <Header {...headerProps} />
            <ListingDetailPage listing={listings.find(x => x.id === selectedListing?.id) || selectedListing} onBack={() => navigate("home")} onNavigate={navigate} user={user} listings={listings} setListings={setListings} onUpdateUser={handleUpdateUser} onBooking={handleBooking} bookings={bookings} onEditListing={(l) => { setEditingListing(l); navigate("create"); }} />
          </>
        ) : (
          <>
            <Header {...headerProps} />
            <CategoryBar onFilter={() => setFilterOpen(true)} showMap={showMap} setShowMap={setShowMap} />
            <HomePage listings={filteredListings} onSelect={(l) => { setSelectedListing(l); navigate("listing"); }} onFav={toggleFavorite} showMap={showMap} mapViewState={mapViewState} onMapViewChange={setMapViewState} />
            <Footer />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
