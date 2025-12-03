-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  credits INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'regular' CHECK (tier IN ('regular', 'vip')),
  notification_push BOOLEAN DEFAULT true,
  notification_email BOOLEAN DEFAULT true,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN UPPER(LEFT(COALESCE(first_name, 'USER'), 4)) || FLOOR(1000 + RANDOM() * 9000)::TEXT;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, referral_code, terms_accepted_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    public.generate_referral_code(NEW.raw_user_meta_data ->> 'first_name'),
    (NEW.raw_user_meta_data ->> 'terms_accepted_at')::TIMESTAMPTZ
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create sequence for job reference numbers
CREATE SEQUENCE IF NOT EXISTS job_ref_seq START WITH 10001;

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_ref TEXT UNIQUE DEFAULT 'SR-' || nextval('job_ref_seq')::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  address_snapshot JSONB,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  preferred_window TEXT,
  notes TEXT,
  estimate_low INTEGER,
  estimate_high INTEGER,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'scheduled', 'in_progress', 'job_complete', 'finished', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create order_photos table
CREATE TABLE public.order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order photos"
  ON public.order_photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_photos.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order photos"
  ON public.order_photos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_photos.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own order photos"
  ON public.order_photos FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_photos.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('order', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for order photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('order-photos', 'order-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage RLS policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'order-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'order-photos' AND (storage.foldername(name))[1] = auth.uid()::text);