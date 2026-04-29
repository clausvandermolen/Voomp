import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ListingsContext = createContext();

export function ListingsProvider({ children }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const fetchListingsRef = useRef(null);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVehicle, setSearchVehicle] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchRentalType, setSearchRentalType] = useState("");
  const [filters, setFilters] = useState({});

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(id, url, position), reviews(id, rating, comment, author_name, author_id, created_at, review_type), profiles!host_id(id, first_name, last_name_1, last_name_2, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setListings([]); return; }

    let savedIds = [];
    if (user?.id) {
      try {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('saved_listing_ids').eq('id', user.id).single();
        if (profileError) {
          if (profileError.code !== 'PGRST116') console.error('Error fetching profile for favorites:', profileError);
        } else {
          savedIds = (profile?.saved_listing_ids || []).map(id => Number(id));
        }
      } catch (err) {
        console.error('Error in fetchListings favorites logic:', err);
      }
    }

    const transformed = (data || []).map(l => {
      const p = l.profiles;
      const photos = (l.listing_photos || []).sort((a, b) => a.position - b.position).map(ph => ph.url);
      const reviewsList = (l.reviews || []).filter(r => !r.review_type || r.review_type === 'listing');
      
      // Safety: Ensure JSON fields are handled even if null in DB
      const amenities = Array.isArray(l.amenities) ? l.amenities : [];
      const security = Array.isArray(l.security) ? l.security : [];
      const vehicleTypes = Array.isArray(l.vehicle_types) ? l.vehicle_types : [];
      const rules = typeof l.rules === "string" 
        ? (l.rules ? l.rules.split("\n").filter(Boolean) : []) 
        : (Array.isArray(l.rules) ? l.rules : []);

      return {
        ...l,
        photos,
        reviewsList,
        amenities,
        security,
        vehicleTypes,
        rules,
        favorite: savedIds.includes(Number(l.id)),
        // Backwards-compatible field names
        priceUnit: l.price_unit,
        priceDaily: l.price_daily,
        priceMonthly: l.price_monthly,
        reviewsCount: l.reviews_count,
        availableDays: Array.isArray(l.available_days) ? l.available_days : [],
        host: p ? {
          name: `${p.first_name || ""} ${p.last_name_1 || ""} ${(p.last_name_2 || "")[0] || ""}.`.trim(),
          avatar: p.avatar_url,
          superhost: false,
          since: new Date(l.created_at).getFullYear().toString(),
          userId: l.host_id,
        } : { name: "Anfitrión", avatar: null, superhost: false, userId: null },
        // Clean up nested data
        profiles: undefined,
        listing_photos: undefined,
      };
    });
    setListings(transformed);
  };
  fetchListingsRef.current = fetchListings;

  useEffect(() => {
    fetchListings();
  }, [user?.id]);

  // Realtime: refetch listings whenever any review changes (rating + comments live update).
  // Reviews are nested in the listings select, so the simplest correct strategy is to refetch.
  useEffect(() => {
    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        if (fetchListingsRef.current) fetchListingsRef.current();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addListing = async (form) => {
    const { data, error } = await supabase.from('listings').insert(form).select().single();
    if (error) { console.error(error); return null; }
    // Update local state by refetching
    await fetchListings();
    // Return raw data for photo upload
    return data;
  };

  const updateListing = async (id, updates) => {
    // Convert camelCase to snake_case
    const dbUpdates = {};
    const map = {
      priceUnit: 'price_unit', priceDaily: 'price_daily', priceMonthly: 'price_monthly',
      vehicleTypes: 'vehicle_types', availableDays: 'available_days',
    };
    for (const [k, v] of Object.entries(updates)) {
      if (k === 'photos' || k === 'photoFiles' || k === 'reviewsList' || k === 'host' || k === 'favorite' || k === 'id') continue;
      dbUpdates[map[k] || k] = v;
    }
    const { data, error } = await supabase.from('listings').update(dbUpdates).eq('id', id).select().single();
    if (error) { console.error(error); throw error; }
    await fetchListings();
    return data;
  };

  const deleteListing = async (id) => {
    // Storage cleanup first — listing_photos rows cascade-delete via FK, but the
    // physical files in the listing-photos bucket would be orphaned otherwise.
    try {
      const { data: files } = await supabase.storage.from('listing-photos').list(String(id));
      if (files?.length) {
        const paths = files.map(f => `${id}/${f.name}`);
        await supabase.storage.from('listing-photos').remove(paths);
      }
    } catch (e) {
      console.error('listing storage cleanup failed (non-fatal):', e);
    }
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setListings(prev => prev.filter(x => x.id !== id));
  };

  const toggleFavorite = async (id) => {
    if (!user?.id) return;

    setListings(prev => prev.map(l => Number(l.id) === Number(id) ? { ...l, favorite: !l.favorite } : l));

    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('saved_listing_ids')
        .eq('id', user.id)
        .maybeSingle();
      if (fetchError) throw fetchError;

      const currentIds = (profile?.saved_listing_ids || []).map(x => Number(x));
      const lid = Number(id);
      const newIds = currentIds.includes(lid)
        ? currentIds.filter(x => x !== lid)
        : [...currentIds, lid];

      if (profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ saved_listing_ids: newIds })
          .eq('id', user.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email, saved_listing_ids: newIds });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert(`Error al guardar favorito: ${err.message || JSON.stringify(err)}`);
      setListings(prev => prev.map(l => Number(l.id) === Number(id) ? { ...l, favorite: !l.favorite } : l));
    }
  };

  // Spanish/Latin accent-insensitive lowercase compare ("Ñuñoa" matches "nunoa").
  // Strips the U+0300..U+036F combining-diacritics block produced by NFD.
  const normalize = (s) => (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (category !== "all") {
      const catMap = {
        covered: l => l.type === "covered",
        outdoor: l => l.type === "outdoor",
        ev: l => l.ev,
        security: l => (l.security?.length || 0) >= 3,
        hourly: l => l.priceUnit === "hora" || (l.price > 0 && !l.priceUnit),
        daily: l => l.priceUnit === "día" || l.priceDaily > 0,
        monthly: l => l.priceUnit === "mes" || l.priceMonthly > 0,
        airport: l => normalize(l.title).includes("aeropuerto"),
        downtown: l => normalize(l.location).includes("centro"),
        residential: l => normalize(l.location).includes("nunoa") || l.type === "covered",
        commercial: l => normalize(l.location).includes("golf") || normalize(l.location).includes("condes"),
        motorcycle: l => l.vehicleTypes?.includes("Moto"),
        oversized: l => l.vehicleTypes?.includes("Camioneta") || l.vehicleTypes?.includes("Furgoneta"),
      };
      if (catMap[category]) result = result.filter(catMap[category]);
    }

    if (searchQuery) {
      const q = normalize(searchQuery);
      result = result.filter(l =>
        normalize(l.title).includes(q) ||
        normalize(l.location).includes(q) ||
        normalize(l.address).includes(q)
      );
    }
    if (searchRentalType) {
      result = result.filter(l => {
        if (searchRentalType === "hora") return l.priceUnit === "hora" || (l.price > 0 && !l.priceUnit);
        if (searchRentalType === "día")  return l.priceUnit === "día"  || l.priceDaily > 0;
        if (searchRentalType === "mes")  return l.priceUnit === "mes"  || l.priceMonthly > 0;
        return true;
      });
    }
    if (searchDate) {
      result = result.filter(l => {
        if (l.availableDays && l.availableDays.length > 0) return l.availableDays.includes(searchDate);
        return true;
      });
    }
    if (searchVehicle) result = result.filter(l => l.vehicleTypes?.includes(searchVehicle));

    if (filters.vehicleType) result = result.filter(l => l.vehicleTypes?.includes(filters.vehicleType));
    if (filters.access) result = result.filter(l => l.access === filters.access);
    if (filters.ev) result = result.filter(l => l.ev);
    if (filters.security?.length) result = result.filter(l => filters.security.every(s => l.security?.includes(s)));
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000)) {
      result = result.filter(l => {
        const p = searchRentalType === "día" ? (l.priceDaily || l.price) : searchRentalType === "mes" ? (l.priceMonthly || l.price) : l.price;
        return p >= filters.priceRange[0] && p <= filters.priceRange[1];
      });
    }
    return result;
  }, [listings, category, searchQuery, searchVehicle, searchDate, searchRentalType, filters]);

  return (
    <ListingsContext.Provider value={{
      listings, setListings, filteredListings,
      fetchListings, addListing, updateListing, deleteListing, toggleFavorite,
      category, setCategory,
      searchQuery, setSearchQuery,
      searchVehicle, setSearchVehicle,
      searchDate, setSearchDate,
      searchRentalType, setSearchRentalType,
      filters, setFilters,
    }}>
      {children}
    </ListingsContext.Provider>
  );
}

export const useListings = () => useContext(ListingsContext);
