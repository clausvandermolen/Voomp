import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sub;
    let initialSessionHandled = false;

    // Use getSession() as the source of truth for the initial load
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      initialSessionHandled = true;
      setSession(s);
      if (s?.user) fetchProfile(s.user.id, s.user);
      else setLoading(false);
    }).catch((err) => {
      initialSessionHandled = true;
      console.error('Auth getSession error:', err);
      setLoading(false);
    });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
        // Skip the INITIAL_SESSION event — getSession() already handles the initial state.
        // This prevents a race condition where onAuthStateChange fires with null
        // before getSession() has recovered the session from localStorage.
        if (event === 'INITIAL_SESSION') return;

        setSession(s);
        if (s?.user) fetchProfile(s.user.id, s.user);
        else { setUser(null); setLoading(false); }
      });
      sub = subscription;
    } catch (err) {
      console.error('Auth listener error:', err);
      setLoading(false);
    }

    // Safety timeout: never stay loading forever. Generous so slow networks
    // (especially mobile) don't race fetchProfile and cause a spurious logout.
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 20000);

    return () => { sub?.unsubscribe(); clearTimeout(timeout); };
  }, []);

  // Realtime: subscribe to changes on the current user's profile row so that
  // server-side credit/debt updates (e.g. from booking triggers) propagate live.
  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const channel = supabase
      .channel(`profile-${uid}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, (payload) => {
        const data = payload.new;
        setUser(prev => prev ? {
          ...prev,
          ...data,
          id: uid,
          firstName: data.first_name ?? prev.firstName,
          lastName1: data.last_name_1 ?? prev.lastName1,
          lastName2: data.last_name_2 ?? prev.lastName2,
          countryCode: data.country_code ?? prev.countryCode,
          idType: data.id_type ?? prev.idType,
          idNumber: data.id_number ?? prev.idNumber,
          avatar: data.avatar_url ?? prev.avatar,
        } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const fetchProfile = async (uid, sessionUser) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error && error.code !== 'PGRST116') console.error('fetchProfile error:', error);
    if (data) {
      setUser({
        ...data,
        id: uid,
        firstName: data.first_name,
        lastName1: data.last_name_1,
        lastName2: data.last_name_2,
        countryCode: data.country_code,
        idType: data.id_type,
        idNumber: data.id_number,
        avatar: data.avatar_url,
        vehicles: data.vehicles || [],
        parking_preferences: data.parking_preferences || {},
      });
    } else {
      setUser({
        id: uid,
        email: sessionUser?.email,
        firstName: sessionUser?.user_metadata?.first_name || sessionUser?.user_metadata?.full_name?.split(' ')[0] || "",
        lastName1: sessionUser?.user_metadata?.last_name_1 || sessionUser?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        lastName2: sessionUser?.user_metadata?.last_name_2 || "",
        countryCode: sessionUser?.user_metadata?.country_code || "+56",
        phone: sessionUser?.user_metadata?.phone || "",
        idType: sessionUser?.user_metadata?.id_type || "rut",
        idNumber: sessionUser?.user_metadata?.id_number || "",
        avatar: sessionUser?.user_metadata?.avatar_url || "",
        vehicles: [],
        parking_preferences: {}
      });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates) => {
    if (!session?.user) return;
    // Convert camelCase to snake_case for DB
    const dbUpdates = {};
    const map = {
      firstName: 'first_name', lastName1: 'last_name_1', lastName2: 'last_name_2',
      countryCode: 'country_code', idType: 'id_type', idNumber: 'id_number',
      avatar: 'avatar_url', avatarUrl: 'avatar_url',
      bankHolder: 'bank_holder', bankName: 'bank_name', bankAccountType: 'bank_account_type',
      bankAccount: 'bank_account', bankRut: 'bank_rut',
      notifEmail: 'notif_email', notifPush: 'notif_push', notifBookings: 'notif_bookings',
      notifMessages: 'notif_messages', notifPromo: 'notif_promo',
      privProfile: 'priv_profile', privShowPhone: 'priv_show_phone', privShowEmail: 'priv_show_email',
    };
    for (const [k, v] of Object.entries(updates)) {
      dbUpdates[map[k] || k] = v;
    }
    dbUpdates.id = session.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbUpdates, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    setUser({
      ...data,
      id: session.user.id,
      firstName: data.first_name,
      lastName1: data.last_name_1,
      lastName2: data.last_name_2,
      countryCode: data.country_code,
      idType: data.id_type,
      idNumber: data.id_number,
      avatar: data.avatar_url,
      vehicles: data.vehicles || [],
      parking_preferences: data.parking_preferences || {},
    });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signUp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
