-- SQL Schema to run in Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    role TEXT NOT NULL CHECK (role IN ('donor', 'ngo')),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert profile." ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update profile." ON public.users FOR UPDATE USING (true);

-- 2. Create Food Listings Table
CREATE TABLE public.food_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    title TEXT NOT NULL,
    description TEXT,
    qty INTEGER NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Urgent', 'Claimed', 'Picked Up', 'Expired')),
    type TEXT NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    donor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    image TEXT,
    tags TEXT[],
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    ai_status_reason TEXT -- Filled by AI if it expires
);

ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Food is readable by all" ON public.food_listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert food" ON public.food_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update food" ON public.food_listings FOR UPDATE USING (true);


-- 3. Create Claims Table
CREATE TABLE public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    food_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    distance_km DOUBLE PRECISION,
    eta_mins INTEGER,
    status TEXT DEFAULT 'En Route'
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Claims are readable by all" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Users can create claims" ON public.claims FOR INSERT WITH CHECK (true);

-- 4. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT,
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications viewable locally" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow insertions" ON public.notifications FOR INSERT WITH CHECK (true);


-- Enable Realtime for Dashboard Updates
ALTER PUBLICATION supabase_realtime ADD TABLE food_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
