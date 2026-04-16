import { useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
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

function ListingDetailWrapper({ headerProps, listings, selectedListing, navigate, user, setListings, handleUpdateUser, handleBooking, bookings, setEditingListing }) {
  const { id } = useParams();
  const listing = listings.find(x => String(x.id) === String(id)) || selectedListing;
  return (
    <>
      <Header {...headerProps} />
      <ListingDetailPage listing={listing} onBack={() => navigate("home")} onNavigate={navigate} user={user} listings={listings} setListings={setListings} onUpdateUser={handleUpdateUser} onBooking={handleBooking} bookings={bookings} onEditListing={(l) => { setEditingListing(l); navigate("create"); }} />
    </>
  );
}

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
    try {
      if (!user) {
        alert("Debes iniciar sesión para publicar un anuncio.");
        return;
      }

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

      if (form.id) {
        savedListing = await updateListing(form.id, listingData);
      } else {
        savedListing = await addListing(listingData);
      }

      if (!savedListing) {
        throw new Error("No se recibió confirmación del servidor al guardar el estacionamiento.");
      }

      // --- 2. HANDLE NEW IMAGE UPLOADS ---
      if (form.photoFiles && form.photoFiles.length > 0) {
        // Calculate starting position for new photos
        const { data: existingPhotos } = await supabase
          .from('listing_photos')
          .select('position')
          .eq('listing_id', savedListing.id)
          .order('position', { ascending: false })
          .limit(1);
        
        const startPos = existingPhotos && existingPhotos.length > 0 ? existingPhotos[0].position + 1 : 0;

        for (let i = 0; i < form.photoFiles.length; i++) {
          const file = form.photoFiles[i];
          const ext = file.name?.split('.').pop() || 'jpg';
          const path = `${savedListing.id}/${Date.now()}_${i}.${ext}`;
          
          try {
            const { error: storageError } = await supabase.storage.from('listing-photos').upload(path, file);
            if (storageError) throw storageError;

            const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path);
            const { error: insertError } = await supabase.from('listing_photos').insert({ 
              listing_id: savedListing.id, 
              url: publicUrl, 
              position: startPos + i 
            });
            if (insertError) throw insertError;
          } catch (storageErr) {
            photoErrors.push(`${file.name || `foto ${i + 1}`}: ${storageErr.message || "Error desconocido"}`);
            console.error("Storage error:", storageErr);
          }
        }
        // Refetch to include the new photos in the local state
        await fetchListings();
      }

      if (photoErrors.length > 0) {
        alert(`Se guardó el estacionamiento, pero hubo errores al subir algunas imágenes:\n\n${photoErrors.join('\n')}\n\nPuedes intentar subirlas más tarde editando tu anuncio.`);
      }

      setEditingListing(null);
    } catch (e) {
      console.error("Error en handlePublish:", e);
      alert(`Error crítico al publicar: ${e.message || "Ocurrió un error inesperado."}`);
      // Re-throw so that CreateListingPage doesn't proceed to onBack()
      throw e;
    }
  };

  const handleUpdateUser = async (updates) => {
    await updateProfile(updates);
  };

  const handleDeletePhoto = async (url, listingId) => {
    if (!url || !listingId) return;
    try {
      // 1. Extract the filename from the URL (robust against tokens and encoding)
      // Example: https://.../img.jpg?token=123 -> img.jpg
      const filename = url.split('/').pop().split('?')[0];
      if (!filename) throw new Error("URL de imagen inválida");

      // 2. Search for the record using the listing_id and the filename
      const { data: records, error: fetchError } = await supabase
        .from('listing_photos')
        .select('id, url')
        .eq('listing_id', listingId)
        .ilike('url', `%${filename}%`);
      
      if (fetchError) throw fetchError;

      const record = records?.[0];

      // 3. Delete from Storage regardless of record match (for resilience)
      // We rely on the path structure: listing-photos/ID/filename
      const parts = url.split('listing-photos/');
      if (parts.length > 1) {
        const path = parts[1].split('?')[0];
        try {
          await supabase.storage.from('listing-photos').remove([path]);
        } catch (e) {
          console.error("Storage removal failed, continuing:", e);
        }
      }

      // 4. Delete from DB by ID if found
      if (record) {
        const { error: dbError } = await supabase
          .from('listing_photos')
          .delete()
          .eq('id', record.id);
        if (dbError) throw dbError;
      }
      
      // 5. Success: update global listings state
      await fetchListings();
      return true;
    } catch (e) {
      console.error("Error definitivo en handleDeletePhoto:", e);
      alert(`ERROR TÉCNICO: No se pudo eliminar de la base de datos (${e.message})`);
      return false;
    }
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

        <Routes>
          <Route path="/" element={
            <LandingPage onEnter={() => navigate("home")} onRegister={() => setAuthModal({ open: true, mode: "register" })} onLogin={() => setAuthModal({ open: true, mode: "login" })} />
          } />
          <Route path="/home" element={
            <>
              {/* Voomp Fix v3 Banner */}
              <div style={{ position: "fixed", bottom: 20, right: 20, background: "#000", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 11, zIndex: 10000, opacity: 0.8, pointerEvents: "none", fontWeight: 700 }}>Voomp Fix v3 Active</div>

              <Header {...headerProps} />
              <CategoryBar onFilter={() => setFilterOpen(true)} showMap={showMap} setShowMap={setShowMap} />
              <HomePage listings={filteredListings} onSelect={(l) => { setSelectedListing(l); navigate("listing", { id: l.id, title: l.title }); }} onFav={toggleFavorite} showMap={showMap} mapViewState={mapViewState} onMapViewChange={setMapViewState} />
              <Footer />
            </>
          } />
          <Route path="/create" element={
            <CreateListingPage onBack={() => { setEditingListing(null); navigate("home"); }} onPublish={handlePublish} onDeletePhoto={handleDeletePhoto} initialData={editingListing} />
          } />
          <Route path="/messages" element={
            <>
              <Header {...headerProps} />
              <MessagesPage onBack={() => navigate("home")} user={user} onMarkRead={markChatRead} />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Header {...headerProps} />
              <ProfilePage onBack={() => navigate("home")} onNavigate={navigate} user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} listings={listings} setListings={setListings} bookings={bookings} setBookings={setBookings} onMarkRead={markChatRead} onSelectListing={(l) => { setSelectedListing(l); navigate("listing", { id: l.id, title: l.title }); }} onUpdateListing={updateListing} onDeleteListing={deleteListing} onUpdateBooking={updateBooking} onEditListing={(l) => { setEditingListing(l); navigate("create"); }} initialTab={profileTab} onTabChange={setProfileTab} />
            </>
          } />
          <Route path="/listing/:id" element={
            <ListingDetailWrapper headerProps={headerProps} listings={listings} selectedListing={selectedListing} navigate={navigate} user={user} setListings={setListings} handleUpdateUser={handleUpdateUser} handleBooking={handleBooking} bookings={bookings} setEditingListing={setEditingListing} />
          } />
          <Route path="/listing/:id/:slug" element={
            <ListingDetailWrapper headerProps={headerProps} listings={listings} selectedListing={selectedListing} navigate={navigate} user={user} setListings={setListings} handleUpdateUser={handleUpdateUser} handleBooking={handleBooking} bookings={bookings} setEditingListing={setEditingListing} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
