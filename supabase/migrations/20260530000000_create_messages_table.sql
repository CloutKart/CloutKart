-- Messages table for Clout Club chat + creative feedback
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_from_admin boolean NOT NULL DEFAULT false,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'chat' CHECK (type IN ('chat', 'feedback')),
  creative_request_id uuid REFERENCES free_creative_requests(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_creative_request_id_idx ON messages(creative_request_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Clients see their own conversation
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (user_id = auth.uid());

-- Clients send chat/feedback messages for themselves
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    sender_id = auth.uid() AND
    is_from_admin = false
  );

-- Admins see all messages
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email LIKE '%@clout-kart.com'
    )
  );

-- Admins reply to any conversation
CREATE POLICY "Admins can insert reply messages" ON messages
  FOR INSERT WITH CHECK (
    is_from_admin = true AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email LIKE '%@clout-kart.com'
    )
  );

-- Admins can mark messages read
CREATE POLICY "Admins can update messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email LIKE '%@clout-kart.com'
    )
  );

-- Users can mark their own messages read
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid());
