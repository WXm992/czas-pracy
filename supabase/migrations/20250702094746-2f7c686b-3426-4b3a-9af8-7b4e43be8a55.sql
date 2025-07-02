
-- Tabela dla przypisań kierowników do budów (relacja many-to-many)
CREATE TABLE public.manager_project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(manager_id, project_id)
);

-- Tabela dla sprzętu
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,
  purchase_date DATE,
  condition TEXT NOT NULL DEFAULT 'good',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela dla przypisań sprzętu do budów
CREATE TABLE public.equipment_project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  returned_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

-- Dodanie RLS policies
ALTER TABLE public.manager_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_project_assignments ENABLE ROW LEVEL SECURITY;

-- Polityki dla manager_project_assignments
CREATE POLICY "Anyone can view manager assignments" ON public.manager_project_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert manager assignments" ON public.manager_project_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update manager assignments" ON public.manager_project_assignments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete manager assignments" ON public.manager_project_assignments FOR DELETE USING (true);

-- Polityki dla equipment
CREATE POLICY "Anyone can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Anyone can insert equipment" ON public.equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update equipment" ON public.equipment FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete equipment" ON public.equipment FOR DELETE USING (true);

-- Polityki dla equipment_project_assignments
CREATE POLICY "Anyone can view equipment assignments" ON public.equipment_project_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert equipment assignments" ON public.equipment_project_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update equipment assignments" ON public.equipment_project_assignments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete equipment assignments" ON public.equipment_project_assignments FOR DELETE USING (true);
