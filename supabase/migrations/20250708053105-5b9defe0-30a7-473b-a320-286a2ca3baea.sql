
-- Create table for equipment-project assignments
CREATE TABLE IF NOT EXISTS public.equipment_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  returned_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.equipment_project_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view equipment assignments" 
  ON public.equipment_project_assignments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert equipment assignments" 
  ON public.equipment_project_assignments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update equipment assignments" 
  ON public.equipment_project_assignments 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete equipment assignments" 
  ON public.equipment_project_assignments 
  FOR DELETE 
  USING (true);
