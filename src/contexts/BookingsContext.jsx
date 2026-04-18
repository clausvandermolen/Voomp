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
  // Check-in / check-out
  checkedInAt: b.checked_in_at ?? null,
  checkedOutAt: b.checked_out_at ?? null,
  // Host-proposed modification
  modEndDate: b.mod_end_date ?? null,
  modEndTime: b.mod_end_time ?? null,
  modNewTotal: b.mod_new_total ?? null,
  modStatus: b.mod_status ?? null,
  modProposedAt: b.mod_proposed_at ?? null,
  modType: b.mod_type ?? null,
  bookingRef: b.booking_ref ?? null,
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
    const { vehicle_name, vehicle_plate } = data;
    let insertPayload = { ...data };
    let { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select()
      .single();
    // Self-heal: drop unknown columns one by one and retry (handles schema drift)
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
    const enriched = {
      ...mapBooking(newBooking),
      vehicleName: newBooking.vehicle_name ?? vehicle_name ?? null,
      vehiclePlate: newBooking.vehicle_plate ?? vehicle_plate ?? null,
    };
    setBookings(prev => [enriched, ...prev]);
    return enriched;
  };

  // Security: client-side field allowlists as defence-in-depth on top of DB RLS.
  // Host can change status and mod proposal fields; conductor can edit their own details.
  const HOST_ALLOWED_FIELDS = new Set([
    "status", "approved_at", "rejected_at", "rejection_reason", "host_notes", "updated_at",
    "mod_end_date", "mod_end_time", "mod_new_total", "mod_status", "mod_proposed_at", "mod_type",
  ]);
  const CONDUCTOR_ALLOWED_FIELDS = new Set([
    "vehicle_name", "vehicle_plate", "start_time", "end_time", "start_date", "end_date", "updated_at",
  ]);

  const updateBooking = async (id, updates, role = "host") => {
    const allowedFields = role === "conductor" ? CONDUCTOR_ALLOWED_FIELDS : HOST_ALLOWED_FIELDS;
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowedFields.has(k))
    );
    if (Object.keys(safeUpdates).length === 0) throw new Error("No hay campos permitidos para actualizar.");
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

  // CONDUCTOR — Check in to a confirmed booking.
  // Security: only works when status = 'confirmed'; for hourly bookings enforces a
  // 15-min early / 60-min late window around start_time.
  const checkIn = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.status !== "confirmed") throw new Error("Solo puedes hacer check-in en reservas confirmadas");

    if (booking.priceUnit === "hora" && booking.startDate && booking.startTime) {
      const startDT = new Date(`${booking.startDate}T${booking.startTime}`);
      const diffMin = (Date.now() - startDT.getTime()) / 60000;
      if (diffMin < -15) {
        const available = new Date(startDT.getTime() - 15 * 60000);
        throw new Error(`Check-in disponible a partir de las ${available.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`);
      }
      if (diffMin > 60) throw new Error("La ventana de check-in expiró (máximo 60 min después del inicio)");
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from('bookings')
      .update({ status: 'active', checked_in_at: now })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    const enriched = mapBooking(saved);
    setBookings(prev => prev.map(x => x.id === bookingId ? { ...x, ...enriched } : x));
    return enriched;
  };

  // CONDUCTOR — Check out from an active booking.
  // If the conductor leaves early, they receive 70% of the unused time as a credit
  // (negative credit = balance in their favour for the next booking).
  const checkOut = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.status !== "active") throw new Error("Debes hacer check-in antes de hacer check-out");

    const now = new Date();
    let creditAdjustment = 0;

    if (booking.priceUnit === "hora" && booking.endDate && booking.endTime) {
      const endDT = new Date(`${booking.endDate}T${booking.endTime}`);
      const unusedMs = endDT.getTime() - now.getTime();
      if (unusedMs > 0) {
        const unusedHours = unusedMs / (1000 * 60 * 60);
        creditAdjustment = -Math.round(unusedHours * (booking.price || 0) * 0.7);
      }
    } else if (booking.priceUnit === "día" && booking.endDate) {
      const endDT = new Date(`${booking.endDate}T23:59:59`);
      const unusedMs = endDT.getTime() - now.getTime();
      if (unusedMs > 2 * 60 * 60 * 1000) {
        const unusedDays = unusedMs / (1000 * 60 * 60 * 24);
        creditAdjustment = -Math.round(unusedDays * (booking.price || 0) * 0.7);
      }
    }

    const { data: saved, error } = await supabase
      .from('bookings')
      .update({ status: 'completed', checked_out_at: now.toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) { console.error(error); throw error; }

    if (creditAdjustment !== 0) {
      const { data: profile } = await supabase
        .from('profiles').select('credit').eq('id', saved.conductor_id).single();
      const current = profile?.credit || 0;
      await supabase.from('profiles').update({ credit: current + creditAdjustment }).eq('id', saved.conductor_id);
    }

    const enriched = mapBooking(saved);
    setBookings(prev => prev.map(x => x.id === bookingId ? { ...x, ...enriched } : x));
    return { enriched, creditAdjustment };
  };

  // HOST or CONDUCTOR — Propose a stay modification (extension or reduction).
  // proposedBy: 'host' → mod_status='pending' (conductor responds)
  // proposedBy: 'conductor' → mod_status='pending_host_approval' (host responds)
  const proposeModification = async (bookingId, { modEndDate, modEndTime, modNewTotal, modType, proposedBy = 'host' }) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.status !== "active" && booking.status !== "confirmed") throw new Error("Solo puedes modificar reservas confirmadas o activas");

    const { data: saved, error } = await supabase
      .from('bookings')
      .update({
        mod_end_date: modEndDate || null,
        mod_end_time: modEndTime || null,
        mod_new_total: modNewTotal,
        mod_status: proposedBy === 'conductor' ? 'pending_host_approval' : 'pending',
        mod_proposed_at: new Date().toISOString(),
        mod_type: modType,
      })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    const enriched = mapBooking(saved);
    setBookings(prev => prev.map(x => x.id === bookingId ? { ...x, ...enriched } : x));
    return enriched;
  };

  // Accept or reject a modification proposal (host or conductor can respond depending on who proposed).
  // Extension accepted: difference added as debt to conductor's credit.
  // Reduction accepted: difference returned as credit balance to conductor.
  const respondToModification = async (bookingId, accept) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.modStatus !== "pending" && booking.modStatus !== "pending_host_approval") throw new Error("No hay modificación pendiente");

    const updates = { mod_status: accept ? 'approved' : 'rejected' };
    if (accept) {
      if (booking.modEndDate) updates.end_date = booking.modEndDate;
      if (booking.modEndTime) updates.end_time = booking.modEndTime;
      if (booking.modNewTotal != null) updates.total = booking.modNewTotal;
    }

    const { data: saved, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();
    if (error) { console.error(error); throw error; }

    if (accept) {
      const diff = (booking.modNewTotal ?? booking.total ?? 0) - (booking.total ?? 0);
      if (diff !== 0) {
        const { data: profile } = await supabase
          .from('profiles').select('credit').eq('id', saved.conductor_id).single();
        const current = profile?.credit || 0;
        // extension → diff > 0 → more debt; reduction → diff < 0 → credit back
        await supabase.from('profiles').update({ credit: current + diff }).eq('id', saved.conductor_id);
      }
    }

    const enriched = mapBooking(saved);
    setBookings(prev => prev.map(x => x.id === bookingId ? { ...x, ...enriched } : x));
    return enriched;
  };

  return (
    <BookingsContext.Provider value={{
      bookings, setBookings, fetchBookings, addBooking, updateBooking,
      checkIn, checkOut, proposeModification, respondToModification,
    }}>
      {children}
    </BookingsContext.Provider>
  );
}

export const useBookings = () => useContext(BookingsContext);
