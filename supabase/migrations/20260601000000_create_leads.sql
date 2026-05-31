CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  niche TEXT,
  platform TEXT,
  score NUMERIC(3,1),
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'prospect',
  notes TEXT,
  outreach_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON leads
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'admin')
  );
