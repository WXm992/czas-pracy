
-- Dodaj nowe pola do tabeli equipment dla przeglądów, ubezpieczeń i leasingu
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS inspection_from DATE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS inspection_to DATE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_company TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_oc BOOLEAN DEFAULT false;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_ac BOOLEAN DEFAULT false;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_assistance BOOLEAN DEFAULT false;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_from DATE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS insurance_to DATE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS lease_company TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS lease_from DATE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS lease_to DATE;

-- Dodaj nowe pole do tabeli employees (symulujemy poprzez local storage w interfejsie)
-- CREATE TABLE IF NOT EXISTS public.employee_credentials (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   employee_id TEXT NOT NULL,
--   credentials_valid_from DATE,
--   credentials_valid_to DATE,
--   credential_type TEXT,
--   notes TEXT
-- );

-- Dodaj tabelę dla użytkowników systemu z rolami
CREATE TABLE IF NOT EXISTS public.system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS dla system_users
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Polityki dla system_users (na razie wszyscy mogą wszystko dla testów)
CREATE POLICY "Anyone can view system users" ON public.system_users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert system users" ON public.system_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update system users" ON public.system_users FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete system users" ON public.system_users FOR DELETE USING (true);
