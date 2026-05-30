-- Drop existing policies that used unreliable auth.users subquery
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can insert reply messages" ON messages;
DROP POLICY IF EXISTS "Admins can update messages" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Re-create using auth.jwt() which reads directly from the token — reliable
-- Client: see and write their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    sender_id = auth.uid() AND
    is_from_admin = false
  );

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid());

-- Admin: full access via JWT email check (no subquery, reads from token directly)
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    (auth.jwt() ->> 'email') LIKE '%@clout-kart.com'
  );

CREATE POLICY "Admins can insert reply messages" ON messages
  FOR INSERT WITH CHECK (
    is_from_admin = true AND
    (auth.jwt() ->> 'email') LIKE '%@clout-kart.com'
  );

CREATE POLICY "Admins can update messages" ON messages
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') LIKE '%@clout-kart.com'
  );
