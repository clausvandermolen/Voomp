-- ============================================
-- VOOMP PLATFORM - Supabase Migration SQL
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================

-- 1. PROFILES (extiende auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name_p text,
  last_name_m text,
  email text unique,
  phone text,
  country_code text default '+56',
  id_type text default 'rut',
  id_number text,
  avatar_url text,
  bank_holder text,
  bank_name text,
  bank_account_type text,
  bank_account text,
  bank_rut text,
  credit numeric default 0,
  notif_email boolean default true,
  notif_push boolean default true,
  notif_bookings boolean default true,
  notif_messages boolean default true,
  notif_promo boolean default false,
  language text default 'es',
  currency text default 'CLP',
  priv_profile text default 'public',
  priv_show_phone boolean default false,
  priv_show_email boolean default false,
  saved_listing_ids bigint[] default '{}',
  created_at timestamptz default now()
);

-- 2. LISTINGS
create table if not exists listings (
  id bigserial primary key,
  title text not null,
  description text,
  location text,
  address text,
  lat double precision,
  lng double precision,
  price integer default 0,
  price_unit text default 'hora',
  price_daily integer,
  price_monthly integer,
  type text default 'covered',
  vehicle_types text[] default '{}',
  access text,
  security text[] default '{}',
  dimensions jsonb default '{"width":0,"length":0,"height":null}',
  ev boolean default false,
  rating numeric default 0,
  reviews_count integer default 0,
  rules text[] default '{}',
  amenities text[] default '{}',
  cancellation text default 'flexible',
  available_days text[] default '{}',
  host_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. LISTING PHOTOS
create table if not exists listing_photos (
  id bigserial primary key,
  listing_id bigint references listings(id) on delete cascade,
  url text not null,
  position integer default 0,
  created_at timestamptz default now()
);

-- 4. REVIEWS
create table if not exists reviews (
  id bigserial primary key,
  listing_id bigint references listings(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- 5. BOOKINGS
create table if not exists bookings (
  id bigserial primary key,
  listing_id bigint references listings(id),
  listing_title text,
  host_id uuid references profiles(id),
  host_name text,
  conductor_id uuid references profiles(id),
  conductor_name text,
  date date,
  start_date date,
  end_date date,
  start_time text,
  end_time text,
  price integer,
  total integer,
  price_unit text,
  pay_method text,
  status text default 'pending',
  photo_url text,
  billing_schedule text,
  full_months integer,
  monthly_start_date date,
  prorate_amount integer,
  monthly_installment integer,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz default now()
);

-- 6. MESSAGES
create table if not exists messages (
  id bigserial primary key,
  chat_key text not null,
  booking_id bigint references bookings(id),
  sender_id uuid references profiles(id),
  sender_name text,
  recipient_id uuid references profiles(id),
  text text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_chat_key on messages(chat_key);
create index if not exists idx_messages_recipient on messages(recipient_id);

-- 7. CHAT READ STATE
create table if not exists chat_read_state (
  user_id uuid references profiles(id) on delete cascade,
  chat_key text not null,
  last_read_id bigint default 0,
  primary key (user_id, chat_key)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "Own profile update" on profiles for update using (auth.uid() = id);

-- Listings
alter table listings enable row level security;
create policy "Public listings" on listings for select using (true);
create policy "Owner insert listing" on listings for insert with check (auth.uid() = host_id);
create policy "Owner update listing" on listings for update using (auth.uid() = host_id);
create policy "Owner delete listing" on listings for delete using (auth.uid() = host_id);

-- Listing photos
alter table listing_photos enable row level security;
create policy "Public photos" on listing_photos for select using (true);
create policy "Host insert photos" on listing_photos for insert with check (
  exists (select 1 from listings where listings.id = listing_photos.listing_id and listings.host_id = auth.uid())
);
create policy "Host delete photos" on listing_photos for delete using (
  exists (select 1 from listings where listings.id = listing_photos.listing_id and listings.host_id = auth.uid())
);

-- Reviews
alter table reviews enable row level security;
create policy "Public reviews" on reviews for select using (true);
create policy "Author insert review" on reviews for insert with check (auth.uid() = author_id);

-- Bookings
alter table bookings enable row level security;
create policy "Participants read bookings" on bookings for select using (auth.uid() = host_id or auth.uid() = conductor_id);
create policy "Conductor insert booking" on bookings for insert with check (auth.uid() = conductor_id);
create policy "Participants update booking" on bookings for update using (auth.uid() = host_id or auth.uid() = conductor_id);

-- Messages
alter table messages enable row level security;
create policy "Chat participants read messages" on messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Sender insert message" on messages for insert with check (auth.uid() = sender_id);

-- Chat read state
alter table chat_read_state enable row level security;
create policy "Own read state select" on chat_read_state for select using (auth.uid() = user_id);
create policy "Own read state insert" on chat_read_state for insert with check (auth.uid() = user_id);
create policy "Own read state update" on chat_read_state for update using (auth.uid() = user_id);

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table messages;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name_p, last_name_m, phone, country_code, id_type, id_number)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name_p', ''),
    coalesce(new.raw_user_meta_data->>'last_name_m', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'country_code', '+56'),
    coalesce(new.raw_user_meta_data->>'id_type', 'rut'),
    coalesce(new.raw_user_meta_data->>'id_number', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS (ejecutar en Storage tab o via API)
-- Nota: Los buckets se crean mejor desde el Dashboard:
--   Storage > New Bucket > "avatars" (public)
--   Storage > New Bucket > "listing-photos" (public)
-- ============================================

-- Funcion helper para recalcular rating de listing
create or replace function public.update_listing_rating()
returns trigger as $$
begin
  update listings set
    rating = (select coalesce(avg(rating), 0) from reviews where listing_id = coalesce(new.listing_id, old.listing_id)),
    reviews_count = (select count(*) from reviews where listing_id = coalesce(new.listing_id, old.listing_id))
  where id = coalesce(new.listing_id, old.listing_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute function public.update_listing_rating();
