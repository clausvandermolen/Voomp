import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BookingsContext = createContext();

const mapBooking = (b) => ({
  ...b,
  listingId: b.listing_id,
  listingTitle: b.listing_title,
  hostId: b.host_id,
  hostName: b.host_name,
  conductorId: b.conductor_id,
  conductorName: b.conductor_name,
  startDate: b.start_date,
  endDate: b.end_date,
  startTime: b.start_time,
  endTime: b.end_time,
  priceUnit: b.price_unit,
  payMethod: b.pay_method,
  photoUrl: b.photo_url,
  billingSchedule: b.billing_schedule,
  fullMonths: b.full_months,
  monthlyStartDate: b.monthly_start_date,
  prorateAmount: b.prorate_amount,
  monthlyInstallment: b.monthly_installment,
  approvedAt: b.approved_at,
  rejectedAt: b.rejected_at,
  createdAt: b.created_at,
  vehicleName: b.vehicle_name ?? null,
  vehiclePlate: b.vehicle_plate ?? null,
});

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); setBookings([]); return; }
    setBookings((data || []).map(mapBooking));
  };

  // Realtime: keep bookings in sync — filtered by current user (conductor or host)
  useEffect(() => {
    let channel;
    const handleChange = (payload) => {
      if (payload.eventType === 'INSERT') {
        const mapped = mapBooking(payload.new);
        setBookings(prev => prev.some(x => x.id === mapped.id) ? prev : [mapped, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const mapped = mapBooking(payload.new);
        setBookings(prev => prev.map(x => x.id === mapped.id ? { ...x, ...mapped } : x));
      } else if (payload.eventType === 'DELETE') {
        setBookings(prev => prev.filter(x => x.id !== payload.old.id));
      }
    };
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel('bookings-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `conductor_id=eq.${user.id}` }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `host_id=eq.${user.id}` }, handleChange)
        .subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const addBooking = async (data) => {
    // Try inserting with all fields; self-heal below will drop any columns
    // the DB schema doesn't have (so vehicle_name/vehicle_plate persist if supported).
    const { vehicle_name, vehicle_plate } = data;
    let insertPayload = { ...data };
    let { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select()
      .single();
    // Self-heal: if DB rejects due to a missing column, strip it and retry.
    // Handles schema drift (e.g. pay_method column not yet migrated).
    let retries = 0;
    while (error && retries < 5) {
      const msg = (error.message || '') + ' ' + (error.details || '');
      const colMatch = msg.match(/column "?([a-z_]+)"? of relation|Could not find the '([a-z_]+)' column/i);
      const badCol = colMatch ? (colMatch[1] || colMatch[2]) : null;
      if (!badCol || !(badCol in insertPayload)) break;
      console.warn(`bookings insert: dropping unknown column "${badCol}" and retrying`);
      const { [badCol]: _dropped, ...rest } = insertPayload;
      insertPayload = rest;
      ({ data: newBooking, error } = await supabase
        .from('bookings')
        .insert(insertPayload)
        .select()
        .single());
      retries++;
    }
    if (error) { console.error('addBooking failed:', error); throw error; }
    // Enrich local state with vehicle info
    const enriched = {
      ...mapBooking(newBooking),
      vehicleName: newBooking.vehicle_name ?? vehicle_name ?? null,
      vehiclePlate: newBooking.vehicle_plate ?? vehicle_plate ?? null,
    };
    setBookings(prev => [enriched, ...prev]);
    return enriched;
  };

  // Security: only allow fields that the client legitimately needs to update.
  // Status transitions (confirm/reject/complete) must go through the host-only
  // allowed set. The DB RLS UPDATE policy checks auth.uid() = host_id OR conductor_id,
  // but we add a client-side allowlist as defence-in-depth to prevent field injection.
  const HOST_ALLOWED_FIELDS = new Set([
    "status", "approved_at", "rejected_at", "rejection_reason",
    "host_notes", "updated_at",
  ]);
  const CONDUCTOR_ALLOWED_FIELDS = new Set([
    "vehicle_name", "vehicle_plate", "start_time", "end_time",
    "start_date", "end_date", "updated_at",
  ]);

  const updateBooking = async (id, updates, role = "host") => {
    const allowedFields = role === "conductor" ? CONDUCTOR_ALLOWED_FIELDS : HOST_ALLOWED_FIELDS;
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowedFields.has(k))
    );
    if (Object.keys(safeUpdates).length === 0) {
      throw new Error("No hay campos permitidos para actualizar.");
    }
    const { data: saved, error } = await supabase
      .from('bookings')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    const enriched = mapBooking(saved);
    setBookings(prev => prev.map(x => x.id === id ? { ...x, ...enriched } : x));
    return enriched;
  };

  return (
    <BookingsContext.Provider value={{ bookings, setBookings, fetchBookings, addBooking, updateBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export const useBookings = () => useContext(BookingsContext);
