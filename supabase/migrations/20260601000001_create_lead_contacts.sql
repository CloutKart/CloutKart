CREATE TABLE IF NOT EXISTS lead_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  instagram_handle TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lead_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON lead_contacts
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'admin')
  );
